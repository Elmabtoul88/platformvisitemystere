const express = require("express");
const router = express.Router();
const base_url = require("../services/baseUrl");
const { auth, adminAuth } = require("../middleware/auth");
const prisma = require("../prismaClient");

// Fonction pour envoyer notification utilisateur
const sendUserNotification = async (
  userId,
  userEmail,
  userName,
  type,
  notificationData,
) => {
  try {
    const fetch = require("node-fetch");
    const response = await fetch(base_url + "/api/user-notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        userEmail,
        userName,
        type,
        notificationData,
      }),
    });

   
  } catch (error) {
    console.error("Erreur notification utilisateur:", error.message);
  }
};

const sendNotificationIfEnabled = async (type, userData) => {
  try {
    const fetch = require("node-fetch");
    const settingsResponse = await fetch(base_url + "/api/notifications");

    if (!settingsResponse.ok) return;

    const settings = await settingsResponse.json();

    if (settings[type]) {
      const notificationResponse = await fetch(
        base_url + "/api/notifications",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, userData }),
        },
      );

      if (!notificationResponse.ok) {
        console.error(`Erreur envoi notification ${type}`);
      }
    }
  } catch (error) {
    console.error(`Erreur système notification ${type}:`, error.message);
  }
};

router.get("/", auth, async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === "shopper") {
      whereClause = { user_id: req.user.id };
    } else if (req.user.role === "client") {
      whereClause = { missions: { clientId: req.user.id } };
    }

    const reports = await prisma.reports.findMany({
      where: whereClause,
      include: {
        missions: {
          select: {
            id: true,
            title: true,
            category: true,
            reward: true,
            businessName: true,
            status: true,
            location: true,
            ville: true,
            scenario: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            telephone: true,
            profile_pic_url: true,
          },
        },
      },
      orderBy: { submitted_at: "desc" },
    });

    const formatted = reports.map((r) => {
      let parsed = [];
      try {
        parsed = JSON.parse(r.answers || "[]");
      } catch (e) {
        parsed = [];
      }
      return {
        ...r,
        answers: parsed,
        category: r.missions?.category,
        reward: r.missions?.reward ? parseFloat(r.missions.reward) : 0,
        mission_title: r.missions?.title,
        businessName: r.missions?.businessName,
        user_name: r.users?.name,
        user_email: r.users?.email,
        user_telephone: r.users?.telephone,
        user_profile_pic: r.users?.profile_pic_url,
      };
    });

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("Erreur reports list:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/surveyqBymission/:id", auth, (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM reports WHERE mission_id = ?";
  req.db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(404).json({ message: "No reports found" });
    res.json(results);
  });
});

router.get("/:id", auth, (req, res) => {
  const query =
    "SELECT m.*, r.submitted_at FROM missions m JOIN reports r ON m.id = r.mission_id WHERE m.status IN ('submitted', 'approved') AND r.status = 'approved' AND r.user_id = ? AND JSON_CONTAINS(m.assignedTo, ?)";
  req.db.query(query, [req.params.id, req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(404).json({ message: "Mission not found" });
    res.json(results);
  });
});

router.get("/surveyQuestions/:missionId", auth, (req, res) => {
  const { missionId } = req.params;

  const sql = `
    SELECT id, type, text, is_required, max_rating, min_label, max_label, 
           allow_multiple, max_images, max_duration_seconds, options_json
    FROM survey_questions 
    WHERE mission_id = ? 
    ORDER BY id ASC
  `;

  req.db.query(sql, [missionId], (err, results) => {
    if (err) {
      console.error("Erreur récupération questions:", err);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération des questions",
      });
    }

    const questions = results.map((question) => ({
      ...question,
      options: question.options_json ? JSON.parse(question.options_json) : null,
    }));
    
    res.json(questions);
  });
});

/*router.post("/", async (req, res) => {
  const {
    mission_id,
    user_id,
    answers,
    status,
    nomMagazin,
    specificStoreAddress,
    scenario,
    dateTimeMission,
  } = req.body;

  if (!mission_id || !user_id || !answers) {
    return res.status(400).json({
      success: false,
      message: "mission_id, user_id et answers sont requis",
    });
  }
  if (!Array.isArray(answers)) {
    return res.status(400).json({
      success: false,
      message: "answers doit être un tableau",
    });
  }
  const sql = `
    INSERT INTO reports (mission_id, user_id, answers, submitted_at, status,nomMagazin,specificStoreAddress,scenario,dateTimeMission)
    VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)
  `;

  const values = [
    mission_id,
    user_id,
    JSON.stringify(answers),
    status || "submitted",
    nomMagazin || null,
    specificStoreAddress || null,
    scenario || null,
    dateTimeMission || null,
  ];

  req.db.query(sql, values, async (err, result) => {
    if (err) {
      console.error("Erreur création rapport:", err);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la création du rapport",
      });
    }

    const notificationDataSql = `
      SELECT 
        m.title as mission_title,
        m.businessName,
        u.name as shopper_name,
        u.email as shopper_email
      FROM missions m, users u 
      WHERE m.id = ? AND u.id = ?
    `;

    req.db.query(
      notificationDataSql,
      [mission_id, user_id],
      async (dataErr, dataResults) => {
        if (!dataErr && dataResults.length > 0) {
          const data = dataResults[0];

          await sendNotificationIfEnabled("reportSubmitted", {
            missionTitle: data.mission_title || "Mission",
            businessName: data.businessName || "",
            shopperName: data.shopper_name || "Shopper",
            shopperEmail: data.shopper_email || "",
            reportId: result.insertId,
            submissionDate: new Date().toISOString(),
            missionId: mission_id,
          });
        } else {
          console.error("Erreur récupération données notification:", dataErr);
        }
      }
    );

    const updateMissionSql =
      "UPDATE missions SET status = 'submitted' WHERE id = ?";
    req.db.query(updateMissionSql, [mission_id]);

    res.json({
      success: true,
      message: "Rapport créé avec succès!",
      data: {
        reportId: result.insertId,
        missionId: mission_id,
      },
    });
  });
});*/

// POST /reports
router.post("/", auth, async (req, res) => {
  let {
    mission_id,
    user_id,
    answers,
    status,
    nomMagazin,
    specificStoreAddress,
    scenario,
    dateTimeMission,
    ville,
    store_id,
  } = req.body;

  // -------------------------
  // 1️⃣ VALIDATION
  // -------------------------
  if (!mission_id || !user_id || !answers) {
    return res.status(400).json({
      success: false,
      message: "mission_id, user_id et answers sont requis",
    });
  }

  if (!Array.isArray(answers)) {
    return res.status(400).json({
      success: false,
      message: "answers doit être un tableau",
    });
  }

  // Auto-enrichissement automatique des métadonnées de la visite si manquantes
  if (!nomMagazin || !ville || !dateTimeMission || !store_id || !specificStoreAddress || !scenario) {
    try {
      const dbClient = req.prisma || prisma;
      const [missionInfo, appInfo] = await Promise.all([
        dbClient.missions.findUnique({
          where: { id: parseInt(mission_id, 10) },
          include: { stores: true },
        }),
        dbClient.applications.findFirst({
          where: {
            mission_id: parseInt(mission_id, 10),
            user_id: parseInt(user_id, 10),
          },
        }),
      ]);

      let assignedStore = null;
      if (appInfo?.stores) {
        try {
          const storeIds = typeof appInfo.stores === "string" ? JSON.parse(appInfo.stores) : appInfo.stores;
          if (Array.isArray(storeIds) && storeIds.length > 0) {
            assignedStore = missionInfo?.stores?.find((s) => s.id === storeIds[0]);
          }
        } catch (e) {}
      }
      if (!assignedStore && missionInfo?.stores?.length > 0) {
        assignedStore = missionInfo.stores[0];
      }

      if (!nomMagazin) nomMagazin = assignedStore?.name || missionInfo?.businessName || missionInfo?.title || "Magasin";
      if (!store_id) store_id = assignedStore?.id || (missionInfo?.stores?.[0]?.id) || 1;
      if (!specificStoreAddress) specificStoreAddress = assignedStore?.address || missionInfo?.location || "";
      if (!ville) ville = assignedStore?.city || missionInfo?.ville || missionInfo?.location || "Maroc";
      if (!scenario) scenario = missionInfo?.scenario || "";
      if (!dateTimeMission) dateTimeMission = appInfo?.mission_date || new Date();
    } catch (enrichErr) {
      console.warn("Auto-enrichment warning on report submit:", enrichErr.message);
    }
  }

  // -------------------------
  // 2️⃣ CHECK DUPLICATE REPORT (Par magasin et par mission)
  // -------------------------
  let checkSql = `
    SELECT id FROM reports
    WHERE mission_id = ? AND user_id = ?
  `;
  const checkParams = [mission_id, user_id];

  if (store_id) {
    checkSql += ` AND store_id = ?`;
    checkParams.push(store_id);
  }
  checkSql += ` LIMIT 1`;

  req.db.query(checkSql, checkParams, (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Erreur vérification rapport:", checkErr);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification du rapport.",
      });
    }

    if (checkResults.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Vous avez déjà soumis un rapport pour ce magasin dans cette mission.",
      });
    }

    // Continue
    insertReport();
  });

  // -------------------------
  // 3️⃣ INSERT REPORT FUNCTION
  // -------------------------
  function insertReport() {
    const sql = `
      INSERT INTO reports 
      (mission_id, user_id, answers, submitted_at, status, nomMagazin, specificStoreAddress, scenario, dateTimeMission, ville,store_id)
      VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      mission_id,
      user_id,
      JSON.stringify(answers),
      status || "submitted",
      nomMagazin || null,
      specificStoreAddress || null,
      scenario || null,
      dateTimeMission || null,
      ville || null,
      store_id || null,
    ];

   

    req.db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erreur création rapport:", err);
        return res.status(500).json({
          success: false,
          message: "Erreur lors de la création du rapport",
        });
      }

      const reportId = result.insertId;

      // -------------------------
      // 5️⃣ VÉRIFIER SI TOUS LES MAGASINS ASSIGNÉS ONT ÉTÉ SOUMIS
      // -------------------------
      const checkStoresSql = `
        SELECT a.stores 
        FROM applications a 
        WHERE a.mission_id = ? AND a.user_id = ? 
        LIMIT 1
      `;

      req.db.query(checkStoresSql, [mission_id, user_id], (appCheckErr, appCheckRes) => {
        let assignedStores = [];
        if (!appCheckErr && appCheckRes && appCheckRes.length > 0) {
          try {
            const raw = appCheckRes[0].stores;
            assignedStores = typeof raw === "string" ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
          } catch (e) {
            assignedStores = [];
          }
        }

        // Récupérer tous les magasins soumis pour cette mission par ce shopper
        const getSubmittedStoresSql = `
          SELECT store_id 
          FROM reports 
          WHERE mission_id = ? AND user_id = ? AND status IN ('submitted', 'approved', 'paid')
        `;

        req.db.query(getSubmittedStoresSql, [mission_id, user_id], (repCheckErr, repCheckRes) => {
          const submittedIds = (repCheckRes || []).map((r) => r.store_id).filter(Boolean);

          let allStoresDone = true;
          let remainingCount = 0;

          if (assignedStores.length > 0) {
            const remainingStores = assignedStores.filter(
              (sId) => !submittedIds.map(String).includes(String(sId)),
            );
            remainingCount = remainingStores.length;
            allStoresDone = remainingStores.length === 0;
          } else {
            allStoresDone = true;
            remainingCount = 0;
          }

          // Si tous les magasins ont été soumis, mettre le statut de la candidature à 'submitted'
          if (allStoresDone) {
            req.db.query(
              "UPDATE applications SET status = 'submitted' WHERE mission_id = ? AND user_id = ?",
              [mission_id, user_id],
              (appErr) => {
                if (appErr) console.error("Erreur mise à jour statut application:", appErr);
              },
            );
          } else {
            // S'il reste des magasins, s'assurer que la candidature reste 'approved' pour continuer
            req.db.query(
              "UPDATE applications SET status = 'approved' WHERE mission_id = ? AND user_id = ?",
              [mission_id, user_id],
              (appErr) => {
                if (appErr) console.error("Erreur maintien statut application:", appErr);
              },
            );
          }

          // Notification
          const storeLabel = nomMagazin ? ` (${nomMagazin})` : "";
          const notifMsg = allStoresDone
            ? `Votre rapport final pour la mission #${mission_id} a été soumis avec succès.`
            : `Votre rapport pour le magasin${storeLabel} (mission #${mission_id}) a été soumis avec succès. Il vous reste ${remainingCount} magasin(s) à évaluer.`;

          const notifSql = `
            INSERT INTO notifications (user_id, type, message, created_at)
            VALUES (?, 'report', ?, NOW())
          `;

          req.db.query(notifSql, [user_id, notifMsg], (notifErr) => {
            if (notifErr) console.error("Erreur notification:", notifErr);
          });

          return res.json({
            success: true,
            message: "Rapport créé avec succès!",
            data: {
              reportId,
              missionId: mission_id,
              allStoresCompleted: allStoresDone,
              remainingStoresCount: remainingCount,
            },
          });
        });
      });
    });
  }
});

router.get("/admin/all", auth, (req, res) => {
  const sql = `
    SELECT 
      r.id as report_id, r.mission_id, r.user_id, r.answers,
      r.submitted_at, r.status, r.refusal_reason,
      m.title as mission_title, m.businessName, m.category, m.reward,
      u.name as user_name, u.email as user_email
    FROM reports r
    LEFT JOIN missions m ON r.mission_id = m.id
    LEFT JOIN users u ON r.user_id = u.id
    ORDER BY r.submitted_at DESC
  `;

  req.db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur récupération rapports admin:", err);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération des rapports",
      });
    }

    const reports = results.map((report) => ({
      ...report,
      answers: JSON.parse(report.answers || "[]"),
    }));

    res.json({
      success: true,
      reports: reports,
      count: reports.length,
    });
  });
});

router.get("/admin/stats", auth, (req, res) => {
  const statsSql = `
    SELECT 
      status,
      COUNT(*) as count
    FROM reports 
    GROUP BY status
    
    UNION ALL
    
    SELECT 
      'total' as status,
      COUNT(*) as count
    FROM reports
  `;

  req.db.query(statsSql, (err, results) => {
    if (err) {
      console.error("Erreur récupération statistiques:", err);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération des statistiques",
      });
    }

    const stats = {
      total: 0,
      submitted: 0,
      approved: 0,
      refused: 0,
      approvalRate: 0,
    };

    results.forEach((row) => {
      if (row.status === "total") {
        stats.total = row.count;
      } else {
        stats[row.status] = row.count || 0;
      }
    });

    if (stats.total > 0) {
      stats.approvalRate = Math.round((stats.approved / stats.total) * 100);
    }

    res.json({
      success: true,
      stats: stats,
    });
  });
});

const updateReportStatus = (req, res) => {
  const { reportId } = req.params;
  const { status, refusal_reason } = req.body;

  const validStatuses = ["submitted", "approved", "refused"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Statut invalide. Statuts valides: ${validStatuses.join(", ")}`,
    });
  }

  // --- Build UPDATE query ---
  const fields = ["status = ?"];
  const values = [status];

  if (status === "refused") {
    fields.push("refusal_reason = ?");
    values.push(refusal_reason || null);
  }

  values.push(reportId);

  const updateSql = `
    UPDATE reports 
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  req.db.query(updateSql, values, (err, result) => {
    if (err) {
      console.error("Erreur update report:", err);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du rapport",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Rapport non trouvé",
      });
    }

    // --- Notification uniquement si approved ou refused ---
    if (!["approved", "refused"].includes(status)) {
      return res.json({
        success: true,
        message: "Statut du rapport mis à jour avec succès",
        data: { reportId, status },
      });
    }

    const userSql = `
      SELECT 
        u.id AS userId,
        u.name,
        u.email,
        m.title AS missionTitle,
        m.reward
      FROM reports r
      JOIN users u ON r.user_id = u.id
      JOIN missions m ON r.mission_id = m.id
      WHERE r.id = ?
    `;

    req.db.query(userSql, [reportId], async (err, rows) => {
      if (!err && rows.length > 0) {
        const user = rows[0];

        try {
          await sendUserNotification(
            user.userId,
            user.email,
            user.name,
            "reportStatusPush",
            {
              missionTitle: user.missionTitle,
              status,
              reward: user.reward,
              refusalReason: refusal_reason || null,
            },
          );
        } catch (notifyErr) {
          console.error("Erreur notification:", notifyErr);
        }
      }

      return res.json({
        success: true,
        message: "Statut du rapport mis à jour avec succès",
        data: { reportId, status },
      });
    });
  });
};

router.patch("/admin/:reportId/status", auth, updateReportStatus);
router.patch("/:reportId/status", auth, updateReportStatus);

module.exports = router;
