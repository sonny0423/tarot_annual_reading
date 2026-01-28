import json
import requests
import os

# 讀取環境變數
API_URL = os.getenv('BUILT_IN_FORGE_API_URL')
API_KEY = os.getenv('BUILT_IN_FORGE_API_KEY')

# 讀取現有塔羅牌資料
with open('/home/ubuntu/tarot_cards_current.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    cards = data['result']['data']['result']

# 只處理前5張牌作為範例
sample_cards = cards[:5]

prompt = f"""你是一位專業的塔羅牌文案創作者。我需要你重新改寫以下塔羅牌的文案內容，保持塔羅牌的核心意義和精神，但使用完全不同的表達方式，避免抄襲問題。

請為以下5張塔羅牌重新創作文案，每張牌包含5個欄位：
1. **牌意**（meaning）：簡短描述這張牌的核心意義（10-20字）
2. **正面特質**（positiveTraits）：描述這張牌代表的正向性格特質（30-50字）
3. **負面特質**（negativeTraits）：描述這張牌代表的負向性格特質（30-50字）
4. **正位解讀**（annualUpright）：流年運勢的正位解讀（40-60字）
5. **逆位解讀**（annualReversed）：流年運勢的逆位解讀（40-60字）

現有文案（僅供參考核心意義，請完全重新表達）：

{json.dumps(sample_cards, ensure_ascii=False, indent=2)}

請以JSON格式輸出，結構如下：
[
  {{
    "id": 0,
    "name": "愚人",
    "meaning": "新的文案...",
    "positiveTraits": "新的文案...",
    "negativeTraits": "新的文案...",
    "annualUpright": "新的文案...",
    "annualReversed": "新的文案..."
  }},
  ...
]

注意：
- 保持塔羅牌的傳統意義和象徵
- 使用流暢自然的中文表達
- 避免使用原文案的相同詞彙和句式
- 文字要有深度和啟發性
"""

# 調用LLM API
response = requests.post(
    f"{API_URL}/llm/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "messages": [
            {"role": "system", "content": "你是專業的塔羅牌文案創作者，擅長用優美且富有深意的中文表達塔羅牌的意義。"},
            {"role": "user", "content": prompt}
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "tarot_cards_rewrite",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "cards": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "integer"},
                                    "name": {"type": "string"},
                                    "meaning": {"type": "string"},
                                    "positiveTraits": {"type": "string"},
                                    "negativeTraits": {"type": "string"},
                                    "annualUpright": {"type": "string"},
                                    "annualReversed": {"type": "string"}
                                },
                                "required": ["id", "name", "meaning", "positiveTraits", "negativeTraits", "annualUpright", "annualReversed"],
                                "additionalProperties": False
                            }
                        }
                    },
                    "required": ["cards"],
                    "additionalProperties": False
                }
            }
        }
    }
)

if response.status_code == 200:
    result = response.json()
    new_cards = json.loads(result['choices'][0]['message']['content'])
    
    # 輸出結果
    with open('/home/ubuntu/tarot_cards_rewritten_sample.json', 'w', encoding='utf-8') as f:
        json.dump(new_cards, f, ensure_ascii=False, indent=2)
    
    print("成功生成前5張牌的新文案！")
    print(json.dumps(new_cards, ensure_ascii=False, indent=2))
else:
    print(f"API調用失敗: {response.status_code}")
    print(response.text)
