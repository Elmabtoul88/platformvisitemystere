const mysql = require("mysql2");
const prisma = require("../prismaClient");
require("dotenv").config();

let numberofconnection = 0;

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.LOCALHOST || "127.0.0.1",
  user: process.env.USER || "root",
  password: process.env.PASSWORD || "",
  database: process.env.DATABASE || "missionview_db",
});

// Middleware to acquire connection and inject Prisma ORM
function createConnection(req, res, next) {
  req.prisma = prisma;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Erreur de pool MySQL:", err.message);
      // Ne pas laisser pendre la requête : req.prisma est toujours disponible
      req.db = null;
      return next();
    }
    req.db = connection;
    numberofconnection++;
    res.on("finish", () => {
      if (connection) {
        connection.release();
      }
    });
    next();
  });
}

function numOfConnection() {
  return numberofconnection;
}

module.exports = {
  createConnection,
  numOfConnection,
};
