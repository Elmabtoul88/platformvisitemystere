const pool = require('../config/db');
const { format } = require('date-fns'); // For potential date formatting/comparison

// @desc    Get available missions (with optional filters)
// @route   GET /api/missions
// @access  Private (Shopper)
const getAvailableMissions = async (req, res) => {
    // Add pagination defaults and parsing
    const { category, location, date, sortBy = 'deadline', order = 'ASC', page = 1, limit = 20 } = req.query;
    const userId = req.user.id; // Shopper ID from auth middleware

    // Validate pagination params
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1 || limitNum > 100) { // Add reasonable limit max
        return res.status(400).json({ success: false, message: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' });
    }
    const offset = (pageNum - 1) * limitNum;


    try {
        // Base query to select mission details
        let query = `
            SELECT SQL_CALC_FOUND_ROWS -- Get total count without separate query
                m.id, m.title, m.description, m.deadline, m.reward, m.location, m.category, m.business_name AS businessName, m.status
            FROM missions m
            WHERE m.status = ?
            -- Exclude missions the user is already assigned to or has reported on (approved/refused/submitted)
            AND NOT EXISTS (
                SELECT 1 FROM assignments a WHERE a.user_id = ? AND a.mission_id = m.id
            )
            AND NOT EXISTS (
                SELECT 1 FROM reports r WHERE r.user_id = ? AND r.mission_id = m.id AND r.status IN ('submitted', 'approved', 'refused')
            )
        `;
        const queryParams = ['available', userId, userId];

        // --- Filtering ---
        if (category) {
            query += ' AND m.category = ?';
            queryParams.push(category);
        }
        if (location) {
            // Basic location filtering (consider case-insensitivity if needed)
            query += ' AND m.location LIKE ?';
            queryParams.push(`%${location}%`);
        }
        if (date) {
            // Filter by deadline (e.g., deadline before or on a certain date)
             try {
                const filterDate = new Date(date).toISOString().split('T')[0]; // Get YYYY-MM-DD format
                query += ' AND DATE(m.deadline) <= ?'; // Compare only dates
                queryParams.push(filterDate);
            } catch (e) {
                console.warn("Invalid date format provided for filtering:", date);
                return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
            }
        }

        // --- Sorting ---
        const validSortColumns = ['deadline', 'reward', 'created_at', 'title', 'category', 'businessName']; // Whitelist columns
        const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'; // Default to ASC
        let sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'deadline'; // Default to deadline
        // Map frontend 'businessName' to backend 'business_name'
        if (sortColumn === 'businessName') sortColumn = 'business_name';
        query += ` ORDER BY m.${sortColumn} ${sortOrder}`;

        // --- Pagination ---
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(limitNum, offset);


        // --- Execute Query ---
        const [missions] = await pool.query(query, queryParams);
        // Get total count from the SQL_CALC_FOUND_ROWS result
        const [[{ totalFound }]] = await pool.query('SELECT FOUND_ROWS() as totalFound');

        res.json({
             success: true,
             missions,
             pagination: {
                total: totalFound,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalFound / limitNum),
            }
        });
    } catch (error) {
        console.error('Error fetching available missions:', error);
        res.status(500).json({ success: false, message: 'Server error fetching available missions.' });
    }
};

// @desc    Get mission details by ID
// @route   GET /api/missions/:id
// @access  Private (Shopper)
const getMissionById = async (req, res) => {
    const missionId = req.params.id;
    const userId = req.user.id; // User must be authenticated

    // Validate missionId format if necessary (e.g., is it a number?)
     if (isNaN(parseInt(missionId))) {
        return res.status(400).json({ success: false, message: 'Invalid mission ID format.' });
     }

    try {
        // Fetch mission details, including assignment status for the current user
        const [missions] = await pool.query(
            `SELECT
                m.id, m.title, m.description, m.deadline, m.reward, m.location, m.category, m.business_name AS businessName, m.status,
                -- Check if the user has an active assignment (status = 'assigned')
                (SELECT COUNT(*) FROM assignments a WHERE a.mission_id = m.id AND a.user_id = ? AND a.status = 'assigned') > 0 AS isAssignedToUser,
                m.survey_questions AS surveyQuestions -- Keep surveyQuestions here
             FROM missions m
             WHERE m.id = ?
             LIMIT 1`,
            [userId, missionId]
        );

        if (missions.length === 0) {
            return res.status(404).json({ success: false, message: 'Mission not found.' });
        }

        const mission = missions[0];
        // Convert isAssignedToUser from 0/1 to boolean (already done by > 0 comparison)

         // Parse survey questions safely
         let parsedQuestions = [];
         if (mission.surveyQuestions) {
             try {
                 parsedQuestions = JSON.parse(mission.surveyQuestions);
                  if (!Array.isArray(parsedQuestions)) parsedQuestions = []; // Ensure it's array
             } catch (parseError) {
                 console.error(`Failed to parse survey questions for mission ${missionId}:`, parseError);
                 // Keep parsedQuestions as []
             }
         }
         // Assign parsed questions back, removing the original string
         mission.surveyQuestions = parsedQuestions;

        // Authorization Check:
        // Allow access if:
        // 1. Mission is 'available' (anyone can view details to potentially apply)
        // 2. Mission is assigned to the current user (regardless of mission status like 'assigned', 'submitted')
        // Note: This check happens *after* fetching, so we don't leak existence info.
        if (mission.status !== 'available' && !mission.isAssignedToUser) {
            // Check if the user has submitted a report for this mission (even if refused/approved)
             const [reportCheck] = await pool.query('SELECT id FROM reports WHERE mission_id = ? AND user_id = ? LIMIT 1', [missionId, userId]);
             if (reportCheck.length === 0) {
                console.warn(`User ${userId} attempted to access mission ${missionId} which is neither available nor assigned to them.`);
                return res.status(403).json({ success: false, message: 'You are not authorized to view this mission\'s details.' });
             }
             // Allow viewing if they submitted a report (completed state)
        }


        res.json({ success: true, mission });
    } catch (error) {
        console.error('Error fetching mission details:', error);
        res.status(500).json({ success: false, message: 'Server error fetching mission details.' });
    }
};


// @desc    Apply for a mission (simplified: directly assigns if available)
// @route   POST /api/missions/:id/apply
// @access  Private (Shopper)
const applyForMission = async (req, res) => {
    const missionId = req.params.id;
    const userId = req.user.id; // From auth middleware

     // Validate missionId format
     if (isNaN(parseInt(missionId))) {
         return res.status(400).json({ success: false, message: 'Invalid mission ID format.' });
     }

    let connection; // Use let for reassignment in finally block

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Check if mission exists and is 'available' (Lock the row for update)
        const [missions] = await connection.query('SELECT status FROM missions WHERE id = ? FOR UPDATE', [missionId]);
        if (missions.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Mission not found.' });
        }
        if (missions[0].status !== 'available') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: `Mission is currently ${missions[0].status} and cannot be applied for.` });
        }

        // 2. Check if user is already assigned or has applied/reported (using EXISTS for efficiency)
        const [[{ assignmentExists }]] = await connection.query(
            'SELECT EXISTS(SELECT 1 FROM assignments WHERE mission_id = ? AND user_id = ?) as assignmentExists',
            [missionId, userId]
        );
        if (assignmentExists) {
            await connection.rollback();
            return res.status(409).json({ success: false, message: 'You have already applied for or are assigned to this mission.' }); // 409 Conflict
        }

        // 3. Check if user is active shopper (rely on auth middleware, but double-check doesn't hurt)
        const [users] = await connection.query('SELECT status FROM users WHERE id = ? AND role = ?', [userId, 'shopper']);
        if (users.length === 0 || users[0].status !== 'active') {
             await connection.rollback();
             return res.status(403).json({ success: false, message: 'User account is not active or not found.' }); // 403 Forbidden
         }

        // 4. Create assignment record with 'assigned' status
        await connection.query(
            'INSERT INTO assignments (mission_id, user_id, status, applied_at) VALUES (?, ?, ?, NOW())', // Use NOW()
            [missionId, userId, 'assigned']
        );
        console.log(`User ${userId} successfully assigned to mission ${missionId}.`);

        // 5. Update mission status to 'assigned'
        await connection.query('UPDATE missions SET status = ? WHERE id = ?', ['assigned', missionId]);
        console.log(`Mission ${missionId} status updated to 'assigned'.`);

        await connection.commit();

        res.status(200).json({ success: true, message: 'Successfully applied and assigned to the mission.' });

    } catch (error) {
        if (connection) await connection.rollback(); // Rollback on any error
        console.error('Error applying for mission:', error);
        // Handle potential duplicate entry errors if DB constraints are violated (though checks should prevent this)
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ success: false, message: 'Application conflict detected. You might already be assigned.' });
         }
        res.status(500).json({ success: false, message: 'Server error applying for mission.' });
    } finally {
         if (connection) connection.release(); // Always release connection
    }
};


// @desc    Get missions assigned to the current shopper (pending action)
// @route   GET /api/missions/assigned
// @access  Private (Shopper)
const getAssignedMissions = async (req, res) => {
    const userId = req.user.id;
    try {
        // Fetch missions where the user has an 'assigned' record AND the mission status allows submission ('assigned', 'submitted')
        const [missions] = await pool.query(
            `SELECT m.id, m.title, m.description, m.deadline, m.reward, m.location, m.category, m.business_name AS businessName, m.status
             FROM missions m
             JOIN assignments a ON m.id = a.mission_id
             WHERE a.user_id = ? AND a.status = ? AND m.status IN (?, ?) -- User assignment status AND mission status
             ORDER BY m.deadline ASC`, // Order by soonest deadline
            [userId, 'assigned', 'assigned', 'submitted'] // User must have 'assigned' status in assignments table
        );
        res.json({ success: true, missions });
    } catch (error) {
        console.error('Error fetching assigned missions:', error);
        res.status(500).json({ success: false, message: 'Server error fetching assigned missions.' });
    }
};

// @desc    Get missions completed (approved or refused) by the current shopper
// @route   GET /api/missions/completed
// @access  Private (Shopper)
const getCompletedMissions = async (req, res) => {
    const userId = req.user.id;
    try {
        // Fetch missions associated with the user's *reports* that are approved or refused
        // This ensures we only show missions the user actually submitted something for.
        const [missions] = await pool.query(
            `SELECT
                m.id, m.title, m.description, m.deadline, m.reward, m.location, m.category, m.business_name AS businessName,
                r.status AS reportStatus, -- Get the report status directly
                r.submitted_at AS reportSubmittedAt,
                r.refusal_reason AS refusalReason,
                m.status as missionStatus -- Also include mission status if needed
             FROM reports r
             JOIN missions m ON r.mission_id = m.id
             WHERE r.user_id = ? AND r.status IN (?, ?) -- Filter by report status
             ORDER BY r.submitted_at DESC NULLS LAST`, // Order by most recently submitted report
            [userId, 'approved', 'refused']
        );
        res.json({ success: true, missions });
    } catch (error) {
        console.error('Error fetching completed missions:', error);
        res.status(500).json({ success: false, message: 'Server error fetching completed missions.' });
    }
};


module.exports = {
    getAvailableMissions,
    getMissionById,
    applyForMission,
    getAssignedMissions,
    getCompletedMissions,
};
