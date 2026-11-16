const Joi = require("joi");

const missionsValidation = (mission) => {
  const schema = {
    title: Joi.string().max(255).required(),
    description: Joi.string().required(),
    deadline: Joi.date().required(),
    reward: Joi.number().min(0).required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    category: Joi.string().valid("Restaurant", "Retail", "Service").required(),
    location: Joi.string().max(255).required(),
    status: Joi.string()
      .valid("available", "assigned", "submitted", "approved", "refused")
      .default("available"),
    businessName: Joi.string().max(255).required(),
    assignedTo: Joi.array().items(Joi.string().max(255)).optional(), // Array of user ids
  };

  return Joi.validate(mission, schema);
};

module.exports.missionsValidation = missionsValidation;
