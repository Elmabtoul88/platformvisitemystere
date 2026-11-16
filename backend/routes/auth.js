const express = require("express");
const { authvalidation } = require("../models/auth");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { generateAuthToken } = require("../models/users");
const { auth } = require("../middleware/auth");
const { authRateLimiter, recordFailedAttempt, resetLoginAttempts } = require("../middleware/rateLimiter");
const prisma = require("../prismaClient");
const { getTransporter, getSender } = require("../services/mailer");

// =========================================================================
// 1. CONNEXION UTILISATEUR (AVEC RATE LIMITING ANTI-BRUTE-FORCE)
// =========================================================================
router.post("/", authRateLimiter, async (req, res) => {
  const { error } = authvalidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      recordFailedAttempt(req);
      return res.status(404).json({
        message: "Compte non trouvé. Veuillez vous inscrire.",
        status: 404,
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        message: "Votre compte est inactif. Veuillez contacter le support.",
        status: 403,
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      recordFailedAttempt(req);
      return res.status(400).json({
        message: "Email ou mot de passe incorrect.",
        status: 400,
      });
    }

    // Réinitialiser le compteur d'échecs après connexion valide
    resetLoginAttempts(req);

    const token = await generateAuthToken(user);

    return res.status(200).json({
      token,
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicUrl: user.profile_pic_url,
        completedMissions: user.completed_missions_count,
        city: user.city,
        birthYear: user.birth_year,
        gender: user.gender,
        cvUrl: user.cv_url,
        motivation: user.motivation,
      },
    });
  } catch (err) {
    console.error("Erreur lors de l'authentification:", err);
    return res.status(500).json({ message: "Erreur serveur interne." });
  }
});

// =========================================================================
// 2. CHANGER LE MOT DE PASSE (UTILISATEUR CONNECTÉ)
// =========================================================================
router.put("/change-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "Veuillez renseigner votre mot de passe actuel et le nouveau.",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "Le nouveau mot de passe doit comporter au moins 6 caractères.",
    });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérifier l'ancien mot de passe
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return res.status(400).json({
        message: "Le mot de passe actuel renseigné est incorrect.",
      });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: "Votre mot de passe a été modifié avec succès.",
    });
  } catch (err) {
    console.error("Erreur changement de mot de passe:", err);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
  }
});

// =========================================================================
// 3. MOT DE PASSE OUBLIÉ (ENVOI D'UN EMAIL DE RÉINITIALISATION)
// =========================================================================
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ message: "Veuillez renseigner votre adresse email." });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = await prisma.users.findUnique({
      where: { email: cleanEmail },
    });

    // Pour des raisons de sécurité, ne pas divulguer si l'email existe ou non
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "Si un compte est associé à cette adresse, un email de réinitialisation vous a été envoyé.",
      });
    }

    // Jeton signé sécurisé unique : invalidé automatiquement dès que le mot de passe change
    const resetSecret = (process.env.PRIVATEKEY || "secret") + user.password;
    const token = jwt.sign(
      { id: user.id, email: user.email, type: "password_reset" },
      resetSecret,
      { expiresIn: "30m" },
    );

    // Déterminer l'URL du frontend
    const reqOrigin = req.get("origin") || req.get("referer");
    let clientAppUrl = "http://localhost:9002";
    if (reqOrigin) {
      try {
        const parsed = new URL(reqOrigin);
        clientAppUrl = `${parsed.protocol}//${parsed.host}`;
      } catch (e) {}
    }

    const resetLink = `${clientAppUrl}/reset-password?token=${encodeURIComponent(token)}&id=${user.id}`;

    // Modèle d'email moderne aux couleurs de la marque (Navy & Gold)
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Réinitialisation de mot de passe</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="580" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(4, 31, 64, 0.08); border: 1px solid rgba(4, 31, 64, 0.06);">
                <!-- En-tête Navy & Gold -->
                <tr>
                  <td style="background-color: #041F40; padding: 36px 30px; text-align: center;">
                    <div style="display: inline-block; padding: 10px 18px; border-radius: 12px; background-color: rgba(214, 199, 153, 0.15); border: 1px solid rgba(214, 199, 153, 0.3); margin-bottom: 12px;">
                      <span style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">
                        MISSION <span style="color: #D6C799; font-weight: 400;">VIEW</span>
                      </span>
                    </div>
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 10px 0 0; letter-spacing: -0.5px;">
                      Réinitialisation de votre mot de passe
                    </h1>
                  </td>
                </tr>

                <!-- Corps de l'email -->
                <tr>
                  <td style="padding: 36px 32px; color: #041F40;">
                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px; font-weight: 600;">
                      Bonjour ${user.name || "partenaire"},
                    </p>
                    <p style="font-size: 14px; line-height: 1.6; color: #4a5568; margin: 0 0 24px;">
                      Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte <strong>MissionView</strong>. Cliquez sur le bouton ci-dessous pour choisir votre nouveau mot de passe :
                    </p>

                    <!-- Bouton CTA -->
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${resetLink}" target="_blank" style="background-color: #041F40; color: #D6C799; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 12px; display: inline-block; box-shadow: 0 6px 16px rgba(4, 31, 64, 0.25); border: 1px solid #D6C799;">
                        Réinitialiser mon mot de passe
                      </a>
                    </div>

                    <!-- Lien alternatif en texte -->
                    <div style="background-color: #f8fafc; border-radius: 10px; padding: 14px; border: 1px dashed #cbd5e1; margin-bottom: 24px;">
                      <p style="font-size: 12px; color: #64748b; margin: 0 0 6px;">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
                      <a href="${resetLink}" style="font-size: 12px; color: #2563eb; word-break: break-all; text-decoration: underline;">${resetLink}</a>
                    </div>

                    <!-- Note d'expiration et sécurité -->
                    <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0 0 8px; border-top: 1px solid #f1f5f9; padding-top: 18px;">
                      ⏱️ Ce lien est valable pendant <strong>30 minutes</strong> et ne peut être utilisé qu'une seule fois.
                    </p>
                    <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0;">
                      🔒 Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                    © ${new Date().getFullYear()} MissionView. Plateforme de Visites Mystères et Audits Qualité.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Envoi via nodemailer si configuré
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: getSender("Emberton Group - Support"),
        to: user.email,
        subject: "🔒 Réinitialisation de votre mot de passe - Emberton Group",
        html: emailHtml,
      });
    } else {
      console.warn("⚠️ SMTP_USER ou SMTP_PASS non configuré. Lien généré:", resetLink);
    }

    return res.status(200).json({
      success: true,
      message: "Un email contenant le lien de réinitialisation vous a été envoyé.",
    });
  } catch (err) {
    console.error("Erreur demande mot de passe oublié:", err);
    return res.status(500).json({ message: "Erreur serveur lors de la demande." });
  }
});

// =========================================================================
// 4. VÉRIFICATION DE LA VALIDITÉ DU JETON DE RÉINITIALISATION
// =========================================================================
router.post("/verify-reset-token", async (req, res) => {
  const id = req.body.id || req.body.userId;
  const token = req.body.token;

  if (!id || !token) {
    return res.status(400).json({ valid: false, message: "Paramètres manquants." });
  }

  const userId = parseInt(id);
  if (isNaN(userId)) {
    return res.status(400).json({ valid: false, message: "ID invalide." });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ valid: false, message: "Compte introuvable." });
    }

    // Le secret dépend de l'ancien mot de passe : si le mot de passe a déjà changé,
    // le token devient automatiquement invalide
    const resetSecret = (process.env.PRIVATEKEY || "secret") + user.password;
    const decoded = jwt.verify(token, resetSecret);

    if (decoded.id !== user.id || decoded.type !== "password_reset") {
      return res.status(400).json({ valid: false, message: "Jeton non conforme." });
    }

    return res.status(200).json({
      valid: true,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    return res.status(400).json({
      valid: false,
      message: "Ce lien de réinitialisation a expiré ou a déjà été utilisé.",
    });
  }
});

// =========================================================================
// 5. VALIDATION DU NOUVEAU MOT DE PASSE (RÉINITIALISATION EFFECTIVE)
// =========================================================================
router.post("/reset-password", async (req, res) => {
  const id = req.body.id || req.body.userId;
  const token = req.body.token;
  const newPassword = req.body.newPassword;

  if (!id || !token || !newPassword) {
    return res.status(400).json({ message: "Données de réinitialisation incomplètes." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "Le nouveau mot de passe doit comporter au moins 6 caractères.",
    });
  }

  const userId = parseInt(id);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "ID utilisateur invalide." });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Vérification du token avec le mot de passe actuel comme sel
    const resetSecret = (process.env.PRIVATEKEY || "secret") + user.password;
    try {
      const decoded = jwt.verify(token, resetSecret);
      if (decoded.id !== user.id || decoded.type !== "password_reset") {
        return res.status(400).json({ message: "Jeton de réinitialisation invalide." });
      }
    } catch (e) {
      return res.status(400).json({
        message: "Ce lien de réinitialisation a expiré ou a déjà été utilisé.",
      });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour en base de données
    await prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
    });
  } catch (err) {
    console.error("Erreur reset-password:", err);
    return res.status(500).json({ message: "Erreur serveur lors de la réinitialisation." });
  }
});

module.exports = router;
