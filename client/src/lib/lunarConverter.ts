// @ts-ignore
import { Solar, Lunar } from "lunar-javascript";

/**
 * 國曆轉農曆（前端本地計算，無需網路請求）
 */
export function solarToLunar(year: number, month: number, day: number) {
  try {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    return {
      year: lunar.getYear() as number,
      month: lunar.getMonth() as number,
      day: lunar.getDay() as number,
      isLeapMonth: (lunar.getMonth() as number) < 0,
    };
  } catch {
    return null;
  }
}

/**
 * 農曆轉國曆（前端本地計算，無需網路請求）
 */
export function lunarToSolar(
  year: number,
  month: number,
  day: number,
  isLeapMonth = false
) {
  try {
    const lunarMonth = isLeapMonth ? -Math.abs(month) : month;
    const lunar = Lunar.fromYmd(year, lunarMonth, day);
    const solar = lunar.getSolar();
    return {
      year: solar.getYear() as number,
      month: solar.getMonth() as number,
      day: solar.getDay() as number,
    };
  } catch {
    return null;
  }
}
