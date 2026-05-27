/**
 * 塔羅靈數計算工具（前端版）
 * 與 server/tarot-calculator.ts 邏輯完全相同，移至前端本地執行
 */

function sumDigits(num: number): number {
  return num
    .toString()
    .split("")
    .map(Number)
    .reduce((sum, digit) => sum + digit, 0);
}

function reduceToTarotNumber(num: number): number {
  while (num > 21) {
    num = sumDigits(num);
  }
  return num;
}

function processYearLastTwoDigits(year: number): number {
  const yearStr = year.toString();
  const lastTwo = parseInt(yearStr.slice(-2));
  if (lastTwo > 21) {
    return sumDigits(lastTwo);
  }
  return lastTwo;
}

export function calculateCoreCard(year: number, _month: number, _day: number): number {
  return processYearLastTwoDigits(year);
}

export function calculateOuterCard(year: number, month: number, day: number): number {
  const sum = year + month + day;
  const digitSum = sumDigits(sum);
  if (digitSum > 21) {
    return digitSum - 22;
  }
  return digitSum;
}

export function calculateInnerCard(year: number, month: number, day: number): number {
  const sum = year + month + day;
  const digitSum = sumDigits(sum);
  if (digitSum > 21) {
    return sumDigits(digitSum);
  }
  return digitSum;
}

export function calculateBenefactorCoreCard(coreCard: number): number {
  const b = coreCard + 5;
  return b > 22 ? b - 22 : b;
}

export function calculateBenefactorOuterCard(outerCard: number): number {
  const b = outerCard + 5;
  return b > 22 ? b - 22 : b;
}

export function calculateBenefactorInnerCard(innerCard: number): number {
  const b = innerCard + 5;
  return b > 22 ? b - 22 : b;
}

export function calculateYearCard(birthMonth: number, birthDay: number, targetYear: number): number {
  const benefactorSum = birthMonth + birthDay;
  const yearSum = targetYear + benefactorSum;
  return reduceToTarotNumber(sumDigits(yearSum));
}

export function calculateMonthCard(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  targetYear: number,
  targetMonth: number
): number {
  const birthSum = birthYear + birthMonth + birthDay;
  const monthSum = birthSum + targetYear + targetMonth;
  const digitSum = sumDigits(monthSum);
  return reduceToTarotNumber(digitSum);
}

export function calculateDayCard(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  targetYear: number,
  targetMonth: number,
  targetDay: number
): number {
  const birthSum = birthYear + birthMonth + birthDay;
  const monthSum = birthSum + targetYear + targetMonth;
  const daySum = monthSum + targetDay;
  const digitSum = sumDigits(daySum);
  return reduceToTarotNumber(digitSum);
}

export interface TarotReading {
  coreCard: number;
  outerCard: number;
  innerCard: number;
  benefactorCore: number;
  benefactorOuter: number;
  benefactorInner: number;
  yearCard: number;
  monthCard: number;
  dayCard: number;
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
  targetYear: number,
  targetMonth: number,
  targetDay: number
): TarotReading {
  const birthdayThisYear = new Date(targetYear, birthMonth - 1, birthDay);
  const now = new Date(targetYear, targetMonth - 1, targetDay);
  const hasBirthdayPassed = now >= birthdayThisYear;

  const yearForCalculation = hasBirthdayPassed ? targetYear : targetYear - 1;

  const coreCard = calculateCoreCard(birthYear, birthMonth, birthDay);
  const outerCard = calculateOuterCard(birthYear, birthMonth, birthDay);
  const innerCard = calculateInnerCard(birthYear, birthMonth, birthDay);

  const benefactorCore = calculateBenefactorCoreCard(coreCard);
  const benefactorOuter = calculateBenefactorOuterCard(outerCard);
  const benefactorInner = calculateBenefactorInnerCard(innerCard);

  const yearCard = calculateYearCard(birthMonth, birthDay, yearForCalculation);
  const monthCard = calculateMonthCard(birthYear, birthMonth, birthDay, targetYear, targetMonth);
  const dayCard = calculateDayCard(birthYear, birthMonth, birthDay, targetYear, targetMonth, targetDay);

  const lunarYearCard = calculateYearCard(lunarBirthMonth, lunarBirthDay, yearForCalculation);
  const lunarMonthCard = calculateMonthCard(lunarBirthYear, lunarBirthMonth, lunarBirthDay, targetYear, targetMonth);
  const lunarDayCard = calculateDayCard(lunarBirthYear, lunarBirthMonth, lunarBirthDay, targetYear, targetMonth, targetDay);

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

/**
 * 批次計算本月流日（前端版）
 * 需傳入 solarToLunar 函式以避免循環依賴
 */
export function calculateMonthlyDayFortune(
  solarBirthYear: number,
  solarBirthMonth: number,
  solarBirthDay: number,
  lunarBirthYear: number,
  lunarBirthMonth: number,
  lunarBirthDay: number,
  targetYear: number,
  targetMonth: number,
  solarToLunarFn: (y: number, m: number, d: number) => { year: number; month: number; day: number; isLeapMonth: boolean } | null
) {
  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
  const days = [];

  const solarBirthSum = solarBirthYear + solarBirthMonth + solarBirthDay;
  const solarMonthSum = solarBirthSum + targetYear + targetMonth;

  for (let day = 1; day <= daysInMonth; day++) {
    const lunarDate = solarToLunarFn(targetYear, targetMonth, day);
    if (!lunarDate) continue;

    const solarDaySum = solarMonthSum + day;
    let solarDayCard = sumDigits(solarDaySum);
    while (solarDayCard > 21) solarDayCard = sumDigits(solarDayCard);

    const lunarBirthSum = lunarBirthYear + lunarBirthMonth + lunarBirthDay;
    const lunarMonthSum = lunarBirthSum + lunarDate.year + lunarDate.month;
    const lunarDaySum = lunarMonthSum + lunarDate.day;
    let lunarDayCard = sumDigits(lunarDaySum);
    while (lunarDayCard > 21) lunarDayCard = sumDigits(lunarDayCard);

    days.push({
      solarDay: day,
      lunarYear: lunarDate.year,
      lunarMonth: lunarDate.month,
      lunarDay: lunarDate.day,
      isLeapMonth: lunarDate.isLeapMonth,
      solarCardNumber: solarDayCard,
      lunarCardNumber: lunarDayCard,
    });
  }

  return days;
}
