const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const generateToken = require("../utils/generateToken");
const { validate: uuidValidate } = require("uuid"); // Keep if using UUIDs later

// Simple email format check (basic)
const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

// Basic password strength check (example)
const isValidPassword = (password) => {
  return password && password.length >= 6; // Minimum 6 characters
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  // Destructure expected fields, provide defaults where applicable
  const {
    name,
    email,
    password,
    role = "shopper",
    telephone,
    city,
    motivation,
    birthYear,
    gender,
    cvUrl,
  } = req.body;

  // --- Input Validation ---
  const errors = {};
  if (!name || typeof name !== "string" || name.trim().length === 0)
    errors.name = "Name is required.";
  if (!email || !isValidEmail(email))
    errors.email = "A valid email address is required.";
  if (!password || !isValidPassword(password))
    errors.password = "Password must be at least 6 characters long.";

  // Optional: Validate role if only specific roles are allowed for registration
  const allowedRoles = ["shopper", "admin"]; // Define allowed roles
  if (role && !allowedRoles.includes(role)) {
    errors.role = `Invalid role specified. Allowed roles are: ${allowedRoles.join(
      ", "
    )}.`;
  }
  // Optional: Validate other fields
  if (
    birthYear &&
    (isNaN(parseInt(birthYear)) ||
      birthYear < 1900 ||
      birthYear > new Date().getFullYear())
  ) {
    errors.birthYear = "Please provide a valid birth year.";
  }
  const allowedGenders = ["male", "female", "other", "prefer_not_say"];
  if (gender && !allowedGenders.includes(gender)) {
    errors.gender = `Invalid gender specified. Allowed values are: ${allowedGenders.join(
      ", "
    )}.`;
  }

  if (Object.keys(errors).length > 0) {
    // Return multiple validation errors at once
    return res
      .status(400)
      .json({ success: false, message: "Validation failed.", errors });
  }

  // --- Business Logic ---
  try {
    // 1. Check if user already exists (case-insensitive email check)
    const lowerCaseEmail = email.toLowerCase();
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [lowerCaseEmail]
    );
    if (existingUsers.length > 0) {
      return res
        .status(409)
        .json({
          success: false,
          message: "User already exists with this email.",
        }); // 409 Conflict
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user object for insertion (with defaults for missing optional fields)
    const newUser = {
      name: name.trim(),
      email: lowerCaseEmail,
      password: hashedPassword,
      role,
      telephone: telephone || null,
      city: city || null,
      motivation: motivation || null,
      birth_year: birthYear ? parseInt(birthYear) : null,
      gender: gender || "prefer_not_say",
      cv_url: cvUrl || null,
      registration_date: new Date(),
      status: "active", // Default status
      completed_missions: 0, // Initialize completed missions
      // profile_pic_url: null, // Initialize if field exists
    };

    // 4. Insert user into database
    const [result] = await pool.query("INSERT INTO users SET ?", newUser);
    const insertedId = result.insertId;

    console.log(
      `User registered successfully. ID: ${insertedId}, Email: ${lowerCaseEmail}, Role: ${role}`
    );
    // Respond with success (don't log in automatically)
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please log in.",
      userId: insertedId, // Return the ID of the newly created user
      // Do NOT send back token or sensitive user details here
    });
  } catch (error) {
    console.error("Error registering user:", error);
    // Check for specific DB errors like unique constraints (though we check email first)
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({
          success: false,
          message: "Database conflict. Email might already exist.",
        });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error during registration." });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // --- Input Validation ---
  if (!email || !isValidEmail(email)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Please provide a valid email address.",
      });
  }
  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: "Password is required." });
  }

  // --- Business Logic ---
  try {
    // 1. Check for user email (case-insensitive comparison)
    const lowerCaseEmail = email.toLowerCase();
    // **IMPORTANT:** Explicitly select all fields needed by the frontend context
    const [users] = await pool.query(
      "SELECT id, name, email, password, role, status, profile_pic_url, completed_missions FROM users WHERE email = ? LIMIT 1",
      [lowerCaseEmail]
    );

    if (users.length === 0) {
      console.warn(
        `Login attempt failed: User not found for email ${lowerCaseEmail}`
      );
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." }); // Use generic message
    }

    const userFromDb = users[0]; // Renamed to avoid confusion

    // **DEBUGGING:** Log the user object fetched from DB
    // console.log("User fetched from DB:", JSON.stringify(userFromDb, null, 2));

    // 2. Check if user account is active
    if (userFromDb.status !== "active") {
      console.warn(
        `Login attempt failed: Account inactive for user ${userFromDb.id} (${lowerCaseEmail})`
      );
      return res
        .status(403)
        .json({
          success: false,
          message: "Account is inactive. Please contact support.",
        }); // 403 Forbidden
    }

    // 3. Check if password matches
    const isMatch = await bcrypt.compare(password, userFromDb.password);

    if (isMatch) {
      // 4. Generate JWT token including necessary info (id, role)
      const token = generateToken(userFromDb.id, userFromDb.role);

      // 5. Construct the user object to return in the response
      // **Ensure all required fields are mapped correctly**
      const userResponse = {
        id: userFromDb.id,
        name: userFromDb.name, // Ensure name is included
        email: userFromDb.email,
        role: userFromDb.role, // Ensure role is included
        profilePicUrl: userFromDb.profile_pic_url,
        completedMissions: userFromDb.completed_missions,
        // Add other non-sensitive fields if needed by frontend context
      };

      // **DEBUGGING:** Log the response object being sent
      console.log(
        "Login successful. Response payload:",
        JSON.stringify(
          { success: true, user: userResponse, tokenExists: !!token },
          null,
          2
        )
      );

      res.json({
        success: true,
        message: "Login successful.",
        user: userResponse, // Send the constructed user object
        token: token,
      });
    } else {
      console.warn(
        `Login attempt failed: Invalid password for user ${userFromDb.id} (${lowerCaseEmail})`
      );
      res.status(401).json({ success: false, message: "Invalid credentials." }); // Generic message
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login." });
  }
};

// --- TODO: Implement Forgot Password / Reset Password Controllers ---
// - Request password reset (generates token, sends email/SMS)
// - Verify reset token
// - Update password

module.exports = {
  registerUser,
  loginUser,
};
