const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file in the backend directory

// --- Essential DB Configuration Check ---
// Include DB_PASSWORD, even if it might be empty for local dev, it needs to be acknowledged.
const requiredDbVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_DATABASE"];
const missingDbVars = requiredDbVars.filter(
  (v) => process.env[v] === undefined
); // Check for undefined, as empty string is allowed for password

if (missingDbVars.length > 0) {
  console.error(
    `FATAL ERROR: Missing required database environment variables: ${missingDbVars.join(
      ", "
    )}`
  );
  console.error(
    "Please ensure DB_HOST, DB_USER, DB_PASSWORD, and DB_DATABASE are set in the backend/.env file."
  );
  console.error("Example backend/.env file content:");
  console.error("DB_HOST=localhost");
  console.error("DB_USER=your_db_user");
  console.error("DB_PASSWORD=your_db_password"); // Can be empty for local dev if MySQL user has no password
  console.error("DB_DATABASE=missionview_db");
  console.error("DB_PORT=3306 # Optional, defaults to 3306");
  process.exit(1); // Exit if essential DB config is missing
}

let pool;
try {
  // Create a connection pool
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // Use the value directly, even if empty
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10, // Use env var or default
    queueLimit: 0, // No limit on queueing connections
    connectTimeout: 10000, // 10 seconds timeout for acquiring a connection
    // Recommended: Add charset and collation for consistency
    charset: "utf8mb4",
    collation: "utf8mb4_unicode_ci",
    // timezone: '+00:00', // UTC timezone is good practice
    dateStrings: true, // Return DATE/DATETIME columns as strings to avoid timezone issues in JS
  });

  // Warning for empty password in production
  if (process.env.NODE_ENV === "production" && !process.env.DB_PASSWORD) {
    console.warn(
      "WARNING: Running in production environment with an empty database password. This is insecure!"
    );
  }
} catch (error) {
  console.error(
    "FATAL ERROR: Failed to create MySQL connection pool:",
    error.message
  );
  process.exit(1); // Exit if pool creation fails
}

// Test the connection async function
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log(
      `MySQL Database connected successfully to database "${process.env.DB_DATABASE}" on host "${process.env.DB_HOST}".`
    );
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error(
      `ERROR: Could not connect to MySQL database "${process.env.DB_DATABASE}" on host "${process.env.DB_HOST}".`
    );
    console.error("Error Details:", error.message);
    console.error("Troubleshooting Tips:");
    console.error(
      "- Verify DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, and DB_PORT in backend/.env are correct."
    );
    console.error(
      "- Ensure the MySQL server is running and accessible from the backend application."
    );
    console.error(
      "- Check firewall settings on both the server running MySQL and the server running the backend."
    );
    console.error(
      "- Confirm the specified database exists and the user has connection permissions."
    );
    // Decide if the app should exit on connection failure after pool creation attempts
    // process.exit(1); // Consider exiting if the DB is critical and connection fails on startup
  }
}

// Call the test connection function after the pool is potentially created
testConnection();

module.exports = pool;
