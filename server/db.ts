import { eq, and, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tarotCards, TarotCard, passwordResetTokens } from "../drizzle/schema";
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

export async function createEmailUser(email: string, passwordHash: string, name?: string): Promise<number> {
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
  });

  return result[0].insertId;
}

// Admin: list all users with pagination
export async function getAllUsers(page: number = 1, pageSize: number = 20) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return { users: [], total: 0 };
  }

  const offset = (page - 1) * pageSize;
  const [rows, countRows] = await Promise.all([
    db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      loginMethod: users.loginMethod,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    }).from(users).limit(pageSize).offset(offset),
    db.select({ count: users.id }).from(users),
  ]);

  return { users: rows, total: countRows.length };
}

// Admin: update user role
export async function updateUserRole(userId: number, role: 'user' | 'admin'): Promise<void> {
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
