/**
 * 測試塔羅靈數計算邏輯是否與Excel一致
 */

// 複製計算邏輯進行測試
function sumDigits(num) {
  return num
    .toString()
    .split('')
    .map(Number)
    .reduce((sum, digit) => sum + digit, 0);
}

function reduceToTarotNumber(num) {
  while (num > 21) {
    num = sumDigits(num);
  }
  return num;
}

function processYearLastTwoDigits(year) {
  const yearStr = year.toString();
  const lastTwo = parseInt(yearStr.slice(-2));
  
  if (lastTwo > 21) {
    return sumDigits(lastTwo);
  }
  return lastTwo;
}

function calculateCoreCard(year, month, day) {
  return processYearLastTwoDigits(year);
}

function calculateOuterCard(year, month, day) {
  const sum = year + month + day;
  const digitSum = sumDigits(sum);
  
  if (digitSum > 21) {
    return digitSum - 22;
  }
  return digitSum;
}

function calculateInnerCard(year, month, day) {
  const sum = year + month + day;
  const digitSum = sumDigits(sum);
  
  if (digitSum > 21) {
    return sumDigits(digitSum);
  }
  return digitSum;
}

function calculateBenefactorCard(month, day) {
  const sum = month + day;
  return reduceToTarotNumber(sum);
}

function calculateYearCard(birthMonth, birthDay, targetYear) {
  const benefactorSum = birthMonth + birthDay;
  const yearSum = targetYear + benefactorSum;
  return reduceToTarotNumber(sumDigits(yearSum));
}

function calculateMonthCard(birthYear, birthMonth, birthDay, targetYear, targetMonth) {
  const birthSum = birthYear + birthMonth + birthDay;
  const monthSum = birthSum + targetYear + targetMonth;
  const digitSum = sumDigits(monthSum);
  
  if (digitSum < 22) {
    return digitSum;
  }
  return digitSum - 21;
}

function calculateDayCard(birthYear, birthMonth, birthDay, targetYear, targetMonth, targetDay) {
  const birthSum = birthYear + birthMonth + birthDay;
  const monthSum = birthSum + targetYear + targetMonth;
  const daySum = monthSum + targetDay;
  const digitSum = sumDigits(daySum);
  
  if (digitSum < 22) {
    return digitSum;
  }
  return digitSum - 21;
}

// 測試案例
console.log("=== 塔羅靈數計算測試 ===\n");

// 測試案例1: 1995/6/15
console.log("測試案例1: 1995年6月15日");
console.log("本性:", calculateCoreCard(1995, 6, 15));
console.log("外顯:", calculateOuterCard(1995, 6, 15));
console.log("內心:", calculateInnerCard(1995, 6, 15));
console.log("貴人本性:", calculateBenefactorCard(6, 15));
console.log("貴人外顯:", calculateBenefactorCard(6, 15));
console.log("貴人內心:", calculateBenefactorCard(6, 15));
console.log("流年(2025):", calculateYearCard(6, 15, 2025));
console.log("流月(2025/1):", calculateMonthCard(1995, 6, 15, 2025, 1));
console.log("流日(2025/1/15):", calculateDayCard(1995, 6, 15, 2025, 1, 15));
console.log();

// 測試案例2: 1990/4/23 (Excel範例)
console.log("測試案例2: 1990年4月23日");
console.log("本性:", calculateCoreCard(1990, 4, 23));
console.log("外顯:", calculateOuterCard(1990, 4, 23));
console.log("內心:", calculateInnerCard(1990, 4, 23));
console.log("貴人本性:", calculateBenefactorCard(4, 23));
console.log("貴人外顯:", calculateBenefactorCard(4, 23));
console.log("貴人內心:", calculateBenefactorCard(4, 23));
console.log("流年(2025):", calculateYearCard(4, 23, 2025));
console.log("流月(2025/1):", calculateMonthCard(1990, 4, 23, 2025, 1));
console.log("流日(2025/1/15):", calculateDayCard(1990, 4, 23, 2025, 1, 15));
console.log();

// 測試案例3: 1970/1/1
console.log("測試案例3: 1970年1月1日");
console.log("本性:", calculateCoreCard(1970, 1, 1));
console.log("外顯:", calculateOuterCard(1970, 1, 1));
console.log("內心:", calculateInnerCard(1970, 1, 1));
console.log("貴人:", calculateBenefactorCard(1, 1));
console.log();

// 測試案例4: 2000/12/31
console.log("測試案例4: 2000年12月31日");
console.log("本性:", calculateCoreCard(2000, 12, 31));
console.log("外顯:", calculateOuterCard(2000, 12, 31));
console.log("內心:", calculateInnerCard(2000, 12, 31));
console.log("貴人:", calculateBenefactorCard(12, 31));
console.log();

console.log("=== 測試完成 ===");
