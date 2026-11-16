const Joi = require("joi");
const jwt = require("jsonwebtoken");

const utilisateurValidation = (user) => {
  const schema = Joi.object({
    name: Joi.string().max(255).required(),
    email: Joi.string().email().max(255).required(),
    telephone: Joi.string().max(25).allow(null, "").optional(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("shopper", "admin", "client").optional().default("shopper"),
    status: Joi.string().valid("active", "inactive").optional().default("active"),
    registration_date: Joi.date().optional().default(Date.now, "current date"),
    profile_pic_url: Joi.string().max(255).allow(null, "").optional(),
    city: Joi.string().max(255).allow(null, "").optional(),
    motivation: Joi.string().allow(null, "").optional(),
    cv_url: Joi.string().max(255).allow(null, "").optional(),
    birth_year: Joi.number().integer().allow(null).optional(),
    gender: Joi.string()
      .valid("female", "male", "other", "prefer_not_say")
      .optional()
      .default("prefer_not_say"),
    completed_missions_count: Joi.number().integer().optional().default(0),
  });

  return schema.validate(user);
};

function getSafeJwtPayload(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function generateNewUserToken(user) {
  return new Promise((resolve, reject) => {
    const payload = getSafeJwtPayload(user);
    const token = jwt.sign(payload, process.env.PRIVATEKEY, { expiresIn: "4h" });
    if (token) return resolve(token);
    reject(new Error("Token not generated"));
  });
}

function generateAuthToken(user) {
  return new Promise((resolve, reject) => {
    const payload = getSafeJwtPayload(user);
    const token = jwt.sign(payload, process.env.PRIVATEKEY, { expiresIn: "7d" });
    if (token) return resolve(token);
    reject(new Error("Token not generated"));
  });
}

module.exports.utilisateurValidation = utilisateurValidation;
module.exports.generateAuthToken = generateAuthToken;
module.exports.generateNewUserToken = generateNewUserToken;
