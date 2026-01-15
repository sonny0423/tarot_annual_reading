/**
 * 塔羅靈數計算工具
 * 根據生日計算對應的塔羅牌編號
 */

/**
 * 將數字拆解相加直到成為單一數字或22以下
 * 例如: 1985 -> 1+9+8+5 = 23 -> 2+3 = 5
 */
function reduceToTarotNumber(num: number): number {
  while (num > 22) {
    const digits = num.toString().split('').map(Number);
    num = digits.reduce((sum, digit) => sum + digit, 0);
  }
  return num === 22 ? 4 : num; // 22 特殊處理為 4 (國王)
}

/**
 * 計算生日總和
 */
function calculateBirthSum(year: number, month: number, day: number): number {
  return year + month + day;
}

/**
 * 計算本性牌 (核心靈數)
 * 年 + 月 + 日 的總和化簡
 */
export function calculateCoreCard(year: number, month: number, day: number): number {
  const sum = calculateBirthSum(year, month, day);
  return reduceToTarotNumber(sum);
}

/**
 * 計算外顯牌
 * 月 + 日 的總和化簡
 */
export function calculateOuterCard(month: number, day: number): number {
  const sum = month + day;
  return reduceToTarotNumber(sum);
}

/**
 * 計算內心牌
 * 與外顯牌相同邏輯
 */
export function calculateInnerCard(month: number, day: number): number {
  return calculateOuterCard(month, day);
}

/**
 * 計算貴人牌組
 * 根據本性、外顯、內心牌計算
 */
export function calculateBenefactorCards(
  coreCard: number,
  outerCard: number,
  innerCard: number
): {
  benefactorCore: number;
  benefactorOuter: number;
  benefactorInner: number;
} {
  // 貴人牌計算邏輯：將原牌號加上特定數值後化簡
  const benefactorCore = reduceToTarotNumber(coreCard + 5);
  const benefactorOuter = reduceToTarotNumber(outerCard + 5);
  const benefactorInner = reduceToTarotNumber(innerCard + 5);

  return {
    benefactorCore,
    benefactorOuter,
    benefactorInner,
  };
}

/**
 * 計算流年運勢牌
 * 生日總和 + 當前年份
 */
export function calculateYearCard(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  targetYear: number
): number {
  const birthSum = calculateBirthSum(birthYear, birthMonth, birthDay);
  const yearSum = birthSum + targetYear;
  return reduceToTarotNumber(yearSum);
}

/**
 * 計算流月運勢牌
 * 流年牌 + 目標月份
 */
export function calculateMonthCard(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  targetYear: number,
  targetMonth: number
): number {
  const yearCard = calculateYearCard(birthYear, birthMonth, birthDay, targetYear);
  const monthSum = yearCard + targetYear + targetMonth;
  return reduceToTarotNumber(monthSum);
}

/**
 * 計算流日運勢牌
 * 流月牌 + 目標日期
 */
export function calculateDayCard(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  targetYear: number,
  targetMonth: number,
  targetDay: number
): number {
  const monthCard = calculateMonthCard(
    birthYear,
    birthMonth,
    birthDay,
    targetYear,
    targetMonth
  );
  const daySum = monthCard + targetYear + targetMonth + targetDay;
  return reduceToTarotNumber(daySum);
}

/**
 * 完整計算個人塔羅靈數資訊
 */
export interface TarotReading {
  // 本命牌組
  coreCard: number;
  outerCard: number;
  innerCard: number;
  // 貴人牌組
  benefactorCore: number;
  benefactorOuter: number;
  benefactorInner: number;
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
  const outerCard = calculateOuterCard(birthMonth, birthDay);
  const innerCard = calculateInnerCard(birthMonth, birthDay);

  const benefactors = calculateBenefactorCards(coreCard, outerCard, innerCard);

  const yearCard = calculateYearCard(birthYear, birthMonth, birthDay, year);
  const monthCard = calculateMonthCard(birthYear, birthMonth, birthDay, year, month);
  const dayCard = calculateDayCard(birthYear, birthMonth, birthDay, year, month, day);

  return {
    coreCard,
    outerCard,
    innerCard,
    benefactorCore: benefactors.benefactorCore,
    benefactorOuter: benefactors.benefactorOuter,
    benefactorInner: benefactors.benefactorInner,
    yearCard,
    monthCard,
    dayCard,
  };
}
