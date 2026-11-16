/**
 * Middleware de protection contre les attaques par force brute (Rate Limiting)
 * Emberton Group - Sécurité des accès Login & Auth
 * 
 * Limite le nombre de tentatives de connexion infructueuses par adresse IP
 * Compatible avec les environnements cPanel / Proxies inverses (x-forwarded-for).
 */

const loginAttempts = new Map();

// Configuration par défaut : 10 tentatives max par fenêtre de 15 minutes
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

// Nettoyage régulier des entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.firstAttempt > WINDOW_MS) {
      loginAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

function getClientIp(req) {
  if (!req) return "127.0.0.1";
  const forwarded = req.headers && req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "127.0.0.1";
}

/**
 * Middleware vérifiant si l'IP n'a pas dépassé le quota de tentatives
 */
function authRateLimiter(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    return next();
  }

  // Vérifier si la fenêtre de 15 minutes est écoulée
  if (now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return next();
  }

  // Si le nombre d'échecs dépasse le seuil autorisé
  if (record.count >= MAX_ATTEMPTS) {
    const remainingTimeMs = WINDOW_MS - (now - record.firstAttempt);
    const remainingMinutes = Math.ceil(remainingTimeMs / (60 * 1000));

    res.set("Retry-After", String(Math.ceil(remainingTimeMs / 1000)));
    res.set("X-RateLimit-Limit", String(MAX_ATTEMPTS));
    res.set("X-RateLimit-Remaining", "0");
    res.set("X-RateLimit-Reset", String(Math.ceil((record.firstAttempt + WINDOW_MS) / 1000)));

    console.warn(`🔒 [RateLimiter] Blocage de l'adresse IP ${ip} : ${record.count} échecs.`);

    return res.status(429).json({
      success: false,
      status: 429,
      error: "Trop de tentatives de connexion.",
      message: `Trop de tentatives de connexion infructueuses. Pour votre sécurité, veuillez patienter ${remainingMinutes} minute(s) avant de réessayer.`,
      retryAfterMinutes: remainingMinutes,
    });
  }

  next();
}

/**
 * Enregistre un échec de connexion pour l'IP
 */
function recordFailedAttempt(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, {
      count: 1,
      firstAttempt: now,
    });
  } else {
    record.count += 1;
  }
}

/**
 * Réinitialise le compteur d'échecs après une connexion réussie
 */
function resetLoginAttempts(req) {
  const ip = getClientIp(req);
  loginAttempts.delete(ip);
}

module.exports = {
  authRateLimiter,
  recordFailedAttempt,
  resetLoginAttempts,
};
