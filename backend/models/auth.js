const Joi = require("joi");

function authvalidation(auth) {
  const shema = {
    email: Joi.string().required().email().max(50),
    password: Joi.string().required().max(1024),
  };

  return Joi.validate(auth, shema);
}

module.exports.authvalidation = authvalidation;
