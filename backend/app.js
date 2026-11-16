const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("express-async-errors");

const fs = require("fs");
const error = require("./middleware/errors");
const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const winston = require("winston");
const { createConnection } = require("./middleware/createconnection");
const base_url = require("./services/baseUrl");

// Import your routes
const users = require("./routes/users");
const auth = require("./routes/auth");
const missions = require("./routes/missions");
const surveyQuestions = require("./routes/surveyQuestions");
const reports = require("./routes/reports");
const dashboardadmin = require("./routes/dashboardadmin");
const applications = require("./routes/applications");
const assignements = require("./routes/assignements");
const chat_messages = require("./routes/chat_messages");
const notifications = require("./routes/notifications");
const upload = require("./routes/upload");
const messages = require("./routes/messages");
const userNotifications = require("./routes/userNotifications");
const { checkActiveSlotReminders } = userNotifications;
const clients = require("./routes/clients");
const stores = require("./routes/stores");
const quizQuestions = require("./routes/quizQuestions");
const bank_info = require("./routes/bank_info");
const paiyments = require("./routes/paiyments");

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(compression());
app.enable("trust proxy");
app.use(createConnection);

// Route audio
app.get("/audio/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  if (fs.existsSync(filePath)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Range, Content-Range, Content-Type",
    );
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Range, Content-Length, Accept-Ranges",
    );
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", "audio/webm");
    res.setHeader("Cache-Control", "no-cache");

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Content-Length", end - start + 1);

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      res.setHeader("Content-Length", fileSize);
      fs.createReadStream(filePath).pipe(res);
    }
  } else {
    res.status(404).send("Audio file not found");
  }
});

// Configuration pour les fichiers uploads
app.use("/uploads", (req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Range, Content-Range, Content-Type",
  );
  res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Range, Content-Length, Accept-Ranges",
  );
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "public, max-age=0");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Error handling
winston.handleExceptions(
  new winston.transports.File({ filename: "uncaughtException.log" }),
);
winston.add(winston.transports.File, { filename: "logfile.log" });
process.on("unhandledRejection", (ex) => {
  throw ex;
});

// Routes
app.use("/api/notifications", notifications);
app.use("/api/user-notifications", userNotifications);
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/missions", missions);
app.use("/api/surveyQuestions", surveyQuestions);
app.use("/api/reports", reports);
app.use("/api/dashboardadmin", dashboardadmin);
app.use("/api/applications", applications);
app.use("/api/assignements", assignements);
app.use("/api/chat_messages", chat_messages);
app.use("/api/upload", upload);
app.use("/api/messages", messages);
app.use("/api/clients", clients);
app.use("/api/stores", stores);
app.use("/api/quizQuestions", quizQuestions);
app.use("/api/bank_info", bank_info);
app.use("/api/paiyments", paiyments);

// Aliases pour compatibilité frontend actions
app.use("/api/admin/reports", reports);
app.use("/api/admin/missions", missions);
app.use("/api/admin/users", users);

// Servir les documents (PDF briefing, scenario, questionnaire) avec support CORS complet
app.use("/documents", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});
app.use("/documents", express.static(path.join(__dirname, "documents")));
app.use("/documents", express.static(path.join(__dirname, "../documents")));

// Servir les uploads avec support CORS complet
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(error);

// Vérification automatique des missions expirantes
const scheduleExpiringMissionCheck = () => {
  const checkMissions = async () => {
    try {
      const fetch = require("node-fetch");

      // Vérification notifications admin
      const adminResponse = await fetch(
        base_url + "/api/notifications/check-expiring-missions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (adminResponse.ok) {
        const result = await adminResponse.json();
        //console.log("Vérification admin terminée:", result.message);
      }

      // Vérification rappels utilisateurs
      const userResponse = await fetch(
        base_url + "/api/user-notifications/check-user-deadlines",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (userResponse.ok) {
        const result = await userResponse.json();
      }
    } catch (error) {
      console.error("Erreur vérification automatique:", error.message);
    }
  };

  // Vérification initiale après 10 secondes
  setTimeout(checkMissions, 10000);

  // Planification quotidienne à 9h00
  const scheduleDaily = () => {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(9, 0, 0, 0);

    if (now > nextRun) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const timeUntilNext = nextRun.getTime() - now.getTime();

    setTimeout(() => {
      checkMissions();
      setInterval(checkMissions, 24 * 60 * 60 * 1000);
    }, timeUntilNext);
  };

  scheduleDaily();
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  //console.log("node run on : " + base_url + " PORT " + PORT);
  setTimeout(() => {
    scheduleExpiringMissionCheck();
    if (typeof checkActiveSlotReminders === "function") {
      checkActiveSlotReminders();
      setInterval(checkActiveSlotReminders, 5 * 60 * 1000);
    }
  }, 3000);
});
