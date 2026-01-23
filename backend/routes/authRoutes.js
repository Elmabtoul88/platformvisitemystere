const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// --- Public Authentication Routes ---
// Base path: /api/auth

// Register a new user
// POST /api/auth/register
router.post('/register', (req, res, next) => {
    // console.log("Received POST /api/auth/register request"); // Optional: Log request start
    registerUser(req, res).catch(next); // Pass errors to global handler
});

// Log in an existing user
// POST /api/auth/login
router.post('/login', (req, res, next) => {
    // console.log("Received POST /api/auth/login request"); // Optional: Log request start
    loginUser(req, res).catch(next); // Pass errors to global handler
});

// --- TODO: Add routes for password reset ---
// POST /api/auth/forgot-password
// POST /api/auth/reset-password/:token

module.exports = router;
