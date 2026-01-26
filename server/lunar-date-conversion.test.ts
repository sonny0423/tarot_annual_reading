import { describe, it, expect } from 'vitest';
import { solarToLunar } from './lunar-converter';

describe('農曆日期轉換測試', () => {
  it('應該正確將2026/1/1轉換為2025/11/13', () => {
    const result = solarToLunar(2026, 1, 1);
    expect(result).not.toBeNull();
    expect(result?.year).toBe(2025);
    expect(result?.month).toBe(11);
    expect(result?.day).toBe(13);
    expect(result?.isLeapMonth).toBe(false);
  });

  it('應該正確將2026/1/2轉換為2025/11/14', () => {
    const result = solarToLunar(2026, 1, 2);
    expect(result).not.toBeNull();
    expect(result?.year).toBe(2025);
    expect(result?.month).toBe(11);
    expect(result?.day).toBe(14);
    expect(result?.isLeapMonth).toBe(false);
  });

  it('應該正確將2026/1/10轉換為2025/11/22', () => {
    const result = solarToLunar(2026, 1, 10);
    expect(result).not.toBeNull();
    expect(result?.year).toBe(2025);
    expect(result?.month).toBe(11);
    expect(result?.day).toBe(22);
    expect(result?.isLeapMonth).toBe(false);
  });

  it('應該正確處理跨月的情況（2026/1/29 → 2025/12/11）', () => {
    const result = solarToLunar(2026, 1, 29);
    expect(result).not.toBeNull();
    expect(result?.year).toBe(2025);
    expect(result?.month).toBe(12);
    expect(result?.day).toBe(11);
    expect(result?.isLeapMonth).toBe(false);
  });
});
