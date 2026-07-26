import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock cookie storage
let cookies: Record<string, string> = {};

function createMockContext(withCookie?: string): TrpcContext {
  const req = {
    headers: {
      cookie: withCookie ? `app_session_id=${withCookie}` : "",
      "x-forwarded-proto": "https",
    },
    hostname: "localhost",
    protocol: "https",
  } as any;

  const res = {
    cookie: vi.fn((name: string, value: string) => {
      cookies[name] = value;
    }),
    clearCookie: vi.fn(),
  } as any;

  return { req, res, user: null };
}

describe("Email Auth", () => {
  beforeEach(() => {
    cookies = {};
  });

  it("should register a new user with email and password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueEmail = `test_${Date.now()}@example.com`;
    const result = await caller.auth.register({
      email: uniqueEmail,
      password: "password123",
      name: "Test User",
    });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe(uniqueEmail);
    expect(result.user.name).toBe("Test User");
    // Should have set a session cookie
    expect(ctx.res.cookie).toHaveBeenCalledWith(
      "app_session_id",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        path: "/",
      })
    );
  });

  it("should reject duplicate email registration", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueEmail = `dup_${Date.now()}@example.com`;

    // First registration should succeed
    await caller.auth.register({
      email: uniqueEmail,
      password: "password123",
    });

    // Second registration with same email should fail
    await expect(
      caller.auth.register({
        email: uniqueEmail,
        password: "password456",
      })
    ).rejects.toThrow("此 Email 已被註冊");
  });

  it("should login with correct credentials", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueEmail = `login_${Date.now()}@example.com`;

    // Register first
    await caller.auth.register({
      email: uniqueEmail,
      password: "mypassword",
    });

    // Login
    const loginCtx = createMockContext();
    const loginCaller = appRouter.createCaller(loginCtx);
    const result = await loginCaller.auth.login({
      email: uniqueEmail,
      password: "mypassword",
    });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe(uniqueEmail);
    expect(loginCtx.res.cookie).toHaveBeenCalledWith(
      "app_session_id",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        path: "/",
      })
    );
  });

  it("should reject login with wrong password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueEmail = `wrongpw_${Date.now()}@example.com`;

    // Register first
    await caller.auth.register({
      email: uniqueEmail,
      password: "correctpassword",
    });

    // Try login with wrong password
    const loginCtx = createMockContext();
    const loginCaller = appRouter.createCaller(loginCtx);

    await expect(
      loginCaller.auth.login({
        email: uniqueEmail,
        password: "wrongpassword",
      })
    ).rejects.toThrow("帳號或密碼錯誤");
  });

  it("should reject login with non-existent email", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "nonexistent@example.com",
        password: "anypassword",
      })
    ).rejects.toThrow("帳號或密碼錯誤");
  });

  it("should validate email format", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        email: "not-an-email",
        password: "password123",
      })
    ).rejects.toThrow();
  });

  it("should validate password minimum length", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        email: "valid@example.com",
        password: "short",
      })
    ).rejects.toThrow();
  });
});
