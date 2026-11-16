const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const prisma = require("../prismaClient");

const VALID_QUESTION_TYPES = [
  "rating",
  "multiple_choice",
  "text",
  "image_upload",
  "checkboxes",
  "gps_capture",
  "audio_recording",
  "section_header",
  "info_text",
  "date",
  "time",
  "yes_no",
  "number",
];

// GET /api/surveyQuestions - Toutes les questions
router.get("/", auth, async (req, res) => {
  try {
    const dbClient = req.prisma || prisma;
    const results = await dbClient.survey_questions.findMany({
      orderBy: { id: "asc" },
    });
    return res.status(200).json(results);
  } catch (error) {
    if (req.db) {
      req.db.query("SELECT * FROM survey_questions", (err, results) => {
        if (!err) return res.status(200).json(results);
        return res.status(500).json({ error: err.message });
      });
      return;
    }
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/surveyQuestions/:id - Questions par mission_id
router.get("/:id", auth, async (req, res) => {
  const missionId = parseInt(req.params.id, 10);
  if (!missionId || isNaN(missionId)) {
    return res.status(400).json({ message: "ID de mission invalide" });
  }

  try {
    const dbClient = req.prisma || prisma;
    const results = await dbClient.survey_questions.findMany({
      where: { mission_id: missionId },
      orderBy: { id: "asc" },
    });
    return res.status(200).json(results);
  } catch (error) {
    if (req.db) {
      req.db.query(
        "SELECT * FROM survey_questions where mission_id = ?",
        [missionId],
        (err, results) => {
          if (!err) return res.status(200).json(results);
          return res.status(500).json({ error: err.message });
        },
      );
      return;
    }
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/surveyQuestions/surveyqBymission/:id - Questions enrichies pour l'éditeur d'enquête
router.get("/surveyqBymission/:id", auth, async (req, res) => {
  const missionId = parseInt(req.params.id, 10);
  if (!missionId || isNaN(missionId)) {
    return res.status(400).json({ message: "ID de mission invalide" });
  }

  try {
    const dbClient = req.prisma || prisma;
    const questions = await dbClient.survey_questions.findMany({
      where: { mission_id: missionId },
      orderBy: { id: "asc" },
    });

    const processedQuestions = questions.map((q) => {
      let options = [];
      if (q.options_json) {
        try {
          options = JSON.parse(q.options_json);
        } catch (e) {
          options = [];
        }
      }

      return {
        id: q.id,
        mission_id: q.mission_id,
        type: q.type,
        text: q.text,
        title: q.type === "section_header" ? q.text : undefined,
        content: q.type === "info_text" ? q.text : undefined,
        isRequired: q.is_required,
        allowMultiple: q.allow_multiple,
        maxLabel: q.max_label,
        minLabel: q.min_label,
        maxRating: q.max_rating,
        maxImages: q.max_images,
        maxDurationSeconds: q.max_duration_seconds,
        options,
      };
    });

    return res.status(200).json(processedQuestions);
  } catch (error) {
    console.error("Erreur récupération survey_questions:", error);
    if (req.db) {
      req.db.query(
        "SELECT * FROM survey_questions WHERE mission_id=? ORDER BY id ASC",
        [missionId],
        (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          return res.status(200).json(results);
        },
      );
      return;
    }
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/surveyQuestions - Sauvegarde atomique complète de l'enquête (Admin only)
router.post("/", [auth, adminAuth], async (req, res) => {
  const { mission_id, questions } = req.body;
  const missionId = parseInt(mission_id, 10);

  if (!missionId || isNaN(missionId)) {
    return res.status(400).json({ message: "ID de mission valide requis." });
  }

  if (!Array.isArray(questions)) {
    return res.status(400).json({ message: "`questions` doit être un tableau." });
  }

  const dbClient = req.prisma || prisma;

  try {
    const preparedQuestions = questions.map((question) => {
      let options_json = null;

      if (
        (question.type === "multiple_choice" || question.type === "checkboxes") &&
        question.options
      ) {
        if (Array.isArray(question.options)) {
          const validOptions = question.options.filter(
            (opt) => opt && opt.text && String(opt.text).trim() !== "",
          );
          if (validOptions.length > 0) {
            options_json = JSON.stringify(validOptions);
          }
        }
      }

      let questionText = question.text || "";
      if (question.type === "section_header") {
        questionText = question.title || "Section";
      }
      if (question.type === "info_text") {
        questionText = question.content || question.title || "";
      }

      const validType = VALID_QUESTION_TYPES.includes(question.type)
        ? question.type
        : "text";

      return {
        mission_id: missionId,
        text: questionText || "Question",
        type: validType,
        is_required: Boolean(question.isRequired || question.is_required),
        allow_multiple: Boolean(question.allowMultiple || question.allow_multiple),
        options_json,
        max_label: question.maxLabel || question.max_label || null,
        min_label: question.minLabel || question.min_label || null,
        max_rating: question.maxRating ? parseInt(question.maxRating, 10) : null,
        max_images: question.maxImages ? parseInt(question.maxImages, 10) : null,
        max_duration_seconds: question.maxDurationSeconds
          ? parseInt(question.maxDurationSeconds, 10)
          : null,
      };
    });

    // Transaction atomique : remplacement propre des questions de la mission
    await dbClient.$transaction(async (tx) => {
      await tx.survey_questions.deleteMany({
        where: { mission_id: missionId },
      });

      if (preparedQuestions.length > 0) {
        await tx.survey_questions.createMany({
          data: preparedQuestions,
        });
      }
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: `${preparedQuestions.length} question(s) enregistrée(s) avec succès.`,
      inserted: preparedQuestions.length,
    });
  } catch (error) {
    console.error("Erreur enregistrement survey_questions:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Erreur lors de l'enregistrement de l'enquête.",
      error: error.message,
    });
  }
});

module.exports = router;
