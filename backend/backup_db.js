const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function backup() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "missionview_db",
  });

  const [tables] = await conn.query("SHOW TABLES");
  const tableNames = tables.map((t) => Object.values(t)[0]);
  console.log("Found tables:", tableNames);

  const backupData = {};
  for (const table of tableNames) {
    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    backupData[table] = rows;
    console.log(`Backed up ${table}: ${rows.length} rows`);
  }

  const backupFile = path.join(__dirname, "backup_before_empty.json");
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), "utf8");
  console.log(`\n✅ Backup successfully saved to: ${backupFile}`);

  await conn.end();
}

backup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
