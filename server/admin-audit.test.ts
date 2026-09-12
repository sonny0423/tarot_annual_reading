import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const mailerMocks = vi.hoisted(() => ({
  sendRegistrationApprovedEmail: vi.fn(async () => true),
}));

vi.mock("./mailer", () => ({
  sendPasswordResetEmail: vi.fn(async () => true),
  sendRegistrationApprovedEmail: mailerMocks.sendRegistrationApprovedEmail,
}));

import { appRouter } from "./routers";
import { createEmailUser, deleteUser, getDb, getRecentAdminActionLogs, getUserByEmail } from "./db";
import { adminActionLogs } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const testEmail = `audit_approval_${Date.now()}@example.com`;
const notificationFailureEmail = `audit_notification_failure_${Date.now()}@example.com`;
const testAdminId = 999_992;

async function cleanup() {
  const db = await getDb();
  if (db) {
    await db.delete(adminActionLogs).where(eq(adminActionLogs.actorId, testAdminId));
  }
  const user = await getUserByEmail(testEmail);
  if (user) await deleteUser(user.id);
  const notificationFailureUser = await getUserByEmail(notificationFailureEmail);
  if (notificationFailureUser) await deleteUser(notificationFailureUser.id);
}

describe("管理員操作紀錄與核准通知", () => {
  beforeAll(async () => {
    await cleanup();
    await createEmailUser(testEmail, "test-password-hash", "審核通知測試", "pending");
    await createEmailUser(notificationFailureEmail, "test-password-hash", "通知失敗測試", "pending");
  });

  afterAll(async () => {
    await cleanup();
  });

  it("核准註冊會寄送通知並寫入不含密碼的操作紀錄", async () => {
    const pendingUser = await getUserByEmail(testEmail);
    if (!pendingUser) throw new Error("Test user not found");

    const caller = appRouter.createCaller({
      user: { id: testAdminId, role: "admin", openId: "audit-test-admin" },
      req: { headers: { "x-forwarded-proto": "https", host: "localhost" } },
      res: {},
    } as any);

    const result = await caller.admin.reviewRegistration({ userId: pendingUser.id, decision: "approved" });

    expect(result).toMatchObject({ success: true, notificationSent: true });
    expect(mailerMocks.sendRegistrationApprovedEmail).toHaveBeenCalledWith(
      testEmail,
      "審核通知測試",
      "https://localhost/login",
    );

    const logs = await getRecentAdminActionLogs();
    const approvalLog = logs.find((log) => log.targetUserId === pendingUser.id && log.action === "registration_approved");
    expect(approvalLog).toMatchObject({
      actorId: testAdminId,
      targetLabel: testEmail,
      detail: "已寄送帳號啟用通知",
    });
    expect(JSON.stringify(approvalLog)).not.toContain("test-password-hash");
  });

  it("通知寄送失敗不會阻斷核准，角色調整也會留下紀錄", async () => {
    const pendingUser = await getUserByEmail(notificationFailureEmail);
    if (!pendingUser) throw new Error("Failure test user not found");
    mailerMocks.sendRegistrationApprovedEmail.mockResolvedValueOnce(false);

    const caller = appRouter.createCaller({
      user: { id: testAdminId, role: "admin", openId: "audit-test-admin" },
      req: { headers: { "x-forwarded-proto": "https", host: "localhost" } },
      res: {},
    } as any);

    const result = await caller.admin.reviewRegistration({ userId: pendingUser.id, decision: "approved" });
    expect(result).toMatchObject({ success: true, notificationSent: false });
    expect((await getUserByEmail(notificationFailureEmail))?.approvalStatus).toBe("approved");

    await caller.admin.updateRole({ userId: pendingUser.id, role: "assistant" });
    const logs = await getRecentAdminActionLogs();
    expect(logs).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: "registration_approved", targetUserId: pendingUser.id, detail: "帳號已核准；通知信未能寄送" }),
      expect.objectContaining({ action: "role_changed", targetUserId: pendingUser.id, detail: "角色調整為 assistant" }),
    ]));
  });
});
