const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAvailableMissions,
    getMissionById,
    applyForMission,
    getAssignedMissions,
    getCompletedMissions,
} = require('../controllers/missionController');
const reportRoutes = require('./reportRoutes'); // Import report routes for nesting

const router = express.Router();

// --- Middleware for Shopper-Specific Mission Routes ---
// All routes below require authentication and the 'shopper' role.
router.use(protect);
router.use(authorize('shopper'));

// Base path: /api/missions

// GET /api/missions - Get available missions (filtered, paginated)
router.get('/', (req, res, next) => {
    // console.log(`User ${req.user.id} requesting GET /api/missions`);
    getAvailableMissions(req, res).catch(next); // Catch async errors
});

// GET /api/missions/assigned - Get missions assigned to the current shopper
router.get('/assigned', (req, res, next) => {
    // console.log(`User ${req.user.id} requesting GET /api/missions/assigned`);
    getAssignedMissions(req, res).catch(next); // Catch async errors
});

// GET /api/missions/completed - Get missions completed by the current shopper
router.get('/completed', (req, res, next) => {
    // console.log(`User ${req.user.id} requesting GET /api/missions/completed`);
    getCompletedMissions(req, res).catch(next); // Catch async errors
});

// GET /api/missions/:id - Get details for a specific mission
router.get('/:id', (req, res, next) => {
    // console.log(`User ${req.user.id} requesting GET /api/missions/${req.params.id}`);
    getMissionById(req, res).catch(next); // Catch async errors
});

// POST /api/missions/:id/apply - Apply for a specific mission
router.post('/:id/apply', (req, res, next) => {
    // console.log(`User ${req.user.id} requesting POST /api/missions/${req.params.id}/apply`);
    applyForMission(req, res).catch(next); // Catch async errors
});


// --- Nested Report Routes ---
// Mount report routes under /api/missions/:missionId/reports
// mergeParams: true in reportRoutes allows access to :missionId
router.use('/:missionId/reports', reportRoutes);

module.exports = router;
