import { describe, expect, it } from "vitest";
import {
  calculateCoreCard,
  calculateOuterCard,
  calculateInnerCard,
  calculateBenefactorCoreCard,
  calculateYearCard,
  calculateMonthCard,
  calculateDayCard,
  calculateFullReading,
} from "./tarot-calculator";

describe("Tarot Calculator", () => {
  describe("calculateCoreCard", () => {
    it("should calculate core card from year last two digits", () => {
      // 1981 -> 81 > 21, so 8+1 = 9
      const result = calculateCoreCard(1981, 4, 23);
      expect(result).toBe(9);
    });

    it("should handle year 2000", () => {
      // 2000 -> 00
      const result = calculateCoreCard(2000, 12, 31);
      expect(result).toBe(0);
    });

    it("should handle year 1995", () => {
      // 1995 -> 95 > 21, so 9+5 = 14
      const result = calculateCoreCard(1995, 6, 15);
      expect(result).toBe(14);
    });
  });

  describe("calculateOuterCard", () => {
    it("should calculate outer card from birth sum", () => {
      // 1981 + 4 + 23 = 2008 -> 2+0+0+8 = 10
      const result = calculateOuterCard(1981, 4, 23);
      expect(result).toBe(10);
    });

    it("should handle year 1995", () => {
      // 1995 + 6 + 15 = 2016 -> 2+0+1+6 = 9
      const result = calculateOuterCard(1995, 6, 15);
      expect(result).toBe(9);
    });
  });

  describe("calculateInnerCard", () => {
    it("should calculate inner card from birth sum", () => {
      // 1981 + 4 + 23 = 2008 -> 2+0+0+8 = 10
      const result = calculateInnerCard(1981, 4, 23);
      expect(result).toBe(10);
    });

    it("should match outer card for same birth date", () => {
      const outer = calculateOuterCard(1981, 4, 23);
      const inner = calculateInnerCard(1981, 4, 23);
      expect(inner).toBe(outer);
    });
  });

  describe("calculateBenefactorCoreCard", () => {
    it("should calculate benefactor card from month and day", () => {
      // 4 + 23 = 27 -> 2+7 = 9
      const result = calculateBenefactorCoreCard(4, 23);
      expect(result).toBe(9);
    });

    it("should handle small numbers", () => {
      // 6 + 15 = 21
      const result = calculateBenefactorCoreCard(6, 15);
      expect(result).toBe(21);
    });
  });

  describe("calculateYearCard", () => {
    it("should calculate year card correctly", () => {
      // 4 + 23 = 27, 2025 + 27 = 2052 -> 2+0+5+2 = 9
      const result = calculateYearCard(4, 23, 2025);
      expect(result).toBe(9);
    });

    it("should produce different results for different years", () => {
      const year2023 = calculateYearCard(4, 23, 2023);
      const year2024 = calculateYearCard(4, 23, 2024);
      // 2023: 2023+27=2050 -> 7
      // 2024: 2024+27=2051 -> 8
      expect(year2023).not.toBe(year2024);
    });
  });

  describe("calculateMonthCard", () => {
    it("should calculate month card correctly", () => {
      // 1981+4+23=2008, 2008+2025+1=4034 -> 4+0+3+4=11
      const result = calculateMonthCard(1981, 4, 23, 2025, 1);
      expect(result).toBe(11);
    });
  });

  describe("calculateDayCard", () => {
    it("should calculate day card correctly", () => {
      // 1981+4+23=2008, 2008+2025+1+15=4049 -> 4+0+4+9=17
      const result = calculateDayCard(1981, 4, 23, 2025, 1, 15);
      expect(result).toBe(17);
    });
  });

  describe("calculateFullReading", () => {
    it("should return complete tarot reading", () => {
      const reading = calculateFullReading(1981, 4, 23, 2025, 1, 15);

      expect(reading.coreCard).toBe(9);
      expect(reading.outerCard).toBe(10);
      expect(reading.innerCard).toBe(10);
      expect(reading.benefactorCore).toBe(9);
      expect(reading.yearCard).toBe(9);
      expect(reading.monthCard).toBe(11);
      expect(reading.dayCard).toBe(17);
    });

    it("should use current date when target date not provided", () => {
      const reading = calculateFullReading(1981, 4, 23);

      expect(reading.coreCard).toBeDefined();
      expect(reading.yearCard).toBeDefined();
      expect(reading.monthCard).toBeDefined();
      expect(reading.dayCard).toBeDefined();
    });
  });
});
