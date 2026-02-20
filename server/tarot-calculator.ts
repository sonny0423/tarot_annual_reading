/**
 * 塔羅靈數計算工具
 * 根據Excel原始公式實作，確保計算邏輯完全一致
 */

/**
 * 將數字的每一位數字相加
 * 例如: 1985 -> 1+9+8+5 = 23
 */
function sumDigits(num: number): number {
  return num
    .toString()
    .split('')
    .map(Number)
    .reduce((sum, digit) => sum + digit, 0);
}

/**
 * 將數字化簡到22以下
 * 如果大於21，將各位數字相加
 */
function reduceToTarotNumber(num: number): number {
  while (num > 21) {
    num = sumDigits(num);
  }
  return num;
}

/**
 * 取年份後兩位數字並處理
 * Excel公式: =IF((MIDB($B$3,3,2)-21)>0,MIDB($B$3,3,1)+MIDB($B$3,4,1),MIDB($B$3,3,2))
 */
function processYearLastTwoDigits(year: number): number {
  const yearStr = year.toString();
  const lastTwo = parseInt(yearStr.slice(-2));
  
  if (lastTwo > 21) {
    // 拆開相加
    return sumDigits(lastTwo);
  }
  return lastTwo;
}

/**
 * 計算本性牌 (核心靈數)
 * Excel: E3 = 取年份後兩位數字處理
 */
export function calculateCoreCard(year: number, month: number, day: number): number {
  return processYearLastTwoDigits(year);
}

/**
 * 計算外顯牌
 * Excel: C5 = SUM(B3:B5) = 年+月+日
 *        E5 = IF($C$6>21,$C$6-22,$C$6)
 * 但實際上E5是根據C6計算的，C6是C5各位數字相加
 */
export function calculateOuterCard(year: number, month: number, day: number): number {
  // C5 = 年 + 月 + 日
  const sum = year + month + day;
  
  // C6 = 將C5的每一位數字相加
  const digitSum = sumDigits(sum);
  
  // E5 = IF($C$6>21,$C$6-22,$C$6)
  if (digitSum > 21) {
    return digitSum - 22;
  }
  return digitSum;
}

/**
 * 計算內心牌
 * Excel: C6 = MIDB($C$5,1,1)+MIDB($C$5,2,1)+MIDB($C$5,3,1)+MIDB($C$5,4,1)
 *        E6 = IF($C$6>21,MIDB($C$6,2,1)+MIDB($C$6,1,1),$C$6)
 */
export function calculateInnerCard(year: number, month: number, day: number): number {
  // C5 = 年 + 月 + 日
  const sum = year + month + day;
  
  // C6 = 將C5的每一位數字相加
  const digitSum = sumDigits(sum);
  
  // E6 = IF($C$6>21,MIDB($C$6,2,1)+MIDB($C$6,1,1),$C$6)
  if (digitSum > 21) {
    // 拆開相加
    return sumDigits(digitSum);
  }
  return digitSum;
}

/**
 * 計算貴人本性牌
 * 貴人本性 = 本性牌 + 5
 */
export function calculateBenefactorCoreCard(coreCard: number): number {
  const benefactor = coreCard + 5;
  // 如果超過22，折返到1-22的範圍
  return benefactor > 22 ? benefactor - 22 : benefactor;
}

/**
 * 計算貴人外顯牌
 * 貴人外顯 = 外顯牌 + 5
 */
export function calculateBenefactorOuterCard(outerCard: number): number {
  const benefactor = outerCard + 5;
  return benefactor > 22 ? benefactor - 22 : benefactor;
}

/**
 * 計算貴人內心牌
 * 貴人內心 = 內心牌 + 5
 */
export function calculateBenefactorInnerCard(innerCard: number): number {
  const benefactor = innerCard + 5;
  return benefactor > 22 ? benefactor - 22 : benefactor;
}

/**
 * 計算流年運勢牌
 * Excel: D9 = B9 + B6 (當年 + 貴人數)
 *        E9 = MIDB($D9,1,1)+MIDB($D9,2,1)+MIDB($D9,3,1)+MIDB($D9,4,1)
 */
export function calculateYearCard(
  birthMonth: number,
  birthDay: number,
  targetYear: number
): number {
  // B6 = 月 + 日
  const benefactorSum = birthMonth + birthDay;
  
  // D9 = 當年 + B6
  const yearSum = targetYear + benefactorSum;
  
  // E9 = 將D9各位數字相加後化簡
  return reduceToTarotNumber(sumDigits(yearSum));
}

/**
 * 計算流月運勢牌
 * Excel: D11 = C5 + B9 + B11 (生日總和 + 當年 + 當月)
 *        E11 = IF(D10<22,D10,D10-21)
 *        D10 = MIDB($D11,1,1)+MIDB($D11,2,1)+MIDB($D11,3,1)+MIDB($D11,4,1)
 */
export function calculateMonthCard(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  targetYear: number,
  targetMonth: number
): number {
  // C5 = 年 + 月 + 日
  const birthSum = birthYear + birthMonth + birthDay;
  
  // D11 = C5 + 當年 + 當月
  const monthSum = birthSum + targetYear + targetMonth;
  
  // D10 = 將D11各位數字相加
  const digitSum = sumDigits(monthSum);
  
  // E11 = 化簡到<=21
  return reduceToTarotNumber(digitSum);
}

/**
 * 計算流日運勢牌
 * Excel: D13 = D11 + B13 (流月 + 當日)
 *        E13 = IF(D12<22,D12,D12-21)
 *        D12 = MIDB($D13,1,1)+MIDB($D13,2,1)+MIDB($D13,3,1)+MIDB($D13,4,1)
 */
export function calculateDayCard(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  targetYear: number,
  targetMonth: number,
  targetDay: number
): number {
  // 先計算D11
  const birthSum = birthYear + birthMonth + birthDay;
  const monthSum = birthSum + targetYear + targetMonth;
  
  // D13 = D11 + 當日
  const daySum = monthSum + targetDay;
  
  // D12 = 將D13各位數字相加
  const digitSum = sumDigits(daySum);
  
  // E13 = 化簡到<=21
  const result = reduceToTarotNumber(digitSum);
  
  // 調試輸出
  console.log(`[calculateDayCard] birthYear=${birthYear}, birthMonth=${birthMonth}, birthDay=${birthDay}`);
  console.log(`[calculateDayCard] targetYear=${targetYear}, targetMonth=${targetMonth}, targetDay=${targetDay}`);
  console.log(`[calculateDayCard] birthSum=${birthSum}, monthSum=${monthSum}, daySum=${daySum}`);
  console.log(`[calculateDayCard] digitSum=${digitSum}, result=${result}`);
  
  return result;
}

/**
 * 完整計算個人塔羅靈數資訊
 */
export interface TarotReading {
  // 本命牌組
  coreCard: number;
  outerCard: number;
  innerCard: number;
  // 貴人牌組（本命牌+5）
  benefactorCore: number;
  benefactorOuter: number;
  benefactorInner: number;
  // 流年運勢（國曆）
  yearCard: number;
  monthCard: number;
  dayCard: number;
  // 流年心境（農曆）
  lunarYearCard: number;
  lunarMonthCard: number;
  lunarDayCard: number;
}

export function calculateFullReading(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  lunarBirthYear: number,
  lunarBirthMonth: number,
  lunarBirthDay: number,
  targetYear?: number,
  targetMonth?: number,
  targetDay?: number
): TarotReading {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  
  // 判斷生日是否已過（用於流年計算）
  const birthdayThisYear = new Date(currentYear, birthMonth - 1, birthDay);
  const hasBirthdayPassed = now >= birthdayThisYear;
  
  // 流年計算：生日未過用去年，生日已過用今年
  // 如果有指定targetYear，則使用指定的年份
  const yearForCalculation = targetYear ?? (hasBirthdayPassed ? currentYear : currentYear - 1);
  
  const year = yearForCalculation;
  const month = targetMonth ?? currentMonth;
  const day = targetDay ?? currentDay;

  const coreCard = calculateCoreCard(birthYear, birthMonth, birthDay);
  const outerCard = calculateOuterCard(birthYear, birthMonth, birthDay);
  const innerCard = calculateInnerCard(birthYear, birthMonth, birthDay);

  const benefactorCore = calculateBenefactorCoreCard(coreCard);
  const benefactorOuter = calculateBenefactorOuterCard(outerCard);
  const benefactorInner = calculateBenefactorInnerCard(innerCard);

  // 國曆流年運勢（使用判斷後的年份）
  const yearCard = calculateYearCard(birthMonth, birthDay, year);
  
  // 流月使用當前的年月，不受生日判斷影響
  const monthCard = calculateMonthCard(birthYear, birthMonth, birthDay, currentYear, currentMonth);
  
  // 流日直接使用當前日期計算，不需要判斷生日是否已過
  const dayCard = calculateDayCard(birthYear, birthMonth, birthDay, currentYear, currentMonth, currentDay);

  // 農曆流年心境也直接使用當前年份或指定年份
  const lunarYearCard = calculateYearCard(lunarBirthMonth, lunarBirthDay, yearForCalculation);
  
  // 農曆流月和流日也使用當前的年月日
  const lunarMonthCard = calculateMonthCard(lunarBirthYear, lunarBirthMonth, lunarBirthDay, currentYear, currentMonth);
  const lunarDayCard = calculateDayCard(lunarBirthYear, lunarBirthMonth, lunarBirthDay, currentYear, currentMonth, currentDay);

  return {
    coreCard,
    outerCard,
    innerCard,
    benefactorCore,
    benefactorOuter,
    benefactorInner,
    yearCard,
    monthCard,
    dayCard,
    lunarYearCard,
    lunarMonthCard,
    lunarDayCard,
  };
}
