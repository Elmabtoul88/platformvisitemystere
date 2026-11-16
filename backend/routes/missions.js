const express = require("express");
const router = express.Router();
const { missionsValidation } = require("../models/missions");
const { auth, adminAuth } = require("../middleware/auth");
const base_url = require("../services/baseUrl");
const { multipdf } = require("../middleware/multerConfig");
const prisma = require("../prismaClient");

// routes/missions.js
router.post("/quiz_mission", [auth, adminAuth, multipdf], async (req, res) => {
  const connection = req.db;

  // Démarrer la transaction
  connection.beginTransaction(async (err) => {
    if (err) {
      console.error("Erreur début transaction:", err);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la création",
      });
    }

    try {
      const {
        title,
        description,
        deadline,
        reward,
        category,
        status,
        businessName,
        pays,
        ville,
        location,
        profil,
        clientId,
        profileQuiz = [],
        recognitionQuiz = [],
        recognitionPassingScore = 100,
      } = req.body;

      // Parser les quiz si ce sont des strings JSON
      let profileQuizData = profileQuiz;
      if (typeof profileQuiz === "string") {
        try {
          profileQuizData = JSON.parse(profileQuiz);
        } catch (e) {
          console.error("❌ Erreur parsing profile quiz:", e);
          profileQuizData = [];
        }
      }

      let recognitionQuizData = recognitionQuiz;
      if (typeof recognitionQuiz === "string") {
        try {
          recognitionQuizData = JSON.parse(recognitionQuiz);
        } catch (e) {
          console.error("❌ Erreur parsing recognition quiz:", e);
          recognitionQuizData = [];
        }
      }

      // Générer les URLs des fichiers PDF
      const baseUrl = `${req.protocol}://${req.get("host")}/documents/`;
      const files = req.files || {};

      const briefingUrl = files.briefing
        ? baseUrl + files.briefing[0].filename
        : null;
      const scenarioUrl = files.scenario
        ? baseUrl + files.scenario[0].filename
        : null;
      const questionnaireUrl = files.questionnaire
        ? baseUrl + files.questionnaire[0].filename
        : null;

      // 1. Insérer la mission
      const missionSql = `
                INSERT INTO missions 
                (title, description, deadline, reward, category, status, businessName, 
                 pays, ville, location, profil, clientId, briefing, scenario, questionnaire)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

      const parsedClientId =
        clientId && !isNaN(parseInt(clientId)) && parseInt(clientId) > 0
          ? parseInt(clientId)
          : null;

      const missionValues = [
        title,
        description,
        deadline,
        parseFloat(reward) || 0,
        category || null,
        status || "available",
        businessName || null,
        pays || null,
        ville || null,
        location || `${ville}, ${pays}`,
        profil || null,
        parsedClientId,
        briefingUrl,
        scenarioUrl,
        questionnaireUrl,
      ];

      const missionResult = await new Promise((resolve, reject) => {
        connection.query(missionSql, missionValues, (err, result) => {
          if (err) {
            console.error("❌ Erreur insertion mission:", err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      const missionId = missionResult.insertId;

      // 2. Insérer les questions du quiz de validation du profil dans quiz_questions
      let profileQuizCount = 0;
      if (profileQuizData && profileQuizData.length > 0) {
        for (let i = 0; i < profileQuizData.length; i++) {
          const question = profileQuizData[i];

          // Nettoyer les options
          let optionsJson = null;
          if (
            question.options &&
            Array.isArray(question.options) &&
            question.options.length > 0
          ) {
            const validOptions = question.options.filter(
              (opt) => opt.text && opt.text.trim() !== "",
            );
            if (validOptions.length > 0) {
              optionsJson = JSON.stringify(
                validOptions.map((opt) => ({
                  id: opt.id,
                  text: opt.text,
                })),
              );
            }
          }

          // Déterminer le type de question
          let questionType = question.type || "text";
          if (questionType === "multiple_choice") {
            questionType = "multiple_choice";
          } else if (questionType === "checkboxes") {
            questionType = "checkboxes";
          } else if (questionType === "text") {
            questionType = "text";
          }

          const quizSql = `
                        INSERT INTO quiz_questions 
                        (mission_id, type, text, is_required, max_rating, min_label, max_label, 
                         allow_multiple, max_images, max_duration_seconds, options_json, user_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

          const quizValues = [
            missionId,
            questionType,
            question.text || "",
            question.isRequired ? 1 : 0,
            question.max_rating || null,
            question.min_label || null,
            question.max_label || null,
            question.allow_multiple || (questionType === "checkboxes" ? 1 : 0),
            question.max_images || null,
            question.max_duration_seconds || null,
            optionsJson,
            clientId || null,
          ];

          await new Promise((resolve, reject) => {
            connection.query(quizSql, quizValues, (err, result) => {
              if (err) {
                console.error(`❌ Erreur question validation ${i + 1}:`, err);
                reject(err);
              } else {
                profileQuizCount++;
                resolve(result);
              }
            });
          });
        }
      }

      // 3. Insérer les questions du quiz de reconnaissance dans mission_recognition_quizzes
      let recognitionQuizCount = 0;
      if (recognitionQuizData && recognitionQuizData.length > 0) {
        for (let i = 0; i < recognitionQuizData.length; i++) {
          const question = recognitionQuizData[i];

          // Nettoyer les options et stocker les réponses correctes
          let optionsJson = null;
          let correctAnswers = [];

          if (
            question.options &&
            Array.isArray(question.options) &&
            question.options.length > 0
          ) {
            const validOptions = question.options.filter(
              (opt) => opt.text && opt.text.trim() !== "",
            );
            if (validOptions.length > 0) {
              // Stocker les options
              optionsJson = JSON.stringify(
                validOptions.map((opt) => ({
                  id: opt.id,
                  text: opt.text,
                })),
              );

              // Extraire les réponses correctes
              correctAnswers = validOptions
                .filter((opt) => opt.isCorrect === true)
                .map((opt) => opt.text);
            }
          }

          // Déterminer le type de question
          let questionType = question.type || "multiple_choice";
          if (questionType === "multiple_choice") {
            questionType = "multiple_choice";
          } else if (questionType === "checkboxes") {
            questionType = "checkboxes";
          }

          // Insérer dans mission_recognition_quizzes
          const recognitionSql = `
                        INSERT INTO mission_recognition_quizzes 
                        (mission_id, question, type, options, correct_answers, points)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;

          const recognitionValues = [
            missionId,
            question.text || "",
            questionType,
            optionsJson,
            JSON.stringify(correctAnswers),
            question.points || 1,
          ];

          await new Promise((resolve, reject) => {
            connection.query(
              recognitionSql,
              recognitionValues,
              (err, result) => {
                if (err) {
                  console.error(
                    `❌ Erreur question reconnaissance ${i + 1}:`,
                    err,
                  );
                  reject(err);
                } else {
                  recognitionQuizCount++;
                  resolve(result);
                }
              },
            );
          });
        }
      }

      // 4. Stocker les paramètres du quiz de reconnaissance
      if (recognitionPassingScore && recognitionQuizCount > 0) {
        const insertSettingsSql = `
                    INSERT INTO mission_recognition_settings (mission_id, passing_score)
                    VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE passing_score = ?
                `;

        await new Promise((resolve, reject) => {
          connection.query(
            insertSettingsSql,
            [missionId, recognitionPassingScore, recognitionPassingScore],
            (err, result) => {
              if (err) {
                console.error("❌ Erreur insertion settings:", err);
                reject(err);
              } else {
                resolve(result);
              }
            },
          );
        });
      }

      // 5. Valider la transaction
      await new Promise((resolve, reject) => {
        connection.commit((err) => {
          if (err) {
            console.error("❌ Erreur commit:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      // Réponse de succès
      res.status(201).json({
        success: true,
        message: "Mission créée avec succès",
        missionId: missionId,
        profileQuizCount: profileQuizCount,
        recognitionQuizCount: recognitionQuizCount,
        recognitionPassingScore: recognitionPassingScore,
        files: {
          briefing: briefingUrl,
          scenario: scenarioUrl,
          questionnaire: questionnaireUrl,
        },
      });
    } catch (error) {
      // Rollback en cas d'erreur
      await new Promise((resolve) => {
        connection.rollback(() => {
          resolve();
        });
      });

      console.error("❌ Erreur lors de la création:", error);
      console.error("📚 Stack trace:", error.stack);

      res.status(500).json({
        success: false,
        error: "Erreur lors de la création de la mission",
        details: error.message,
        sql: error.sql || null,
      });
    }
  });
});

// Fonction de notification (optionnelle)
function notifyUsers(title, businessName, reward, connection) {
  const notifyNewMission = async () => {
    try {
      const getUsersSql = `
        SELECT id, name, email FROM users 
        WHERE role IN ('user', 'shopper') AND email IS NOT NULL
      `;

      connection.query(getUsersSql, async (err, users) => {
        if (err || users.length === 0) return;

        const fetch = require("node-fetch");
        const base_url = process.env.BASE_URL || "http://localhost:3000";

        for (const user of users) {
          try {
            await fetch(base_url + "/api/user-notifications/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                userEmail: user.email,
                userName: user.name,
                type: "newMissionEmail",
                notificationData: {
                  missionTitle: title,
                  businessName: businessName,
                  reward: reward,
                },
              }),
            });
          } catch (e) {
            console.error("Erreur notification:", e.message);
          }
        }
      });
    } catch (error) {
      console.error("Erreur système notifications nouvelles missions:", error);
    }
  };

  setImmediate(notifyNewMission);
}

// Create a new mission
/*router.post("/", [auth, adminAuth], async (req, res) => {
  // Validate the mission data
  //const { error } = missionsValidation(req.body);
  //if (error) return res.status(400).send(error.details[0].message);

  // Proceed with creating the mission if validation passes
  const {
    title,
    description,
    deadline,
    reward,
    latitude,
    longitude,
    category,
    status,
    businessName,

    location,
  } = req.body;
  const sql = `
      INSERT INTO missions 
      (title, description, deadline, reward, latitude, longitude, category, status, businessName,location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  req.db.query(
    sql,
    [
      title,
      description,
      deadline,
      reward,
      latitude,
      longitude,
      category,
      status,
      businessName,
      location,
    ],
    (err, result) => {
      console.log("Mission creation result:", err, result);
      if (err) return res.status(500).json({ error: err });

      // Notifier tous les utilisateurs de la nouvelle mission
      const notifyNewMission = async () => {
        try {
          const getUsersSql =
            "SELECT id, name, email FROM users WHERE role IN ('user', 'shopper') AND email IS NOT NULL";
          req.db.query(getUsersSql, async (err, users) => {
            if (err || users.length === 0) return;

            const fetch = require("node-fetch");
            for (const user of users) {
              try {
                const response = await fetch(
                  base_url + "/api/user-notifications/send",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId: user.id,
                      userEmail: user.email,
                      userName: user.name,
                      type: "newMissionEmail",
                      notificationData: {
                        missionTitle: title,
                        businessName: businessName,
                        reward: reward,
                      },
                    }),
                  },
                );

                if (response.ok) {
                  console.log(
                    `Notification newMissionEmail envoyée à ${user.email}`,
                  );
                }
              } catch (e) {
                console.error("Erreur notification:", e.message);
              }
            }
          });
        } catch (error) {
          console.error(
            "Erreur système notifications nouvelles missions:",
            error,
          );
        }
      };

      setImmediate(notifyNewMission);
      res.status(201).json({ message: "Mission created", id: result.insertId });
    },
  );
});*/

router.get("/admin/all", [auth, adminAuth], (req, res) => {
  const query = `
    SELECT m.*,
      (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.mission_id = m.id) AS profile_quiz_count,
      (SELECT COUNT(*) FROM mission_recognition_quizzes mrq WHERE mrq.mission_id = m.id) AS recognition_quiz_count,
      (SELECT COUNT(*) FROM stores st WHERE st.mission_id = m.id) AS stores_count
    FROM missions m
  `;
  req.db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });

    const missions = results.map((mission) => {
      if (mission.assignedTo && typeof mission.assignedTo === "string") {
        try {
          mission.assignedTo = JSON.parse(mission.assignedTo);
        } catch (e) {
          mission.assignedTo = [];
        }
      }
      return mission;
    });

    res.json(missions);
  });
});

/*router.get("/missionsApp/:id", auth, (req, res) => {
  const sql = `SELECT 
  m.*,
  CASE 
    WHEN au.id IS NULL THEN FALSE
    ELSE TRUE
  END AS applied,
  au.status AS application_status,
  COALESCE(ac.total_applied, 0) AS count
FROM missions m
LEFT JOIN applications au
  ON au.mission_id = m.id
  AND au.user_id = ?
LEFT JOIN (
  SELECT mission_id, COUNT(*) AS total_applied
  FROM applications
  GROUP BY mission_id
) ac ON ac.mission_id = m.id;
`;

  req.db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    const missions = results.map((mission) => {
      if (mission.assignedTo && typeof mission.assignedTo === "string") {
        try {
          mission.assignedTo = JSON.parse(mission.assignedTo);
        } catch (e) {
          console.error("Error parsing assignedTo:", e);
          mission.assignedTo = [];
        }
      }
      return mission;
    });

    res.json(missions);
  });
});*/

router.get("/:id", auth, (req, res) => {
  const id = req.params.id;
  const userId = req.user?.id;

  req.db.query("SELECT * FROM missions WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(404).json({ message: "Mission not found" });

    const mission = results[0];

    if (userId) {
      req.db.query(
        "SELECT id, status, applied_at, time_slot, mission_date FROM applications WHERE mission_id = ? AND user_id = ?",
        [id, userId],
        (appErr, appResults) => {
          if (!appErr && appResults && appResults.length > 0) {
            mission.has_applied = true;
            mission.application = appResults[0];
            mission.application_status = appResults[0].status;
          } else {
            mission.has_applied = false;
            mission.application = null;
          }
          res.json(mission);
        },
      );
    } else {
      mission.has_applied = false;
      res.json(mission);
    }
  });
});

// Route pour modifier une mission avec gestion des PDF
router.put("/:id", [auth, adminAuth, multipdf], async (req, res) => {
  const connection = req.db;
  const missionId = req.params.id;

  try {
    const {
      title,
      description,
      deadline,
      reward,
      category,
      status,
      businessName,
      location,
      pays,
      ville,
      profil,
      clientId,

      // Ne pas envoyer les URLs des PDFs depuis le frontend, on les génère ici
    } = req.body;

    const parsedClientId =
      clientId !== undefined &&
      clientId !== "" &&
      clientId !== "null" &&
      !isNaN(parseInt(clientId)) &&
      parseInt(clientId) > 0
        ? parseInt(clientId)
        : null;

    // Récupérer la mission existante pour garder les anciens PDFs si non remplacés
    const getExistingSql = `
      SELECT briefing, scenario, questionnaire FROM missions WHERE id = ?
    `;

    const existingMission = await new Promise((resolve, reject) => {
      connection.query(getExistingSql, [missionId], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });

    if (!existingMission) {
      return res.status(404).json({
        success: false,
        error: "Mission non trouvée",
      });
    }

    // Générer les URLs des fichiers PDF (si de nouveaux fichiers sont uploadés)
    const baseUrl = `${req.protocol}://${req.get("host")}/documents/`;
    const files = req.files || {};

    // Conserver les anciens fichiers si pas de nouveau fichier
    let briefingUrl = existingMission.briefing;
    let scenarioUrl = existingMission.scenario;
    let questionnaireUrl = existingMission.questionnaire;

    // Remplacer par les nouveaux fichiers si présents
    if (files.briefing && files.briefing[0]) {
      briefingUrl = baseUrl + files.briefing[0].filename;
    }
    if (files.scenario && files.scenario[0]) {
      scenarioUrl = baseUrl + files.scenario[0].filename;
    }
    if (files.questionnaire && files.questionnaire[0]) {
      questionnaireUrl = baseUrl + files.questionnaire[0].filename;
    }

    // Construire la requête UPDATE
    const sql = `
      UPDATE missions SET
        title = ?,
        description = ?,
        deadline = ?,
        reward = ?,
        category = ?,
        status = ?,
        businessName = ?,
        location = ?,
        pays = ?,
        ville = ?,
        profil = ?,
        clientId = ?,
        briefing = ?,
        scenario = ?,
        questionnaire = ?
      WHERE id = ?
    `;

    const values = [
      title || null,
      description || null,
      deadline || null,
      parseFloat(reward) || 0,
      category || null,
      status || "available",
      businessName || null,
      location || null,
      pays || null,
      ville || null,
      profil || null,
      parsedClientId,
      briefingUrl,
      scenarioUrl,
      questionnaireUrl,
      missionId,
    ];

    const result = await new Promise((resolve, reject) => {
      connection.query(sql, values, (err, result) => {
        if (err) {
          console.error("❌ Erreur UPDATE:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Mission non trouvée ou aucune modification",
      });
    }

    res.json({
      success: true,
      message: "Mission mise à jour avec succès",
      missionId: missionId,
      files: {
        briefing: briefingUrl,
        scenario: scenarioUrl,
        questionnaire: questionnaireUrl,
      },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de la mission",
      details: error.message,
    });
  }
});

// Route pour mettre à jour uniquement les champs sans fichiers
router.put("/:id/update", [auth, adminAuth], async (req, res) => {
  const connection = req.db;
  const missionId = req.params.id;

  try {
    const {
      title,
      description,
      deadline,
      reward,
      category,
      status,
      businessName,
      location,
      pays,
      ville,
      profil,
      clientId,
      latitude,
      longitude,
      briefing,
      scenario,
      questionnaire,
    } = req.body;

    const parsedClientId =
      clientId !== undefined &&
      clientId !== "" &&
      clientId !== "null" &&
      !isNaN(parseInt(clientId)) &&
      parseInt(clientId) > 0
        ? parseInt(clientId)
        : null;

    const sql = `
      UPDATE missions SET
        title = ?,
        description = ?,
        deadline = ?,
        reward = ?,
        latitude = ?,
        longitude = ?,
        category = ?,
        status = ?,
        businessName = ?,
        location = ?,
        pays = ?,
        ville = ?,
        profil = ?,
        clientId = ?,
        briefing = ?,
        scenario = ?,
        questionnaire = ?
      WHERE id = ?
    `;

    const values = [
      title || null,
      description || null,
      deadline || null,
      parseFloat(reward) || 0,
      parseFloat(latitude) || null,
      parseFloat(longitude) || null,
      category || null,
      status || "available",
      businessName || null,
      location || null,
      pays || null,
      ville || null,
      profil || null,
      parsedClientId,
      briefing || null,
      scenario || null,
      questionnaire || null,
      missionId,
    ];

    const result = await new Promise((resolve, reject) => {
      connection.query(sql, values, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Mission non trouvée ou aucune modification",
      });
    }

    res.json({
      success: true,
      message: "Mission mise à jour avec succès",
      missionId: missionId,
      status: 200,
    });
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/*router.delete("/:id", auth, (req, res) => {
  const missionId = req.params.id;
  req.db.query(
    "DELETE FROM reports WHERE mission_id = ?",
    [missionId],
    (err) => {
      if (err) console.log("Reports:", err.message);

      req.db.query(
        "DELETE FROM applications WHERE mission_id = ?",
        [missionId],
        (err) => {
          if (err) console.log("Applications:", err.message);

              req.db.query(
                "DELETE FROM missions WHERE id = ?",
                [missionId],
                (err, result) => {
                  if (err) {
                    return res
                      .status(500)
                      .json({ error: err.message, success: false });
                  }

                  if (result.affectedRows === 0) {
                    return res
                      .status(404)
                      .json({ message: "Mission non trouvée", success: false });
                  }

                  res.json({
                    message: "Mission supprimée",
                    success: true,
                  });
                },
              );
            },
          );
        },
      );
    },
  );
});*/

router.delete("/:id", [auth, adminAuth], (req, res) => {
  const mission_id = req.params.id;
  req.db.query(
    "DELETE FROM missions WHERE id = ?",
    [mission_id],
    (err, result) => {
      if (err)
        return res.status(400).send({
          message: "Mission est pas supprimé",
          success: false,
        });
      return res.status(200).send({
        message: "Mission supprimée",
        success: true,
      });
    },
  );
});

router.patch("/patch/:id", auth, (req, res) => {
  const missionId = req.params.id;
  const fields = req.body;

  if (!fields || Object.keys(fields).length === 0) {
    return res.status(400).json({ message: "No fields provided for update" });
  }

  const updates = Object.keys(fields)
    .map((field) => `${field} = ?`)
    .join(", ");
  const values = Object.values(fields);

  const sql = `UPDATE missions SET ${updates} WHERE id = ?`;

  req.db.query(sql, [...values, missionId], (error, result) => {
    if (error) {
      console.error("Error updating mission:", error);
      return res
        .status(500)
        .json({ message: "Server error while updating mission" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Mission not found" });
    }

    res.json({ message: "Mission updated successfully", status: "success" });
  });
});

// Route pour assigner ou dissocier un client d'une mission (Admin uniquement)
router.patch("/:id/client", [auth, adminAuth], async (req, res) => {
  const missionId = parseInt(req.params.id);
  const { clientId } = req.body;

  if (isNaN(missionId)) {
    return res.status(400).json({ error: "ID de mission invalide." });
  }

  const parsedClientId =
    clientId !== null &&
    clientId !== undefined &&
    clientId !== "" &&
    clientId !== "null" &&
    !isNaN(parseInt(clientId)) &&
    parseInt(clientId) > 0
      ? parseInt(clientId)
      : null;

  try {
    const updated = await prisma.missions.update({
      where: { id: missionId },
      data: { clientId: parsedClientId },
    });

    return res.status(200).json({
      success: true,
      message: parsedClientId
        ? "Client assigné à la mission avec succès."
        : "Client retiré de la mission avec succès.",
      mission: updated,
    });
  } catch (err) {
    console.error("Erreur assignation client:", err);
    return res.status(500).json({
      error: "Erreur serveur lors de l'assignation du client.",
    });
  }
});

router.patch("/:id", auth, (req, res) => {
  const missionId = req.params.id;
  const { assignedTo, status } = req.body;

  if (!Array.isArray(assignedTo)) {
    return res.status(400).json({ message: "`assignedTo` must be an array" });
  }

  const jsonAssignedTo = JSON.stringify(assignedTo);

  // If no status provided, determine it based on assignedTo length
  const finalStatus =
    status || (assignedTo.length > 0 ? "assigned" : "available");

  const updateQuery = `UPDATE missions SET assignedTo = ?, status = ? WHERE id = ?`;
  req.db.query(
    updateQuery,
    [jsonAssignedTo, finalStatus, missionId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database update failed",
          error: err,
          success: false,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Mission not found",
          success: false,
        });
      }

      res.status(200).json({
        message: "Mission assignment updated successfully",
        missionId,
        assignedTo,
        status: finalStatus,
        success: true,
      });
    },
  );
});

// GET - Récupérer les missions avec statut de candidature (Prisma ORM)
router.get("/missionsApp/:id", auth, async (req, res) => {
  const targetUserId = parseInt(req.params.id);

  if (isNaN(targetUserId)) {
    return res.status(400).json({ error: "ID utilisateur requis" });
  }

  // Contrôle d'accès : seulement l'auditeur lui-même ou un administrateur
  if (req.user.role !== "admin" && req.user.id !== targetUserId) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  try {
    const rawMissions = await prisma.missions.findMany({
      where: { status: "available" },
      include: {
        stores: true,
        applications: {
          where: { user_id: targetUserId },
        },
        reports: {
          where: { user_id: targetUserId },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { deadline: "asc" },
    });

    const missions = rawMissions.map((mission) => {
      let assignedToArray = [];
      if (mission.assignedTo && typeof mission.assignedTo === "string") {
        try {
          assignedToArray = JSON.parse(mission.assignedTo);
        } catch (e) {
          assignedToArray = [];
        }
      }

      const userApp = mission.applications[0] || null;
      const userReport = mission.reports[0] || null;
      const hasApplied = Boolean(userApp);

      let applicationStatus = "available";
      if (hasApplied) {
        if (
          userReport?.status === "approved" ||
          userReport?.status === "paid" ||
          userApp?.status === "completed"
        ) {
          applicationStatus = "approved";
        } else if (
          userReport?.status === "submitted" ||
          userApp?.status === "submitted"
        ) {
          applicationStatus = "pending";
        } else if (
          userReport?.status === "refused" ||
          userApp?.status === "refused"
        ) {
          applicationStatus = "refused";
        } else {
          applicationStatus =
            userApp.status === "approved"
              ? "assigned"
              : "applied";
        }
      }

      const storesList = mission.stores.map((s) => ({
        id: s.id,
        name: s.name,
        city: s.city,
        address: s.address,
        latitude: s.latitude ? parseFloat(s.latitude) : null,
        longitude: s.longitude ? parseFloat(s.longitude) : null,
        category: s.category,
      }));

      const mainStore = storesList[0] || null;

      return {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        deadline: mission.deadline,
        reward: mission.reward ? parseFloat(mission.reward) : 0,
        category: mission.category,
        status: mission.status,
        assignedTo: assignedToArray,
        businessName: mission.businessName,
        location: mission.location,
        clientId: mission.clientId,
        pays: mission.pays,
        ville: mission.ville,
        briefing: mission.briefing,
        scenario: mission.scenario,
        questionnaire: mission.questionnaire,
        profil: mission.profil,
        has_applied: hasApplied,
        application_status: applicationStatus,
        application_id: userApp?.id || null,
        report_status:
          userReport?.status ||
          (userApp?.status === "submitted" ? "submitted" : null),
        report_id: userReport?.id || null,
        count: mission._count.applications || 0,
        store: mainStore
          ? {
              id: mainStore.id,
              name: mainStore.name || mission.businessName,
              city: mainStore.city || mission.ville,
              address: mainStore.address || mission.location,
              latitude: mainStore.latitude,
              longitude: mainStore.longitude,
              category: mainStore.category || mission.category,
            }
          : {
              id: null,
              name: mission.businessName,
              city: mission.ville,
              address: mission.location,
              latitude: null,
              longitude: null,
              category: mission.category,
            },
        stores: storesList,
        latitude: mainStore?.latitude || null,
        longitude: mainStore?.longitude || null,
      };
    });

    return res.status(200).json({
      message: "Missions récupérées avec succès",
      data: missions,
    });
  } catch (err) {
    console.error("Erreur récupération missionsApp Prisma:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// GET - Statistiques
router.get("/stats/:userId", auth, (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      COUNT(DISTINCT m.id) as total_missions,
      SUM(CASE WHEN m.status = 'available' THEN 1 ELSE 0 END) as available_missions,
      COUNT(DISTINCT a.id) as total_applications,
      SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
      SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) as approved_applications,
      SUM(CASE WHEN a.status = 'refused' THEN 1 ELSE 0 END) as refused_applications,
      SUM(CASE WHEN r.status = 'submitted' THEN 1 ELSE 0 END) as pending_reports,
      SUM(CASE WHEN r.status = 'approved' THEN 1 ELSE 0 END) as approved_reports,
      SUM(CASE WHEN r.status = 'refused' THEN 1 ELSE 0 END) as refused_reports,
      SUM(CASE WHEN r.status = 'approved' THEN m.reward ELSE 0 END) as total_earned
    FROM missions m
    LEFT JOIN applications a ON a.mission_id = m.id AND a.user_id = ?
    LEFT JOIN reports r ON r.mission_id = m.id AND r.user_id = ?
    WHERE m.status = 'available'
  `;

  req.db.query(sql, [userId, userId], (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération stats:", err);
      return res.status(500).json({
        error: err.message || "Erreur lors de la récupération",
      });
    }

    const stats = results[0] || {};
    return res.status(200).json({
      message: "Statistiques récupérées avec succès",
      data: {
        total: parseInt(stats.total_missions) || 0,
        available: parseInt(stats.available_missions) || 0,
        applied: parseInt(stats.total_applications) || 0,
        pending:
          parseInt(stats.pending_applications) ||
          parseInt(stats.pending_reports) ||
          0,
        approved:
          parseInt(stats.approved_applications) ||
          parseInt(stats.approved_reports) ||
          0,
        refused:
          parseInt(stats.refused_applications) ||
          parseInt(stats.refused_reports) ||
          0,
        totalEarned: parseFloat(stats.total_earned) || 0,
      },
    });
  });
});

// GET - Récupérer les questions du quiz de reconnaissance
router.get("/:missionId/recognition-quiz/:userId", (req, res) => {
  const connection = req.db;
  const { missionId, userId } = req.params;

  // Récupérer les questions du quiz de reconnaissance
  connection.query(
    `SELECT id, mission_id, question, type, options, points 
     FROM mission_recognition_quizzes 
     WHERE mission_id = ? 
     ORDER BY id ASC`,
    [missionId],
    (err, questions) => {
      if (err) {
        console.error("Erreur récupération questions:", err);
        return res.status(500).json({
          success: false,
          error: "Erreur lors de la récupération du quiz",
        });
      }

      if (questions.length === 0) {
        return res.json({
          success: true,
          hasPassed: true,
          questions: [],
          passingScore: 100,
          attempts: 0,
          message: "Aucun quiz de reconnaissance requis pour cette mission.",
        });
      }

      // Récupérer les paramètres du quiz
      connection.query(
        `SELECT passing_score 
         FROM mission_recognition_settings 
         WHERE mission_id = ?`,
        [missionId],
        (err, settings) => {
          if (err) {
            console.error("Erreur récupération settings:", err);
            return res.status(500).json({
              success: false,
              error: "Erreur lors de la récupération des paramètres",
            });
          }

          const passingScore =
            settings.length > 0 ? settings[0].passing_score : 100;

          // Vérifier si l'utilisateur a déjà passé le quiz
          connection.query(
            `SELECT score, correct_answers, total_questions 
             FROM mission_recognition_results 
             WHERE mission_id = ? AND user_id = ?`,
            [missionId, userId],
            (err, existingResult) => {
              if (err) {
                console.error("Erreur récupération résultat:", err);
                return res.status(500).json({
                  success: false,
                  error: "Erreur lors de la vérification du résultat",
                });
              }

              const hasPassed =
                existingResult.length > 0 &&
                existingResult[0].score >= passingScore;

              res.json({
                success: true,
                questions: questions.map((q) => ({
                  ...q,
                  options: JSON.parse(q.options),
                })),
                passingScore,
                hasPassed,
                previousResult:
                  existingResult.length > 0 ? existingResult[0] : null,
              });
            },
          );
        },
      );
    },
  );
});

// POST - Soumettre les réponses du quiz de reconnaissance
router.post("/:missionId/recognition-quiz/submit/:userId", (req, res) => {
  const connection = req.db;
  const { missionId, userId } = req.params;
  const { answers } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Utilisateur non authentifié",
    });
  }

  if (!answers || Object.keys(answers).length === 0) {
    return res.status(400).json({
      success: false,
      error: "Aucune réponse fournie",
    });
  }

  // Récupérer les questions et leurs réponses correctes
  connection.query(
    `SELECT id, correct_answers, type 
     FROM mission_recognition_quizzes 
     WHERE mission_id = ?`,
    [missionId],
    (err, questions) => {
      if (err) {
        console.error("Erreur récupération questions:", err);
        return res.status(500).json({
          success: false,
          error: "Erreur lors de la récupération des questions",
        });
      }

      if (questions.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Aucune question trouvée",
        });
      }

      // Récupérer les paramètres
      connection.query(
        `SELECT passing_score 
         FROM mission_recognition_settings 
         WHERE mission_id = ?`,
        [missionId],
        (err, settings) => {
          if (err) {
            console.error("Erreur récupération settings:", err);
            return res.status(500).json({
              success: false,
              error: "Erreur lors de la récupération des paramètres",
            });
          }

          const passingScore =
            settings.length > 0 ? settings[0].passing_score : 100;

          // Calculer le score
          let correctCount = 0;
          let totalQuestions = questions.length;

          for (const question of questions) {
            const correctAnswers = JSON.parse(question.correct_answers);
            const userAnswer = answers[question.id];

            if (!userAnswer) continue;

            if (question.type === "multiple_choice") {
              if (correctAnswers.includes(userAnswer)) {
                correctCount++;
              }
            } else if (question.type === "checkboxes") {
              const userAnswers = Array.isArray(userAnswer)
                ? userAnswer
                : [userAnswer];
              const isCorrect =
                userAnswers.length === correctAnswers.length &&
                userAnswers.every((ans) => correctAnswers.includes(ans));
              if (isCorrect) {
                correctCount++;
              }
            }
          }

          const score = (correctCount / totalQuestions) * 100;
          const hasPassed = score >= passingScore;

          // Date actuelle au format MySQL (UTC)
          const now = new Date();
          const formattedNow = now.toISOString().slice(0, 19).replace("T", " ");

          // Calculer la date de déblocage (15 minutes après l'échec)
          let blockUntil = null;
          if (!hasPassed) {
            const blockDate = new Date(now.getTime() + 15 * 60 * 1000);
            blockUntil = blockDate.toISOString().slice(0, 19).replace("T", " ");
          }

          // 1. Insérer le résultat
          connection.query(
            `INSERT INTO mission_recognition_results 
             (mission_id, user_id, score, total_questions, correct_answers) 
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             score = VALUES(score), 
             total_questions = VALUES(total_questions), 
             correct_answers = VALUES(correct_answers),
             completed_at = CURRENT_TIMESTAMP`,
            [missionId, userId, score, totalQuestions, correctCount],
            (err, result) => {
              if (err) {
                console.error("Erreur insertion résultat:", err);
                return res.status(500).json({
                  success: false,
                  error: "Erreur lors de l'enregistrement du résultat",
                });
              }

              // 2. Mettre à jour la table applications
              let updateQuery = `
                UPDATE applications 
                SET 
                  last_quiz_attempt_at = ?,
                  quiz_blocked_until = ?
              `;

              const updateValues = [formattedNow, blockUntil];

              if (hasPassed) {
                updateQuery += `, recognition_passed = 1, recognition_passed_at = ?`;
                updateValues.push(formattedNow);
              } else {
                updateQuery += `, recognition_passed = 0, recognition_passed_at = NULL`;
              }

              updateQuery += ` WHERE mission_id = ? AND user_id = ?`;
              updateValues.push(missionId, userId);

              connection.query(
                updateQuery,
                updateValues,
                (err, updateResult) => {
                  if (err) {
                    console.error("Erreur mise à jour statut:", err);
                    return res.status(500).json({
                      success: false,
                      error: "Erreur lors de la mise à jour du statut",
                    });
                  }

                  res.json({
                    success: true,
                    score,
                    correctCount,
                    totalQuestions,
                    hasPassed,
                    passingScore,
                    blockUntil: blockUntil,
                    message: hasPassed
                      ? "Félicitations ! Vous pouvez maintenant accéder au questionnaire final."
                      : `Vous avez obtenu ${Math.round(score)}%. Le score minimum requis est de ${passingScore}%. Vous serez bloqué pendant 15 minutes.`,
                  });
                },
              );
            },
          );
        },
      );
    },
  );
});

// GET - Vérifier l'accès au questionnaire final
router.get("/:missionId/check-access/:userId", (req, res) => {
  const connection = req.db;
  const { missionId, userId } = req.params;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Utilisateur non authentifié",
    });
  }

  // Utiliser UTC_TIMESTAMP() au lieu de NOW() pour éviter les problèmes de fuseau horaire
  connection.query(
    `SELECT 
      r.score, 
      r.correct_answers, 
      r.total_questions, 
      r.completed_at as last_attempt_at,
      s.passing_score,
      a.recognition_passed,
      a.recognition_passed_at,
      a.quiz_blocked_until,
      a.last_quiz_attempt_at,
      TIMESTAMPDIFF(MINUTE, a.quiz_blocked_until, UTC_TIMESTAMP()) as minutes_since_block
     FROM applications a
     LEFT JOIN mission_recognition_results r ON r.mission_id = a.mission_id AND r.user_id = a.user_id
     LEFT JOIN mission_recognition_settings s ON s.mission_id = a.mission_id
     WHERE a.mission_id = ? AND a.user_id = ?
     ORDER BY r.completed_at DESC
     LIMIT 1`,
    [missionId, userId],
    (err, result) => {
      if (err) {
        console.error("Erreur vérification accès:", err);
        return res.status(500).json({
          success: false,
          error: "Erreur lors de la vérification de l'accès",
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Application non trouvée",
        });
      }

      const data = result[0];

      // Vérifier si des questions de reconnaissance existent pour cette mission
      connection.query(
        "SELECT COUNT(*) as qCount FROM mission_recognition_quizzes WHERE mission_id = ?",
        [missionId],
        (countErr, countRows) => {
          const totalQuizQuestions =
            !countErr && countRows?.length > 0 ? countRows[0].qCount : 0;
          const hasPassed =
            totalQuizQuestions === 0 || data.recognition_passed === 1;
          const passingScore = data.passing_score || 100;
          const lastScore = data.score;

          // Vérifier le blocage avec UTC_TIMESTAMP
          let isBlocked = false;
          let blockRemainingMinutes = 0;

          if (totalQuizQuestions > 0 && data.quiz_blocked_until) {
            const minutesSinceBlock = data.minutes_since_block;
            if (minutesSinceBlock < 0) {
              isBlocked = true;
              blockRemainingMinutes = Math.abs(minutesSinceBlock);
            }
          }

          if (hasPassed) {
            isBlocked = false;
            blockRemainingMinutes = 0;
          }

          let message = "";
          if (isBlocked) {
            message = `⏳ Vous avez échoué au quiz. Veuillez attendre ${Math.ceil(blockRemainingMinutes)} minutes avant de réessayer. Lisez le briefing attentivement.`;
          } else if (hasPassed) {
            message =
              totalQuizQuestions === 0
                ? "✅ Aucun quiz de reconnaissance requis. Vous pouvez accéder au questionnaire final."
                : "✅ Vous avez réussi le quiz ! Vous pouvez accéder au questionnaire final.";
          } else {
            message =
              "❌ Vous devez réussir le quiz de reconnaissance pour accéder au questionnaire final.";
          }

          res.json({
            success: true,
            canAccess: hasPassed && !isBlocked,
            hasPassed,
            isBlocked,
            blockRemainingMinutes: Math.ceil(
              Math.max(0, blockRemainingMinutes),
            ),
            score: lastScore,
            passingScore,
            message,
          });
        },
      );
    },
  );
});
module.exports = router;
