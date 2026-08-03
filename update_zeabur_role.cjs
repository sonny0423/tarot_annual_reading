const mysql = require('mysql2/promise');

const ZEABUR_DB = {
  host: '139.162.119.249',
  port: 32715,
  user: 'root',
  password: process.env.ZEABUR_DB_PASSWORD || '',
  database: 'zeabur',
  connectTimeout: 10000,
};

async function main() {
  // Read password from environment or use the one found earlier
  const conn = await mysql.createConnection(ZEABUR_DB);
  
  try {
    console.log('Connected to Zeabur MySQL');
    
    // Check current enum values for role column
    const [cols] = await conn.execute(`
      SELECT COLUMN_TYPE FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'zeabur' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `);
    console.log('Current role column type:', cols[0]?.COLUMN_TYPE);
    
    // Modify the enum to add 'assistant'
    await conn.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('user', 'admin', 'assistant') NOT NULL DEFAULT 'user'
    `);
    console.log('✓ Successfully added assistant role to users table');
    
    // Verify
    const [verCols] = await conn.execute(`
      SELECT COLUMN_TYPE FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'zeabur' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `);
    console.log('Updated role column type:', verCols[0]?.COLUMN_TYPE);
    
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
