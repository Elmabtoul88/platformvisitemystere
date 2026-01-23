const pool = require('../config/db');
const bcrypt = require('bcryptjs'); // Keep for potential future password reset

// Helper function for basic email validation
const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).toLowerCase());
};

// Helper to map DB snake_case to frontend camelCase
const mapUserToCamelCase = (dbUser) => {
    if (!dbUser) return null;
    return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        status: dbUser.status,
        telephone: dbUser.telephone,
        city: dbUser.city,
        motivation: dbUser.motivation,
        birthYear: dbUser.birth_year,
        gender: dbUser.gender,
        cvUrl: dbUser.cv_url,
        profilePicUrl: dbUser.profile_pic_url,
        registrationDate: dbUser.registration_date,
        completedMissions: dbUser.completed_missions,
    };
};

// Helper to map Mission DB snake_case to frontend camelCase
const mapMissionToCamelCase = (dbMission) => {
     if (!dbMission) return null;
     // Basic mapping, add more fields as needed
     return {
        id: dbMission.id,
        title: dbMission.title,
        description: dbMission.description,
        deadline: dbMission.deadline,
        reward: dbMission.reward,
        location: dbMission.location,
        category: dbMission.category,
        businessName: dbMission.business_name,
        status: dbMission.status,
        createdAt: dbMission.created_at,
        createdBy: dbMission.created_by,
        surveyQuestions: dbMission.survey_questions, // Keep as is, parsing handled elsewhere
         // Add aggregated fields if selected
         assignedToIds: dbMission.assignedToIds,
         submittedReportsCount: dbMission.submittedReportsCount,
         // processed fields added later
         // assignedTo: [],
         // submittedReportsCount: 0
     };
 };


// --- User Management ---

// @desc    Get all users (with filtering, pagination, sorting)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    const { role, status, search, page = 1, limit = 20, sortBy = 'registration_date', order = 'DESC' } = req.query;

     // Validate pagination
     const pageNum = parseInt(page, 10);
     const limitNum = parseInt(limit, 10);
     if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
         return res.status(400).json({ success: false, message: 'Invalid pagination parameters.' });
     }
     const offset = (pageNum - 1) * limitNum;

     // Validate sorting
     const allowedSortBy = ['name', 'email', 'role', 'status', 'city', 'registration_date', 'completed_missions'];
     const sortColumn = allowedSortBy.includes(sortBy) ? sortBy : 'registration_date';
     const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';


    try {
        let query = `
            SELECT SQL_CALC_FOUND_ROWS
                id, name, email, role, status, city, registration_date, completed_missions, profile_pic_url
            FROM users
            WHERE 1=1`; // Base query
        const queryParams = [];

        // Filtering
        if (role) {
            query += ' AND role = ?';
            queryParams.push(role);
        }
        if (status) {
             query += ' AND status = ?';
             queryParams.push(status);
        }
        if (search) {
             query += ' AND (name LIKE ? OR email LIKE ?)';
             queryParams.push(`%${search}%`, `%${search}%`);
         }

        // Sorting
        query += ` ORDER BY ${pool.escapeId(sortColumn)} ${sortOrder}`; // Use escapeId for safety

        // Pagination
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(limitNum, offset);

        // Execute queries
        const [users] = await pool.query(query, queryParams);
        const [[{ totalFound }]] = await pool.query('SELECT FOUND_ROWS() as totalFound');

        res.json({
            success: true,
            users: users.map(mapUserToCamelCase), // Map results to camelCase
            pagination: {
                total: totalFound,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalFound / limitNum),
            }
         });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server error fetching users.' });
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
    const userId = req.params.id;

    // Validate ID format if needed (e.g., if numeric)
     if (isNaN(parseInt(userId))) {
         return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
     }

    try {
        // Select all relevant fields
        const [users] = await pool.query(
            `SELECT
                id, name, email, role, status, telephone, city, motivation, birth_year, gender, cv_url, profile_pic_url, registration_date, completed_missions
             FROM users
             WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const user = mapUserToCamelCase(users[0]); // Map to camelCase

        res.json({ success: true, user });
    } catch (error) {
        console.error(`Error fetching user by ID ${userId}:`, error);
        res.status(500).json({ success: false, message: 'Server error fetching user.' });
    }
};

// @desc    Update user details by ID
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
    const userId = req.params.id;
    // Allow updating specific fields by admin
    const { name, role, status, city, motivation, telephone, birthYear, gender } = req.body;

     // Validate ID format
     if (isNaN(parseInt(userId))) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
     }


    // --- Input Validation ---
    const errors = {};
    const allowedRoles = ['shopper', 'admin'];
    const allowedStatuses = ['active', 'inactive'];
    const allowedGenders = ['male', 'female', 'other', 'prefer_not_say'];

    if (role && !allowedRoles.includes(role)) errors.role = `Invalid role. Allowed: ${allowedRoles.join(', ')}.`;
    if (status && !allowedStatuses.includes(status)) errors.status = `Invalid status. Allowed: ${allowedStatuses.join(', ')}.`;
    if (birthYear && (isNaN(parseInt(birthYear)) || birthYear < 1900 || birthYear > new Date().getFullYear())) errors.birthYear = 'Invalid birth year.';
    if (gender && !allowedGenders.includes(gender)) errors.gender = `Invalid gender. Allowed: ${allowedGenders.join(', ')}.`;
    // Add more specific validation (e.g., telephone format) if needed


    // Construct update object selectively, mapping camelCase to snake_case for DB
    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = String(name).trim(); // Ensure string and trim
    if (role !== undefined) fieldsToUpdate.role = role; // Be cautious allowing role changes
    if (status !== undefined) fieldsToUpdate.status = status;
    if (city !== undefined) fieldsToUpdate.city = city;
    if (motivation !== undefined) fieldsToUpdate.motivation = motivation;
    if (telephone !== undefined) fieldsToUpdate.telephone = telephone;
    if (birthYear !== undefined) fieldsToUpdate.birth_year = birthYear ? parseInt(birthYear) : null;
    if (gender !== undefined) fieldsToUpdate.gender = gender;

    // Check if there are actual fields to update
    if (Object.keys(fieldsToUpdate).length === 0) {
        errors.general = 'No valid fields provided for update.';
    }
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    try {
        // Check if user exists before updating
        const [users] = await pool.query('SELECT id, role FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
             return res.status(404).json({ success: false, message: 'User not found.' });
         }

         // Prevent self-role change or changing other admins? (Optional policy)
         // if (String(userId) === String(req.user.id) && fieldsToUpdate.role && fieldsToUpdate.role !== 'admin') {
         //     return res.status(403).json({ success: false, message: 'Cannot change your own role.' });
         // }
         // if (users[0].role === 'admin' && String(userId) !== String(req.user.id)) {
         //     // Prevent changing other admin roles/status?
         // }


        // Perform the update
        const [result] = await pool.query('UPDATE users SET ? WHERE id = ?', [fieldsToUpdate, userId]);

        if (result.affectedRows === 0) {
             // Should not happen due to the existence check, but safety first
             return res.status(404).json({ success: false, message: 'User not found or update failed unexpectedly.' });
         }
         if (result.changedRows === 0) {
              // Row was found but no values were different
              return res.json({ success: true, message: 'User details unchanged.' });
         }


        console.log(`Admin ${req.user.id} updated user ${userId}. Changed rows: ${result.changedRows}`);
        res.json({ success: true, message: 'User updated successfully.' });
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        // Check for specific DB errors like unique constraints if email were editable
        res.status(500).json({ success: false, message: 'Server error updating user.' });
    }
};

// @desc    Toggle user status (active/inactive)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
const toggleUserStatus = async (req, res) => {
    const userId = req.params.id;
    const { currentStatus } = req.body; // Expect the *current* status from frontend for confirmation

     // Validate ID format
     if (isNaN(parseInt(userId))) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
     }
    // Validate currentStatus
    if (!currentStatus || !['active', 'inactive'].includes(currentStatus)) {
        return res.status(400).json({ success: false, message: 'Valid currentStatus (\'active\' or \'inactive\') is required.' });
    }

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
         // First, check if the user exists and get their role
         const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
         if (users.length === 0) {
             return res.status(404).json({ success: false, message: 'User not found.' });
         }

         // --- Security Check: Prevent deactivating admin accounts (including self) ---
         if (users[0].role === 'admin') {
              // Allow activating an inactive admin, but not deactivating an active one? Or disallow all changes?
             // This rule prevents deactivation.
             if (newStatus === 'inactive') {
                 console.warn(`Admin ${req.user.id} attempted to deactivate admin user ${userId}.`);
                 return res.status(403).json({ success: false, message: 'Cannot deactivate an admin account.' });
             }
         }

        // Update the status
        const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, userId]);

        if (result.affectedRows === 0) {
            // Should not happen if user exists, but safety check
            return res.status(404).json({ success: false, message: 'User not found or status update failed.' });
        }

        console.log(`Admin ${req.user.id} updated status of user ${userId} to ${newStatus}.`);
        res.json({ success: true, message: `User status updated to ${newStatus}.`, newStatus: newStatus });
    } catch (error) {
        console.error(`Error toggling user status for ${userId}:`, error);
        res.status(500).json({ success: false, message: 'Server error toggling user status.' });
    }
};

// --- Mission Management ---

// @desc    Create a new mission
// @route   POST /api/admin/missions
// @access  Private (Admin)
const createMission = async (req, res) => {
    const { title, description, deadline, reward, location, category, businessName } = req.body;
    const adminUserId = req.user.id; // Get admin ID for created_by field

    // --- Validation ---
    const errors = {};
    if (!title || title.trim().length === 0) errors.title = 'Title is required.';
    if (!description || description.trim().length === 0) errors.description = 'Description is required.';
    if (!deadline) errors.deadline = 'Deadline is required.';
    if (reward === undefined || reward === null || isNaN(parseFloat(reward)) || parseFloat(reward) < 0) errors.reward = 'Reward must be a non-negative number.';
    if (!location || location.trim().length === 0) errors.location = 'Location is required.';
    if (!category || category.trim().length === 0) errors.category = 'Category is required.';
    if (!businessName || businessName.trim().length === 0) errors.businessName = 'Business Name is required.';

     let deadlineDate;
     if (deadline) {
        try {
            deadlineDate = new Date(deadline);
            if (isNaN(deadlineDate.getTime())) throw new Error(); // Check if valid date
        } catch (e) {
            errors.deadline = 'Invalid deadline format. Use a valid date string (e.g., YYYY-MM-DDTHH:mm:ssZ).';
        }
     }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    try {
        const newMission = {
            title: title.trim(),
            description: description.trim(),
            deadline: deadlineDate,
            reward: parseFloat(reward),
            location: location.trim(),
            category: category.trim(),
            business_name: businessName.trim(),
            created_by: adminUserId,
            created_at: new Date(),
            status: 'available' // Initial status
        };

        const [result] = await pool.query('INSERT INTO missions SET ?', newMission);
        const missionId = result.insertId;

        console.log(`Admin ${adminUserId} created mission ${missionId}: "${newMission.title}"`);
        res.status(201).json({ success: true, message: 'Mission created successfully.', missionId: missionId });
    } catch (error) {
        console.error('Error creating mission:', error);
        res.status(500).json({ success: false, message: 'Server error creating mission.' });
    }
};

// @desc    Get all missions (admin view, with filters, pagination, sorting)
// @route   GET /api/admin/missions
// @access  Private (Admin)
const getAllMissions = async (req, res) => {
    const { status, category, search, page = 1, limit = 10, sortBy = 'created_at', order = 'DESC' } = req.query;

    // Validate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
     if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
         return res.status(400).json({ success: false, message: 'Invalid pagination parameters.' });
     }
    const offset = (pageNum - 1) * limitNum;

     // Validate sorting
     const validSortColumns = ['title', 'business_name', 'deadline', 'reward', 'status', 'category', 'created_at']; // Use DB column names
     const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
     const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    try {
        let query = `
            SELECT SQL_CALC_FOUND_ROWS
                m.id, m.title, m.business_name, m.location, m.deadline, m.reward, m.status, m.category, m.created_at, m.created_by,
                -- Concatenate distinct assigned user IDs
                GROUP_CONCAT(DISTINCT a.user_id SEPARATOR ',') AS assignedToIds,
                -- Count distinct submitted/approved/refused reports
                COUNT(DISTINCT r.id) AS totalReportsCount
             FROM missions m
             LEFT JOIN assignments a ON a.mission_id = m.id AND a.status = 'assigned' -- Join only active assignments
             LEFT JOIN reports r ON r.mission_id = m.id -- Join all reports for counting
             WHERE 1=1
        `;
        const queryParams = [];

         // Filtering
         if (status) {
             query += ' AND m.status = ?';
             queryParams.push(status);
         }
         if (category) {
             query += ' AND m.category = ?';
             queryParams.push(category);
         }
         if (search) {
             query += ' AND (m.title LIKE ? OR m.business_name LIKE ?)';
             queryParams.push(`%${search}%`, `%${search}%`);
         }

         // Grouping is crucial for aggregate functions like GROUP_CONCAT and COUNT
         query += ' GROUP BY m.id';

         // Sorting
         query += ` ORDER BY ${pool.escapeId(sortColumn)} ${sortOrder}`;

          // Pagination
          query += ' LIMIT ? OFFSET ?';
          queryParams.push(limitNum, offset);

           // Execute queries
           const [missions] = await pool.query(query, queryParams);
           const [[{ totalFound }]] = await pool.query('SELECT FOUND_ROWS() as totalFound');


         // Process results: Map to camelCase and convert assignedToIds string to array of numbers
         const processedMissions = missions.map(m => {
             const mapped = mapMissionToCamelCase(m); // Map base fields
             mapped.assignedTo = mapped.assignedToIds ? mapped.assignedToIds.split(',').map(id => parseInt(id, 10)) : [];
             mapped.totalReportsCount = parseInt(m.totalReportsCount, 10) || 0; // Use the alias from query
             delete mapped.assignedToIds; // Remove the original string field
             return mapped;
         });

        res.json({
            success: true,
            missions: processedMissions,
             pagination: {
                 total: totalFound,
                 page: pageNum,
                 limit: limitNum,
                 totalPages: Math.ceil(totalFound / limitNum),
             }
         });
    } catch (error) {
        console.error('Error fetching all missions for admin:', error);
        res.status(500).json({ success: false, message: 'Server error fetching missions.' });
    }
};


// @desc    Get single mission by ID (Admin view, includes survey)
// @route   GET /api/admin/missions/:id
// @access  Private (Admin)
const getMissionById = async (req, res) => {
    const missionId = req.params.id;

    if (isNaN(parseInt(missionId))) {
        return res.status(400).json({ success: false, message: 'Invalid mission ID format.' });
    }

    try {
        // Fetch mission details including survey questions
        const [missions] = await pool.query(
            `SELECT m.* FROM missions m WHERE m.id = ?`,
            [missionId]
        );

        if (missions.length === 0) {
            return res.status(404).json({ success: false, message: 'Mission not found.' });
        }

        const mission = mapMissionToCamelCase(missions[0]);

        // Parse survey questions
        let parsedQuestions = [];
        if (mission.surveyQuestions) {
            try {
                parsedQuestions = JSON.parse(mission.surveyQuestions);
                if (!Array.isArray(parsedQuestions)) parsedQuestions = [];
            } catch (e) {
                console.error(`Failed to parse survey questions JSON for mission ${missionId}:`, e);
            }
        }
        mission.surveyQuestions = parsedQuestions;

        res.json({ success: true, mission });

    } catch (error) {
        console.error(`Error fetching mission ${missionId} for admin:`, error);
        res.status(500).json({ success: false, message: 'Server error fetching mission details.' });
    }
};



// @desc    Update mission details
// @route   PUT /api/admin/missions/:id
// @access  Private (Admin)
const updateMission = async (req, res) => {
    const missionId = req.params.id;
    // Allow updating specific fields
    const { title, description, deadline, reward, location, category, businessName, status } = req.body;

     // Validate ID format
     if (isNaN(parseInt(missionId))) {
        return res.status(400).json({ success: false, message: 'Invalid mission ID format.' });
     }

    // --- Validation ---
    const errors = {};
    const allowedStatuses = ['available', 'assigned', 'submitted', 'approved', 'refused', 'cancelled']; // Add more if needed
    if (status && !allowedStatuses.includes(status)) errors.status = `Invalid status. Allowed: ${allowedStatuses.join(', ')}.`;
    if (reward !== undefined && (isNaN(parseFloat(reward)) || parseFloat(reward) < 0)) errors.reward = 'Reward must be a non-negative number.';

     let deadlineDate;
     if (deadline) {
        try {
            deadlineDate = new Date(deadline);
            if (isNaN(deadlineDate.getTime())) throw new Error();
        } catch (e) {
             errors.deadline = 'Invalid deadline format.';
        }
     }

    // Build fields to update, mapping to DB columns
    const fieldsToUpdate = {};
    if (title !== undefined) fieldsToUpdate.title = title.trim();
    if (description !== undefined) fieldsToUpdate.description = description.trim();
    if (deadlineDate !== undefined) fieldsToUpdate.deadline = deadlineDate;
    if (reward !== undefined) fieldsToUpdate.reward = parseFloat(reward);
    if (location !== undefined) fieldsToUpdate.location = location.trim();
    if (category !== undefined) fieldsToUpdate.category = category.trim();
    if (businessName !== undefined) fieldsToUpdate.business_name = businessName.trim();
    if (status !== undefined) fieldsToUpdate.status = status; // Allow admin to change status directly

    if (Object.keys(fieldsToUpdate).length === 0) {
        errors.general = 'No valid fields provided for update.';
    }

     if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    try {
        // Check if mission exists
         const [existing] = await pool.query('SELECT id FROM missions WHERE id = ?', [missionId]);
         if (existing.length === 0) {
             return res.status(404).json({ success: false, message: 'Mission not found.' });
         }

        const [result] = await pool.query('UPDATE missions SET ? WHERE id = ?', [fieldsToUpdate, missionId]);

         if (result.affectedRows === 0) {
            // Should not happen due to existence check
            return res.status(404).json({ success: false, message: 'Mission not found or update failed unexpectedly.' });
         }
         if (result.changedRows === 0) {
             return res.json({ success: true, message: 'Mission details unchanged.' });
         }

        console.log(`Admin ${req.user.id} updated mission ${missionId}. Changed rows: ${result.changedRows}`);
        res.json({ success: true, message: 'Mission updated successfully.' });
    } catch (error) {
        console.error(`Error updating mission ${missionId}:`, error);
        res.status(500).json({ success: false, message: 'Server error updating mission.' });
    }
};

// @desc    Delete a mission
// @route   DELETE /api/admin/missions/:id
// @access  Private (Admin)
const deleteMission = async (req, res) => {
    const missionId = req.params.id;

     // Validate ID format
     if (isNaN(parseInt(missionId))) {
        return res.status(400).json({ success: false, message: 'Invalid mission ID format.' });
     }

    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check if mission exists before attempting deletes
        const [missions] = await connection.query('SELECT id, status FROM missions WHERE id = ? FOR UPDATE', [missionId]);
         if (missions.length === 0) {
             await connection.rollback();
             connection.release();
             return res.status(404).json({ success: false, message: 'Mission not found.' });
         }

         // Optional: Add business logic check (e.g., prevent deleting 'assigned' missions?)
         // if (['assigned', 'submitted'].includes(missions[0].status)) {
         //      await connection.rollback();
         //      connection.release();
         //      return res.status(400).json({ success: false, message: `Cannot delete mission while it is ${missions[0].status}.` });
         // }

        // Delete related data first (important for foreign key constraints if they exist)
        console.log(`Admin ${req.user.id} attempting to delete mission ${missionId} and related data...`);
        // Wrap deletions in try/catch to log potential issues with specific tables
        try { await connection.query('DELETE FROM reports WHERE mission_id = ?', [missionId]); } catch (e) { console.error(`Error deleting reports for mission ${missionId}:`, e.message); throw e; }
        try { await connection.query('DELETE FROM assignments WHERE mission_id = ?', [missionId]); } catch (e) { console.error(`Error deleting assignments for mission ${missionId}:`, e.message); throw e; }
        try { await connection.query('DELETE FROM messages WHERE mission_id = ?', [missionId]); } catch (e) { console.error(`Error deleting messages for mission ${missionId}:`, e.message); throw e; }
        try { await connection.query('DELETE FROM notifications WHERE mission_id = ?', [missionId]); } catch (e) { console.error(`Error deleting notifications for mission ${missionId}:`, e.message); throw e; }


        // Delete the mission itself
        const [result] = await connection.query('DELETE FROM missions WHERE id = ?', [missionId]);

        // No need to check result.affectedRows again due to the initial check

        await connection.commit();

        console.log(`Admin ${req.user.id} successfully deleted mission ${missionId}.`);
        res.json({ success: true, message: 'Mission and associated data deleted successfully.' });
    } catch (error) {
        if (connection) await connection.rollback(); // Rollback on any error during the transaction
        console.error(`Error deleting mission ${missionId}:`, error);
        res.status(500).json({ success: false, message: 'Server error deleting mission.' });
    } finally {
        if (connection) connection.release();
    }
};

// --- Assignment Management ---

// @desc    Assign a mission to one or more users
// @route   POST /api/admin/missions/:missionId/assign
// @access  Private (Admin)
const assignMission = async (req, res) => {
    const missionId = req.params.missionId;
    // Expect an array of user IDs in the request body
    const { userIds } = req.body;

     // Validate missionId format
     if (isNaN(parseInt(missionId))) {
        return res.status(400).json({ success: false, message: 'Invalid mission ID format.' });
     }
    // Validate userIds array
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ success: false, message: 'userIds must be a non-empty array.' });
    }
    // Validate each user ID in the array
    if (!userIds.every(id => Number.isInteger(id) && id > 0)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format found in the array.' });
    }


    let connection;
    const results = { assigned: [], failed: [], alreadyAssigned: [] };

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Check if mission exists and is assignable (Lock the row)
        const [missions] = await connection.query('SELECT status FROM missions WHERE id = ? FOR UPDATE', [missionId]);
        if (missions.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Mission not found.' });
        }
        const missionStatus = missions[0].status;
        // Allow assigning if available OR already assigned (to add more users)
        if (missionStatus !== 'available' && missionStatus !== 'assigned') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: `Mission status (${missionStatus}) prevents assignment.` });
        }

        // 2. Get currently assigned users to avoid duplicates efficiently
        const [currentAssignments] = await connection.query('SELECT user_id FROM assignments WHERE mission_id = ? AND status = ?', [missionId, 'assigned']);
        const currentlyAssignedIds = new Set(currentAssignments.map(a => a.user_id));


        // 3. Process each user ID for assignment
        for (const userId of userIds) {
            try {
                // 3a. Check if user exists, is an active shopper
                const [users] = await connection.query('SELECT status FROM users WHERE id = ? AND role = ?', [userId, 'shopper']);
                if (users.length === 0 || users[0].status !== 'active') {
                     results.failed.push({ userId, reason: 'User not found, inactive, or not a shopper.' });
                     continue; // Skip to next user
                }

                // 3b. Check if already assigned (using the Set)
                if (currentlyAssignedIds.has(userId)) {
                    results.alreadyAssigned.push(userId);
                    continue; // Skip to next user
                }

                // 4. Create assignment record with 'assigned' status
                await connection.query(
                    'INSERT INTO assignments (mission_id, user_id, status, applied_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE status = ?, applied_at = NOW()',
                    [missionId, userId, 'assigned', 'assigned'] // Update status if somehow exists but wasn't 'assigned'
                );
                results.assigned.push(userId);

            } catch (userError) {
                console.error(`Error assigning user ${userId} to mission ${missionId}:`, userError);
                results.failed.push({ userId, reason: 'Database error during individual assignment.' });
                 // Decide if one user failure should rollback the whole batch? (Current: No)
            }
        }

        // 5. Update mission status to 'assigned' if it was 'available' AND at least one user was newly assigned
        if (missionStatus === 'available' && results.assigned.length > 0) {
            await connection.query('UPDATE missions SET status = ? WHERE id = ?', ['assigned', missionId]);
             console.log(`Mission ${missionId} status updated to 'assigned' due to new assignments.`);
        }

        await connection.commit();

        // Construct response message
        let message = `Assignment Results: ${results.assigned.length} newly assigned.`;
        if (results.alreadyAssigned.length > 0) message += ` ${results.alreadyAssigned.length} already assigned.`;
        if (results.failed.length > 0) {
            message += ` ${results.failed.length} failed.`;
            console.error("Assignment Failures:", results.failed);
        }

        console.log(`Admin ${req.user.id} processed assignments for mission ${missionId}. Results:`, results);
        res.status(200).json({ success: true, message, results });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error(`Error processing bulk assignment for mission ${missionId}:`, error);
        res.status(500).json({ success: false, message: 'Server error during bulk assignment process.' });
    } finally {
        if (connection) connection.release();
    }
};


// --- Report Review ---

// @desc    Get all reports for a specific mission
// @route   GET /api/admin/missions/:missionId/reports
// @access  Private (Admin)
const getReportsForMission = async (req, res) => {
    const missionId = req.params.missionId;

    // Validate ID format
     if (isNaN(parseInt(missionId))) {
        return res.status(400).json({ success: false, message: 'Invalid mission ID format.' });
     }

    try {
        // Join with users table to get shopper details
        const [reports] = await pool.query(
            `SELECT
                r.id, r.mission_id, r.user_id, r.answers, r.submitted_at, r.status, r.refusal_reason,
                u.name AS shopperName, u.email AS shopperEmail, u.profile_pic_url AS shopperAvatarUrl
             FROM reports r
             JOIN users u ON r.user_id = u.id
             WHERE r.mission_id = ?
             ORDER BY r.submitted_at DESC`,
            [missionId]
        );

        // Parse answers JSON for each report
         const processedReports = reports.map(r => {
            let parsedAnswers = {};
            if (r.answers) {
                 try {
                    parsedAnswers = JSON.parse(r.answers);
                 } catch (e) {
                     console.error(`Failed to parse answers for report ${r.id}:`, e);
                     // parsedAnswers = { _parseError: "Could not read report answer data." }; // Optionally flag error
                 }
            }
            return {
                id: r.id,
                missionId: r.mission_id,
                userId: r.user_id,
                shopperName: r.shopperName,
                shopperEmail: r.shopperEmail,
                shopperAvatarUrl: r.shopperAvatarUrl,
                submittedAt: r.submitted_at,
                status: r.status,
                refusalReason: r.refusal_reason,
                answers: parsedAnswers, // Include the parsed (or empty/error) answers
             };
         });

        res.json({ success: true, reports: processedReports });
    } catch (error) {
        console.error(`Error fetching reports for mission ${missionId}:`, error);
        res.status(500).json({ success: false, message: 'Server error fetching reports.' });
    }
};


// @desc    Approve a submitted report
// @route   PATCH /api/admin/reports/:reportId/approve
// @access  Private (Admin)
const approveReport = async (req, res) => {
    const reportId = req.params.reportId;

    // Validate ID format
     if (isNaN(parseInt(reportId))) {
        return res.status(400).json({ success: false, message: 'Invalid report ID format.' });
     }

    let connection;
    const io = req.app.get('socketio'); // Get io instance for notifications

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Check report status and get related info (Lock rows)
        const [reports] = await connection.query(
            'SELECT r.mission_id, r.status, r.user_id, m.title AS missionTitle, m.status AS missionStatus ' + // Get mission status too
            'FROM reports r JOIN missions m ON r.mission_id = m.id ' +
            'WHERE r.id = ? FOR UPDATE', // Lock report row
            [reportId]
        );
        if (reports.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Report not found.' });
        }
        const report = reports[0];
        if (report.status !== 'submitted') {
             await connection.rollback();
             return res.status(400).json({ success: false, message: `Report status is ${report.status}, cannot approve.` });
        }

        const missionId = report.mission_id;
        const userId = report.user_id;
        const missionTitle = report.missionTitle;
        const currentMissionStatus = report.missionStatus;


        // Lock associated mission and user rows for update
        await connection.query('SELECT id FROM missions WHERE id = ? FOR UPDATE', [missionId]);
        await connection.query('SELECT id FROM users WHERE id = ? FOR UPDATE', [userId]);

        // 2. Update report status to 'approved'
        await connection.query('UPDATE reports SET status = ? WHERE id = ?', ['approved', reportId]);

        // 3. Update user's completed missions count
        await connection.query('UPDATE users SET completed_missions = completed_missions + 1 WHERE id = ?', [userId]);
        console.log(`Incremented completed missions for user ${userId}`);

         // 4. Check if *all* assigned users have submitted and been reviewed (approved/refused)
         // Get counts of assignments and reports (approved/refused)
        const [[{ assignedCount }]] = await connection.query(
             'SELECT COUNT(*) as assignedCount FROM assignments WHERE mission_id = ? AND status = ?',
             [missionId, 'assigned']
         );
        const [[{ reviewedReportCount }]] = await connection.query(
             'SELECT COUNT(*) as reviewedReportCount FROM reports WHERE mission_id = ? AND status IN (?, ?)',
             [missionId, 'approved', 'refused']
         );

         // 5. Update mission status to 'approved' only if all assigned users' reports are reviewed
        let missionUpdatedToApproved = false;
        if (currentMissionStatus !== 'approved' && assignedCount > 0 && reviewedReportCount >= assignedCount) {
            await connection.query('UPDATE missions SET status = ? WHERE id = ?', ['approved', missionId]);
            missionUpdatedToApproved = true;
            console.log(`Mission ${missionId} marked as 'approved' as all reports reviewed.`);
        } else if (currentMissionStatus === 'submitted') {
            // If not all reviewed, but was 'submitted', keep it 'submitted' or 'assigned' depending on other reports
             console.log(`Mission ${missionId} status remains '${currentMissionStatus}' as not all reports are reviewed yet.`);
        }

        // 6. Update assignment status for the user
        await connection.query('UPDATE assignments SET status = ? WHERE mission_id = ? AND user_id = ?', ['completed', missionId, userId]);


        await connection.commit();

        // --- Post-Transaction Actions ---
        console.log(`Admin ${req.user.id} approved report ${reportId} for mission ${missionId} (User: ${userId}). Payment simulated.`);

        // Send Socket.IO notification to the specific user
        if (io && io.sendNotification) {
             const notificationData = {
                type: 'REPORT_APPROVED',
                message: `Your report for mission "${missionTitle}" has been approved! Payment processed.`,
                missionId: missionId,
                reportId: reportId,
                timestamp: new Date()
             };
             io.sendNotification(userId, notificationData); // Target specific user ID
        } else {
             console.warn("Socket.IO instance or sendNotification method not available.");
        }


        res.json({ success: true, message: `Report approved.${missionUpdatedToApproved ? ' Mission marked as completed.' : ''}` });

    } catch (error) { 
        if (connection) await connection.rollback();
        console.error(`Error approving report ${reportId}:`, error);
        res.status(500).json({ success: false, message: 'Server error approving report.' });
    } finally {
         if (connection) connection.release();
    }
};

// @desc    Refuse a submitted report
// @route   PATCH /api/admin/reports/:reportId/refuse
// @access  Private (Admin)
const refuseReport = async (req, res) => {
    const reportId = req.params.reportId;
    const { reason } = req.body; // Expect refusal reason

     // Validate ID format
     if (isNaN(parseInt(reportId))) {
        return res.status(400).json({ success: false, message: 'Invalid report ID format.' });
     }
    // Validate reason
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Refusal reason is required.' });
    }
     const trimmedReason = reason.trim();
     if (trimmedReason.length > 1000) { // Add a reasonable length limit
         return res.status(400).json({ success: false, message: 'Refusal reason is too long (max 1000 characters).' });
     }


    let connection;
    const io = req.app.get('socketio'); // Get io instance

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Check report status and get related info (Lock rows)
        const [reports] = await connection.query(
            'SELECT r.mission_id, r.status, r.user_id, m.title AS missionTitle, m.status AS missionStatus ' +
            'FROM reports r JOIN missions m ON r.mission_id = m.id ' +
            'WHERE r.id = ? FOR UPDATE',
            [reportId]
        );
        if (reports.length === 0) {
             await connection.rollback();
             return res.status(404).json({ success: false, message: 'Report not found.' });
        }
        const report = reports[0];
         if (report.status !== 'submitted') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: `Report status is ${report.status}, cannot refuse.` });
         }

        const missionId = report.mission_id;
        const userId = report.user_id;
        const missionTitle = report.missionTitle;
        const currentMissionStatus = report.missionStatus;


        // Lock mission row
        await connection.query('SELECT id FROM missions WHERE id = ? FOR UPDATE', [missionId]);

        // 2. Update report status to 'refused' and add reason
        await connection.query('UPDATE reports SET status = ?, refusal_reason = ? WHERE id = ?', ['refused', trimmedReason, reportId]);

         // 3. Update assignment status for the user
        await connection.query('UPDATE assignments SET status = ? WHERE mission_id = ? AND user_id = ?', ['completed', missionId, userId]);


        // 4. Check if this refusal should mark the entire mission as refused
        // Simple logic: If any report is refused, mark mission refused. (Can be adjusted)
        let missionUpdatedToRefused = false;
         if (currentMissionStatus !== 'refused' && currentMissionStatus !== 'approved') { // Avoid overwriting final states
             await connection.query('UPDATE missions SET status = ? WHERE id = ?', ['refused', missionId]);
             missionUpdatedToRefused = true;
             console.log(`Mission ${missionId} marked as 'refused' due to report ${reportId} refusal.`);
        }

        await connection.commit();

         // --- Post-Transaction Actions ---
         console.log(`Admin ${req.user.id} refused report ${reportId} for mission ${missionId} (User: ${userId}). Reason: ${trimmedReason}`);

         // Emit Socket.IO notification to the specific user
         if (io && io.sendNotification) {
            const notificationData = {
                type: 'REPORT_REFUSED',
                message: `Your report for mission "${missionTitle}" was refused. Reason: ${trimmedReason}`,
                missionId: missionId,
                reportId: reportId,
                refusalReason: trimmedReason,
                timestamp: new Date()
            };
            io.sendNotification(userId, notificationData);
        } else {
             console.warn("Socket.IO instance or sendNotification method not available.");
        }

        res.json({ success: true, message: `Report refused.${missionUpdatedToRefused ? ' Mission marked as refused.' : ''}` });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error(`Error refusing report ${reportId}:`, error);
        res.status(500).json({ success: false, message: 'Server error refusing report.' });
    } finally {
         if (connection) connection.release();
    }
};

// --- Survey Management ---

// @desc    Save/Update survey questions for a mission
// @route   POST /api/admin/missions/:missionId/survey
// @access  Private (Admin)
const saveSurvey = async (req, res) => {
    const missionId = req.params.missionId;
    const { questions } = req.body; // Expecting { questions: [...] }

     // Validate ID format
     if (isNaN(parseInt(missionId))) {
        return res.status(400).json({ success: false, message: 'Invalid mission ID format.' });
     }

    // --- Validation ---
    if (!questions || !Array.isArray(questions)) { // Check for null/undefined and array type
        return res.status(400).json({ success: false, message: 'Invalid format. Expected a "questions" array in the request body.' });
    }

    // Basic validation of question structure (can be more thorough using Zod or similar)
     const validationErrors = [];
     questions.forEach((q, index) => {
         if (!q || typeof q !== 'object') validationErrors.push(`Question ${index + 1} is not a valid object.`);
         else {
             if (!q.id) validationErrors.push(`Question ${index + 1} is missing an 'id'.`);
             if (!q.type) validationErrors.push(`Question ${index + 1} (ID: ${q.id}) is missing a 'type'.`);
             if (!q.text || typeof q.text !== 'string' || q.text.trim().length === 0) validationErrors.push(`Question ${index + 1} (ID: ${q.id}) has empty or invalid 'text'.`);
             // Add more checks (e.g., options for choices, valid type values)
             if ((q.type === 'multiple_choice' || q.type === 'checkboxes') && (!Array.isArray(q.options) || q.options.length === 0 || q.options.some(opt => !opt.id || !opt.text))) {
                validationErrors.push(`Question ${index + 1} (ID: ${q.id}) requires valid 'options' array with id and text.`);
             }
         }
     });

    if (validationErrors.length > 0) {
        return res.status(400).json({ success: false, message: 'Invalid survey structure.', errors: validationErrors });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check if mission exists (Lock row)
        const [existing] = await connection.query('SELECT id FROM missions WHERE id = ? FOR UPDATE', [missionId]);
        if (existing.length === 0) {
             await connection.rollback();
            return res.status(404).json({ success: false, message: 'Mission not found.' });
        }

        // Store the entire questions array as a JSON string
        const questionsJson = JSON.stringify(questions);

        // Use UPDATE query
        const [result] = await connection.query('UPDATE missions SET survey_questions = ? WHERE id = ?', [questionsJson, missionId]);

        // Check if update was successful (affectedRows should be 1 if found)
         if (result.affectedRows === 0) {
            // Should not happen if mission exists, but safety check
             await connection.rollback();
             return res.status(404).json({ success: false, message: 'Mission not found or survey update failed unexpectedly.' });
         }

        await connection.commit();

        console.log(`Admin ${req.user.id} saved survey for mission ${missionId}.`);
        res.status(200).json({ success: true, message: 'Survey saved successfully.' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error(`Error saving survey for mission ${missionId}:`, error);
        // Handle JSON stringify errors (less likely with validation)
        if (error instanceof SyntaxError) {
            return res.status(500).json({ success: false, message: 'Internal error processing survey questions.' });
        }
        res.status(500).json({ success: false, message: 'Server error saving survey.' });
    } finally {
         if (connection) connection.release();
    }
};

// @desc    Get survey questions for a mission
// @route   GET /api/admin/missions/:missionId/survey
// @access  Private (Admin or Shopper - requires auth middleware adjustment if needed)
// NOTE: Keeping access as Admin for now based on route structure.
// Shoppers get survey via GET /api/missions/:id endpoint.
const getSurvey = async (req, res) => {
    const missionId = req.params.missionId;

    // Validate ID format
     if (isNaN(parseInt(missionId))) {
        return res.status(400).json({ success: false, message: 'Invalid mission ID format.' });
     }

    try {
        const [missions] = await pool.query('SELECT survey_questions FROM missions WHERE id = ?', [missionId]);

        if (missions.length === 0) {
            return res.status(404).json({ success: false, message: 'Mission not found.' });
        }

        let questions = [];
        if (missions[0].survey_questions) {
            try {
                questions = JSON.parse(missions[0].survey_questions);
                 // Ensure result is always an array
                 if (!Array.isArray(questions)) {
                     console.warn(`Survey data for mission ${missionId} is not an array after parsing.`);
                     questions = [];
                 }
            } catch (parseError) {
                console.error(`Failed to parse survey questions JSON for mission ${missionId}:`, parseError);
                 // Optionally log this error more formally
            }
        }

        res.json({ success: true, questions }); // Return the array of questions

    } catch (error) {
        console.error(`Error fetching survey for mission ${missionId}:`, error);
        res.status(500).json({ success: false, message: 'Server error fetching survey.' });
    }
};


// --- Dashboard Stats ---

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        // Use Promise.all for concurrent, non-dependent queries
        const [
            // User counts
            [[{ totalUsers }]],
            [[{ totalShoppers }]],
            [[{ activeShoppers }]],
             // Mission counts by status
             [missionStatusCountsResult],
            // Report counts by status
            [reportStatusCountsResult],
            // Total missions
            [[{ totalMissions }]],
             // Missions by category
             [missionsByCategoryResult],
        ] = await Promise.all([
            // Users
            pool.query('SELECT COUNT(*) as totalUsers FROM users'),
            pool.query('SELECT COUNT(*) as totalShoppers FROM users WHERE role = ?', ['shopper']),
            pool.query('SELECT COUNT(*) as activeShoppers FROM users WHERE role = ? AND status = ?', ['shopper', 'active']),
            // Missions
            pool.query('SELECT status, COUNT(*) as count FROM missions GROUP BY status'),
            // Reports
            pool.query('SELECT status, COUNT(*) as count FROM reports GROUP BY status'),
            pool.query('SELECT COUNT(*) as totalMissions FROM missions'),
            pool.query('SELECT category, COUNT(*) as count FROM missions GROUP BY category ORDER BY count DESC'),
        ]);

         // Process grouped results into key-value objects for easier frontend use
         const missionStatusCounts = missionStatusCountsResult.reduce((acc, row) => {
            acc[row.status] = row.count;
            return acc;
         }, {});
        const reportStatusCounts = reportStatusCountsResult.reduce((acc, row) => {
             acc[row.status] = row.count;
             return acc;
         }, {});


        res.json({
            success: true,
            stats: {
                totalUsers,
                totalShoppers,
                activeShoppers,
                totalMissions,
                // Add specific counts derived from grouped data if needed frontend side
                pendingReports: reportStatusCounts['submitted'] || 0,
                approvedReports: reportStatusCounts['approved'] || 0,
                refusedReports: reportStatusCounts['refused'] || 0,
                availableMissions: missionStatusCounts['available'] || 0,
                assignedMissions: missionStatusCounts['assigned'] || 0,
                completedMissions: missionStatusCounts['approved'] || 0, // Assuming 'approved' state marks completion

                // Raw grouped data
                missionStatusCounts, // e.g., { available: 5, assigned: 3, ... }
                reportStatusCounts, // e.g., { submitted: 2, approved: 15, ... }
                missionsByCategory: missionsByCategoryResult, // e.g., [ { category: 'Retail', count: 10 }, ... ]
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server error fetching dashboard stats.' });
    }
};


module.exports = {
    // Users
    getUsers,
    getUserById,
    updateUser,
    toggleUserStatus,
    // Missions
    createMission,
    getAllMissions,
    getMissionById, // Added Admin specific get mission by ID
    updateMission,
    deleteMission,
    // Assignments
    assignMission,
    // Reports
    getReportsForMission,
    approveReport,
    refuseReport,
    // Surveys
    saveSurvey,
    getSurvey,
    // Stats
    getDashboardStats,
};
