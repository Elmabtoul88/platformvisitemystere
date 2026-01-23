const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http"); // Required for Socket.IO
const { Server } = require("socket.io"); // Import Socket.IO Server
const pool = require("./config/db"); // db.js checks connection pool on startup
const initializeSocket = require("./socketHandler"); // Import the socket handler initializer

// --- Load Environment Variables ---
dotenv.config(); // Load variables from backend/.env file

// --- Environment Check ---
const NODE_ENV = process.env.NODE_ENV || "development";
console.log(`Starting server in ${NODE_ENV} mode.`);

// --- Initialize Express App & HTTP Server ---
const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO

// --- Configure CORS ---
const allowedOrigins = [
  process.env.CORS_ORIGIN_DEV || "http://localhost:3000", // Default frontend dev origin
  // Add production frontend URL from env var if set
  ...(process.env.CORS_ORIGIN_PROD ? [process.env.CORS_ORIGIN_PROD] : []),
];
console.log("Allowed CORS Origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman) OR if origin is in allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
  credentials: true, // Allow cookies/authorization headers if needed
  optionsSuccessStatus: 204, // For preflight requests
};

// --- Core Middleware ---
app.use(
  cors({
    origin: "http://localhost:3000", // or your frontend URL like https://myapp.com
    credentials: true, // if you're using cookies or authentication headers
  })
); // Enable CORS with specific options
app.use(express.json({ limit: "10mb" })); // Parse JSON request bodies (increase limit for potential image data?)
app.use(express.urlencoded({ extended: false, limit: "10mb" })); // Parse URL-encoded request bodies

// --- Simple Request Logging Middleware (Optional but helpful for debugging) ---
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${
      req.ip
    }`
  );
  next();
});

// --- Socket.IO Setup ---
try {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins, // Use the same origins allowed by API CORS
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Optional: Increase buffer size if handling large events, but be cautious
    // maxHttpBufferSize: 1e7 // 10MB, adjust as needed
  });

  // Initialize Socket.IO event handlers and pass the 'io' instance
  initializeSocket(io);
  console.log("Socket.IO initialized successfully.");

  // Make io accessible to controllers (e.g., for sending notifications)
  app.set("socketio", io);
} catch (socketError) {
  console.error("FATAL ERROR: Failed to initialize Socket.IO:", socketError);
  process.exit(1);
}

// --- Route Imports ---
// Ensure routes are imported after middleware and socket setup if they need access to `req.app.get('socketio')`
const authRoutes = require("./routes/authRoutes");
const missionRoutes = require("./routes/missionRoutes");
const adminRoutes = require("./routes/adminRoutes");
// const userRoutes = require('./routes/userRoutes'); // If user-specific profile routes exist

// --- API Routes ---
app.get("/", (req, res) => {
  res.json({ success: true, message: "MissionView API is running!" });
});

// Mount main application routes
app.use("/api/auth", authRoutes);
app.use("/api/missions", missionRoutes); // Shopper routes (+ nested reports)
app.use("/api/admin", adminRoutes); // Admin routes
// app.use('/api/users', userRoutes); // Mount user profile routes if they exist

// --- 404 Not Found Handler ---
// Catch-all for requests that didn't match any route
app.use((req, res, next) => {
  console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Not Found - The requested resource ${req.originalUrl} does not exist.`,
  });
});

// --- Global Error Handling Middleware ---
// Must be defined last, after all routes and other middleware
// Added 'next' parameter which is required for Express error handlers
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err);

  // Determine status code: use err.status, or res.statusCode if set, default to 500
  const statusCode =
    err.status || (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false, // Indicate failure
    message: err.message || "An unexpected server error occurred.",
    // Only include stack trace in development environment for security
    stack: NODE_ENV === "production" ? undefined : err.stack,
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`Frontend expected at: ${allowedOrigins[0]}`); // Log expected frontend origin
});

// --- Graceful Shutdown Logic ---
const shutdown = (signal) => {
  console.log(`\n${signal} signal received. Closing server gracefully...`);
  const io = app.get("socketio"); // Get the io instance

  // 1. Close Socket.IO connections first
  if (io) {
    io.close((err) => {
      if (err) {
        console.error("Error closing Socket.IO:", err);
      } else {
        console.log("Socket.IO connections closed.");
      }
      // Proceed to close server even if socket closing fails after timeout
    });
  }

  // 2. Close the HTTP server (stops accepting new connections)
  server.close(async () => {
    console.log("HTTP server closed.");

    // 3. Close the database connection pool
    try {
      await pool.end();
      console.log("MySQL pool closed.");
      process.exit(0); // Exit cleanly
    } catch (dbErr) {
      console.error("Error closing MySQL pool:", dbErr);
      process.exit(1); // Exit with error code
    }
  });

  // 4. Force shutdown after a timeout if connections don't close promptly
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down."
    );
    process.exit(1);
  }, 10000); // 10 seconds timeout
};

// Listen for termination signals
process.on("SIGINT", () => shutdown("SIGINT")); // CTRL+C
process.on("SIGTERM", () => shutdown("SIGTERM")); // kill command

// Handle unhandled promise rejections and uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Consider logging detailed error, but avoid crashing if possible unless critical
  // Optionally trigger shutdown for critical unhandled rejections
  // shutdown('Unhandled Rejection');
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // It's generally recommended to shut down after an uncaught exception,
  // as the application state might be corrupted.
  shutdown("Uncaught Exception");
});
