/**
 * 塔羅靈數計算工具。
 * 核心公式僅在伺服器執行；前端只接收需要呈現的計算結果。
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
  const lastTwo = parseInt(year.toString().slice(-2), 10);
  return lastTwo > 21 ? sumDigits(lastTwo) : lastTwo;
}

/**
 * 靈魂換日線僅在流年、流月、流日的總和縮減前套用。
 */
function applyShiftAndReduce(sum: number, soulShift: number): number {
  return reduceToTarotNumber(sumDigits(sum + soulShift));
}

export function calculateCoreCard(year: number, _month: number, _day: number): number {
  return processYearLastTwoDigits(year);
}

export function calculateOuterCard(year: number, month: number, day: number): number {
  const digitSum = sumDigits(year + month + day);
  return digitSum > 21 ? digitSum - 22 : digitSum;
}

export function calculateInnerCard(year: number, month: number, day: number): number {
  const digitSum = sumDigits(year + month + day);
  return digitSum > 21 ? sumDigits(digitSum) : digitSum;
}

export function calculateBenefactorCoreCard(coreCard: number): number {
  const result = coreCard + 5;
  return result > 22 ? result - 22 : result;
}

export function calculateBenefactorOuterCard(outerCard: number): number {
  const result = outerCard + 5;
  return result > 22 ? result - 22 : result;
}

export function calculateBenefactorInnerCard(innerCard: number): number {
  const result = innerCard + 5;
  return result > 22 ? result - 22 : result;
}

export function calculateYearCard(
  birthMonth: number,
  birthDay: number,
  targetYear: number,
  soulShift = 0,
): number {
  const total = targetYear + birthMonth + birthDay;
  return soulShift === 0
    ? reduceToTarotNumber(sumDigits(total))
    : applyShiftAndReduce(total, soulShift);
}

export function calculateMonthCard(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  targetYear: number,
  targetMonth: number,
  soulShift = 0,
): number {
  const total = birthYear + birthMonth + birthDay + targetYear + targetMonth;
  return soulShift === 0
    ? reduceToTarotNumber(sumDigits(total))
    : applyShiftAndReduce(total, soulShift);
}

export function calculateDayCard(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  targetYear: number,
  targetMonth: number,
  targetDay: number,
  soulShift = 0,
): number {
  const total = birthYear + birthMonth + birthDay + targetYear + targetMonth + targetDay;
  return soulShift === 0
    ? reduceToTarotNumber(sumDigits(total))
    : applyShiftAndReduce(total, soulShift);
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
  targetDay: number,
  soulShift = 0,
): TarotReading {
  const birthdayThisYear = new Date(targetYear, birthMonth - 1, birthDay);
  const targetDate = new Date(targetYear, targetMonth - 1, targetDay);
  const yearForCalculation = targetDate >= birthdayThisYear ? targetYear : targetYear - 1;

  // 本命牌組與貴人牌組不套用靈魂換日線。
  const coreCard = calculateCoreCard(birthYear, birthMonth, birthDay);
  const outerCard = calculateOuterCard(birthYear, birthMonth, birthDay);
  const innerCard = calculateInnerCard(birthYear, birthMonth, birthDay);

  return {
    coreCard,
    outerCard,
    innerCard,
    benefactorCore: calculateBenefactorCoreCard(coreCard),
    benefactorOuter: calculateBenefactorOuterCard(outerCard),
    benefactorInner: calculateBenefactorInnerCard(innerCard),
    yearCard: calculateYearCard(birthMonth, birthDay, yearForCalculation, soulShift),
    monthCard: calculateMonthCard(birthYear, birthMonth, birthDay, targetYear, targetMonth, soulShift),
    dayCard: calculateDayCard(birthYear, birthMonth, birthDay, targetYear, targetMonth, targetDay, soulShift),
    lunarYearCard: calculateYearCard(lunarBirthMonth, lunarBirthDay, yearForCalculation, soulShift),
    lunarMonthCard: calculateMonthCard(lunarBirthYear, lunarBirthMonth, lunarBirthDay, targetYear, targetMonth, soulShift),
    lunarDayCard: calculateDayCard(lunarBirthYear, lunarBirthMonth, lunarBirthDay, targetYear, targetMonth, targetDay, soulShift),
  };
}

export function calculateMonthlyDayFortune(
  solarBirthYear: number,
  solarBirthMonth: number,
  solarBirthDay: number,
  lunarBirthYear: number,
  lunarBirthMonth: number,
  lunarBirthDay: number,
  targetYear: number,
  targetMonth: number,
  solarToLunarFn: (year: number, month: number, day: number) => {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  } | null,
  soulShift = 0,
) {
  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
  const days = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const lunarDate = solarToLunarFn(targetYear, targetMonth, day);
    if (!lunarDate) continue;

    days.push({
      solarDay: day,
      lunarYear: lunarDate.year,
      lunarMonth: lunarDate.month,
      lunarDay: lunarDate.day,
      isLeapMonth: lunarDate.isLeapMonth,
      solarCardNumber: calculateDayCard(
        solarBirthYear,
        solarBirthMonth,
        solarBirthDay,
        targetYear,
        targetMonth,
        day,
        soulShift,
      ),
      lunarCardNumber: calculateDayCard(
        lunarBirthYear,
        lunarBirthMonth,
        lunarBirthDay,
        targetYear,
        targetMonth,
        day,
        soulShift,
      ),
    });
  }

  return days;
}
