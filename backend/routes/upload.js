const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const base_url = require("../services/baseUrl");
const { auth } = require("../middleware/auth");

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration multer sécurisée pour les images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
    cb(null, `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${safeExt}`);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Seuls les formats JPG, PNG et WEBP sont autorisés."));
    }
  },
});

// Upload d'une image (Authentification requise)
router.post("/image", auth, imageUpload.single("file"), (req, res) => {
  if (req.file) {
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        url: `${base_url}/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } else {
    res.status(400).json({ error: "Aucun fichier téléversé" });
  }
});

// Upload de plusieurs images (Authentification requise)
router.post("/images", auth, imageUpload.array("images", 6), (req, res) => {
  if (req.files && req.files.length > 0) {
    const filesData = req.files.map((file) => ({
      filename: file.filename,
      url: `${base_url}/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({
      success: true,
      files: filesData,
    });
  } else {
    res.status(400).json({ error: "Aucun fichier téléversé" });
  }
});

// Configuration multer pour les documents (CVs, etc.)
const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
    const safeExt = [".pdf", ".doc", ".docx"].includes(ext) ? ext : ".pdf";
    cb(null, `cv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${safeExt}`);
  },
});

const docUpload = multer({
  storage: docStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|doc|docx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Seuls les formats PDF, DOC et DOCX sont autorisés."));
    }
  },
});

router.post("/document", auth, docUpload.single("file"), (req, res) => {
  if (req.file) {
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        url: `${base_url}/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } else {
    res.status(400).json({ error: "Aucun fichier téléversé" });
  }
});

// Upload audio sécurisé (Authentification requise)
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".webm";
    const safeExt = [".webm", ".mp3", ".wav", ".ogg", ".m4a"].includes(ext) ? ext : ".webm";
    cb(null, `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${safeExt}`);
  },
});

const audioUpload = multer({
  storage: audioStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/") || file.mimetype === "video/webm") {
      cb(null, true);
    } else {
      cb(new Error("Format audio non supporté."));
    }
  },
}).single("audio");

router.post("/audio", auth, (req, res) => {
  audioUpload(req, res, (err) => {
    if (err) {
      console.error("Erreur upload audio:", err);
      return res.status(400).json({ error: "Échec du téléversement : " + err.message });
    }

    if (req.file) {
      res.json({
        success: true,
        url: `${base_url}/audio/${req.file.filename}`,
        filename: req.file.filename,
      });
    } else {
      res.status(400).json({ error: "Aucun fichier audio reçu" });
    }
  });
});

module.exports = router;
