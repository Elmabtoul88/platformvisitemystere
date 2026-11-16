const nodemailer = require("nodemailer");

/**
 * Créer un transporteur Nodemailer configuré selon les variables d'environnement.
 * Compatible avec PrivateEmail (mail.privateemail.com), Gmail, ou tout autre serveur SMTP.
 */
function getTransporter() {
  let rawHost = process.env.MAIL_HOST || "mail.privateemail.com";
  // Nettoyer les éventuels préfixes parasites tels que '://', 'smtp://', etc.
  let host = rawHost.replace(/^[a-zA-Z]*:?\/\//, "").trim();
  if (!host || host === "privateemail.com") {
    host = "mail.privateemail.com";
  }

  const port = parseInt(process.env.MAIL_PORT, 10) || 465;
  const secure = port === 465;

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function getSender(label = "Emberton Group") {
  const email = process.env.SMTP_USER || "contact@embertongroup.com";
  return `"${label}" <${email}>`;
}

module.exports = {
  getTransporter,
  createTransporter: getTransporter,
  getSender,
};
