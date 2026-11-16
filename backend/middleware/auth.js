const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

function extractToken(req) {
  const header = req.header("x-auth-token") || req.header("authorization");
  if (!header) return null;
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return header.trim();
}

function auth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentification requise. Aucun jeton fourni." });
    }
    console.log("Token extrait:", token);
    const decoded = jwt.verify(token, process.env.PRIVATEKEY || "secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Jeton non autorisé ou expiré." });
  }
}

function adminAuth(req, res, next) {
  try {
    if (req.user && req.user.role) {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({
            message: "Accès refusé : privilèges administrateur requis.",
          });
      }
      return next();
    }

    const token = extractToken(req);
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentification requise. Aucun jeton fourni." });
    }

    const decoded = jwt.verify(token, process.env.PRIVATEKEY || "secret");
    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Accès refusé : privilèges administrateur requis." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Jeton non autorisé ou session expirée." });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    try {
      if (req.user && req.user.role) {
        if (!roles.includes(req.user.role)) {
          return res
            .status(403)
            .json({ message: "Accès interdit pour ce rôle." });
        }
        return next();
      }

      const token = extractToken(req);
      if (!token) {
        return res.status(401).json({ message: "Authentification requise." });
      }

      const decoded = jwt.verify(token, process.env.PRIVATEKEY || "secret");
      if (!roles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ message: "Accès interdit pour ce rôle." });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Jeton invalide ou expiré." });
    }
  };
}

module.exports = {
  auth,
  adminAuth,
  requireRole,
  extractToken,
};
