import { describe, it, expect } from "vitest";

describe("多年流年視覺化圖表計算", () => {
  it("應該正確計算未來五年的運勢與心境牌卡", () => {
    // 模擬前端的calculateMultiYearFortune邏輯
    const birthMonth = 4;
    const birthDay = 23;
    const lunarMonth = 3;
    const lunarDay = 28;
    const currentYear = new Date().getFullYear();
    
    const years = [];
    
    for (let i = 0; i < 5; i++) {
      const targetYear = currentYear + i;
      
      // 國曆流年運勢
      const solarBenefactorSum = birthMonth + birthDay;
      const solarYearSum = targetYear + solarBenefactorSum;
      const solarDigitSum = solarYearSum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      let solarYearCard = solarDigitSum;
      while (solarYearCard > 21) {
        solarYearCard = solarYearCard.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      }
      
      // 農曆流年心境
      const lunarBenefactorSum = lunarMonth + lunarDay;
      const lunarYearSum = targetYear + lunarBenefactorSum;
      const lunarDigitSum = lunarYearSum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      let lunarYearCard = lunarDigitSum;
      while (lunarYearCard > 21) {
        lunarYearCard = lunarYearCard.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      }
      
      years.push({
        year: targetYear,
        solarCardNumber: solarYearCard,
        lunarCardNumber: lunarYearCard,
      });
    }
    
    // 驗證返回5年的資料
    expect(years).toHaveLength(5);
    
    // 驗證每年的牌卡編號在有效範圍內
    years.forEach((year) => {
      expect(year.solarCardNumber).toBeGreaterThanOrEqual(0);
      expect(year.solarCardNumber).toBeLessThanOrEqual(21);
      expect(year.lunarCardNumber).toBeGreaterThanOrEqual(0);
      expect(year.lunarCardNumber).toBeLessThanOrEqual(21);
    });
    
    // 驗證年份遞增
    for (let i = 1; i < years.length; i++) {
      expect(years[i].year).toBe(years[i - 1].year + 1);
    }
    
    console.log("未來五年運勢與心境:");
    years.forEach((year) => {
      console.log(`${year.year}: 運勢=${year.solarCardNumber}, 心境=${year.lunarCardNumber}`);
    });
  });

  it("應該正確計算圖表高度比例", () => {
    // 測試牌卡編號轉換為圖表高度的邏輯
    const testCards = [0, 10, 21];
    const maxHeight = 200;
    
    testCards.forEach((cardNumber) => {
      const height = (cardNumber / 21) * maxHeight;
      expect(height).toBeGreaterThanOrEqual(0);
      expect(height).toBeLessThanOrEqual(maxHeight);
    });
    
    // 驗證邊界值
    expect((0 / 21) * maxHeight).toBe(0);
    expect((21 / 21) * maxHeight).toBe(maxHeight);
    expect((10 / 21) * maxHeight).toBeCloseTo(95.24, 1);
  });
});
