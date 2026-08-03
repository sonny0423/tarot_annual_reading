const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: '139.162.119.249',
    port: 32715,
    user: 'root',
    password: 'fb24rBoRP870jZzFG13JDs5euhd9TUx6',
    database: 'zeabur',
    connectTimeout: 15000,
  });

  const [rows] = await conn.execute('SELECT id, name, positive_traits FROM tarot_cards ORDER BY id');
  
  console.log('=== Zeabur tarot_cards verification ===\n');
  for (const row of rows) {
    const preview = row.positive_traits ? row.positive_traits.substring(0, 40) : 'NULL';
    const isDetailed = row.positive_traits && row.positive_traits.length > 20 && row.positive_traits.includes('。');
    console.log(`${isDetailed ? '✓' : '✗'} [${row.id}] ${row.name}: ${preview}...`);
  }
  
  await conn.end();
}

main().catch(err => console.error('Error:', err.message));
