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
 * Excel: B6 = SUM(B4:B5) = 月+日
 * 然後同樣的數字拆分邏輯
 */
export function calculateBenefactorCoreCard(month: number, day: number): number {
  const sum = month + day;
  return reduceToTarotNumber(sum);
}

/**
 * 計算貴人牌（簡化版）
 * 貴人只有一張牌，與calculateBenefactorCoreCard相同
 */
export function calculateBenefactorCard(month: number, day: number): number {
  return calculateBenefactorCoreCard(month, day);
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
  
  // E11 = IF(D10<22,D10,D10-21)
  if (digitSum < 22) {
    return digitSum;
  }
  return digitSum - 21;
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
  
  // E13 = IF(D12<22,D12,D12-21)
  if (digitSum < 22) {
    return digitSum;
  }
  return digitSum - 21;
}

/**
 * 完整計算個人塔羅靈數資訊
 */
export interface TarotReading {
  // 本命牌組
  coreCard: number;
  outerCard: number;
  innerCard: number;
  // 貴人牌（只有一張）
  benefactorCore: number;
  // 流年運勢
  yearCard: number;
  monthCard: number;
  dayCard: number;
}

export function calculateFullReading(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  targetYear?: number,
  targetMonth?: number,
  targetDay?: number
): TarotReading {
  const now = new Date();
  const year = targetYear ?? now.getFullYear();
  const month = targetMonth ?? now.getMonth() + 1;
  const day = targetDay ?? now.getDate();

  const coreCard = calculateCoreCard(birthYear, birthMonth, birthDay);
  const outerCard = calculateOuterCard(birthYear, birthMonth, birthDay);
  const innerCard = calculateInnerCard(birthYear, birthMonth, birthDay);

  const benefactorCore = calculateBenefactorCoreCard(birthMonth, birthDay);

  const yearCard = calculateYearCard(birthMonth, birthDay, year);
  const monthCard = calculateMonthCard(birthYear, birthMonth, birthDay, year, month);
  const dayCard = calculateDayCard(birthYear, birthMonth, birthDay, year, month, day);

  return {
    coreCard,
    outerCard,
    innerCard,
    benefactorCore,
    yearCard,
    monthCard,
    dayCard,
  };
}
