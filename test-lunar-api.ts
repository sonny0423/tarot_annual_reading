import { solarToLunar, lunarToSolar } from './server/lunar-converter';

console.log('Testing Solar to Lunar conversion:');
console.log('Input: 1981年4月23日 (國曆)');
const result = solarToLunar(1981, 4, 23);
console.log('Output:', result);
console.log('');

console.log('Expected: 1981年3月19日 (農曆)');
console.log('Actual year:', result?.year);
console.log('Actual month:', result?.month);
console.log('Actual day:', result?.day);
console.log('Year in Chinese:', result?.yearInChinese);
console.log('Month in Chinese:', result?.monthInChinese);
console.log('Day in Chinese:', result?.dayInChinese);
console.log('Is leap month:', result?.isLeapMonth);
