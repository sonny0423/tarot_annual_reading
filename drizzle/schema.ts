import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "assistant"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  subscriptionStart: timestamp("subscriptionStart"),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "suspended", "expired"]).default("active").notNull(),
  approvalStatus: mysqlEnum("approvalStatus", ["pending", "approved", "rejected"]).default("approved").notNull(),
  reviewedAt: timestamp("reviewedAt"),
  reviewedBy: int("reviewedBy"),
}, (table) => ({
  approvalStatusIdx: index("users_approval_status_idx").on(table.approvalStatus),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tarot cards master table - 22 major arcana cards
 */
export const tarotCards = mysqlTable("tarot_cards", {
  id: int("id").primaryKey(), // 0-21
  name: varchar("name", { length: 50 }).notNull(),
  positiveTraits: text("positive_traits").notNull(),
  negativeTraits: text("negative_traits").notNull(),
  meaning: text("meaning").notNull(),
  upright: text("upright").notNull(),
  reversed: text("reversed").notNull(),
  scriptAnalysis: text("script_analysis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TarotCard = typeof tarotCards.$inferSelect;
export type InsertTarotCard = typeof tarotCards.$inferInsert;

/**
 * User reading history - store calculated readings
 */
export const readings = mysqlTable("readings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  birthYear: int("birth_year").notNull(),
  birthMonth: int("birth_month").notNull(),
  birthDay: int("birth_day").notNull(),
  isLunar: int("is_lunar").default(0).notNull(), // 0: solar, 1: lunar
  innerCardId: int("inner_card_id").notNull(), // 內心
  outerCardId: int("outer_card_id").notNull(), // 外顯
  coreCardId: int("core_card_id").notNull(), // 本性
  benefactorInnerCardId: int("benefactor_inner_card_id").notNull(),
  benefactorOuterCardId: int("benefactor_outer_card_id").notNull(),
  benefactorCoreCardId: int("benefactor_core_card_id").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reading = typeof readings.$inferSelect;
export type InsertReading = typeof readings.$inferInsert;

/**
 * Password reset tokens table
 */
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

/**
 * Singleton setting (id = 1) controlling whether new registrations are
 * individually reviewed or immediately activated for a live class.
 */
export const registrationApprovalSettings = mysqlTable("registration_approval_settings", {
  id: int("id").primaryKey(),
  mode: mysqlEnum("mode", ["manual", "instant"]).default("manual").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy"),
});

export type RegistrationApprovalSetting = typeof registrationApprovalSettings.$inferSelect;

/**
 * Immutable audit trail for each class-mode / manual-review-mode switch.
 */
export const registrationApprovalModeEvents = mysqlTable("registration_approval_mode_events", {
  id: int("id").autoincrement().primaryKey(),
  mode: mysqlEnum("mode", ["manual", "instant"]).notNull(),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
  changedBy: int("changedBy").notNull(),
}, (table) => ({
  changedAtIdx: index("registration_approval_events_changed_at_idx").on(table.changedAt),
}));

export type RegistrationApprovalModeEvent = typeof registrationApprovalModeEvents.$inferSelect;
