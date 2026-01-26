import { describe, expect, it } from "vitest";
import {
  calculateCoreCard,
  calculateOuterCard,
  calculateInnerCard,
  calculateBenefactorCoreCard,
  calculateBenefactorOuterCard,
  calculateBenefactorInnerCard,
  calculateYearCard,
  calculateMonthCard,
  calculateDayCard,
  calculateFullReading,
} from "./tarot-calculator";

describe("Tarot Calculator", () => {
  describe("calculateCoreCard", () => {
    it("should calculate core card from birth year", () => {
      // 1981 -> 81 -> 8+1 = 9
      expect(calculateCoreCard(1981, 4, 23)).toBe(9);
    });

    it("should handle year > 21", () => {
      // 1995 -> 95 -> 9+5 = 14
      expect(calculateCoreCard(1995, 6, 15)).toBe(14);
    });
  });

  describe("calculateOuterCard", () => {
    it("should calculate outer card from sum of year, month, day", () => {
      // 1981+4+23 = 2008 -> 2+0+0+8 = 10
      expect(calculateOuterCard(1981, 4, 23)).toBe(10);
    });
  });

  describe("calculateInnerCard", () => {
    it("should calculate inner card from outer card digits", () => {
      // outer = 10 -> 1+0 = 1, but if 1 <= 21, check if > 21 first
      // For 1981/4/23: outer=10, inner should be 10 (since 10<=21)
      const outer = calculateOuterCard(1981, 4, 23);
      const inner = calculateInnerCard(1981, 4, 23);
      expect(inner).toBe(10);
    });

    it("should handle when outer and inner are the same", () => {
      // When outer <= 21, inner = outer
      const outer = calculateOuterCard(1981, 4, 23);
      const inner = calculateInnerCard(1981, 4, 23);
      expect(inner).toBe(outer);
    });
  });

  describe("calculateBenefactorCoreCard", () => {
    it("should calculate benefactor core card as coreCard + 5", () => {
      // 本性牌 9 + 5 = 14
      expect(calculateBenefactorCoreCard(9)).toBe(14);
    });

    it("should wrap around when exceeding 22", () => {
      // 本性牌 20 + 5 = 25 -> 25 - 22 = 3
      expect(calculateBenefactorCoreCard(20)).toBe(3);
    });

    it("should handle edge case at 22", () => {
      // 本性牌 22 + 5 = 27 -> 27 - 22 = 5
      expect(calculateBenefactorCoreCard(22)).toBe(5);
    });
  });

  describe("calculateBenefactorOuterCard", () => {
    it("should calculate benefactor outer card as outerCard + 5", () => {
      // 外顯牌 10 + 5 = 15
      expect(calculateBenefactorOuterCard(10)).toBe(15);
    });

    it("should wrap around when exceeding 22", () => {
      // 外顯牌 19 + 5 = 24 -> 24 - 22 = 2
      expect(calculateBenefactorOuterCard(19)).toBe(2);
    });
  });

  describe("calculateBenefactorInnerCard", () => {
    it("should calculate benefactor inner card as innerCard + 5", () => {
      // 內心牌 10 + 5 = 15
      expect(calculateBenefactorInnerCard(10)).toBe(15);
    });

    it("should wrap around when exceeding 22", () => {
      // 內心牌 18 + 5 = 23 -> 23 - 22 = 1
      expect(calculateBenefactorInnerCard(18)).toBe(1);
    });
  });

  describe("calculateYearCard", () => {
    it("should calculate year card correctly", () => {
      // 4 + 23 = 27, 2025 + 27 = 2052 -> 2+0+5+2 = 9
      const result = calculateYearCard(4, 23, 2025);
      expect(result).toBe(9);
    });
  });

  describe("calculateMonthCard", () => {
    it("should calculate month card correctly", () => {
      // sum(1981,4,23) = 2008, 2025 + 1 + 2008 = 4034 -> 4+0+3+4 = 11
      const result = calculateMonthCard(1981, 4, 23, 2025, 1);
      expect(result).toBe(11);
    });
  });

  describe("calculateDayCard", () => {
    it("should calculate day card correctly", () => {
      const result = calculateDayCard(1981, 4, 23, 2025, 1, 15);
      // This depends on monthCard + day
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(22);
    });
  });

  describe("calculateFullReading", () => {
    it("should return complete reading with all cards", () => {
      const reading = calculateFullReading(1981, 4, 23);
      
      expect(reading.coreCard).toBe(9);
      expect(reading.outerCard).toBe(10);
      expect(reading.innerCard).toBe(10);
      expect(reading.benefactorCore).toBe(14); // 9 + 5
      expect(reading.benefactorOuter).toBe(15); // 10 + 5
      expect(reading.benefactorInner).toBe(15); // 10 + 5
      expect(typeof reading.yearCard).toBe("number");
      expect(typeof reading.monthCard).toBe("number");
      expect(typeof reading.dayCard).toBe("number");
    });

    it("should handle custom target year/month/day", () => {
      const reading = calculateFullReading(1995, 6, 15, 2026, 3, 20);
      
      expect(typeof reading.coreCard).toBe("number");
      expect(typeof reading.yearCard).toBe("number");
      expect(typeof reading.monthCard).toBe("number");
      expect(typeof reading.dayCard).toBe("number");
    });
  });
});
