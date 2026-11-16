const winston = require("winston");

module.exports = function (err, req, res, next) {
  if (err.message === "File too large")
    return res.status(418).send("Image trop large");
  winston.error(err.message, err);
  
  return res.status(500).send(err.message);
};
