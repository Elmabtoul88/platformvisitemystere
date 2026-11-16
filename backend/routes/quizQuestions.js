const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const { surveyQuestionsValidation } = require("../models/surveyQuestions");

router.get("/:id", (req, res) => {
  req.db.query(
    "SELECT * FROM quiz_questions where mission_id = ?",
    [req.params.id],
    (err, results) => {
      if (!err) return res.status(200).send(results);
      return res.status(500).json({ error: err });
    },
  );
});

module.exports = router;
