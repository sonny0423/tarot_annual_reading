import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getAllTarotCards, getTarotCardById, getTarotCardsByIds } from "./db";
import { calculateFullReading } from "./tarot-calculator";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tarot: router({
    // 取得所有塔羅牌
    getAllCards: publicProcedure.query(async () => {
      return await getAllTarotCards();
    }),

    // 取得單張塔羅牌
    getCard: publicProcedure
      .input(z.object({ id: z.number().min(0).max(21) }))
      .query(async ({ input }) => {
        return await getTarotCardById(input.id);
      }),

    // 取得多張塔羅牌
    getCards: publicProcedure
      .input(z.object({ ids: z.array(z.number().min(0).max(21)) }))
      .query(async ({ input }) => {
        return await getTarotCardsByIds(input.ids);
      }),

    // 計算完整運勢
    calculateReading: publicProcedure
      .input(
        z.object({
          birthYear: z.number().min(1900).max(2100),
          birthMonth: z.number().min(1).max(12),
          birthDay: z.number().min(1).max(31),
          targetYear: z.number().min(1900).max(2100).optional(),
          targetMonth: z.number().min(1).max(12).optional(),
          targetDay: z.number().min(1).max(31).optional(),
        })
      )
      .query(async ({ input }) => {
        const reading = calculateFullReading(
          input.birthYear,
          input.birthMonth,
          input.birthDay,
          input.targetYear,
          input.targetMonth,
          input.targetDay
        );

        // 取得所有相關牌卡的詳細資訊
        const cardIds = [
          reading.coreCard,
          reading.outerCard,
          reading.innerCard,
          reading.benefactorCore,
          reading.benefactorOuter,
          reading.benefactorInner,
          reading.yearCard,
          reading.monthCard,
          reading.dayCard,
        ];

        const uniqueCardIds = Array.from(new Set(cardIds));
        const cards = await getTarotCardsByIds(uniqueCardIds);

        // 建立卡片映射
        const cardMap = new Map(cards.map(card => [card.id, card]));

        // 取得所有塔羅牌供前端計算多年流年和每月流日
        const allCards = await getAllTarotCards();

        return {
          reading,
          cards: {
            core: cardMap.get(reading.coreCard),
            outer: cardMap.get(reading.outerCard),
            inner: cardMap.get(reading.innerCard),
            benefactorCore: cardMap.get(reading.benefactorCore),
            benefactorOuter: cardMap.get(reading.benefactorOuter),
            benefactorInner: cardMap.get(reading.benefactorInner),
            year: cardMap.get(reading.yearCard),
            month: cardMap.get(reading.monthCard),
            day: cardMap.get(reading.dayCard),
          },
          allCards,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
