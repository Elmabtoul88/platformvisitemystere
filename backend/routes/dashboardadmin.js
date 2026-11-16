const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const prisma = require("../prismaClient");

const MONTHS_QUERY = `
  SELECT 
    m.month_name,
    COALESCE(COUNT(u.id), 0) AS shoppers
  FROM (
    SELECT 1 AS month_num, 'Jan' AS month_name UNION
    SELECT 2, 'Feb' UNION
    SELECT 3, 'Mar' UNION
    SELECT 4, 'Apr' UNION
    SELECT 5, 'May' UNION
    SELECT 6, 'Jun' UNION
    SELECT 7, 'Jul' UNION
    SELECT 8, 'Aug' UNION
    SELECT 9, 'Sep' UNION
    SELECT 10, 'Oct' UNION
    SELECT 11, 'Nov' UNION
    SELECT 12, 'Dec'
  ) AS m
  LEFT JOIN users u
    ON MONTH(u.registration_date) = m.month_num
    AND YEAR(u.registration_date) = YEAR(CURDATE())
    AND u.role = 'shopper'
  GROUP BY m.month_num, m.month_name
  ORDER BY m.month_num;
`;

router.get("/usersMonth", [auth, adminAuth], async (req, res) => {
  try {
    const dbClient = req.prisma || prisma;
    const results = await dbClient.$queryRawUnsafe(MONTHS_QUERY);

    // BigInt serialization safe conversion
    const formatted = results.map((row) => ({
      month_name: row.month_name,
      shoppers: Number(row.shoppers || 0),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error in dashboardadmin/usersMonth with Prisma:", error);
    if (req.db) {
      req.db.query(MONTHS_QUERY, (err, results) => {
        if (!err) return res.status(200).json(results);
        return res.status(500).json({ error: err.message });
      });
      return;
    }
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
