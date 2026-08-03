const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  // Read Manus data
  const cards = JSON.parse(fs.readFileSync('/tmp/manus_cards.json', 'utf8'));
  console.log(`Loaded ${cards.length} cards from Manus DB`);

  // Connect to Zeabur
  const conn = await mysql.createConnection({
    host: '139.162.119.249',
    port: 32715,
    user: 'root',
    password: 'fb24rBoRP870jZzFG13JDs5euhd9TUx6',
    database: 'zeabur',
    connectTimeout: 15000,
  });
  console.log('Connected to Zeabur MySQL!');

  let success = 0;
  let failed = 0;

  for (const card of cards) {
    try {
      const [result] = await conn.execute(
        `UPDATE tarot_cards SET 
          name = ?,
          positive_traits = ?,
          negative_traits = ?,
          meaning = ?,
          upright = ?,
          reversed = ?,
          script_analysis = ?
        WHERE id = ?`,
        [
          card.name,
          card.positive_traits,
          card.negative_traits,
          card.meaning,
          card.upright,
          card.reversed,
          card.script_analysis,
          card.id
        ]
      );
      console.log(`✓ [${card.id}] ${card.name}: affected ${result.affectedRows} row(s)`);
      success++;
    } catch (err) {
      console.error(`✗ [${card.id}] ${card.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);

  // Verify a few
  const [rows] = await conn.execute('SELECT id, name, positive_traits FROM tarot_cards WHERE id IN (0, 5, 10, 21)');
  console.log('\n=== Verification ===');
  for (const row of rows) {
    console.log(`[${row.id}] ${row.name}: ${row.positive_traits ? row.positive_traits.substring(0, 50) : 'NULL'}...`);
  }

  await conn.end();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
