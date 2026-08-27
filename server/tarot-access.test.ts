import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: { headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAdministratorContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "tarot-api-test-admin",
      email: "admin@example.com",
      name: "API Test Admin",
      loginMethod: "email",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("tarot access protection", () => {
  it("rejects unauthenticated complete-reading requests before evaluating formulas", async () => {
    const caller = appRouter.createCaller(createUnauthenticatedContext());

    await expect(caller.tarot.calculateReading({
      birthYear: 1981,
      birthMonth: 4,
      birthDay: 23,
      lunarBirthYear: 1981,
      lunarBirthMonth: 3,
      lunarBirthDay: 19,
      targetYear: 2026,
      targetMonth: 2,
      targetDay: 21,
      soulShift: 0,
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects unauthenticated requests for the complete card library", async () => {
    const caller = appRouter.createCaller(createUnauthenticatedContext());

    await expect(caller.tarot.getAllCards()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns only the current reading's detailed cards and lightweight life-table cards", async () => {
    const caller = appRouter.createCaller(createAdministratorContext());
    const readingResult = await caller.tarot.calculateReading({
      birthYear: 1981,
      birthMonth: 4,
      birthDay: 23,
      lunarBirthYear: 1981,
      lunarBirthMonth: 3,
      lunarBirthDay: 19,
      targetYear: 2026,
      targetMonth: 2,
      targetDay: 21,
      soulShift: 1,
    });
    const lifeResults = await caller.tarot.calculateLifeFortune({
      birthYear: 1981,
      birthMonth: 4,
      birthDay: 23,
      lunarBirthMonth: 3,
      lunarBirthDay: 19,
      soulShift: 1,
    });

    expect(readingResult.reading).toMatchObject({ yearCard: 10, monthCard: 14, dayCard: 17 });
    expect(readingResult.cards.core).toMatchObject({ id: 9 });
    expect(readingResult.lunarPersonality.cards.core).toBeDefined();
    expect(readingResult).not.toHaveProperty("allCards");
    expect(lifeResults).toHaveLength(101);
    expect(lifeResults[0]?.solarCard).toEqual({
      id: lifeResults[0]?.solarCardNumber,
      name: expect.any(String),
    });
    expect(lifeResults[0]?.solarCard).not.toHaveProperty("positiveTraits");
  });
});
