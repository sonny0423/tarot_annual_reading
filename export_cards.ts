import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { tarotCards } from './drizzle/schema';
import fs from 'fs';

async function exportCards() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  const cards = await db.select().from(tarotCards);
  
  fs.writeFileSync('tarot_cards_export.json', JSON.stringify(cards, null, 2));
  console.log('Exported', cards.length, 'cards to tarot_cards_export.json');

  await connection.end();
}

exportCards();
