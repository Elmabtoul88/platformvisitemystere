const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    // User Management
    getUsers,
    getUserById,
    updateUser,
    toggleUserStatus,
    // Mission Management
    createMission,
    getAllMissions,
    getMissionById: getMissionByIdAdmin, // Alias to avoid conflict if imported elsewhere
    updateMission,
    deleteMission,
    // Assignment Management
    assignMission,
    // Report Management
    getReportsForMission,
    approveReport,
    refuseReport,
    // Survey Management
    saveSurvey,
    getSurvey,
    // Stats
    getDashboardStats
} = require('../controllers/adminController');

const router = express.Router();

// --- Base Middleware for all Admin Routes ---
// All routes in this file require authentication and 'admin' role.
router.use(protect);
router.use(authorize('admin'));

// --- User Routes ---
// Base path: /api/admin/users
router.get('/users', (req, res, next) => getUsers(req, res).catch(next));
router.get('/users/:id', (req, res, next) => getUserById(req, res).catch(next));
router.put('/users/:id', (req, res, next) => updateUser(req, res).catch(next));
router.patch('/users/:id/status', (req, res, next) => toggleUserStatus(req, res).catch(next));

// --- Mission Routes ---
// Base path: /api/admin/missions
router.post('/missions', (req, res, next) => createMission(req, res).catch(next));
router.get('/missions', (req, res, next) => getAllMissions(req, res).catch(next));
router.get('/missions/:id', (req, res, next) => getMissionByIdAdmin(req, res).catch(next)); // Use admin controller function
router.put('/missions/:id', (req, res, next) => updateMission(req, res).catch(next));
router.delete('/missions/:id', (req, res, next) => deleteMission(req, res).catch(next));
router.post('/missions/:missionId/assign', (req, res, next) => assignMission(req, res).catch(next));

// --- Report Review Routes ---
// Base path: /api/admin/reports (for actions on specific reports)
// Base path: /api/admin/missions/:missionId/reports (for getting reports of a mission)
router.get('/missions/:missionId/reports', (req, res, next) => getReportsForMission(req, res).catch(next));
router.patch('/reports/:reportId/approve', (req, res, next) => approveReport(req, res).catch(next));
router.patch('/reports/:reportId/refuse', (req, res, next) => refuseReport(req, res).catch(next));

// --- Survey Routes ---
// Base path: /api/admin/missions/:missionId/survey
router.post('/missions/:missionId/survey', (req, res, next) => saveSurvey(req, res).catch(next));
router.get('/missions/:missionId/survey', (req, res, next) => getSurvey(req, res).catch(next));

// --- Dashboard Stats Route ---
// Base path: /api/admin/stats
router.get('/stats', (req, res, next) => getDashboardStats(req, res).catch(next));

module.exports = router;
