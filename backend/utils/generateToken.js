const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // Ensure environment variables are loaded

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // Default to 1 day expiry

// --- Pre-flight Check for JWT_SECRET ---
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
  console.error('Authentication will not function correctly.');
  // In a real application, you might want to throw an error or exit
  // throw new Error('JWT_SECRET must be set in the environment variables.');
  process.exit(1); // Exit if secret is absolutely required
} else if (JWT_SECRET.length < 32) {
    // Warn if the secret seems too short/weak (recommendation)
    console.warn('WARNING: Your JWT_SECRET is less than 32 characters long. Consider using a longer, more secure secret.');
}

/**
 * Generates a JSON Web Token (JWT) for a user.
 *
 * @param {string | number} id - The user's unique identifier.
 * @param {string} role - The user's role (e.g., 'shopper', 'admin').
 * @returns {string} The generated JWT.
 * @throws {Error} If JWT signing fails.
 */
const generateToken = (id, role) => {
  // --- Payload Definition ---
  // Include essential, non-sensitive information needed for authorization
  const payload = {
    id: id,   // User ID is crucial for identifying the user
    role: role, // Role is crucial for authorization checks
    // Optional: You could add an issue timestamp (iat) here, but jwt.sign does it automatically.
    // Optional: You could add other non-sensitive claims if needed.
  };

  // --- Signing Options ---
  const options = {
    expiresIn: JWT_EXPIRES_IN, // Set token expiration time
    // algorithm: 'HS256' // Algorithm is HS256 by default for HMAC secrets
  };

  try {
    // --- Sign the Token ---
    const token = jwt.sign(payload, JWT_SECRET, options);
    console.log(`JWT generated for user ${id} with role ${role}, expires in ${JWT_EXPIRES_IN}`);
    return token;
  } catch (error) {
    console.error('Error signing JWT:', error);
    // Throw a more specific error or handle it appropriately
    throw new Error('Failed to generate authentication token.');
  }
};

module.exports = generateToken;
