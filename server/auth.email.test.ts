import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getUserByEmail, updateUserApprovalStatus } from "./db";

// Mock cookie storage
let cookies: Record<string, string> = {};

async function approveEmail(email: string) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error(`Test user not found: ${email}`);
  await updateUserApprovalStatus(user.id, "approved", 1);
}

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

    expect(result).toMatchObject({
      success: true,
      pendingApproval: true,
      message: "註冊申請已送出，請等待管理員審核通過後再登入",
    });
    expect(ctx.res.cookie).not.toHaveBeenCalled();
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
    ).rejects.toThrow("此帳號已被使用");
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

    await approveEmail(uniqueEmail);

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

  it("should reject login while registration is pending", async () => {
    const email = `pending_${Date.now()}@example.com`;
    const caller = appRouter.createCaller(createMockContext());
    await caller.auth.register({ email, password: "password123" });

    await expect(caller.auth.login({ email, password: "password123" })).rejects.toThrow("註冊申請尚在審核中");
  });

  it("should let an admin approve a pending registration before login", async () => {
    const email = `approved_${Date.now()}@example.com`;
    const registerCaller = appRouter.createCaller(createMockContext());
    await registerCaller.auth.register({ email, password: "password123" });
    const pendingUser = await getUserByEmail(email);
    expect(pendingUser?.approvalStatus).toBe("pending");

    const adminContext = createMockContext();
    adminContext.user = { id: 1, openId: "test-admin", role: "admin", name: "Test Admin" } as any;
    const adminCaller = appRouter.createCaller(adminContext);
    await expect(adminCaller.admin.reviewRegistration({ userId: pendingUser!.id, decision: "approved" }))
      .resolves.toMatchObject({ success: true });

    await expect(appRouter.createCaller(createMockContext()).auth.login({ email, password: "password123" }))
      .resolves.toMatchObject({ success: true });
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

    await approveEmail(uniqueEmail);

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

  it("should change a logged-in user's password only after current password verification", async () => {
    const email = `change_password_${Date.now()}@example.com`;
    const registerCtx = createMockContext();
    const registerCaller = appRouter.createCaller(registerCtx);
    await registerCaller.auth.register({
      email,
      password: "oldpassword123",
    });
    await approveEmail(email);

    const dbUser = await getUserByEmail(email);
    expect(dbUser).toBeTruthy();

    const changeCtx = createMockContext();
    changeCtx.user = dbUser as any;
    const changeCaller = appRouter.createCaller(changeCtx);

    await expect(
      changeCaller.auth.changePassword({
        currentPassword: "incorrect-password",
        newPassword: "newpassword123",
      })
    ).rejects.toThrow("目前密碼不正確");

    await expect(
      changeCaller.auth.changePassword({
        currentPassword: "oldpassword123",
        newPassword: "newpassword123",
      })
    ).resolves.toMatchObject({ success: true });

    const loginCtx = createMockContext();
    const loginCaller = appRouter.createCaller(loginCtx);
    await expect(
      loginCaller.auth.login({ email, password: "oldpassword123" })
    ).rejects.toThrow("帳號或密碼錯誤");

    await expect(
      loginCaller.auth.login({ email, password: "newpassword123" })
    ).resolves.toMatchObject({ success: true });
  });
});
