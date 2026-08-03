const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  const conn = await mysql.createConnection({
    host: '139.162.119.249',
    port: 32715,
    user: 'root',
    password: 'fb24rBoRP870jZzFG13JDs5euhd9TUx6',
    database: 'zeabur',
    connectTimeout: 15000,
  });

  console.log('Connected to Zeabur MySQL!');

  // Read the SQL file
  const sql = fs.readFileSync('/home/ubuntu/tarot_annual_reading/sync_tarot_cards.sql', 'utf8');
  
  // Split by semicolons and filter empty
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`Executing ${statements.length} UPDATE statements...`);
  
  let success = 0;
  let failed = 0;
  
  for (const stmt of statements) {
    try {
      const [result] = await conn.execute(stmt);
      console.log(`✓ Affected rows: ${result.affectedRows}`);
      success++;
    } catch (err) {
      console.error(`✗ Error: ${err.message}`);
      console.error(`  Statement: ${stmt.substring(0, 100)}...`);
      failed++;
    }
  }
  
  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
  
  // Verify
  const [rows] = await conn.execute('SELECT id, name, positive_traits FROM tarot_cards WHERE id = 9');
  console.log('\nVerify id=9 (隱士):', rows[0].positive_traits.substring(0, 50) + '...');
  
  await conn.end();
}

main().catch(err => {
  console.error('Connection error:', err.message);
  process.exit(1);
});
