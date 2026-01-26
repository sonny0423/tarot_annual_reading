import { Solar, Lunar } from 'lunar-javascript';

/**
 * 國曆轉農曆
 */
export function solarToLunar(year: number, month: number, day: number) {
  try {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    
    return {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      isLeapMonth: lunar.getMonth() < 0, // 負數表示閏月
      yearInChinese: lunar.getYearInChinese(),
      monthInChinese: lunar.getMonthInChinese(),
      dayInChinese: lunar.getDayInChinese(),
    };
  } catch (error) {
    console.error('Solar to Lunar conversion error:', error);
    return null;
  }
}

/**
 * 農曆轉國曆
 */
export function lunarToSolar(year: number, month: number, day: number, isLeapMonth: boolean = false) {
  try {
    // 如果是閏月，月份需要設為負數
    const lunarMonth = isLeapMonth ? -Math.abs(month) : month;
    const lunar = Lunar.fromYmd(year, lunarMonth, day);
    const solar = lunar.getSolar();
    
    return {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
    };
  } catch (error) {
    console.error('Lunar to Solar conversion error:', error);
    return null;
  }
}

/**
 * 格式化農曆日期顯示
 */
export function formatLunarDate(year: number, month: number, day: number, isLeapMonth: boolean = false) {
  try {
    const lunarMonth = isLeapMonth ? -Math.abs(month) : month;
    const lunar = Lunar.fromYmd(year, lunarMonth, day);
    
    const yearStr = lunar.getYearInChinese();
    const monthStr = lunar.getMonthInChinese();
    const dayStr = lunar.getDayInChinese();
    
    return `${yearStr}年${isLeapMonth ? '閏' : ''}${monthStr}${dayStr}`;
  } catch (error) {
    console.error('Format lunar date error:', error);
    return '';
  }
}
