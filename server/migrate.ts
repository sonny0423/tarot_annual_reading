import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { createConnection } from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ColumnInfo = {
  COLUMN_NAME: string;
  COLUMN_TYPE: string;
};

async function ensureLegacyUsersSchema(databaseUrl: string) {
  const connection = await createConnection(databaseUrl);
  try {
    const [tableRows] = await connection.query(
      "SELECT 1 AS present FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' LIMIT 1",
    );
    if (!Array.isArray(tableRows) || tableRows.length === 0) return;

    const [columnRows] = await connection.query(
      "SELECT COLUMN_NAME, COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'",
    );
    const columns = new Map(
      (columnRows as ColumnInfo[]).map((column) => [column.COLUMN_NAME, column]),
    );

    const addColumnIfMissing = async (name: string, definition: string) => {
      if (columns.has(name)) return;
      await connection.query(`ALTER TABLE \`users\` ADD COLUMN \`${name}\` ${definition}`);
      columns.set(name, { COLUMN_NAME: name, COLUMN_TYPE: definition });
      console.log(`[Migrate] Added missing legacy users.${name} column`);
    };

    const roleColumn = columns.get("role");
    if (roleColumn && !roleColumn.COLUMN_TYPE.includes("'assistant'")) {
      await connection.query(
        "ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','assistant') NOT NULL DEFAULT 'user'",
      );
      console.log("[Migrate] Updated legacy users.role enum");
    }

    await addColumnIfMissing("passwordHash", "varchar(255)");
    await addColumnIfMissing("subscriptionStart", "timestamp");
    await addColumnIfMissing(
      "subscriptionStatus",
      "enum('active','suspended','expired') NOT NULL DEFAULT 'active'",
    );
    await addColumnIfMissing(
      "approvalStatus",
      "enum('pending','approved','rejected') NOT NULL DEFAULT 'approved'",
    );
    await addColumnIfMissing("reviewedAt", "timestamp");
    await addColumnIfMissing("reviewedBy", "int");

    const [indexRows] = await connection.query("SHOW INDEX FROM `users` WHERE Key_name = 'users_approval_status_idx'");
    if (Array.isArray(indexRows) && indexRows.length === 0) {
      await connection.query("CREATE INDEX `users_approval_status_idx` ON `users` (`approvalStatus`)");
      console.log("[Migrate] Added users_approval_status_idx index");
    }
  } finally {
    await connection.end();
  }
}

async function ensureRegistrationApprovalModeSchema(databaseUrl: string) {
  const connection = await createConnection(databaseUrl);
  try {
    await connection.query(
      "CREATE TABLE IF NOT EXISTS `registration_approval_settings` (`id` int NOT NULL, `mode` enum('manual','instant') NOT NULL DEFAULT 'manual', `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `updatedBy` int, CONSTRAINT `registration_approval_settings_id` PRIMARY KEY (`id`))",
    );
    await connection.query(
      "CREATE TABLE IF NOT EXISTS `registration_approval_mode_events` (`id` int AUTO_INCREMENT NOT NULL, `mode` enum('manual','instant') NOT NULL, `changedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `changedBy` int NOT NULL, CONSTRAINT `registration_approval_mode_events_id` PRIMARY KEY (`id`))",
    );
    const [indexRows] = await connection.query(
      "SELECT 1 AS present FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registration_approval_mode_events' AND INDEX_NAME = 'registration_approval_events_changed_at_idx' LIMIT 1",
    );
    if (Array.isArray(indexRows) && indexRows.length === 0) {
      await connection.query("CREATE INDEX `registration_approval_events_changed_at_idx` ON `registration_approval_mode_events` (`changedAt`)");
    }
  } finally {
    await connection.end();
  }
}

async function ensureAdminActionLogSchema(databaseUrl: string) {
  const connection = await createConnection(databaseUrl);
  try {
    await connection.query(
      "CREATE TABLE IF NOT EXISTS `admin_action_logs` (`id` int AUTO_INCREMENT NOT NULL, `action` varchar(64) NOT NULL, `actorId` int NOT NULL, `targetUserId` int, `targetLabel` varchar(320), `detail` text, `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT `admin_action_logs_id` PRIMARY KEY (`id`))",
    );
    const indexes = [
      ["admin_action_logs_created_at_idx", "`createdAt`"],
      ["admin_action_logs_target_user_idx", "`targetUserId`"],
    ] as const;
    for (const [name, columns] of indexes) {
      const [indexRows] = await connection.query(
        `SELECT 1 AS present FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admin_action_logs' AND INDEX_NAME = '${name}' LIMIT 1`,
      );
      if (Array.isArray(indexRows) && indexRows.length === 0) {
        await connection.query(`CREATE INDEX \`${name}\` ON \`admin_action_logs\` (${columns})`);
      }
    }
  } finally {
    await connection.end();
  }
}

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("[Migrate] DATABASE_URL not set, skipping migrations");
    return;
  }

  try {
    console.log("[Migrate] Running database migrations...");
    // Zeabur's legacy MySQL schema predates Drizzle's migration history. Ensure
    // the users fields expected by the current app exist before replaying history.
    await ensureLegacyUsersSchema(databaseUrl);
    await ensureRegistrationApprovalModeSchema(databaseUrl);
    await ensureAdminActionLogSchema(databaseUrl);
    const db = drizzle(databaseUrl);
    // In dev (tsx): __dirname = server/, drizzle is at ../drizzle
    // In prod (built): __dirname = dist/, drizzle is at ./drizzle (copied by build script)
    const isDev = process.env.NODE_ENV === "development";
    const migrationsFolder = isDev
      ? path.resolve(__dirname, "../drizzle")
      : path.resolve(__dirname, "./drizzle");
    await migrate(db, { migrationsFolder });
    // A fresh database creates `users` during migration 0000, so run once more
    // after Drizzle has created its base tables.
    await ensureLegacyUsersSchema(databaseUrl);
    await ensureAdminActionLogSchema(databaseUrl);
    console.log("[Migrate] Migrations completed successfully");
  } catch (err) {
    console.error("[Migrate] Migration failed:", err);
    // Don't throw - allow server to start even if migration fails
    // (e.g., if migrations were already applied)
  }
}
