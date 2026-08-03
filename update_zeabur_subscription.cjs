const mysql = require('mysql2/promise');

async function main() {
  const password = process.env.ZEABUR_DB_PASSWORD;
  const conn = await mysql.createConnection({
    host: '139.162.119.249',
    port: 32715,
    user: 'root',
    password,
    database: 'zeabur',
  });

  // Check existing columns
  const [cols] = await conn.execute("SHOW COLUMNS FROM users");
  const colNames = cols.map(c => c.Field);
  console.log("Existing columns:", colNames);

  if (!colNames.includes('subscriptionStart')) {
    await conn.execute("ALTER TABLE `users` ADD COLUMN `subscriptionStart` timestamp NULL");
    console.log("✓ subscriptionStart added");
  } else {
    console.log("- subscriptionStart already exists");
  }

  if (!colNames.includes('subscriptionStatus')) {
    await conn.execute("ALTER TABLE `users` ADD COLUMN `subscriptionStatus` enum('active','suspended','expired') NOT NULL DEFAULT 'active'");
    console.log("✓ subscriptionStatus added");
  } else {
    console.log("- subscriptionStatus already exists");
  }

  // Verify
  const [rows] = await conn.execute("DESCRIBE users");
  console.log("Columns:", rows.map(r => r.Field));
  await conn.end();
  console.log("Done!");
}

main().catch(console.error);
