/**
 * Zeabur 資料庫初始化腳本
 * 執行方式：node scripts/seed-zeabur.mjs
 * 需要設定 DATABASE_URL 環境變數
 */
import { drizzle } from "drizzle-orm/mysql2";
import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

// 塔羅牌資料（從 Manus 資料庫匯出）
const TAROT_DATA = [
  { id: 0, name: "愚者", positiveTraits: "自由、冒險、天真、開放、勇氣、新開始", negativeTraits: "魯莽、不負責任、天真過頭、逃避現實", meaning: "愚者代表新的開始、純真與冒險精神。他象徵著一個即將踏上未知旅程的靈魂，充滿好奇心和對生命的熱情。", upright: "新開始、冒險精神、自由、純真、機遇", reversed: "魯莽、逃避責任、不成熟、冒險過度" },
  { id: 1, name: "魔術師", positiveTraits: "意志力、技巧、創造力、溝通能力、資源整合", negativeTraits: "操縱、欺騙、技巧濫用、自我中心", meaning: "魔術師象徵著將想法化為現實的能力。他掌握四種元素，代表擁有實現目標所需的一切工具和技能。", upright: "意志力、技巧、創造力、溝通、資源整合", reversed: "操縱、欺騙、技巧濫用、缺乏專注" },
  { id: 2, name: "女祭司", positiveTraits: "直覺、智慧、神秘、內省、靈性洞察", negativeTraits: "過度神秘、壓抑情感、與現實脫節", meaning: "女祭司代表直覺、潛意識和神秘知識。她是智慧的守護者，提醒我們傾聽內心深處的聲音。", upright: "直覺、智慧、神秘、內省、靈性", reversed: "壓抑直覺、秘密、與內心脫節" },
  { id: 3, name: "女皇", positiveTraits: "豐盛、創造力、母性、自然、美麗、生育力", negativeTraits: "過度保護、依賴、停滯、物質主義", meaning: "女皇象徵豐盛、創造力和母性的力量。她代表自然的循環、生命的繁榮和感官的享受。", upright: "豐盛、創造力、母性、自然、美麗", reversed: "過度保護、依賴、創造力受阻" },
  { id: 4, name: "皇帝", positiveTraits: "權威、穩定、結構、領導力、保護、秩序", negativeTraits: "獨裁、控制欲、僵化、過於嚴格", meaning: "皇帝代表權威、秩序和父性的力量。他象徵著建立結構、提供穩定和保護的能力。", upright: "權威、穩定、結構、領導力、保護", reversed: "獨裁、控制欲、僵化、缺乏靈活性" },
  { id: 5, name: "教皇", positiveTraits: "傳統、精神指引、智慧、道德、教育", negativeTraits: "教條主義、墨守成規、過於保守", meaning: "教皇代表傳統、精神指引和道德智慧。他是連接神聖與人間的橋樑，提供精神上的指引和教導。", upright: "傳統、精神指引、智慧、道德、教育", reversed: "教條主義、墨守成規、過於保守" },
  { id: 6, name: "戀人", positiveTraits: "愛情、和諧、選擇、關係、價值觀一致", negativeTraits: "優柔寡斷、不忠、價值觀衝突", meaning: "戀人牌代表愛情、關係和重要的選擇。它象徵著心靈的連結、和諧的關係以及基於真實價值觀的決定。", upright: "愛情、和諧、選擇、關係、價值觀", reversed: "優柔寡斷、不忠、關係失衡" },
  { id: 7, name: "戰車", positiveTraits: "意志力、勝利、控制、決心、成功", negativeTraits: "侵略性、缺乏方向、過度控制", meaning: "戰車代表意志力、勝利和對環境的掌控。它象徵著通過堅定的決心和自律來克服障礙。", upright: "意志力、勝利、控制、決心、成功", reversed: "侵略性、缺乏方向、失控" },
  { id: 8, name: "力量", positiveTraits: "內在力量、勇氣、耐心、慈悲、自信", negativeTraits: "懦弱、自我懷疑、過度壓制", meaning: "力量牌代表內在的力量、勇氣和慈悲。它象徵著用溫柔和耐心來馴服內心的野獸，展現真正的力量。", upright: "內在力量、勇氣、耐心、慈悲、自信", reversed: "懦弱、自我懷疑、過度壓制本能" },
  { id: 9, name: "隱士", positiveTraits: "內省、智慧、孤獨、指引、精神探索", negativeTraits: "孤立、退縮、過度內向", meaning: "隱士代表內省、精神探索和智慧的追求。他象徵著退出世俗喧囂，尋找內心的真理和指引。", upright: "內省、智慧、孤獨、指引、精神探索", reversed: "孤立、退縮、拒絕幫助" },
  { id: 10, name: "命運之輪", positiveTraits: "命運、轉機、循環、機遇、好運", negativeTraits: "壞運氣、抗拒變化、命運的玩弄", meaning: "命運之輪代表生命的循環、命運的轉折和機遇的到來。它提醒我們生命在不斷變化，好運與壞運都是暫時的。", upright: "命運、轉機、循環、機遇、好運", reversed: "壞運氣、抗拒變化、命運的挑戰" },
  { id: 11, name: "正義", positiveTraits: "公正、真理、法律、因果、平衡", negativeTraits: "不公正、偏見、逃避責任", meaning: "正義牌代表公正、真理和因果法則。它象徵著客觀的評判、道德的責任和行動的後果。", upright: "公正、真理、法律、因果、平衡", reversed: "不公正、偏見、逃避責任" },
  { id: 12, name: "吊人", positiveTraits: "犧牲、等待、新視角、放下、啟示", negativeTraits: "停滯、無謂犧牲、拖延", meaning: "吊人代表自願的犧牲、等待和從不同角度看待事物。它象徵著通過放下舊有模式來獲得新的洞見。", upright: "犧牲、等待、新視角、放下、啟示", reversed: "停滯、無謂犧牲、拖延" },
  { id: 13, name: "死神", positiveTraits: "轉變、結束與開始、蛻變、放下過去", negativeTraits: "抗拒改變、停滯、恐懼結束", meaning: "死神牌代表轉變、結束和新的開始。它象徵著舊事物的終結為新事物創造空間，是蛻變和重生的象徵。", upright: "轉變、結束與開始、蛻變、放下", reversed: "抗拒改變、停滯、恐懼結束" },
  { id: 14, name: "節制", positiveTraits: "平衡、耐心、調和、中庸、療癒", negativeTraits: "失衡、過度、缺乏耐心", meaning: "節制牌代表平衡、耐心和調和。它象徵著將不同元素融合在一起，找到中道，以及療癒和整合的過程。", upright: "平衡、耐心、調和、中庸、療癒", reversed: "失衡、過度、缺乏耐心" },
  { id: 15, name: "惡魔", positiveTraits: "物質力量、性能量、野心、現實主義", negativeTraits: "束縛、執念、物質主義、上癮", meaning: "惡魔牌代表束縛、執念和物質主義。它象徵著我們被自己的恐懼、慾望或不健康的模式所束縛。", upright: "束縛、執念、物質主義、上癮、野心", reversed: "解放、釋放束縛、重獲自由" },
  { id: 16, name: "高塔", positiveTraits: "突破、啟示、解放、真相揭露", negativeTraits: "混亂、破壞、突然的改變、危機", meaning: "高塔代表突然的改變、破壞和啟示。它象徵著舊有結構的崩塌，雖然痛苦，但往往是必要的轉化。", upright: "突然改變、破壞、啟示、危機", reversed: "避免災難、延遲崩潰、恐懼改變" },
  { id: 17, name: "星星", positiveTraits: "希望、靈感、平靜、更新、信念", negativeTraits: "絕望、失去信念、不切實際", meaning: "星星牌代表希望、靈感和更新。在黑暗之後，星星帶來平靜和信念，象徵著療癒和美好的未來。", upright: "希望、靈感、平靜、更新、信念", reversed: "絕望、失去信念、不切實際" },
  { id: 18, name: "月亮", positiveTraits: "直覺、夢境、潛意識、神秘、幻象", negativeTraits: "恐懼、幻覺、欺騙、混亂", meaning: "月亮牌代表直覺、潛意識和神秘。它象徵著隱藏的真相、夢境的世界以及我們內心深處的恐懼和慾望。", upright: "直覺、夢境、潛意識、神秘", reversed: "恐懼、幻覺、欺騙、混亂" },
  { id: 19, name: "太陽", positiveTraits: "成功、喜悅、活力、清晰、正面能量", negativeTraits: "過度自信、天真、缺乏深度", meaning: "太陽牌代表成功、喜悅和正面能量。它象徵著光明、清晰和生命的活力，帶來幸福和成就感。", upright: "成功、喜悅、活力、清晰、正面能量", reversed: "過度自信、天真、暫時的阻礙" },
  { id: 20, name: "審判", positiveTraits: "更新、覺醒、召喚、反思、轉化", negativeTraits: "自我懷疑、拒絕改變、過去的包袱", meaning: "審判牌代表更新、覺醒和轉化。它象徵著對過去的反思、接受召喚以及在更高層次上的重生。", upright: "更新、覺醒、召喚、反思、轉化", reversed: "自我懷疑、拒絕改變、過去的包袱" },
  { id: 21, name: "世界", positiveTraits: "完成、整合、成就、旅程結束、圓滿", negativeTraits: "未完成、停滯、缺乏閉合", meaning: "世界牌代表完成、整合和成就。它象徵著一個重要旅程的圓滿結束，以及在更高層次上的整合與和諧。", upright: "完成、整合、成就、旅程結束、圓滿", reversed: "未完成、停滯、缺乏閉合" },
];

async function seedZeabur() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL 環境變數未設定");
    process.exit(1);
  }

  console.log("🔗 連接資料庫...");
  const db = drizzle(process.env.DATABASE_URL);

  console.log(`📦 準備匯入 ${TAROT_DATA.length} 張塔羅牌資料...`);

  let success = 0;
  let failed = 0;

  for (const card of TAROT_DATA) {
    try {
      await db
        .insert(tarotCards)
        .values({
          id: card.id,
          name: card.name,
          positiveTraits: card.positiveTraits,
          negativeTraits: card.negativeTraits,
          meaning: card.meaning,
          upright: card.upright,
          reversed: card.reversed,
          scriptAnalysis: null,
        })
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
      console.log(`  ✓ ${card.id}. ${card.name}`);
      success++;
    } catch (error) {
      console.error(`  ✗ 失敗: ${card.name}`, error.message);
      failed++;
    }
  }

  console.log(`\n✅ 完成！成功: ${success}，失敗: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

seedZeabur().catch(err => {
  console.error("❌ 執行錯誤:", err);
  process.exit(1);
});
