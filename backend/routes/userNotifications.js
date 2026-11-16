const express = require("express");
const router = express.Router();
require("dotenv").config();
const { auth } = require("../middleware/auth");
const prisma = require("../prismaClient");
const { createTransporter } = require("../services/mailer");
const base_url = process.env.BASE_URL;
const userPreferences = {};

const getUserEmailTemplate = (type, userData = {}) => {
  const baseStyle = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  `;

  const endStyle = `
      </div>
      <div style="text-align: center; margin-top: 20px; padding: 15px;">
        <p style="color: #6c757d; font-size: 12px; margin: 0;">
          Email automatique - ${new Date().toLocaleString("fr-FR")}
        </p>
      </div>
    </div>
  `;

  switch (type) {
    case "newMissionEmail":
      return {
        subject: "Nouvelle mission disponible - MissionView",
        html:
          baseStyle +
          `
          <h1 style="color: #007bff; text-align: center; margin-bottom: 25px;">Nouvelle Mission!</h1>
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 5px solid #2196f3;">
            <h2 style="color: #1976d2;">Bonjour ${
              userData.userName || "Mystery Shopper"
            },</h2>
            <p style="color: #555;">Une nouvelle mission est disponible :</p>
            <table style="width: 100%; border-collapse: collapse; background: white; margin: 15px 0;">
              <tr><td style="padding: 12px; font-weight: bold;">Mission :</td><td style="padding: 12px;">${
                userData.missionTitle || "Mission"
              }</td></tr>
              <tr><td style="padding: 12px; font-weight: bold;">Entreprise :</td><td style="padding: 12px;">${
                userData.businessName || ""
              }</td></tr>
              <tr><td style="padding: 12px; font-weight: bold;">Récompense :</td><td style="padding: 12px; font-weight: bold; color: #28a745;">${
                userData.reward || "50"
              } points</td></tr>
            </table>
          </div>
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://app.embertongroup.com/missions" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Voir la Mission
            </a>
          </div>
        ` +
          endStyle,
      };

    case "deadlineReminderEmail":
      return {
        subject: "Rappel : Mission à terminer - MissionView",
        html:
          baseStyle +
          `
          <h1 style="color: #ff9800; text-align: center; margin-bottom: 25px;">Rappel de Deadline</h1>
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 5px solid #ff9800;">
            <h2 style="color: #e65100;">Bonjour ${
              userData.userName || "Mystery Shopper"
            },</h2>
            <p style="color: #555;">Votre mission arrive bientôt à expiration :</p>
            <table style="width: 100%; border-collapse: collapse; background: white; margin: 15px 0;">
              <tr><td style="padding: 12px; font-weight: bold;">Mission :</td><td style="padding: 12px;">${
                userData.missionTitle || "Mission"
              }</td></tr>
              <tr><td style="padding: 12px; font-weight: bold;">Temps restant :</td><td style="padding: 12px; font-weight: bold; color: #d32f2f;">${
                userData.daysLeft || "2"
              } jour(s)</td></tr>
            </table>
          </div>
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://app.embertongroup.com/missions" style="background: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Terminer la Mission
            </a>
          </div>
        ` +
          endStyle,
      };

    case "reportStatusPush":
      const isApproved = userData.status === "approved";
      return {
        subject: `${
          isApproved ? "Approuvé" : "Refusé"
        } - Statut de votre rapport - MissionView`,
        html:
          baseStyle +
          `
          <h1 style="color: ${
            isApproved ? "#28a745" : "#dc3545"
          }; text-align: center; margin-bottom: 25px;">
            Rapport ${isApproved ? "Approuvé!" : "Refusé"}
          </h1>
          <div style="background: ${
            isApproved ? "#d4edda" : "#f8d7da"
          }; padding: 20px; border-radius: 8px; border-left: 5px solid ${
            isApproved ? "#28a745" : "#dc3545"
          };">
            <h2 style="color: ${isApproved ? "#155724" : "#721c24"};">Bonjour ${
              userData.userName || "Mystery Shopper"
            },</h2>
            <p style="color: #555;">
              ${
                isApproved
                  ? "Félicitations ! Votre rapport a été approuvé."
                  : "Votre rapport nécessite des améliorations."
              }
            </p>
            <table style="width: 100%; border-collapse: collapse; background: white; margin: 15px 0;">
              <tr><td style="padding: 12px; font-weight: bold;">Mission :</td><td style="padding: 12px;">${
                userData.missionTitle || "Mission"
              }</td></tr>
              <tr><td style="padding: 12px; font-weight: bold;">Statut :</td><td style="padding: 12px; font-weight: bold; color: ${
                isApproved ? "#28a745" : "#dc3545"
              };">${isApproved ? "Approuvé" : "Refusé"}</td></tr>
              ${
                isApproved
                  ? `<tr><td style="padding: 12px; font-weight: bold;">Points :</td><td style="padding: 12px; font-weight: bold; color: #28a745;">${
                      userData.reward || "50"
                    } points</td></tr>`
                  : userData.refusalReason
                    ? `<tr><td style="padding: 12px; font-weight: bold;">Raison :</td><td style="padding: 12px;">${userData.refusalReason}</td></tr>`
                    : ""
              }
            </table>
          </div>
        ` +
          endStyle,
      };

    case "slotReminderEmail":
      return {
        subject: `⏰ Rappel : Votre visite pour "${userData.missionTitle || "votre mission"}" est en cours ! - MissionView`,
        html:
          baseStyle +
          `
          <h1 style="color: #ff9800; text-align: center; margin-bottom: 25px;">⏰ Rappel de Créneau de Visite</h1>
          <div style="background: #fff8e1; padding: 20px; border-radius: 8px; border-left: 5px solid #ffb300;">
            <h2 style="color: #b78103; margin-top: 0;">Bonjour ${
              userData.userName || "Mystery Shopper"
            },</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.5;">
              Ceci est un rappel automatique : vous avez une visite mystère planifiée <strong>aujourd'hui</strong> dont le créneau horaire est actuellement actif !
            </p>
            <table style="width: 100%; border-collapse: collapse; background: white; margin: 15px 0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <tr><td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee; width: 35%;">🎯 Mission :</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${
                userData.missionTitle || "Mission"
              }</td></tr>
              ${userData.businessName ? `<tr><td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">🏢 Enseigne :</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${userData.businessName}</td></tr>` : ""}
              ${userData.storeName ? `<tr><td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">🏪 Magasin :</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${userData.storeName}</td></tr>` : ""}
              <tr><td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">📅 Date :</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${
                userData.dateFormatted || "Aujourd'hui"
              }</td></tr>
              <tr><td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">⏰ Créneau horaire :</td><td style="padding: 12px; border-bottom: 1px solid #eee; color: #e65100; font-weight: bold;">${
                userData.slotFormatted || "Créneau actif"
              }</td></tr>
              ${userData.reward ? `<tr><td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">💰 Rémunération :</td><td style="padding: 12px; border-bottom: 1px solid #eee; color: #28a745; font-weight: bold;">${userData.reward} MAD</td></tr>` : ""}
            </table>
            <div style="background: #e8f4fd; padding: 12px 15px; border-radius: 6px; margin-top: 15px; color: #0c5460; font-size: 13px;">
              💡 <strong>Conseil :</strong> Pensez à bien relire le scénario et le briefing avant d'entrer dans le point de vente, puis remplissez votre questionnaire directement depuis l'onglet « Missions assignées ».
            </div>
          </div>
          <div style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${userData.actionUrl || "http://localhost:9002/missions/assigned"}" style="background: #041F40; color: #D6C799; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px; letter-spacing: 0.5px;">
              Accéder à ma mission assignée →
            </a>
          </div>
        ` +
          endStyle,
      };

    default:
      return null;
  }
};

// Fonction pour vérifier les créneaux actifs et envoyer les rappels par email
const checkActiveSlotReminders = async (prismaInstance) => {
  const db = prismaInstance || prisma;
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Récupérer les candidatures approuvées prévues pour aujourd'hui
    const applications = await db.applications.findMany({
      where: {
        status: "approved",
        OR: [
          {
            mission_date: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
          {
            mission_date: null,
            applied_at: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        ],
      },
      include: {
        users: {
          select: { id: true, name: true, email: true },
        },
        missions: {
          select: { id: true, title: true, businessName: true, reward: true, deadline: true },
        },
      },
    });

    let sentCount = 0;

    for (const app of applications) {
      if (!app.users || !app.users.email || !app.missions) continue;

      // 1. Vérifier si l'utilisateur a désactivé ce rappel
      const prefs = userPreferences[app.users.id];
      if (prefs && prefs.slotReminderEmail === false) continue;

      // 2. Vérifier si un rapport a déjà été soumis ou validé
      const existingReport = await db.reports.findFirst({
        where: {
          mission_id: app.mission_id,
          user_id: app.user_id,
          status: { in: ["submitted", "approved"] },
        },
      });
      if (existingReport) continue;

      // 3. Calculer la fenêtre horaire
      const plannedDate = new Date(app.mission_date || app.applied_at);
      const isSlotOpen = app.time_slot === "open";
      const parsedSlot = Number(app.time_slot);
      const windowMin = !isNaN(parsedSlot) && parsedSlot > 0 ? parsedSlot : 60;

      const startTime = new Date(plannedDate.getTime() - windowMin * 60000);
      const endTime = new Date(plannedDate.getTime() + windowMin * 60000);

      let isWithinSlot = false;
      let slotFormatted = "";

      if (isSlotOpen) {
        isWithinSlot = true;
        slotFormatted = "Toute la journée (créneau libre)";
      } else {
        // Envoi à partir de 30 minutes avant le début jusqu'à la fin de la fenêtre
        const reminderStart = new Date(startTime.getTime() - 30 * 60000);
        isWithinSlot = now >= reminderStart && now <= endTime;
        const pad = (n) => String(n).padStart(2, "0");
        slotFormatted = `${pad(startTime.getHours())}:${pad(startTime.getMinutes())} → ${pad(endTime.getHours())}:${pad(endTime.getMinutes())} (± ${windowMin} min)`;
      }

      if (!isWithinSlot) continue;

      // 4. Vérifier si une notification a déjà été envoyée aujourd'hui pour cette mission
      const alreadySent = await db.user_notifications.findFirst({
        where: {
          user_id: app.user_id,
          type: "slotReminderEmail",
          created_at: { gte: startOfToday },
          notification_data: { contains: `"missionId":${app.mission_id}` },
        },
      });

      if (alreadySent) continue;

      // Récupérer le nom du magasin si spécifié
      let storeName = "";
      try {
        if (app.stores) {
          const parsed = JSON.parse(app.stores);
          if (Array.isArray(parsed) && parsed.length > 0) {
            storeName = parsed[0].name || parsed[0].city || "";
          }
        }
      } catch (e) {}

      const dateFormatted = plannedDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // 5. Envoyer l'email
      try {
        const transporter = createTransporter();
        const template = getUserEmailTemplate("slotReminderEmail", {
          userName: app.users.name,
          missionTitle: app.missions.title,
          businessName: app.missions.businessName,
          storeName,
          dateFormatted,
          slotFormatted,
          reward: app.missions.reward,
          actionUrl: `${process.env.FRONTEND_URL || "http://localhost:9002"}/missions/assigned`,
        });

        if (template && process.env.SMTP_USER && process.env.SMTP_PASS) {
          await transporter.sendMail({
            from: `"MissionView" <${process.env.SMTP_USER}>`,
            to: app.users.email,
            subject: template.subject,
            html: template.html,
          });
        }

        // 6. Enregistrer dans user_notifications pour idempotence
        await db.user_notifications.create({
          data: {
            user_id: app.user_id,
            user_email: app.users.email,
            user_name: app.users.name,
            type: "slotReminderEmail",
            notification_data: JSON.stringify({
              missionId: app.mission_id,
              applicationId: app.id,
              storeName,
              slotFormatted,
              dateFormatted,
            }),
          },
        });

        sentCount++;
      } catch (sendErr) {
        console.error(`[SlotReminder] Erreur envoi email à ${app.users.email}:`, sendErr.message);
      }
    }

    return { success: true, count: sentCount, message: `${sentCount} rappel(s) de créneau envoyé(s)` };
  } catch (err) {
    console.error("[SlotReminder] Erreur vérification créneaux:", err.message);
    return { success: false, error: err.message };
  }
};

// Endpoints pour déclencher la vérification des créneaux (avant /:userId pour éviter conflit de routage)
router.all("/check-slot-reminders", async (req, res) => {
  const result = await checkActiveSlotReminders();
  res.json(result);
});

// GET - Récupérer les préférences
router.get("/:userId", auth, (req, res) => {
  const { userId } = req.params;
  const preferences = userPreferences[userId] || {
    newMissionEmail: true,
    deadlineReminderEmail: false,
    reportStatusPush: true,
    slotReminderEmail: true,
  };
  res.json({ preferences });
});

// PUT - Sauvegarder les préférences
router.put("/:userId", auth, (req, res) => {
  const { userId } = req.params;
  const { notifications } = req.body;

  userPreferences[userId] = notifications;

  res.json({
    success: true,
    message: "Préférences sauvegardées",
    preferences: notifications,
  });
});

// POST - Envoyer une notification
/*router.post("/send", async (req, res) => {
  try {
    const { userId, userEmail, userName, type, notificationData } = req.body;

    const preferences = userPreferences[userId] || {
      newMissionEmail: true,
      deadlineReminderEmail: false,
      reportStatusPush: true,
    };

    if (!preferences[type]) {
      return res.json({
        success: false,
        message: "Notification désactivée par l'utilisateur",
      });
    }

    const transporter = createTransporter();
    const template = getUserEmailTemplate(type, {
      ...notificationData,
      userName,
    });

    if (!template) {
      return res.status(400).json({ error: "Type de notification invalide" });
    }

    const info = await transporter.sendMail({
      from: `"MissionView" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    res.json({
      success: true,
      message: "Notification envoyée",
      messageId: info.messageId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});*/

router.post("/send", auth, async (req, res) => {
  try {
    const { userId, userEmail, userName, type, notificationData } = req.body;

    // 1️⃣ User preferences (unchanged)
    const preferences = userPreferences[userId] || {
      newMissionEmail: true,
      deadlineReminderEmail: false,
      reportStatusPush: true,
      slotReminderEmail: true,
    };

    if (!preferences[type]) {
      return res.json({
        success: false,
        message: "Notification désactivée par l'utilisateur",
      });
    }

    // 2️⃣ Send email (unchanged)
    const transporter = createTransporter();
    const template = getUserEmailTemplate(type, {
      ...notificationData,
      userName,
    });

    if (!template) {
      return res.status(400).json({
        error: "Type de notification invalide",
      });
    }

    const info = await transporter.sendMail({
      from: `"MissionView" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    // 3️⃣ INSERT INTO DATABASE (NEW)
    const insertSql = `
      INSERT INTO user_notifications
        (user_id,user_email,user_name, type, notification_data)
      VALUES (?, ?, ?, ?, ?)
    `;

    req.db.query(
      insertSql,
      [userId, userEmail, userName, type, JSON.stringify(notificationData)],
      (dbErr) => {
        if (dbErr) {
          console.error("Erreur insertion notification:", dbErr);
          // ⚠️ Do NOT fail the request if DB insert fails
        }
      },
    );

    // 4️⃣ Response
    res.json({
      success: true,
      message: "Notification envoyée",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Erreur notification:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour vérifier les deadlines et envoyer rappels
router.post("/check-user-deadlines", auth, async (req, res) => {
  try {
    const sql = `
      SELECT 
        m.id as mission_id,
        m.title,
        m.deadline,
        m.assignedTo,
        DATEDIFF(m.deadline, NOW()) as days_left
      FROM missions m 
      WHERE m.deadline <= DATE_ADD(NOW(), INTERVAL 2 DAY)
      AND m.deadline >= NOW()
      AND m.status NOT IN ('completed', 'approved', 'submitted')
      AND m.assignedTo IS NOT NULL
    `;

    req.db.query(sql, async (err, missions) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      let notificationsSent = 0;

      for (const mission of missions) {
        try {
          const assignedUsers = JSON.parse(mission.assignedTo || "[]");

          for (const userId of assignedUsers) {
            const userSql = "SELECT id, name, email FROM users WHERE id = ?";

            const userResult = await new Promise((resolve) => {
              req.db.query(userSql, [userId], (userErr, users) => {
                resolve(!userErr && users.length > 0 ? users[0] : null);
              });
            });

            if (userResult) {
              const preferences = userPreferences[userResult.id] || {
                deadlineReminderEmail: false,
              };

              if (preferences.deadlineReminderEmail) {
                try {
                  const transporter = createTransporter();
                  const template = getUserEmailTemplate(
                    "deadlineReminderEmail",
                    {
                      userName: userResult.name,
                      missionTitle: mission.title,
                      daysLeft: mission.days_left,
                    },
                  );

                  await transporter.sendMail({
                    from: `"MissionView" <${process.env.SMTP_USER}>`,
                    to: userResult.email,
                    subject: template.subject,
                    html: template.html,
                  });

                  notificationsSent++;
                 
                } catch (mailError) {
                  console.error("Erreur envoi email:", mailError.message);
                }
              }
            }
          }
        } catch (missionError) {
          console.error("Erreur traitement mission:", missionError.message);
        }
      }

      res.json({
        success: true,
        message: `${notificationsSent} rappel(s) envoyé(s)`,
        totalMissions: missions.length,
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.checkActiveSlotReminders = checkActiveSlotReminders;
module.exports.getUserEmailTemplate = getUserEmailTemplate;
module.exports.createTransporter = createTransporter;
