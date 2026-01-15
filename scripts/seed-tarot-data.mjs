import { drizzle } from "drizzle-orm/mysql2";
import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define schema inline to avoid TS import issues
const tarotCards = mysqlTable("tarot_cards", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  positiveTraits: text("positive_traits").notNull(),
  negativeTraits: text("negative_traits").notNull(),
  meaning: text("meaning").notNull(),
  upright: text("upright").notNull(),
  reversed: text("reversed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

async function seedTarotData() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  // 讀取JSON資料
  const traitsData = JSON.parse(
    fs.readFileSync("/home/ubuntu/tarot_traits.json", "utf-8")
  );
  const meaningsData = JSON.parse(
    fs.readFileSync("/home/ubuntu/tarot_meanings.json", "utf-8")
  );

  // 合併資料
  const cardsData = traitsData.map((trait, index) => {
    const meaning = meaningsData[index];
    return {
      id: trait.id,
      name: trait.name,
      positiveTraits: trait.positive_traits,
      negativeTraits: trait.negative_traits,
      meaning: meaning.meaning,
      upright: meaning.upright,
      reversed: meaning.reversed,
    };
  });

  console.log(`準備匯入 ${cardsData.length} 張塔羅牌資料...`);

  // 逐筆插入或更新
  for (const card of cardsData) {
    try {
      await db
        .insert(tarotCards)
        .values(card)
        .onDuplicateKeyUpdate({
          set: {
            name: card.name,
            positiveTraits: card.positiveTraits,
            negativeTraits: card.negativeTraits,
            meaning: card.meaning,
            upright: card.upright,
            reversed: card.reversed,
          },
        });
      console.log(`✓ 匯入: ${card.id}. ${card.name}`);
    } catch (error) {
      console.error(`✗ 匯入失敗: ${card.name}`, error);
    }
  }

  console.log("\n塔羅牌資料匯入完成！");
  process.exit(0);
}

seedTarotData().catch((error) => {
  console.error("匯入過程發生錯誤:", error);
  process.exit(1);
});
