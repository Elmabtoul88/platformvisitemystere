const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");

router.get("/", auth, (req, res) => {
  const query = `SELECT a.id, a.mission_id, a.applied_at, a.user_id, u.name as user_name, u.profile_pic_url, u.email, u.city, u.completed_missions_count, m.title as mission_title, a.status, a.refusal_reason, a.stores, a.quiz, a.time_slot, a.mission_date, a.recognition_passed, a.recognition_passed_at FROM applications a JOIN users u ON a.user_id = u.id JOIN missions m ON a.mission_id = m.id ORDER BY a.applied_at DESC`;
  req.db.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    return res.status(500).json({ message: err });
  });
});

router.get("/check/:mission_id/:user_id", auth, (req, res) => {
  const { mission_id, user_id } = req.params;
  const storeId = req.query.store_id || req.query.storeId;

  const sql =
    "SELECT id, status, applied_at, time_slot, mission_date, stores FROM applications WHERE mission_id = ? AND user_id = ?";
  req.db.query(sql, [mission_id, user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const hasApplied = results && results.length > 0;
    const application = hasApplied ? results[0] : null;

    // Récupérer tous les rapports pour cette mission et cet utilisateur
    const reportSql =
      "SELECT id, store_id, status, submitted_at FROM reports WHERE mission_id = ? AND user_id = ? AND status IN ('submitted', 'approved', 'paid')";
    req.db.query(reportSql, [mission_id, user_id], (repErr, repResults) => {
      const reports = repResults || [];
      const submittedStoreIds = reports.map((r) => r.store_id).filter(Boolean);

      let hasSubmittedThisStore = false;
      let matchedReport = null;

      if (storeId) {
        matchedReport = reports.find(
          (r) => String(r.store_id) === String(storeId)
        );
        hasSubmittedThisStore = Boolean(matchedReport);
      } else {
        hasSubmittedThisStore = reports.length > 0;
        matchedReport = reports[0] || null;
      }

      let assignedStores = [];
      try {
        assignedStores = application?.stores
          ? (typeof application.stores === "object" ? application.stores : JSON.parse(application.stores))
          : [];
      } catch (e) {
        assignedStores = [];
      }

      const allStoresSubmitted =
        assignedStores.length > 0
          ? assignedStores.every((sId) => submittedStoreIds.map(String).includes(String(sId)))
          : reports.length > 0;

      return res.json({
        has_applied: hasApplied,
        application,
        has_submitted_report: hasSubmittedThisStore,
        all_stores_submitted: allStoresSubmitted,
        submitted_store_ids: submittedStoreIds,
        report: matchedReport,
      });
    });
  });
});

router.post("/", auth, (req, res) => {
  const { user_id, mission_id, status, stores, quiz } = req.body;

  if (!user_id || !mission_id || !status || !stores || !quiz) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Vérifier si le shopper a déjà postulé à cette mission (limité à une seule candidature)
  const checkSql =
    "SELECT id, status FROM applications WHERE user_id = ? AND mission_id = ?";
  req.db.query(checkSql, [user_id, mission_id], (checkError, existing) => {
    if (checkError) {
      console.error("Error checking existing application:", checkError);
      return res
        .status(500)
        .json({ message: "Server error checking existing application" });
    }

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Vous avez déjà postulé à cette mission.",
        has_applied: true,
        application_id: existing[0].id,
        status: existing[0].status,
      });
    }

    const sql =
      "INSERT INTO applications (user_id, mission_id, status, stores, quiz) VALUES (?, ?, ?, ?, ?)";
    const values = [user_id, mission_id, status, stores, quiz];

    req.db.query(sql, values, (error, result) => {
      if (error) {
        console.error("Error inserting application:", error);
        return res
          .status(500)
          .json({ message: "Server error while inserting application" });
      }

      res.status(201).json({
        success: true,
        message: "Application created successfully",
        application_id: result.insertId,
      });
    });
  });
});

router.patch("/patch/:id", auth, (req, res) => {
  const missionId = req.params.id;
  const fields = { ...req.body };

  if (!fields || Object.keys(fields).length === 0) {
    return res.status(400).json({ message: "No fields provided for update" });
  }

  // Assurer la validité du time_slot pour éviter les enum invalides
  if (fields.time_slot !== undefined) {
    if (!fields.time_slot || !["30", "60", "120", "open"].includes(String(fields.time_slot))) {
      fields.time_slot = null;
    }
  }

  // Build dynamic SET clause
  const updates = Object.keys(fields)
    .map((field) => `${field} = ?`)
    .join(", ");
  const values = Object.values(fields);

  const sql = `UPDATE applications SET ${updates} WHERE id = ?`;

  req.db.query(sql, [...values, missionId], (error, result) => {
    if (error) {
      console.error("Error updating mission:", error);
      return res
        .status(500)
        .json({ message: "Server error while updating mission" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "application not found" });
    }

    if (fields.status === "approved") {
      req.db.query(
        "SELECT mission_id, user_id FROM applications WHERE id = ?",
        [missionId],
        (appErr, appRows) => {
          if (!appErr && appRows && appRows.length > 0) {
            const { mission_id, user_id } = appRows[0];
            req.db.query(
              "SELECT assignedTo FROM missions WHERE id = ?",
              [mission_id],
              (mErr, mRows) => {
                if (!mErr && mRows && mRows.length > 0) {
                  let currentAssigned = [];
                  try {
                    currentAssigned = JSON.parse(mRows[0].assignedTo) || [];
                    if (!Array.isArray(currentAssigned)) currentAssigned = [];
                  } catch (e) {
                    currentAssigned = [];
                  }
                  if (!currentAssigned.includes(user_id)) {
                    currentAssigned.push(user_id);
                  }
                  req.db.query(
                    "UPDATE missions SET assignedTo = ? WHERE id = ?",
                    [JSON.stringify(currentAssigned), mission_id],
                  );
                }
              },
            );
          }
        },
      );
    }

    res.json({
      message: "application updated successfully",
      status: "success",
    });
  });
});

router.get("/assigned/:user_id", auth, (req, res) => {
  const userId = req.params.user_id;

  const sql = `
    SELECT
      a.id as application_id,
      a.mission_id,
      a.user_id,
      a.applied_at,
      a.status,
      a.time_slot,
      a.mission_date,
      a.refusal_reason,
      m.title,
      m.description,
      m.reward,
      m.businessName,
      m.location,
      m.briefing,
      m.scenario,
      m.questionnaire,
      m.profil,
      m.deadline,
      a.stores,
      a.quiz
    FROM applications a
    INNER JOIN missions m ON a.mission_id = m.id
    WHERE a.user_id = ?
    ORDER BY a.applied_at DESC
  `;

  req.db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    // 1. parse stores ids en toute sécurité
    const parsed = result.map((item) => {
      let parsedStores = [];
      try {
        parsedStores = item.stores ? (typeof item.stores === "object" ? item.stores : JSON.parse(item.stores)) : [];
      } catch (e) {
        parsedStores = [];
      }
      let parsedQuiz = [];
      try {
        parsedQuiz = item.quiz ? (typeof item.quiz === "object" ? item.quiz : JSON.parse(item.quiz)) : [];
      } catch (e) {
        parsedQuiz = [];
      }
      return {
        ...item,
        stores: parsedStores,
        quiz: parsedQuiz,
      };
    });

    // 2. Récupérer les identifiants de missions
    const missionIds = [...new Set(parsed.map((item) => item.mission_id))];

    if (missionIds.length === 0) {
      return res.json([]);
    }

    // 3. Récupérer les rapports existants pour ces missions et cet utilisateur
    req.db.query(
      `SELECT mission_id, store_id, status, submitted_at FROM reports WHERE mission_id IN (?) AND user_id = ? AND status IN ('submitted', 'approved', 'paid')`,
      [missionIds, userId],
      (errReports, reports) => {
        if (errReports) {
          return res.status(500).json({ message: errReports.message });
        }

        const submittedStoresMap = new Map();
        const submittedMissionsMap = new Map();
        (reports || []).forEach((r) => {
          submittedMissionsMap.set(r.mission_id, r);
          if (r.store_id) {
            submittedStoresMap.set(`${r.mission_id}_${r.store_id}`, r);
          }
        });

        // 4. collect all store IDs
        const storeIds = [...new Set(parsed.flatMap((r) => r.stores))];

        const buildResponse = (storeMap = new Map()) => {
          const finalData = parsed.map((item) => {
            const hasMissionReport = submittedMissionsMap.has(item.mission_id);
            const mappedStores = item.stores
              .map((id) => storeMap.get(id))
              .filter(Boolean);

            const availableStores = mappedStores.filter(
              (store) =>
                !submittedStoresMap.has(`${item.mission_id}_${store.id}`),
            );

            // Collecter les IDs des magasins déjà soumis pour cette mission
            const submittedStoreIdsForMission = (reports || [])
              .filter((r) => r.mission_id === item.mission_id)
              .map((r) => r.store_id)
              .filter(Boolean);

            // Une mission est entièrement terminée si :
            // 1) Elle a des magasins et TOUS les magasins ont été soumis
            // 2) OU elle n'a pas de magasins et au moins 1 rapport a été soumis
            const allStoresDone =
              item.stores.length > 0
                ? availableStores.length === 0 && hasMissionReport
                : (hasMissionReport || item.status === "submitted" || item.status === "completed");

            // Si tous les magasins ne sont pas encore faits, le statut reste "approved" pour continuer
            const status = allStoresDone
              ? "submitted"
              : item.status === "pending" || item.status === "refused"
                ? item.status
                : "approved";

            const rep = submittedMissionsMap.get(item.mission_id);

            return {
              ...item,
              status,
              // Pour la mission active, on fournit les magasins encore disponibles à évaluer
              stores:
                availableStores.length > 0 ? availableStores : mappedStores,
              all_stores: mappedStores,
              submitted_store_ids: submittedStoreIdsForMission,
              total_stores_count: item.stores.length,
              remaining_stores_count: availableStores.length,
              has_submitted_report: allStoresDone,
              report_status: allStoresDone ? rep?.status || "submitted" : null,
              report_submitted_at: rep ? rep.submitted_at : null,
            };
          });

          return res.json(finalData);
        };

        if (storeIds.length === 0) {
          return buildResponse();
        }

        // 5. fetch stores details
        req.db.query(
          `SELECT * FROM stores WHERE id IN (?)`,
          [storeIds],
          (errStores, stores) => {
            if (errStores) {
              return res.status(500).json({ message: errStores.message });
            }

            const storeMap = new Map(stores.map((s) => [s.id, s]));
            return buildResponse(storeMap);
          },
        );
      },
    );
  });
});

// ============================================
// 1. GET /api/applications/pending
// Récupérer toutes les applications en attente
// ============================================
router.get("/pending", [auth, adminAuth], (req, res) => {
  const sql = `SELECT * FROM applications WHERE status = 'pending' ORDER BY applied_at DESC`;

  req.db.query(sql, (error, results) => {
    if (error) {
      console.error("Erreur lors de la récupération des applications:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
      });
    }

    res.json({
      success: true,
      applications: results,
    });
  });
});

// ============================================
// 2. GET /api/applications/detail/:id
// Récupérer une application avec les détails des stores
// ============================================
// GET /api/applications/detail/:id
// Récupérer une application avec les détails des stores
router.get("/detail/:id", auth, (req, res) => {
  const applicationId = req.params.id;

  // 1. Récupérer l'application
  const getAppSql = `SELECT * FROM applications WHERE id = ?`;

  req.db.query(getAppSql, [applicationId], (error, results) => {
    if (error) {
      console.error("Erreur lors de la récupération de l'application:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération de l'application",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application non trouvée",
      });
    }

    const application = results[0];

    // Parser le quiz
    let quizData = [];
    try {
      quizData = JSON.parse(application.quiz);
      if (!Array.isArray(quizData)) quizData = [];
    } catch (e) {
      quizData = [];
    }
    application.quiz = quizData;

    // Parser les IDs des stores
    let storeIds = [];
    try {
      storeIds = JSON.parse(application.stores);
      if (!Array.isArray(storeIds)) storeIds = [];
    } catch (e) {
      storeIds = [];
    }
    application.store_ids = storeIds;

    // 2. Si l'application a des stores, on les récupère
    if (storeIds.length === 0) {
      // Pas de stores, on retourne directement l'application
      return res.json({
        success: true,
        application: application,
        store_details: [],
      });
    }

    // Récupérer les détails des stores
    const placeholders = storeIds.map(() => "?").join(",");
    const getStoresSql = `
      SELECT id, name, city, address, latitude, longitude, category 
      FROM stores 
      WHERE id IN (${placeholders}) AND active = 1
    `;

    req.db.query(getStoresSql, storeIds, (err, storeResults) => {
      if (err) {
        console.error("Erreur lors de la récupération des stores:", err);
        return res.status(500).json({
          success: false,
          message: "Erreur serveur lors de la récupération des stores",
        });
      }

      res.json({
        success: true,
        application: application,
        store_details: storeResults || [],
      });
    });
  });
});

// ============================================
// 3. PATCH /api/applications/validate/:id
// Valider une application (approuver/refuser)
// ============================================
router.patch("/validate/:id", [auth, adminAuth], (req, res) => {
  const applicationId = req.params.id;
  const { selectedStores, status, refusal_reason } = req.body;

  // Validation des paramètres
  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Le statut est requis",
    });
  }

  if (!["approved", "refused"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Statut invalide. Doit être 'approved' ou 'refused'",
    });
  }

  // Récupérer l'application actuelle
  const getAppSql = `SELECT id, stores, status, mission_id, user_id FROM applications WHERE id = ?`;

  req.db.query(getAppSql, [applicationId], (error, results) => {
    if (error) {
      console.error("Erreur lors de la récupération de l'application:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération de l'application",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application non trouvée",
      });
    }

    const application = results[0];

    // Vérifier que l'application est en attente
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `L'application est déjà ${application.status}. Seules les applications en attente peuvent être validées.`,
      });
    }

    // Si le statut est 'approved', on doit avoir des stores sélectionnés
    if (status === "approved") {
      let storeIds = [];

      if (
        selectedStores &&
        Array.isArray(selectedStores) &&
        selectedStores.length > 0
      ) {
        storeIds = selectedStores.map((id) => parseInt(id));

        // Vérifier que tous les stores existent et sont actifs
        const checkStoresSql = `SELECT id FROM stores WHERE id IN (?) AND active = 1`;
        req.db.query(checkStoresSql, [storeIds], (err, storeResults) => {
          if (err) {
            console.error("Erreur lors de la vérification des stores:", err);
            return res.status(500).json({
              success: false,
              message: "Erreur serveur lors de la vérification des stores",
            });
          }

          const existingStoreIds = storeResults.map((s) => s.id);
          const invalidStores = storeIds.filter(
            (id) => !existingStoreIds.includes(id),
          );

          if (invalidStores.length > 0) {
            return res.status(400).json({
              success: false,
              message: `Stores invalides: ${invalidStores.join(", ")}. Ces stores n'existent pas ou sont inactifs.`,
            });
          }

          // Mettre à jour avec les stores sélectionnés
          performUpdate(JSON.stringify(storeIds));
        });
      } else {
        // Si aucun store sélectionné, on refuse automatiquement
        return res.status(400).json({
          success: false,
          message:
            "Aucun magasin sélectionné. Veuillez sélectionner au moins un magasin ou utiliser le statut 'refused'.",
        });
      }
    } else {
      // Pour 'refused', on garde les stores existants
      performUpdate(application.stores);
    }

    function performUpdate(storesValue) {
      // Construire la requête de mise à jour
      const updates = [];
      const values = [];

      // Ajouter le statut
      updates.push("status = ?");
      values.push(status);

      // Ajouter la raison de refus si fournie
      if (refusal_reason !== undefined && status === "refused") {
        updates.push("refusal_reason = ?");
        values.push(refusal_reason || "");
      } else if (status === "approved") {
        // Pour approved, on efface la raison de refus
        updates.push("refusal_reason = ?");
        values.push(null);
      }

      // Ajouter les stores mis à jour
      updates.push("stores = ?");
      values.push(storesValue);

      // Ajouter l'ID de l'application
      values.push(applicationId);

      const sql = `UPDATE applications SET ${updates.join(", ")} WHERE id = ?`;

      req.db.query(sql, values, (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour de l'application:", err);
          return res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la mise à jour de l'application",
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Application non trouvée",
          });
        }

        // Récupérer l'application mise à jour
        const getUpdatedSql = `SELECT * FROM applications WHERE id = ?`;
        req.db.query(getUpdatedSql, [applicationId], (err, updatedResults) => {
          if (err) {
            console.error(
              "Erreur lors de la récupération de l'application mise à jour:",
              err,
            );
            return res.status(500).json({
              success: false,
              message:
                "Erreur serveur lors de la récupération de l'application mise à jour",
            });
          }

          res.json({
            success: true,
            message: `Application ${status === "approved" ? "approuvée" : "refusée"} avec succès`,
            application: updatedResults[0],
          });
        });
      });
    }
  });
});

// ============================================
// 4. PATCH /api/applications/status/:id
// Mettre à jour uniquement le statut
// ============================================
router.patch("/status/:id", [auth, adminAuth], (req, res) => {
  const applicationId = req.params.id;
  const { status, refusal_reason } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Le statut est requis",
    });
  }

  if (!["pending", "approved", "refused"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Statut invalide. Doit être 'pending', 'approved' ou 'refused'",
    });
  }

  // Récupérer l'application pour vérifier qu'elle existe
  const getAppSql = `SELECT id, status FROM applications WHERE id = ?`;

  req.db.query(getAppSql, [applicationId], (error, results) => {
    if (error) {
      console.error("Erreur lors de la récupération de l'application:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application non trouvée",
      });
    }

    // Construire la requête de mise à jour
    let updates = ["status = ?"];
    let values = [status];

    // Si le statut est 'refused', ajouter la raison de refus
    if (status === "refused" && refusal_reason !== undefined) {
      updates.push("refusal_reason = ?");
      values.push(refusal_reason || "");
    } else if (status === "approved" || status === "pending") {
      // Effacer la raison de refus pour les autres statuts
      updates.push("refusal_reason = ?");
      values.push(null);
    }

    values.push(applicationId);

    const sql = `UPDATE applications SET ${updates.join(", ")} WHERE id = ?`;

    req.db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour du statut:", err);
        return res.status(500).json({
          success: false,
          message: "Erreur serveur lors de la mise à jour du statut",
        });
      }

      res.json({
        success: true,
        message: "Statut mis à jour avec succès",
        status: status,
      });
    });
  });
});

// ============================================
// 5. PATCH /api/applications/add-store/:id
// Ajouter un store à une application
// ============================================
router.patch("/add-store/:id", [auth, adminAuth], (req, res) => {
  const applicationId = req.params.id;
  const { storeId } = req.body;

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: "storeId est requis",
    });
  }

  // Récupérer l'application
  const getAppSql = `SELECT id, stores, status FROM applications WHERE id = ?`;

  req.db.query(getAppSql, [applicationId], (error, results) => {
    if (error) {
      console.error("Erreur lors de la récupération de l'application:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application non trouvée",
      });
    }

    const application = results[0];

    // Vérifier que l'application est en attente
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Impossible de modifier les stores d'une application ${application.status}`,
      });
    }

    // Vérifier que le store existe et est actif
    const checkStoreSql = `SELECT id FROM stores WHERE id = ? AND active = 1`;
    req.db.query(checkStoreSql, [storeId], (err, storeResults) => {
      if (err) {
        console.error("Erreur lors de la vérification du store:", err);
        return res.status(500).json({
          success: false,
          message: "Erreur serveur lors de la vérification du store",
        });
      }

      if (storeResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Store non trouvé ou inactif",
        });
      }

      // Parser les stores actuels
      let currentStores = [];
      try {
        currentStores = JSON.parse(application.stores);
        if (!Array.isArray(currentStores)) {
          currentStores = [];
        }
      } catch (e) {
        currentStores = [];
      }

      const storeIdInt = parseInt(storeId);

      // Vérifier si le store existe déjà
      if (currentStores.includes(storeIdInt)) {
        return res.status(400).json({
          success: false,
          message: `Le store ${storeId} est déjà dans la liste`,
        });
      }

      // Ajouter le store
      currentStores.push(storeIdInt);
      const storesJson = JSON.stringify(currentStores);

      // Mettre à jour
      const updateSql = `UPDATE applications SET stores = ? WHERE id = ?`;
      req.db.query(updateSql, [storesJson, applicationId], (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour des stores:", err);
          return res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la mise à jour",
          });
        }

        res.json({
          success: true,
          message: "Store ajouté avec succès",
          stores: currentStores,
        });
      });
    });
  });
});

// ============================================
// 6. PATCH /api/applications/remove-store/:id
// Retirer un store d'une application
// ============================================
router.patch("/remove-store/:id", [auth, adminAuth], (req, res) => {
  const applicationId = req.params.id;
  const { storeId } = req.body;

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: "storeId est requis",
    });
  }

  // Récupérer l'application
  const getAppSql = `SELECT id, stores, status FROM applications WHERE id = ?`;

  req.db.query(getAppSql, [applicationId], (error, results) => {
    if (error) {
      console.error("Erreur lors de la récupération de l'application:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application non trouvée",
      });
    }

    const application = results[0];

    // Vérifier que l'application est en attente
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Impossible de modifier les stores d'une application ${application.status}`,
      });
    }

    // Parser les stores actuels
    let currentStores = [];
    try {
      currentStores = JSON.parse(application.stores);
      if (!Array.isArray(currentStores)) {
        currentStores = [];
      }
    } catch (e) {
      currentStores = [];
    }

    const storeIdInt = parseInt(storeId);

    // Vérifier si le store existe dans la liste
    if (!currentStores.includes(storeIdInt)) {
      return res.status(400).json({
        success: false,
        message: `Le store ${storeId} n'est pas dans la liste`,
      });
    }

    // Retirer le store
    const updatedStores = currentStores.filter((id) => id !== storeIdInt);
    const storesJson = JSON.stringify(updatedStores);

    // Mettre à jour
    const updateSql = `UPDATE applications SET stores = ? WHERE id = ?`;
    req.db.query(updateSql, [storesJson, applicationId], (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour des stores:", err);
        return res.status(500).json({
          success: false,
          message: "Erreur serveur lors de la mise à jour",
        });
      }

      res.json({
        success: true,
        message: "Store retiré avec succès",
        stores: updatedStores,
      });
    });
  });
});

// ============================================
// 7. PATCH /api/applications/stores/:id
// Mettre à jour toute la liste des stores
// ============================================
router.patch("/stores/:id", [auth, adminAuth], (req, res) => {
  const applicationId = req.params.id;
  const { stores } = req.body;

  if (!stores || !Array.isArray(stores)) {
    return res.status(400).json({
      success: false,
      message: "La liste des stores est requise et doit être un tableau",
    });
  }

  // Récupérer l'application
  const getAppSql = `SELECT id, status FROM applications WHERE id = ?`;

  req.db.query(getAppSql, [applicationId], (error, results) => {
    if (error) {
      console.error("Erreur lors de la récupération de l'application:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application non trouvée",
      });
    }

    const application = results[0];

    // Vérifier que l'application est en attente
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Impossible de modifier les stores d'une application ${application.status}`,
      });
    }

    // Vérifier que tous les stores existent
    const storeIds = stores.map((id) => parseInt(id));

    if (storeIds.length > 0) {
      const checkStoresSql = `SELECT id FROM stores WHERE id IN (?) AND active = 1`;
      req.db.query(checkStoresSql, [storeIds], (err, storeResults) => {
        if (err) {
          console.error("Erreur lors de la vérification des stores:", err);
          return res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la vérification des stores",
          });
        }

        const existingStoreIds = storeResults.map((s) => s.id);
        const invalidStores = storeIds.filter(
          (id) => !existingStoreIds.includes(id),
        );

        if (invalidStores.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Stores invalides: ${invalidStores.join(", ")}. Ces stores n'existent pas ou sont inactifs.`,
          });
        }

        updateStores(JSON.stringify(storeIds));
      });
    } else {
      // Liste vide
      updateStores(JSON.stringify([]));
    }

    function updateStores(storesValue) {
      const sql = `UPDATE applications SET stores = ? WHERE id = ?`;
      req.db.query(sql, [storesValue, applicationId], (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour des stores:", err);
          return res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la mise à jour des stores",
          });
        }

        res.json({
          success: true,
          message: "Liste des stores mise à jour avec succès",
          stores: JSON.parse(storesValue),
        });
      });
    }
  });
});

// ============================================
// 8. PATCH /api/applications/patch/:id
// Mise à jour générique (pour compatibilité)
// ============================================
router.patch("/patch/:id", (req, res) => {
  const missionId = req.params.id;
  const fields = req.body;

  if (!fields || Object.keys(fields).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Aucun champ fourni pour la mise à jour",
    });
  }

  // Construire la clause SET dynamique
  const updates = Object.keys(fields)
    .map((field) => `${field} = ?`)
    .join(", ");
  const values = Object.values(fields);

  const sql = `UPDATE applications SET ${updates} WHERE id = ?`;

  req.db.query(sql, [...values, missionId], (error, result) => {
    if (error) {
      console.error("Erreur lors de la mise à jour:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la mise à jour",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Application non trouvée",
      });
    }

    res.json({
      success: true,
      message: "Application mise à jour avec succès",
    });
  });
});

module.exports = router;
