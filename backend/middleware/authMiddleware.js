const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pool = require('../config/db'); // Import db pool for user validation

dotenv.config(); // Load .env variables

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is not defined.");
  process.exit(1); // Exit if secret is missing
} else if (JWT_SECRET.length < 32) {
  console.warn('SECURITY WARNING: Your JWT_SECRET is less than 32 characters long. Consider using a longer, more secure secret.');
}


// --- Protect Middleware: Verify JWT and attach user ---
const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // 1. Extract token from header
      token = authHeader.split(' ')[1];
      if (!token) {
          console.warn('Auth Middleware: Token missing after Bearer split.');
          return res.status(401).json({ success: false, message: 'Not authorized, token malformed' });
      }

      // 2. Verify token using the secret
      const decoded = jwt.verify(token, JWT_SECRET);
       if (!decoded.id || !decoded.role) {
            console.warn('Auth Middleware: Token payload missing id or role.');
            return res.status(401).json({ success: false, message: 'Not authorized, invalid token payload' });
       }


      // 3. **Mandatory:** Fetch user from DB to ensure they still exist and are active
      const [users] = await pool.query('SELECT id, role, status FROM users WHERE id = ?', [decoded.id]);

      if (users.length === 0) {
           console.warn(`Auth Middleware Warning: User ID ${decoded.id} from token not found in DB.`);
           return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      const user = users[0];

      // 4. Check user status
      if (user.status !== 'active') {
           console.warn(`Auth Middleware Warning: User ID ${user.id} is inactive.`);
           return res.status(401).json({ success: false, message: 'Not authorized, account inactive' });
      }

       // 5. Role consistency check (optional, but good practice)
       if (user.role !== decoded.role) {
           console.warn(`Auth Middleware Warning: Role mismatch for user ID ${user.id}. Token: ${decoded.role}, DB: ${user.role}. Using DB role.`);
           // Consider logging this potential security event more formally
       }

      // 6. Attach user info (id and validated role from DB) to the request object
      req.user = {
          id: user.id,
          role: user.role // Use the role confirmed from the database
      };
      // console.log(`Auth Middleware: User ${req.user.id} (${req.user.role}) authenticated for ${req.method} ${req.originalUrl}`);

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token signature' });
      }
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ success: false, message: 'Not authorized, token expired' });
      }
      // Handle other potential errors during DB query or verification
      return res.status(500).json({ success: false, message: 'Server error during authentication' });
    }
  }

  // If no token or incorrect format
  if (!token) {
    // Log if the header exists but doesn't start with 'Bearer '
    if (authHeader) {
        console.warn(`Auth Middleware: Invalid Authorization header format.`);
    }
    res.status(401).json({ success: false, message: 'Not authorized, no token provided or invalid format' });
  }
};

// --- Authorize Middleware: Restrict access based on roles ---
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Assumes 'protect' middleware has run and attached req.user
    if (!req.user || !req.user.role) {
        // This case should ideally be caught by 'protect', but added for safety
        console.error(`Authorization Middleware Error: req.user or req.user.role missing for route ${req.originalUrl}. Possible issue in 'protect' middleware.`);
        return res.status(403).json({ success: false, message: 'Forbidden: User role information missing.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
        console.warn(`Authorization Middleware Failed: User role '${req.user.role}' not in allowed roles '${allowedRoles.join(', ')}' for route ${req.originalUrl}`);
      return res.status(403).json({ success: false, message: `Forbidden: Your role (${req.user.role}) is not authorized to access this resource.` });
    }

    // User has one of the allowed roles, proceed
    // console.log(`Authorization Middleware: User ${req.user.id} (${req.user.role}) authorized for ${req.method} ${req.originalUrl}`);
    next();
  };
};


module.exports = { protect, authorize };
