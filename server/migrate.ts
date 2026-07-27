import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("[Migrate] DATABASE_URL not set, skipping migrations");
    return;
  }

  try {
    console.log("[Migrate] Running database migrations...");
    const db = drizzle(databaseUrl);
    // In dev (tsx): __dirname = server/, drizzle is at ../drizzle
    // In prod (built): __dirname = dist/, drizzle is at ./drizzle (copied by build script)
    const isDev = process.env.NODE_ENV === "development";
    const migrationsFolder = isDev
      ? path.resolve(__dirname, "../drizzle")
      : path.resolve(__dirname, "./drizzle");
    await migrate(db, { migrationsFolder });
    console.log("[Migrate] Migrations completed successfully");
  } catch (err) {
    console.error("[Migrate] Migration failed:", err);
    // Don't throw - allow server to start even if migration fails
    // (e.g., if migrations were already applied)
  }
}
