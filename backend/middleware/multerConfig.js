// middleware/multerConfig.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Créer le dossier documents s'il n'existe pas dans backend et à la racine
const documentsDir = path.join(__dirname, "../documents");
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}
const rootDocumentsDir = path.join(__dirname, "../../documents");
if (!fs.existsSync(rootDocumentsDir)) {
  try {
    fs.mkdirSync(rootDocumentsDir, { recursive: true });
  } catch (e) {}
}

// MIME_TYPES pour les images
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
};

// MIME_TYPES pour les PDF
const MIME_TYPES_PDF = {
  "application/pdf": "pdf",
};

const maxSize = 2 * 1024 * 1024; // 2MB pour les images
const maxSizePDF = 5 * 1024 * 1024; // 5MB pour les PDF

const options = { fileSize: maxSize };
const optionsPDF = { fileSize: maxSizePDF };

// Configuration du stockage pour les images
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, documentsDir);
  },
  filename: (req, file, callback) => {
    const filename = file.fieldname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, filename + Date.now() + "." + extension);
  },
});

// Configuration du stockage pour les PDF avec nom basé sur le titre de la mission
const storagePDF = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, documentsDir);
  },
  filename: (req, file, callback) => {
    // Utiliser le titre de la mission pour nommer les fichiers
    const missionTitle = req.body.title || "mission";
    const sanitizedTitle = missionTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .substring(0, 50);

    const fieldName = file.fieldname; // briefing, scenario, questionnaire
    const date = new Date().toISOString().replace(/[:.]/g, "-");
    const extension = MIME_TYPES_PDF[file.mimetype] || "pdf";

    // Format: titre_mission_fieldname_date.pdf
    const filename = `${sanitizedTitle}_${fieldName}_${date}.${extension}`;
    callback(null, filename);
  },
});

// Filtre pour les fichiers PDF
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers PDF sont autorisés"), false);
  }
};

// Filtre pour les images
const imageFileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers JPG, JPEG et PNG sont autorisés"), false);
  }
};

// Configuration existante pour les images
module.exports.multerone = multer({ storage, limits: options }).single("url");
module.exports.multerpart = multer({ storage, limits: options }).single(
  "_parts",
);
module.exports.multerMulti = multer({ storage, limits: options }).array(
  "image",
  6,
);

// Pour une seule image
module.exports.singleImage = multer({
  storage,
  limits: options,
  fileFilter: imageFileFilter,
}).single("file");

// Pour plusieurs images
module.exports.multipleImages = multer({
  storage,
  limits: options,
  fileFilter: imageFileFilter,
}).array("images", 6);

// NOUVELLE CONFIGURATION POUR LES PDF MULTIPLES
module.exports.multipdf = multer({
  storage: storagePDF,
  limits: { fileSize: maxSizePDF },
  fileFilter: pdfFileFilter,
}).fields([
  { name: "briefing", maxCount: 1 },
  { name: "scenario", maxCount: 1 },
  { name: "questionnaire", maxCount: 1 },
]);

// Pour un seul PDF
module.exports.singlePDF = multer({
  storage: storagePDF,
  limits: { fileSize: maxSizePDF },
  fileFilter: pdfFileFilter,
}).single("pdf");

// Export des MIME_TYPES si nécessaire
module.exports.MIME_TYPES = MIME_TYPES;
module.exports.MIME_TYPES_PDF = MIME_TYPES_PDF;
