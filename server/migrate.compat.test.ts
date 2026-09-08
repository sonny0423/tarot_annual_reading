import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const connection = {
    query: vi.fn(),
    end: vi.fn(),
  };
  return {
    connection,
    createConnection: vi.fn(),
    drizzle: vi.fn(() => ({})),
    migrate: vi.fn(),
  };
});

vi.mock("mysql2/promise", () => ({ createConnection: mocks.createConnection }));
vi.mock("drizzle-orm/mysql2", () => ({ drizzle: mocks.drizzle }));
vi.mock("drizzle-orm/mysql2/migrator", () => ({ migrate: mocks.migrate }));

import { runMigrations } from "./migrate";

describe("legacy Zeabur users schema compatibility", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = "mysql://test:test@localhost:3306/test";

    const columns = new Map<string, string>([["role", "enum('user','admin')"]]);
    let hasApprovalIndex = false;

    mocks.createConnection.mockResolvedValue(mocks.connection as never);
    mocks.connection.query.mockImplementation(async (sql: string) => {
      if (sql.includes("information_schema.TABLES")) return [[{ present: 1 }]];
      if (sql.includes("information_schema.COLUMNS")) {
        return [[...columns.entries()].map(([COLUMN_NAME, COLUMN_TYPE]) => ({ COLUMN_NAME, COLUMN_TYPE }))];
      }
      if (sql.includes("MODIFY COLUMN `role`")) {
        columns.set("role", "enum('user','admin','assistant')");
        return [{}];
      }
      const addMatch = sql.match(/ADD COLUMN `([^`]+)`/);
      if (addMatch) {
        columns.set(addMatch[1], "added");
        return [{}];
      }
      if (sql.includes("SHOW INDEX")) return [hasApprovalIndex ? [{ Key_name: "users_approval_status_idx" }] : []];
      if (sql.includes("CREATE INDEX `users_approval_status_idx`")) {
        hasApprovalIndex = true;
        return [{}];
      }
      return [{}];
    });
  });

  it("adds missing legacy columns and the approval index before Drizzle records old migrations", async () => {
    await runMigrations();

    const sql = mocks.connection.query.mock.calls.map(([statement]) => statement).join("\n");
    expect(sql).toContain("MODIFY COLUMN `role` enum('user','admin','assistant')");
    expect(sql).toContain("ADD COLUMN `subscriptionStart` timestamp");
    expect(sql).toContain("ADD COLUMN `subscriptionStatus` enum('active','suspended','expired')");
    expect(sql).toContain("ADD COLUMN `approvalStatus` enum('pending','approved','rejected')");
    expect(sql).toContain("ADD COLUMN `reviewedAt` timestamp");
    expect(sql).toContain("ADD COLUMN `reviewedBy` int");
    expect(sql).toContain("CREATE INDEX `users_approval_status_idx`");
    expect(mocks.migrate).toHaveBeenCalledTimes(1);
    expect(mocks.connection.end).toHaveBeenCalledTimes(3);
  });

  it("skips all work when DATABASE_URL is unavailable", async () => {
    delete process.env.DATABASE_URL;

    await runMigrations();

    expect(mocks.createConnection).not.toHaveBeenCalled();
    expect(mocks.migrate).not.toHaveBeenCalled();
  });

  afterAll(() => {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
  });
});
