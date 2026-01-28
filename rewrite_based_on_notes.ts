import { invokeLLM } from './server/_core/llm';
import fs from 'fs';

const notesContent = fs.readFileSync('/home/ubuntu/tarot_pdf_extracted.txt', 'utf-8');

async function rewriteCards() {
  const prompt = `根據以下塔羅牌筆記內容，為前5張牌（愚人、魔法師、女祭司、女皇、皇帝）重新整理出適合流年運勢查詢系統使用的文案。

每張牌需要包含5個項目：
1. **牌意**：簡潔的核心關鍵字（8-15字），直接使用筆記中的「核心關鍵字」和「核心意義說明」
2. **正面特質**：從筆記的正位「補充」內容提取，描述正向性格特質（30-50字）
3. **負面特質**：從筆記的逆位「補充」內容提取，描述負向性格特質（30-50字）
4. **正位解讀**：針對流年運勢的正位解讀，整合筆記中正位的「結果」、「建議」、「核心意義說明」（40-60字）
5. **逆位解讀**：針對流年運勢的逆位解讀，整合筆記中逆位的「結果」、「建議」、「核心意義說明」（40-60字）

要求：
- 保持筆記的原汁原味和實用風格
- 文字要自然流暢，適合流年運勢解讀
- 避免直接複製筆記原文，需要重新組織語句
- 保持塔羅牌的核心意義不變

筆記內容：
${notesContent}

請以JSON格式輸出，格式如下：
{
  "cards": [
    {
      "id": 0,
      "name": "愚人",
      "meaning": "...",
      "positiveTraits": "...",
      "negativeTraits": "...",
      "annualUpright": "...",
      "annualReversed": "..."
    },
    ...
  ]
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content": "你是專業的塔羅牌文案整理專家，擅長將筆記內容轉化為適合系統使用的文案。" },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "tarot_cards",
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
  fs.writeFileSync('/home/ubuntu/tarot_cards_rewritten_v2.json', JSON.stringify(result, null, 2));
  console.log('文案重新整理完成！');
  console.log(JSON.stringify(result, null, 2));
}

rewriteCards().catch(console.error);
