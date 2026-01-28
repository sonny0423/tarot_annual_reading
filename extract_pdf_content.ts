import { invokeLLM } from './server/_core/llm';
import fs from 'fs';

// 將PDF轉換為base64
const pdfPath = '/home/ubuntu/upload/大牌.pdf';
const pdfBuffer = fs.readFileSync(pdfPath);
const pdfBase64 = pdfBuffer.toString('base64');

async function extractPDFContent() {
  const prompt = `請仔細閱讀這份塔羅牌筆記PDF，提取所有22張大阿爾克那牌的資訊。

對於每張牌，請提取以下資訊：
1. 牌名
2. 核心關鍵字（主標題下的關鍵字）
3. 重要元素描述
4. 核心意義說明（粗體文字部分）
5. 正位的結果、現況、過去、建議、補充
6. 逆位的結果、現況、過去、建議、補充

請以JSON格式輸出，每張牌包含完整的資訊。`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "你是專業的塔羅牌資料整理專家，擅長從圖片中提取結構化資訊。" },
      { role: "user", content: [
        { type: "text", text: prompt },
        { type: "file_url", file_url: { url: `data:application/pdf;base64,${pdfBase64}`, mime_type: "application/pdf" } }
      ]}
    ]
  });

  const result = response.choices[0].message.content;
  fs.writeFileSync('/home/ubuntu/tarot_pdf_extracted.txt', result);
  console.log('PDF內容提取完成！');
  console.log(result.substring(0, 1000) + '...');
}

extractPDFContent().catch(console.error);
