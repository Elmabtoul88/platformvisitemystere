const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function restore() {
  const backupFile = path.join(__dirname, "backup_before_empty.json");
  if (!fs.existsSync(backupFile)) {
    console.error("No backup file found at", backupFile);
    return;
  }

  const backupData = JSON.parse(fs.readFileSync(backupFile, "utf8"));
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "missionview_db",
  });

  await conn.query("SET FOREIGN_KEY_CHECKS = 0");

  for (const [table, rows] of Object.entries(backupData)) {
    await conn.query(`TRUNCATE TABLE \`${table}\``);
    if (rows.length > 0) {
      const keys = Object.keys(rows[0]);
      const columns = keys.map((k) => `\`${k}\``).join(", ");
      const placeholders = keys.map(() => "?").join(", ");
      const sql = `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`;

      for (const row of rows) {
        const values = keys.map((k) => row[k]);
        await conn.query(sql, values);
      }
    }
    console.log(`Restored ${table}: ${rows.length} rows`);
  }

  await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  console.log("\n✅ Database successfully restored!");
  await conn.end();
}

if (require.main === module) {
  restore().catch(console.error);
}

module.exports = { restore };
