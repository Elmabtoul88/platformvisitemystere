const mysql = require("mysql2/promise");

async function emptyDatabase() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "missionview_db",
  });

  const [tables] = await conn.query("SHOW TABLES");
  const tableNames = tables.map((t) => Object.values(t)[0]);
  console.log("Emptying tables:", tableNames);

  await conn.query("SET FOREIGN_KEY_CHECKS = 0");

  for (const table of tableNames) {
    await conn.query(`TRUNCATE TABLE \`${table}\``);
    console.log(`Truncated: ${table}`);
  }

  await conn.query("SET FOREIGN_KEY_CHECKS = 1");

  console.log("\nVerifying row counts after truncate:");
  let totalRows = 0;
  for (const table of tableNames) {
    const [[{ count }]] = await conn.query(`SELECT COUNT(*) as count FROM \`${table}\``);
    console.log(`- ${table}: ${count} rows`);
    totalRows += count;
  }

  console.log(`\nTotal rows across all tables: ${totalRows}`);
  if (totalRows === 0) {
    console.log("✅ DATABASE IS COMPLETELY EMPTY!");
  } else {
    console.warn("⚠️ Warning: some tables still have rows.");
  }

  await conn.end();
}

emptyDatabase().catch(console.error);
