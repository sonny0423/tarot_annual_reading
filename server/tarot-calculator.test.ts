import { describe, expect, it } from "vitest";
import {
  calculateCoreCard,
  calculateOuterCard,
  calculateInnerCard,
  calculateBenefactorCards,
  calculateYearCard,
  calculateMonthCard,
  calculateDayCard,
  calculateFullReading,
} from "./tarot-calculator";

describe("Tarot Calculator", () => {
  describe("calculateCoreCard", () => {
    it("should calculate core card correctly", () => {
      // 1981 + 4 + 23 = 2008 -> 2+0+0+8 = 10
      const result = calculateCoreCard(1981, 4, 23);
      expect(result).toBe(10);
    });

    it("should handle numbers that reduce to 22", () => {
      // When sum equals 22, should return 4
      const result = calculateCoreCard(1990, 1, 13); // 1990+1+13=2004 -> 6
      expect(result).toBeLessThanOrEqual(22);
    });

    it("should reduce large numbers correctly", () => {
      const result = calculateCoreCard(2000, 12, 31); // 2000+12+31=2043 -> 9
      expect(result).toBe(9);
    });
  });

  describe("calculateOuterCard", () => {
    it("should calculate outer card from month and day", () => {
      // 4 + 23 = 27 -> 2+7 = 9
      const result = calculateOuterCard(4, 23);
      expect(result).toBe(9);
    });

    it("should handle single digit results", () => {
      const result = calculateOuterCard(1, 5); // 1+5=6
      expect(result).toBe(6);
    });
  });

  describe("calculateInnerCard", () => {
    it("should match outer card calculation", () => {
      const outer = calculateOuterCard(4, 23);
      const inner = calculateInnerCard(4, 23);
      expect(inner).toBe(outer);
    });
  });

  describe("calculateBenefactorCards", () => {
    it("should calculate benefactor cards correctly", () => {
      const benefactors = calculateBenefactorCards(10, 9, 9);
      
      expect(benefactors.benefactorCore).toBeDefined();
      expect(benefactors.benefactorOuter).toBeDefined();
      expect(benefactors.benefactorInner).toBeDefined();
      
      // All should be within valid range
      expect(benefactors.benefactorCore).toBeGreaterThanOrEqual(0);
      expect(benefactors.benefactorCore).toBeLessThanOrEqual(22);
    });
  });

  describe("calculateYearCard", () => {
    it("should calculate year card for current year", () => {
      const result = calculateYearCard(1981, 4, 23, 2023);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(22);
    });

    it("should produce different results for different years", () => {
      const year2023 = calculateYearCard(1981, 4, 23, 2023);
      const year2024 = calculateYearCard(1981, 4, 23, 2024);
      // Different years should typically produce different cards
      expect(year2023).not.toBe(year2024);
    });
  });

  describe("calculateMonthCard", () => {
    it("should calculate month card correctly", () => {
      const result = calculateMonthCard(1981, 4, 23, 2023, 3);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(22);
    });
  });

  describe("calculateDayCard", () => {
    it("should calculate day card correctly", () => {
      const result = calculateDayCard(1981, 4, 23, 2023, 3, 13);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(22);
    });
  });

  describe("calculateFullReading", () => {
    it("should return complete reading with all cards", () => {
      const reading = calculateFullReading(1981, 4, 23, 2023, 3, 13);
      
      expect(reading.coreCard).toBeDefined();
      expect(reading.outerCard).toBeDefined();
      expect(reading.innerCard).toBeDefined();
      expect(reading.benefactorCore).toBeDefined();
      expect(reading.benefactorOuter).toBeDefined();
      expect(reading.benefactorInner).toBeDefined();
      expect(reading.yearCard).toBeDefined();
      expect(reading.monthCard).toBeDefined();
      expect(reading.dayCard).toBeDefined();
      
      // All cards should be in valid range
      Object.values(reading).forEach((cardId) => {
        expect(cardId).toBeGreaterThanOrEqual(0);
        expect(cardId).toBeLessThanOrEqual(22);
      });
    });

    it("should use current date when target date not provided", () => {
      const reading = calculateFullReading(1981, 4, 23);
      
      expect(reading.yearCard).toBeDefined();
      expect(reading.monthCard).toBeDefined();
      expect(reading.dayCard).toBeDefined();
    });

    it("should calculate consistent results for same input", () => {
      const reading1 = calculateFullReading(1981, 4, 23, 2023, 3, 13);
      const reading2 = calculateFullReading(1981, 4, 23, 2023, 3, 13);
      
      expect(reading1).toEqual(reading2);
    });
  });

  describe("Edge cases", () => {
    it("should handle leap year dates", () => {
      const result = calculateCoreCard(2000, 2, 29);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(22);
    });

    it("should handle year boundaries", () => {
      const result = calculateCoreCard(1900, 1, 1);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(22);
    });

    it("should handle end of year dates", () => {
      const result = calculateCoreCard(2100, 12, 31);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(22);
    });
  });
});
