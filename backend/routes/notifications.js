const express = require("express");
const { createTransporter } = require("../services/mailer");
const router = express.Router();
const base_url = require("../services/baseUrl");
const { auth } = require("../middleware/auth");

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
        const error = await notificationResponse.json();
        console.error(` Erreur envoi notification ${type}:`, error);
      }
    }
  } catch (error) {
    console.error(` Erreur système notification ${type}:`, error.message);
  }
};

// createTransporter est importé depuis ../services/mailer

const getEmailTemplate = (type, userData = {}) => {
  const baseStyle = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  `;

  const endStyle = `
      </div>
      <div style="text-align: center; margin-top: 20px; padding: 15px;">
        <p style="color: #6c757d; font-size: 12px; margin: 0;">
          📧 Email automatique envoyé le ${new Date().toLocaleString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p style="color: #6c757d; font-size: 11px; margin: 5px 0 0 0;">
          Système de notification - Application MissionView
        </p>
      </div>
    </div>
  `;

  switch (type) {
    case "newUserSignup":
      return {
        subject: "🔔 Nouvelle inscription MissionView",
        html:
          baseStyle +
          `
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #007bff; margin: 0; font-size: 28px;">🎉 Nouvelle Inscription !</h1>
          </div>
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 5px solid #2196f3;">
            <h2 style="color: #1976d2; margin: 0 0 15px 0; font-size: 20px;">Nouveau  Shopper</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">👤 Nom :</td><td style="padding: 8px 0; color: #555;">${
                userData.name || "Jean Dupont (Test)"
              }</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">📧 Email :</td><td style="padding: 8px 0; color: #555;">${
                userData.email || "jean.test@example.com"
              }</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">📅 Inscription :</td><td style="padding: 8px 0; color: #555;">${new Date().toLocaleDateString(
                "fr-FR",
              )}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">⏰ Heure :</td><td style="padding: 8px 0; color: #555;">${new Date().toLocaleTimeString(
                "fr-FR",
              )}</td></tr>
            </table>
          </div>
          <div style="margin: 25px 0; text-align: center;">
            <a href="#" style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              🔍 Voir le Profil dans l'Admin
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; margin: 20px 0;">
            <strong>Action requise :</strong> Ce nouveau shopper attend votre validation dans le tableau de bord administrateur. 
            Pensez à vérifier son profil et à lui assigner des missions appropriées.
          </p>
        ` +
          endStyle,
      };

    case "reportSubmitted":
      return {
        subject: "📋 Nouveau rapport de mission à réviser",
        html:
          baseStyle +
          `
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #28a745; margin: 0; font-size: 28px;">📋 Rapport Soumis !</h1>
          </div>
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 5px solid #28a745;">
            <h2 style="color: #155724; margin: 0 0 15px 0; font-size: 20px;">Nouvelle Soumission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">🎯 Mission :</td><td style="padding: 8px 0; color: #555;">${
                userData.missionTitle || 'Évaluation Restaurant "Le Bon Goût"'
              }</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">👤 Shopper :</td><td style="padding: 8px 0; color: #555;">${
                userData.shopperName || "Marie Martin (Test)"
              }</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">📅 Soumis le :</td><td style="padding: 8px 0; color: #555;">${new Date().toLocaleDateString(
                "fr-FR",
              )}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">⏰ À :</td><td style="padding: 8px 0; color: #555;">${new Date().toLocaleTimeString(
                "fr-FR",
              )}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">📊 Statut :</td><td style="padding: 8px 0; color: #f57c00; font-weight: bold;">⏳ En attente de révision</td></tr>
            </table>
          </div>
          <div style="margin: 25px 0; text-align: center;">
            <a href="#" style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              📖 Réviser le Rapport
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; margin: 20px 0;">
            <strong>⚡ Action immédiate requise :</strong> Un nouveau rapport de mission a été soumis et attend votre révision. 
            Veuillez l'examiner dans les plus brefs délais pour maintenir la qualité du service.
          </p>
        ` +
          endStyle,
      };

    case "missionExpiringSoon":
      return {
        subject: "⚠️ URGENT - Mission arrivant à expiration",
        html:
          baseStyle.replace("white", "#fff5f5") +
          `
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #dc3545; margin: 0; font-size: 28px;">⚠️ ALERTE URGENTE !</h1>
          </div>
          <div style="background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 5px solid #dc3545;">
            <h2 style="color: #721c24; margin: 0 0 15px 0; font-size: 20px;">Mission Expirante</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">🎯 Mission :</td><td style="padding: 8px 0; color: #555;">${
                userData.title || 'Visite Magasin "Super Market"'
              }</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">👤 Shopper assigné :</td><td style="padding: 8px 0; color: #555;">${
                userData.assignedShopper || "Pierre Dubois (Test)"
              }</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">📅 Date limite :</td><td style="padding: 8px 0; color: #555;">${
                userData.deadline
                  ? new Date(userData.deadline).toLocaleDateString("fr-FR")
                  : new Date(
                      Date.now() + 2 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString("fr-FR")
              }</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">⏰ Temps restant :</td><td style="padding: 8px 0; color: #dc3545; font-weight: bold; font-size: 16px;">🚨 ${
                userData.daysLeft || 2
              } jour(s) seulement !</td></tr>
            </table>
          </div>
          <div style="margin: 25px 0; text-align: center;">
            <a href="#" style="background: #dc3545; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              🚨 Gérer cette Mission
            </a>
          </div>
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin: 0 0 10px 0;">🛠️ Actions possibles :</h3>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>📞 Contacter immédiatement le shopper assigné</li>
              <li>📅 Prolonger la date limite de la mission</li>
              <li>🔄 Réassigner la mission à un autre shopper disponible</li>
              <li>❌ Annuler la mission si nécessaire</li>
            </ul>
          </div>
        ` +
          endStyle,
      };

    default:
      return {
        subject: "🧪 Test de configuration email - MissionView",
        html:
          baseStyle +
          `
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #007bff; margin: 0; font-size: 28px;">🧪 Test Réussi !</h1>
          </div>
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; text-center;">
            <h2 style="color: #1976d2; margin: 0 0 15px 0;">✅ Configuration Email Fonctionnelle</h2>
            <p style="color: #555; font-size: 16px; margin: 15px 0;">
              Si vous recevez cet email, votre système de notifications fonctionne parfaitement !
            </p>
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0; color: #333;"><strong>🖥️ Serveur SMTP :</strong> Gmail</p>
              <p style="margin: 5px 0; color: #333;"><strong>📧 Backend :</strong> Node.js + Express</p>
              <p style="margin: 5px 0; color: #333;"><strong>⚡ Frontend :</strong> React + Next.js</p>
            </div>
          </div>
          <p style="color: #666; text-align: center; margin: 20px 0; font-style: italic;">
            🎉 Votre système de notifications de MissionView est opérationnel !
          </p>
        ` +
          endStyle,
      };
  }
};

let adminSettings = {
  newUserSignup: true,
  reportSubmitted: true,
  missionExpiringSoon: true,
  email: process.env.ADMIN_EMAIL || "admin@example.com",
};

router.get("/", auth, async (req, res) => {
  try {
    res.json(adminSettings);
  } catch (error) {
    console.error("❌ Erreur récupération paramètres:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération" });
  }
});

router.put("/", auth, async (req, res) => {
  try {
    const { notificationSettings } = req.body;
    if (!notificationSettings) {
      return res
        .status(400)
        .json({ error: "Paramètres de notification manquants" });
    }
    const oldSettings = { ...adminSettings };
    adminSettings = { ...adminSettings, ...notificationSettings };
    res.json({
      message: "Paramètres sauvegardés avec succès",
      settings: adminSettings,
      changes: notificationSettings,
    });
  } catch (error) {
    console.error("❌ Erreur sauvegarde:", error);
    res.status(500).json({ error: "Erreur serveur lors de la sauvegarde" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { type, userData } = req.body;

    if (
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.ADMIN_EMAIL
    ) {
      return res.status(500).json({
        error: "Configuration email manquante",
        details:
          "Vérifiez SMTP_USER, SMTP_PASS et ADMIN_EMAIL dans votre fichier .env",
      });
    }

    if (type && !adminSettings[type]) {
      return res.status(400).json({
        error: `La notification "${type}" est actuellement désactivée`,
        suggestion:
          "Activez cette notification dans les paramètres avant de tester",
      });
    }

    const transporter = createTransporter();
    await transporter.verify();

    const template = getEmailTemplate(type, userData);
    if (!template) {
      return res.status(400).json({ error: "Type de notification invalide" });
    }

    const info = await transporter.sendMail({
      from: `"🔔 MissionView Admin" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: template.subject,
      html: template.html,
    });

    res.json({
      success: true,
      message: "Email de test envoyé avec succès",
      messageId: info.messageId,
      recipient: process.env.ADMIN_EMAIL,
      type: type,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    let errorMessage = "Erreur inconnue lors de l'envoi";
    let suggestions = [];

    if (error.code === "EAUTH") {
      errorMessage = "Authentification Gmail échouée";
      suggestions = [
        "Vérifiez que vous avez généré un mot de passe d'application Gmail",
        "Assurez-vous que la 2FA est activée sur votre compte Google",
        "Vérifiez la variable SMTP_PASS dans votre fichier .env",
      ];
    } else if (error.code === "ECONNECTION" || error.code === "ENOTFOUND") {
      errorMessage = "Impossible de se connecter au serveur Gmail";
      suggestions = [
        "Vérifiez votre connexion internet",
        "Assurez-vous que le port 587 n'est pas bloqué",
        "Essayez de redémarrer votre application",
      ];
    } else if (error.message.includes("Invalid login")) {
      errorMessage = "Email ou mot de passe incorrect";
      suggestions = [
        "Vérifiez la variable SMTP_USER dans votre .env",
        "Régénérez un nouveau mot de passe d'application Gmail",
      ];
    } else if (error.code === "EMESSAGE") {
      errorMessage = "Erreur dans le contenu de l'email";
      suggestions = ["Vérifiez le template HTML de l'email"];
    }

    res.status(500).json({
      error: errorMessage,
      details: error.message,
      code: error.code,
      suggestions: suggestions,
      timestamp: new Date().toISOString(),
    });
  }
});

router.get("/test-connection", auth, async (req, res) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        connected: false,
        error: "Variables d'environnement manquantes",
      });
    }

    const transporter = createTransporter();
    await transporter.verify();

    res.json({
      connected: true,
      message: "Connexion SMTP fonctionnelle",
      server: `${process.env.MAIL_HOST || "mail.privateemail.com"}:${process.env.MAIL_PORT || 465}`,
      user: process.env.SMTP_USER,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message,
      code: error.code,
    });
  }
});

router.post("/test-expiring-real", auth, async (req, res) => {
  try {
    const sql = `
      SELECT 
        m.id,
        m.title,
        m.businessName,
        m.deadline,
        m.assignedTo,
        m.status,
        DATEDIFF(m.deadline, NOW()) as days_left
      FROM missions m 
      WHERE m.deadline <= DATE_ADD(NOW(), INTERVAL 3 DAY)
      AND m.deadline >= NOW()
      AND m.status NOT IN ('completed', 'approved')
      ORDER BY m.deadline ASC
    `;

    req.db.query(sql, async (err, missions) => {
      if (err) {
        return res.status(500).json({ error: "Erreur base de données" });
      }

      if (missions.length === 0) {
        return res.json({
          success: false,
          message:
            "Aucune mission expirante trouvée dans les 3 prochains jours",
          suggestion:
            "Créez une mission avec deadline proche ou modifiez une deadline existante",
        });
      }

      const mission = missions[0];
      const notificationData = {
        title: mission.title || `Mission #${mission.id}`,
        businessName: mission.businessName || "",
        assignedShopper: "Shopper assigné",
        deadline: mission.deadline,
        daysLeft: mission.days_left,
        missionId: mission.id,
      };

      await sendNotificationIfEnabled("missionExpiringSoon", notificationData);

      res.json({
        success: true,
        message: "Notification envoyée pour mission réelle",
        mission: {
          id: mission.id,
          title: mission.title,
          deadline: mission.deadline,
          daysLeft: mission.days_left,
          businessName: mission.businessName,
        },
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/expiring-missions", auth, (req, res) => {
  const sql = `
    SELECT 
      m.id,
      m.title,
      m.businessName,
      m.deadline,
      m.status,
      DATEDIFF(m.deadline, NOW()) as days_left,
      DATE_FORMAT(m.deadline, '%d/%m/%Y %H:%i') as deadline_formatted
    FROM missions m 
    WHERE m.deadline >= NOW()
    ORDER BY m.deadline ASC
    LIMIT 10
  `;

  req.db.query(sql, (err, missions) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json({
      total: missions.length,
      missions: missions,
    });
  });
});

router.post("/check-expiring-missions", auth, async (req, res) => {
  try {
    const sendNotification = async (notificationData) => {
      try {
        const fetch = require("node-fetch");
        const settingsResponse = await fetch(base_url + "/api/notifications");
        if (!settingsResponse.ok) return false;
        const settings = await settingsResponse.json();

        if (!settings.missionExpiringSoon) return false;

        const notificationResponse = await fetch(
          base_url + "/api/notifications",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "missionExpiringSoon",
              userData: notificationData,
            }),
          },
        );

        if (notificationResponse.ok) {
          const result = await notificationResponse.json();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    };

    const sql = `
      SELECT 
        m.id,
        m.title,
        m.businessName,
        m.deadline,
        m.assignedTo,
        DATEDIFF(m.deadline, NOW()) as days_left
      FROM missions m 
      WHERE m.deadline <= DATE_ADD(NOW(), INTERVAL 2 DAY)
      AND m.deadline >= NOW()
      AND m.status NOT IN ('completed', 'approved')
    `;

    req.db.query(sql, async (err, missions) => {
      if (err) {
        return res.status(500).json({ error: err });
      }

      let notificationsSent = 0;

      for (const mission of missions) {
        try {
          const success = await sendNotification({
            title: mission.title || `Mission #${mission.id}`,
            businessName: mission.businessName || "",
            assignedShopper: "Shopper assigné",
            deadline: mission.deadline,
            daysLeft: mission.days_left,
            missionId: mission.id,
          });
          if (success) notificationsSent++;
        } catch {}
      }

      res.json({
        success: true,
        message: `Vérification terminée: ${notificationsSent} notification(s) envoyée(s)`,
        totalMissions: missions.length,
        notificationsSent: notificationsSent,
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
