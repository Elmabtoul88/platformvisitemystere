const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

router.get("/count", (req, res) => {
  const connection = req.db;
  const adminId = req.query.admin_id || 2;

  if (!connection) {
    return res.status(500).json({ count: 0, error: "Pas de connexion DB" });
  }

  connection.query(
    "SELECT COUNT(*) as count FROM chat_messages WHERE receiver_id = ? AND is_read = 0",
    [adminId],
    (error, results) => {
      if (error) {
        console.error("Erreur count messages:", error);
        return res.status(500).json({ count: 0, error: error.message });
      }

      res.json({ count: results[0].count });
    },
  );
});

router.get("/count/:adminId", auth, (req, res) => {
  const { adminId } = req.params;
  const connection = req.db;

  if (!connection) {
    return res.status(500).json({ count: 0, error: "Pas de connexion DB" });
  }

  connection.query(
    "SELECT COUNT(*) as count FROM chat_messages WHERE receiver_id = ? AND is_read = 0",
    [adminId],
    (error, results) => {
      if (error) {
        console.error("Erreur count admin:", error);
        return res.status(500).json({ count: 0, error: error.message });
      }

      res.json({ count: results[0].count });
    },
  );
});

router.post("/mark-read/:userId", auth, (req, res) => {
  const { userId } = req.params;
  const adminId = req.body.adminId || 2;
  const connection = req.db;

  if (!connection) {
    return res
      .status(500)
      .json({ success: false, error: "Pas de connexion DB" });
  }

  connection.query(
    "SELECT COUNT(*) as unreadCount FROM chat_messages WHERE sender_id = ? AND receiver_id = ? AND is_read = 0",
    [userId, adminId],
    (error, countResults) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      const unreadCount = countResults[0].unreadCount;

      if (unreadCount === 0) {
        return res.json({ success: true, markedAsRead: 0 });
      }

      connection.query(
        "UPDATE chat_messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0",
        [userId, adminId],
        (updateError, updateResults) => {
          if (updateError) {
            return res
              .status(500)
              .json({ success: false, error: updateError.message });
          }

          res.json({
            success: true,
            markedAsRead: updateResults.affectedRows,
          });
        },
      );
    },
  );
});

module.exports = router;
