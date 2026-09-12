import { eq, and, desc, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  tarotCards,
  TarotCard,
  passwordResetTokens,
  registrationApprovalModeEvents,
  registrationApprovalSettings,
  adminActionLogs,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Email auth helpers
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function createEmailUser(
  email: string,
  passwordHash: string,
  name?: string,
  approvalStatus: 'pending' | 'approved' = 'pending',
): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Generate a unique openId for email users (prefix with 'email_')
  const openId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  const result = await db.insert(users).values({
    openId,
    email,
    passwordHash,
    name: name || null,
    loginMethod: 'email',
    lastSignedIn: new Date(),
    approvalStatus,
  });

  return result[0].insertId;
}

// Admin: list all users with pagination and optional name/email search.
export async function getAllUsers(page: number = 1, pageSize: number = 20, search?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return { users: [], total: 0 };
  }

  const offset = (page - 1) * pageSize;
  const normalizedSearch = search?.trim();
  const filter = normalizedSearch
    ? await (async () => {
        const { like, or } = await import("drizzle-orm");
        const keyword = `%${normalizedSearch}%`;
        return or(like(users.name, keyword), like(users.email, keyword));
      })()
    : undefined;
  const selectFields = {
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    loginMethod: users.loginMethod,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
    subscriptionStart: users.subscriptionStart,
    subscriptionStatus: users.subscriptionStatus,
    approvalStatus: users.approvalStatus,
    reviewedAt: users.reviewedAt,
    reviewedBy: users.reviewedBy,
  };
  const usersQuery = db.select(selectFields).from(users);
  const countQuery = db.select({ count: users.id }).from(users);
  const [rows, countRows] = await Promise.all([
    (filter ? usersQuery.where(filter) : usersQuery).limit(pageSize).offset(offset),
    filter ? countQuery.where(filter) : countQuery,
  ]);

  return { users: rows, total: countRows.length };
}

// Admin: list pending registration applications with optional name/email search.
export async function getPendingRegistrationApplications(search?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pending applications: database not available");
    return [];
  }

  const normalizedSearch = search?.trim();
  const filter = normalizedSearch
    ? await (async () => {
        const { and, like, or } = await import("drizzle-orm");
        const keyword = `%${normalizedSearch}%`;
        return and(
          eq(users.approvalStatus, 'pending'),
          or(like(users.name, keyword), like(users.email, keyword)),
        );
      })()
    : eq(users.approvalStatus, 'pending');

  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    createdAt: users.createdAt,
    approvalStatus: users.approvalStatus,
    reviewedAt: users.reviewedAt,
    reviewedBy: users.reviewedBy,
  }).from(users).where(filter).orderBy(users.createdAt);
}

// Admin: approve or reject a registration application
export async function updateUserApprovalStatus(
  userId: number,
  approvalStatus: 'approved' | 'rejected',
  reviewedBy: number,
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({
    approvalStatus,
    reviewedAt: new Date(),
    reviewedBy,
  }).where(eq(users.id, userId));
}

export type RegistrationApprovalMode = "manual" | "instant";

export async function getRegistrationApprovalMode() {
  const db = await getDb();
  if (!db) {
    return { mode: "manual" as const, updatedAt: null, updatedBy: null };
  }

  const result = await db
    .select()
    .from(registrationApprovalSettings)
    .where(eq(registrationApprovalSettings.id, 1))
    .limit(1);
  const setting = result[0];
  return setting
    ? { mode: setting.mode, updatedAt: setting.updatedAt, updatedBy: setting.updatedBy }
    : { mode: "manual" as const, updatedAt: null, updatedBy: null };
}

export async function getRecentRegistrationApprovalModeEvents(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(registrationApprovalModeEvents)
    .orderBy(desc(registrationApprovalModeEvents.changedAt))
    .limit(limit);
}

export async function setRegistrationApprovalMode(mode: RegistrationApprovalMode, changedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const current = await getRegistrationApprovalMode();
  const now = new Date();
  await db
    .insert(registrationApprovalSettings)
    .values({ id: 1, mode, updatedAt: now, updatedBy: changedBy })
    .onDuplicateKeyUpdate({ set: { mode, updatedAt: now, updatedBy: changedBy } });

  const changed = current.mode !== mode;
  if (changed) {
    await db.insert(registrationApprovalModeEvents).values({ mode, changedAt: now, changedBy });
  }

  return { mode, updatedAt: now, updatedBy: changedBy, changed };
}

export type AdminAction =
  | "registration_approved"
  | "registration_rejected"
  | "registration_mode_changed"
  | "user_created"
  | "user_deleted"
  | "role_changed"
  | "password_reset"
  | "subscription_status_changed";

export async function recordAdminAction(input: {
  action: AdminAction;
  actorId: number;
  targetUserId?: number | null;
  targetLabel?: string | null;
  detail?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminActionLogs).values({
    action: input.action,
    actorId: input.actorId,
    targetUserId: input.targetUserId ?? null,
    targetLabel: input.targetLabel ?? null,
    detail: input.detail ?? null,
  });
}

export async function getRecentAdminActionLogs(limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(adminActionLogs)
    .orderBy(desc(adminActionLogs.createdAt))
    .limit(limit);
}

// Admin: update user role
export async function updateUserRole(userId: number, role: 'user' | 'admin' | 'assistant'): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// Password reset token helpers
export async function createPasswordResetToken(userId: number, token: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Invalidate any existing tokens for this user
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await db.insert(passwordResetTokens).values({ userId, token, expiresAt });
}

export async function getValidResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;

  const now = new Date();
  const result = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, now)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function markTokenUsed(tokenId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, tokenId));
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, tokenId));
}

export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
}

// Subscription: set subscription start date (first login)
export async function initSubscriptionStart(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Only set if not already set (use isNull for proper SQL NULL comparison)
  const { isNull } = await import('drizzle-orm');
  await db.update(users)
    .set({ subscriptionStart: new Date() })
    .where(and(eq(users.id, userId), isNull(users.subscriptionStart)));
}

// Admin: update subscription status (active/suspended)
export async function updateSubscriptionStatus(userId: number, status: 'active' | 'suspended' | 'expired'): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ subscriptionStatus: status }).where(eq(users.id, userId));
}

// Admin: delete user by ID
export async function deleteUser(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Also clean up any password reset tokens for this user
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
}

// Tarot card queries
export async function getAllTarotCards(): Promise<TarotCard[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get tarot cards: database not available");
    return [];
  }

  const result = await db.select().from(tarotCards);
  return result;
}

export async function getTarotCardById(id: number): Promise<TarotCard | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get tarot card: database not available");
    return undefined;
  }

  const result = await db.select().from(tarotCards).where(eq(tarotCards.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTarotCardsByIds(ids: number[]): Promise<TarotCard[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get tarot cards: database not available");
    return [];
  }

  if (ids.length === 0) return [];

  const result = await db.select().from(tarotCards).where(
    eq(tarotCards.id, ids[0])
  );
  
  // For multiple IDs, we need to query each one
  if (ids.length === 1) return result;
  
  const allResults: TarotCard[] = [];
  for (const id of ids) {
    const card = await getTarotCardById(id);
    if (card) allResults.push(card);
  }
  
  return allResults;
}
