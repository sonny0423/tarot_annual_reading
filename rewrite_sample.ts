import { invokeLLM } from './server/_core/llm';
import fs from 'fs';

const cardsData = [
  {
    id: 0,
    name: "愚人",
    current: {
      meaning: "活在當下",
      positiveTraits: "慾厚敦直，誠懇實在，相信人性本善。",
      negativeTraits: "容易相信人，易受騙，粗心大意，沒有心機，不懂算計，不會看人臉色，說話白目。",
      annualUpright: "活在當下，享受生活，無憂無慮，自由自在，不受拘束",
      annualReversed: "過度天真，缺乏計劃，魯莽行事，不切實際"
    }
  },
  {
    id: 1,
    name: "魔術師",
    current: {
      meaning: "創造力、開始",
      positiveTraits: "聰明，靈活，反應快，有創意，有想法，有行動力。",
      negativeTraits: "說謊，欺騙，狡猾，愛現，愛表現，愛吹牛。",
      annualUpright: "展現才華，發揮創意，掌握資源，開創新局，把握機會",
      annualReversed: "缺乏行動，錯失良機，資源不足，計劃受阻"
    }
  },
  {
    id: 2,
    name: "女祭司",
    current: {
      meaning: "智慧、直覺",
      positiveTraits: "有智慧，有內涵，有深度，有氣質，有修養。",
      negativeTraits: "冷漠，孤僻，不合群，不善表達，過度理性。",
      annualUpright: "內在智慧，直覺準確，靜心思考，洞察真相，精神成長",
      annualReversed: "忽視直覺，缺乏洞察，內心混亂，秘密曝光"
    }
  },
  {
    id: 3,
    name: "皇后",
    current: {
      meaning: "豐收、母性",
      positiveTraits: "溫柔，體貼，有愛心，有耐心，有包容心。",
      negativeTraits: "過度保護，溺愛，依賴，缺乏獨立性。",
      annualUpright: "豐盛富足，創造力旺盛，享受生活，關係和諧，孕育新生",
      annualReversed: "創意受阻，缺乏滋養，關係失衡，過度依賴"
    }
  },
  {
    id: 4,
    name: "皇帝",
    current: {
      meaning: "權威、秩序",
      positiveTraits: "有領導力，有責任感，有組織能力，有決斷力。",
      negativeTraits: "專制，固執，控制慾強，缺乏彈性。",
      annualUpright: "建立秩序，掌握權力，理性決策，穩固基礎，承擔責任",
      annualReversed: "失去控制，權威受損，過度僵化，缺乏彈性"
    }
  }
];

async function rewriteCards() {
  const prompt = `你是一位專業的塔羅牌文案創作者。我需要你重新改寫以下5張塔羅牌的文案內容，保持塔羅牌的核心意義和精神，但使用完全不同的表達方式，避免抄襲問題。

請為以下5張塔羅牌重新創作文案，每張牌包含5個欄位：
1. **牌意**（meaning）：簡短描述這張牌的核心意義（10-20字）
2. **正面特質**（positiveTraits）：描述這張牌代表的正向性格特質（30-50字）
3. **負面特質**（negativeTraits）：描述這張牌代表的負向性格特質（30-50字）
4. **正位解讀**（annualUpright）：流年運勢的正位解讀（40-60字）
5. **逆位解讀**（annualReversed）：流年運勢的逆位解讀（40-60字）

現有文案（僅供參考核心意義，請完全重新表達）：
${JSON.stringify(cardsData, null, 2)}

注意：
- 保持塔羅牌的傳統意義和象徵
- 使用流暢自然的中文表達
- 避免使用原文案的相同詞彙和句式
- 文字要有深度和啟發性
- 請直接輸出JSON格式，不要包含任何markdown標記`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "你是專業的塔羅牌文案創作者，擅長用優美且富有深意的中文表達塔羅牌的意義。" },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "tarot_cards_rewrite",
        strict: true,
        schema: {
          type: "object",
          properties: {
            cards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  meaning: { type: "string" },
                  positiveTraits: { type: "string" },
                  negativeTraits: { type: "string" },
                  annualUpright: { type: "string" },
                  annualReversed: { type: "string" }
                },
                required: ["id", "name", "meaning", "positiveTraits", "negativeTraits", "annualUpright", "annualReversed"],
                additionalProperties: false
              }
            }
          },
          required: ["cards"],
          additionalProperties: false
        }
      }
    }
  });

  const result = JSON.parse(response.choices[0].message.content);
  fs.writeFileSync('/home/ubuntu/tarot_cards_sample_rewritten.json', JSON.stringify(result, null, 2));
  console.log('成功生成前5張牌的新文案！');
  console.log(JSON.stringify(result, null, 2));
}

rewriteCards().catch(console.error);
