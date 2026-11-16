const Joi = require("joi");

const surveyQuestionsValidation = (question) => {
  const schema = {
    mission_id: Joi.number().integer().required(),

    type: Joi.string()
      .valid(
        "rating",
        "text",
        "multiple_choice",
        "checkboxes",
        "image_upload",
        "gps_capture",
        "audio_recording"
      )
      .required(),

    text: Joi.string().max(500).required(),

    is_required: Joi.boolean().default(false),

    max_rating: Joi.number().integer().allow(null),

    min_label: Joi.string().max(100).allow(null),

    max_label: Joi.string().max(100).allow(null),

    allow_multiple: Joi.boolean().allow(null),

    max_images: Joi.number().integer().allow(null),

    max_duration_seconds: Joi.number().integer().allow(null),

    options: Joi.string().allow(null), // Store as JSON string or comma-separated if needed
  };

  return Joi.validate(question, schema);
};

module.exports.surveyQuestionsValidation = surveyQuestionsValidation;
