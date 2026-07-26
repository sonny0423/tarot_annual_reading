import { drizzle } from "drizzle-orm/mysql2";
import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import fs from "fs";

const tarotCards = mysqlTable("tarot_cards", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  positiveTraits: text("positive_traits").notNull(),
  negativeTraits: text("negative_traits").notNull(),
  meaning: text("meaning").notNull(),
  upright: text("upright").notNull(),
  reversed: text("reversed").notNull(),
  scriptAnalysis: text("script_analysis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

async function exportToSQL() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);
  const cards = await db.select().from(tarotCards);

  console.log(`Found ${cards.length} cards`);

  const escape = (str) => {
    if (str === null || str === undefined) return "NULL";
    return "'" + String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r") + "'";
  };

  let sql = `-- Tarot Cards Seed Data\n-- Generated from Manus DB\n\n`;
  sql += `CREATE TABLE IF NOT EXISTS \`tarot_cards\` (\n`;
  sql += `  \`id\` int NOT NULL,\n`;
  sql += `  \`name\` varchar(50) NOT NULL,\n`;
  sql += `  \`positive_traits\` text NOT NULL,\n`;
  sql += `  \`negative_traits\` text NOT NULL,\n`;
  sql += `  \`meaning\` text NOT NULL,\n`;
  sql += `  \`upright\` text NOT NULL,\n`;
  sql += `  \`reversed\` text NOT NULL,\n`;
  sql += `  \`script_analysis\` text,\n`;
  sql += `  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `  PRIMARY KEY (\`id\`)\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  sql += `INSERT INTO \`tarot_cards\` (\`id\`, \`name\`, \`positive_traits\`, \`negative_traits\`, \`meaning\`, \`upright\`, \`reversed\`, \`script_analysis\`) VALUES\n`;

  const rows = cards.map(card => {
    return `(${card.id}, ${escape(card.name)}, ${escape(card.positiveTraits)}, ${escape(card.negativeTraits)}, ${escape(card.meaning)}, ${escape(card.upright)}, ${escape(card.reversed)}, ${escape(card.scriptAnalysis)})`;
  });

  sql += rows.join(",\n") + "\n";
  sql += `ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`), \`positive_traits\`=VALUES(\`positive_traits\`), \`negative_traits\`=VALUES(\`negative_traits\`), \`meaning\`=VALUES(\`meaning\`), \`upright\`=VALUES(\`upright\`), \`reversed\`=VALUES(\`reversed\`), \`script_analysis\`=VALUES(\`script_analysis\`);\n`;

  fs.writeFileSync("scripts/tarot_cards_seed.sql", sql);
  console.log("Exported to scripts/tarot_cards_seed.sql");
  process.exit(0);
}

exportToSQL().catch(err => {
  console.error(err);
  process.exit(1);
});
