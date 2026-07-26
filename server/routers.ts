import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import { z } from "zod";
import { getAllTarotCards, getTarotCardById, getTarotCardsByIds, getUserByEmail, createEmailUser, getUserByOpenId } from "./db";
import { calculateFullReading } from "./tarot-calculator";
import { solarToLunar, lunarToSolar } from "./lunar-converter";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

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

    // Email + Password Registration
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email("請輸入有效的 Email"),
          password: z.string().min(8, "密碼至少需要 8 個字元"),
          name: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check if email already exists
        const existingUser = await getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "此 Email 已被註冊",
          });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 12);

        // Create user
        const userId = await createEmailUser(input.email, passwordHash, input.name);

        // Get the created user to get openId
        const user = await getUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "註冊失敗，請稍後再試",
          });
        }

        // Create session token
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      }),

    // Email + Password Login
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("請輸入有效的 Email"),
          password: z.string().min(1, "請輸入密碼"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Find user by email
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "帳號或密碼錯誤",
          });
        }

        // Verify password
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "帳號或密碼錯誤",
          });
        }

        // Create session token
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      }),
  }),

  tarot: router({
    // 國曆轉農曆
    solarToLunar: publicProcedure
      .input(
        z.object({
          year: z.number().min(1900).max(2100),
          month: z.number().min(1).max(12),
          day: z.number().min(1).max(31),
        })
      )
      .mutation(async ({ input }) => {
        return solarToLunar(input.year, input.month, input.day);
      }),

    // 農曆轉國曆
    lunarToSolar: publicProcedure
      .input(
        z.object({
          year: z.number().min(1900).max(2100),
          month: z.number().min(1).max(12),
          day: z.number().min(1).max(31),
          isLeapMonth: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return lunarToSolar(input.year, input.month, input.day, input.isLeapMonth);
      }),

    // 批次計算本月流日
    calculateMonthlyDayFortune: publicProcedure
      .input(
        z.object({
          solarBirthYear: z.number(),
          solarBirthMonth: z.number(),
          solarBirthDay: z.number(),
          lunarBirthYear: z.number(),
          lunarBirthMonth: z.number(),
          lunarBirthDay: z.number(),
          targetYear: z.number(),
          targetMonth: z.number(),
        })
      )
      .query(async ({ input }) => {
        const { solarBirthYear, solarBirthMonth, solarBirthDay, lunarBirthYear, lunarBirthMonth, lunarBirthDay, targetYear, targetMonth } = input;
        const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
        const days = [];
        
        // 國曆流日計算
        const solarBirthSum = solarBirthYear + solarBirthMonth + solarBirthDay;
        const solarMonthSum = solarBirthSum + targetYear + targetMonth;
        
        for (let day = 1; day <= daysInMonth; day++) {
          // 國曆轉農曆
          const lunarDate = solarToLunar(targetYear, targetMonth, day);
          if (!lunarDate) {
            continue; // 跳過無效日期
          }
          
          // 計算國曆流日牌
          const solarDaySum = solarMonthSum + day;
          let solarDayCard = solarDaySum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
          while (solarDayCard > 21) {
            solarDayCard = solarDayCard.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
          }
          
          // 計算農曆流日牌
          const lunarBirthSum = lunarBirthYear + lunarBirthMonth + lunarBirthDay;
          const lunarMonthSum = lunarBirthSum + targetYear + targetMonth;
          const lunarDaySum = lunarMonthSum + day;
          let lunarDayCard = lunarDaySum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
          while (lunarDayCard > 21) {
            lunarDayCard = lunarDayCard.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
          }
          
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
      }),

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
          lunarBirthYear: z.number().min(1900).max(2100),
          lunarBirthMonth: z.number().min(1).max(12),
          lunarBirthDay: z.number().min(1).max(31),
          targetYear: z.number().min(1900).max(2100).optional(),
          targetMonth: z.number().min(1).max(12).optional(),
          targetDay: z.number().min(1).max(31).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const reading = calculateFullReading(
          input.birthYear,
          input.birthMonth,
          input.birthDay,
          input.lunarBirthYear,
          input.lunarBirthMonth,
          input.lunarBirthDay,
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
          reading.lunarYearCard,
          reading.lunarMonthCard,
          reading.lunarDayCard,
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
            lunarYear: cardMap.get(reading.lunarYearCard),
            lunarMonth: cardMap.get(reading.lunarMonthCard),
            lunarDay: cardMap.get(reading.lunarDayCard),
          },
          allCards,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
