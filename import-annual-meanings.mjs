import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { tarotCards } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// 流年牌義資料（已調整用語避免抄襲）
const annualMeanings = [
  {
    id: 0,
    annualUpright: '活力充沛，富有創意，不畏挑戰，勇於嘗試新事物',
    annualReversed: '衝動魯莽，缺乏規劃，內心焦慮，難以集中精神'
  },
  {
    id: 1,
    annualUpright: '訓練創造力，行動力顯著提升',
    annualReversed: '行動不足，無法充分展現能力'
  },
  {
    id: 2,
    annualUpright: '冷靜且具智慧，以直覺做出明智決策',
    annualReversed: '情緒起伏大，做決定時過於感性，缺乏理性思考'
  },
  {
    id: 3,
    annualUpright: '女性魅力綻放，展現溫柔與包容',
    annualReversed: '女性特質被壓抑，無法展現內在的溫柔與關懷'
  },
  {
    id: 4,
    annualUpright: '謹慎規劃，穩定發展，目標明確，有紀律感',
    annualReversed: '努力但缺乏成效，沒有方向感，防備心過重，難以信任他人'
  },
  {
    id: 5,
    annualUpright: '擁抱信念，不忘初心，尋求智慧學習，關懷身心靈成長，藏有深刻領悟',
    annualReversed: '錯誤的觀念影響發展，不受尊重，難以獲得他人認同'
  },
  {
    id: 6,
    annualUpright: '人際關係良好，能夠建立穩固關係，認識新朋友，獲得他人支持，和諧相處',
    annualReversed: '溝通不良，不懂得合作，陷入困境，友誼破裂，失去重要的人際連結'
  },
  {
    id: 7,
    annualUpright: '挑戰與競爭，戰場上的勝利者，充滿鬥志，掌握主導權，展現領導力，獲得肯定與成就感',
    annualReversed: '缺乏戰鬥意志，面對挑戰退縮，遭遇挫折，交通意外風險增加'
  },
  {
    id: 8,
    annualUpright: '決斷力強，以堅定意志面對困難，不輕易放棄，突破障礙，冷靜應對，小心謹慎',
    annualReversed: '缺乏決心，方向錯誤，獨自奮戰感到疲憊'
  },
  {
    id: 9,
    annualUpright: '作息規律，好好休養，開心享受生活，時機到來，一個人的機遇，保持文靜，靜待時機成熟',
    annualReversed: '時機未到，過於急躁'
  },
  {
    id: 10,
    annualUpright: '運氣好轉，一分努力一分收穫，代表公平性',
    annualReversed: '不公平，不被理解，無法獲得應有的回報'
  },
  {
    id: 11,
    annualUpright: '凡事按部就班，機會來臨，維持秩序',
    annualReversed: '不得已，不懂得適時放鬆，機會錯失，維持不變，行動受限'
  },
  {
    id: 12,
    annualUpright: '結束',
    annualReversed: '結束'
  },
  {
    id: 13,
    annualUpright: '整形美容，親情與愛情交流',
    annualReversed: '過度不安，跨越不了，聯繫斷裂'
  },
  {
    id: 14,
    annualUpright: '整合制衡，親情教導，去學習，出去玩，探索新事物，跨越地域，跨國交流',
    annualReversed: '過度不安，跨越不了，聯繫斷裂'
  },
  {
    id: 15,
    annualUpright: '交際娛樂，沉迷玩樂，想要放縱玩樂，也可能是過度執著某事物',
    annualReversed: '徹底放棄，沒有執著於某事物，不再保持聯繫，不再依戀'
  },
  {
    id: 16,
    annualUpright: '意外，生命的結束',
    annualReversed: '稍微好轉，拒絕接受'
  },
  {
    id: 17,
    annualUpright: '自己的夢想，近期完成可能性高，信心滿滿，有希望',
    annualReversed: '自己會有落差，沒有希望'
  },
  {
    id: 18,
    annualUpright: '自己感到不安，但實際沒那麼可怕，謹慎思考，要有勇氣',
    annualReversed: '關係破裂，不是想像中那麼嚴重的情況，冷處理'
  },
  {
    id: 19,
    annualUpright: '光明，開心，大家庭聚會，與朋友相聚，光明前景，有所期盼，看到曙光，有所提升'
  },
  {
    id: 20,
    annualUpright: '有大事情，思考過去的經驗，因過去經驗獲益，有所提升',
    annualReversed: '沒有消息，沒有完成的機會'
  },
  {
    id: 21,
    annualUpright: '圓滿完成，出去玩，一種完美的體驗',
    annualReversed: '中斷滯礙，沒有完成的機會，無法順利進展，無法順利結束'
  }
];

// 更新每張牌卡的流年牌義
for (const meaning of annualMeanings) {
  await db.update(tarotCards)
    .set({
      annualUpright: meaning.annualUpright,
      annualReversed: meaning.annualReversed || null
    })
    .where(eq(tarotCards.id, meaning.id));
  
  console.log(`✓ Updated card ${meaning.id}`);
}

console.log('✓ All annual meanings imported successfully!');
await connection.end();
