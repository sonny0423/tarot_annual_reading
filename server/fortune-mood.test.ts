import { describe, it, expect } from "vitest";
import { calculateFullReading } from "./tarot-calculator";

describe("運勢與心境計算", () => {
  it("應該正確計算國曆流年運勢（運勢）和農曆流年心境（心境）", () => {
    // 測試案例：國曆1990年4月23日，農曆1990年3月28日
    const reading = calculateFullReading(
      1990, 4, 23,  // 國曆生日
      1990, 3, 28,  // 農曆生日
      2026, 1, 26   // 目標日期：2026年1月26日
    );

    // 驗證返回的資料結構完整
    expect(reading).toHaveProperty("coreCard");
    expect(reading).toHaveProperty("outerCard");
    expect(reading).toHaveProperty("innerCard");
    expect(reading).toHaveProperty("benefactorCore");
    expect(reading).toHaveProperty("benefactorOuter");
    expect(reading).toHaveProperty("benefactorInner");
    
    // 驗證國曆流年運勢（運勢）
    expect(reading).toHaveProperty("yearCard");
    expect(reading).toHaveProperty("monthCard");
    expect(reading).toHaveProperty("dayCard");
    
    // 驗證農曆流年心境（心境）
    expect(reading).toHaveProperty("lunarYearCard");
    expect(reading).toHaveProperty("lunarMonthCard");
    expect(reading).toHaveProperty("lunarDayCard");

    // 驗證牌卡編號在有效範圍內（0-21）
    expect(reading.yearCard).toBeGreaterThanOrEqual(0);
    expect(reading.yearCard).toBeLessThanOrEqual(21);
    expect(reading.lunarYearCard).toBeGreaterThanOrEqual(0);
    expect(reading.lunarYearCard).toBeLessThanOrEqual(21);

    // 驗證國曆和農曆的流年牌卡應該不同（因為生日不同）
    expect(reading.yearCard).not.toBe(reading.lunarYearCard);

    console.log("國曆流年運勢（運勢）:", reading.yearCard);
    console.log("農曆流年心境（心境）:", reading.lunarYearCard);
  });

  it("應該正確計算流月和流日的運勢與心境", () => {
    const reading = calculateFullReading(
      1990, 4, 23,  // 國曆生日
      1990, 3, 28,  // 農曆生日
      2026, 1, 26   // 目標日期：2026年1月26日
    );

    // 驗證流月牌卡
    expect(reading.monthCard).toBeGreaterThanOrEqual(0);
    expect(reading.monthCard).toBeLessThanOrEqual(21);
    expect(reading.lunarMonthCard).toBeGreaterThanOrEqual(0);
    expect(reading.lunarMonthCard).toBeLessThanOrEqual(21);

    // 驗證流日牌卡
    expect(reading.dayCard).toBeGreaterThanOrEqual(0);
    expect(reading.dayCard).toBeLessThanOrEqual(21);
    expect(reading.lunarDayCard).toBeGreaterThanOrEqual(0);
    expect(reading.lunarDayCard).toBeLessThanOrEqual(21);

    console.log("國曆流月運勢:", reading.monthCard);
    console.log("農曆流月心境:", reading.lunarMonthCard);
    console.log("國曆流日運勢:", reading.dayCard);
    console.log("農曆流日心境:", reading.lunarDayCard);
  });
});
