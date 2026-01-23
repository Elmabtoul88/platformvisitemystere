const pool = require('../config/db');

// @desc    Submit or Update a report for a mission
// @route   POST /api/missions/:missionId/reports
// @access  Private (Shopper)
const submitReport = async (req, res) => {
    const missionId = req.params.missionId;
    const userId = req.user.id; // From auth middleware
    const { answers } = req.body; // Expecting { answers: { q_id_type: value | { type: '...', value: '...' } } }

    // --- Input Validation ---
    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
        return res.status(400).json({ success: false, message: 'Report answers are required and must be a non-empty object.' });
    }
    // Optional: Add deeper validation for the structure of 'answers' if needed

     // Validate missionId format
     if (isNaN(parseInt(missionId))) {
        return res.status(400).json({ success: false, message: 'Invalid mission ID format.' });
     }

    let connection; // Define connection outside try block

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Verify Assignment and Mission Status (Lock relevant rows)
        // Check if user has an 'assigned' status in the assignments table for this mission
        // Also check if the mission itself is in a state allowing submission ('assigned', 'submitted')
        const [assignmentCheck] = await connection.query(
            `SELECT m.status AS missionStatus
             FROM assignments a
             JOIN missions m ON a.mission_id = m.id
             WHERE a.mission_id = ? AND a.user_id = ? AND a.status = ?
             FOR UPDATE`, // Lock assignment row
            [missionId, userId, 'assigned'] // User MUST have assignment status 'assigned'
        );

        if (assignmentCheck.length === 0) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'You are not assigned to this mission or assignment status is invalid.' });
        }

        const missionStatus = assignmentCheck[0].missionStatus;
        if (missionStatus !== 'assigned' && missionStatus !== 'submitted') { // Mission must be 'assigned' or 'submitted'
            await connection.rollback();
            return res.status(400).json({ success: false, message: `Cannot submit report for mission with status: ${missionStatus}.` });
        }

        // Lock mission row as well
        await connection.query('SELECT id FROM missions WHERE id = ? FOR UPDATE', [missionId]);

        // 2. Check if a report already exists (Upsert Logic)
        const [existingReports] = await connection.query(
            'SELECT id, status FROM reports WHERE mission_id = ? AND user_id = ? LIMIT 1 FOR UPDATE', // Lock existing report row
            [missionId, userId]
        );

        let reportId;
        let actionMessage;
        let httpStatus = 200; // Default to 200 OK for update
        const answersJson = JSON.stringify(answers); // Store answers as JSON string

        if (existingReports.length > 0) {
            // --- Update Existing Report ---
            reportId = existingReports[0].id;
            const existingReportStatus = existingReports[0].status;

            // Prevent updating if already approved/refused
            if (existingReportStatus === 'approved' || existingReportStatus === 'refused') {
                 await connection.rollback();
                 return res.status(400).json({ success: false, message: `Cannot update report with status: ${existingReportStatus}.` });
            }

            // Update answers, submission time, and status back to 'submitted'
            await connection.query(
                'UPDATE reports SET answers = ?, submitted_at = NOW(), status = ? WHERE id = ?',
                [answersJson, 'submitted', reportId]
            );
            actionMessage = `Report updated successfully.`;
            console.log(`Report ${reportId} for mission ${missionId} by user ${userId} updated.`);

            // Ensure mission status is 'submitted' if it wasn't already
            if (missionStatus === 'assigned') {
                await connection.query('UPDATE missions SET status = ? WHERE id = ?', ['submitted', missionId]);
                 console.log(`Updated mission ${missionId} status back to 'submitted'.`);
            }

        } else {
            // --- Insert New Report ---
            const newReport = {
                mission_id: missionId,
                user_id: userId,
                answers: answersJson,
                submitted_at: new Date(), // Can use NOW() in query too
                status: 'submitted'
            };
            const [result] = await connection.query('INSERT INTO reports SET ?', newReport);
            reportId = result.insertId;
            actionMessage = `Report submitted successfully.`;
            httpStatus = 201; // Use 201 Created for new resource
            console.log(`New report ${reportId} for mission ${missionId} by user ${userId} inserted.`);

            // Update the mission status to 'submitted' if it was 'assigned'
            if (missionStatus === 'assigned') {
                 await connection.query('UPDATE missions SET status = ? WHERE id = ?', ['submitted', missionId]);
                 console.log(`Updated mission ${missionId} status to 'submitted'.`);
            }
        }

        // Commit transaction
        await connection.commit();

        // Emit notification/event if needed (e.g., via Socket.IO)
        const io = req.app.get('socketio');
        if (io && io.to) { // Check if io and 'to' method exist
             // Notify admins that a report was submitted/updated
             const notificationData = {
                 type: httpStatus === 201 ? 'REPORT_SUBMITTED' : 'REPORT_UPDATED',
                 message: `Report for mission #${missionId} was ${httpStatus === 201 ? 'submitted' : 'updated'} by user #${userId}.`,
                 missionId: missionId,
                 reportId: reportId,
                 userId: userId,
                 timestamp: new Date()
             };
             // Send to a room containing all admins
             io.to('admin_room').emit('notification', notificationData);
             console.log("Sent report submission/update notification to admin_room.");
         } else {
             console.warn("Socket.IO instance not available or 'to' method missing for sending admin notification.");
         }

        // Respond with success
        res.status(httpStatus).json({ success: true, message: actionMessage, reportId });

    } catch (error) {
        // Rollback transaction on error
        if (connection) await connection.rollback();

        console.error('Error submitting report:', error);
        // Handle specific errors
        if (error instanceof SyntaxError) { // Should not happen if JSON.stringify is correct
             return res.status(400).json({ success: false, message: 'Invalid JSON format in report answers.' });
         }
         if (error.code === 'ER_DATA_TOO_LONG') {
             return res.status(400).json({ success: false, message: 'Report data is too large for storage.' });
         }
        res.status(500).json({ success: false, message: 'Server error submitting report.' });
    } finally {
        // Always release the connection
        if (connection) connection.release();
    }
};

// @desc    Get report details by ID
// @route   GET /api/missions/:missionId/reports/:reportId
// @access  Private (Shopper owner or Admin)
const getReportById = async (req, res) => {
    const { missionId, reportId } = req.params;
    const userId = req.user.id; // From auth middleware
    const userRole = req.user.role; // From auth middleware

     // Validate IDs
     if (isNaN(parseInt(missionId)) || isNaN(parseInt(reportId))) {
        return res.status(400).json({ success: false, message: 'Invalid mission or report ID format.' });
     }

    try {
        // Fetch report details, join with mission and user for context
        const [reports] = await pool.query(
            `SELECT
                r.id, r.mission_id, r.user_id, r.answers, r.submitted_at, r.status, r.refusal_reason,
                m.title AS missionTitle,
                u.name AS shopperName, u.email AS shopperEmail
             FROM reports r
             JOIN missions m ON r.mission_id = m.id
             JOIN users u ON r.user_id = u.id
             WHERE r.id = ? AND r.mission_id = ?`, // Ensure report belongs to mission
            [reportId, missionId]
        );

        if (reports.length === 0) {
            return res.status(404).json({ success: false, message: 'Report not found for this mission.' });
        }

        const report = reports[0];

        // --- Authorization Check ---
        // Allow access if the requester is the report owner OR an admin
        if (report.user_id !== userId && userRole !== 'admin') {
             console.warn(`User ${userId} (role: ${userRole}) attempted unauthorized access to report ${reportId}. Owner: ${report.user_id}`);
            return res.status(403).json({ success: false, message: 'You are not authorized to view this report.' });
        }

        // --- Parse Answers JSON Safely ---
        let parsedAnswers = {};
        if (report.answers) {
            try {
                parsedAnswers = JSON.parse(report.answers);
            } catch (parseError) {
                console.error(`Failed to parse answers JSON for report ${report.id}:`, parseError);
                // Keep parsedAnswers as {}, maybe log this issue more formally
                 // parsedAnswers = { _parseError: "Could not read report answer data." };
            }
        }

        // Prepare response object (map DB columns to camelCase if needed)
        const responseReport = {
            id: report.id,
            missionId: report.mission_id,
            userId: report.user_id,
            shopperName: report.shopperName,
            shopperEmail: report.shopperEmail,
            missionTitle: report.missionTitle,
            submittedAt: report.submitted_at,
            status: report.status,
            refusalReason: report.refusal_reason,
            answers: parsedAnswers, // Send parsed answers
        };

        res.json({ success: true, report: responseReport });

    } catch (error) {
        console.error('Error fetching report details:', error);
        res.status(500).json({ success: false, message: 'Server error fetching report details.' });
    }
};


module.exports = {
    submitReport,
    getReportById,
};
