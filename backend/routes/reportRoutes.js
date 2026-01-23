const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { submitReport, getReportById } = require('../controllers/reportController');

// --- Report Routes ---

// mergeParams: true is crucial here to access :missionId from the parent router (missionRoutes.js)
const router = express.Router({ mergeParams: true });

// These routes are relative to the mounting point in missionRoutes.js (i.e., /api/missions/:missionId/reports)

// Submit or Update a report for a mission
// POST /api/missions/:missionId/reports/
// Requires authentication and 'shopper' role
router.post('/', protect, authorize('shopper'), (req, res, next) => {
    // console.log(`User ${req.user.id} requesting POST /api/missions/${req.params.missionId}/reports`);
    submitReport(req, res).catch(next); // Catch async errors
});

// Get details of a specific report
// GET /api/missions/:missionId/reports/:reportId
// Requires authentication, allows 'shopper' (owner) or 'admin'
router.get('/:reportId', protect, authorize('shopper', 'admin'), (req, res, next) => {
    // console.log(`User ${req.user.id} requesting GET /api/missions/${req.params.missionId}/reports/${req.params.reportId}`);
    getReportById(req, res).catch(next); // Catch async errors
});

// --- TODO: Add other report-related routes if needed ---
// E.g., DELETE /api/missions/:missionId/reports/:reportId (for shopper to delete draft?) - Requires careful implementation

module.exports = router;
