import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createEmailUser,
  deleteUser,
  getAllUsers,
  getPendingRegistrationApplications,
  getUserByEmail,
  updateUserApprovalStatus,
} from "./db";

const approvedEmail = `admin_search_approved_${Date.now()}@example.com`;
const pendingEmail = `admin_search_pending_${Date.now()}@example.com`;

async function removeTestUser(email: string) {
  const user = await getUserByEmail(email);
  if (user) await deleteUser(user.id);
}

describe("管理員使用者搜尋", () => {
  beforeAll(async () => {
    await removeTestUser(approvedEmail);
    await removeTestUser(pendingEmail);

    const approvedId = await createEmailUser(approvedEmail, "test-password-hash", "搜尋核准使用者", "approved");
    await updateUserApprovalStatus(approvedId, "approved", 1);
    await createEmailUser(pendingEmail, "test-password-hash", "搜尋待審核使用者", "pending");
  });

  afterAll(async () => {
    await removeTestUser(approvedEmail);
    await removeTestUser(pendingEmail);
  });

  it("可依姓名或 Email 跨頁篩選既有使用者", async () => {
    const byName = await getAllUsers(1, 20, "搜尋核准使用者");
    expect(byName.total).toBe(1);
    expect(byName.users[0]).toMatchObject({ email: approvedEmail, name: "搜尋核准使用者" });

    const byEmail = await getAllUsers(1, 20, "admin_search_approved_");
    expect(byEmail.total).toBe(1);
    expect(byEmail.users[0]?.email).toBe(approvedEmail);
  });

  it("可依姓名或 Email 篩選待審核註冊申請", async () => {
    const byName = await getPendingRegistrationApplications("搜尋待審核使用者");
    expect(byName).toHaveLength(1);
    expect(byName[0]).toMatchObject({ email: pendingEmail, name: "搜尋待審核使用者" });

    const byEmail = await getPendingRegistrationApplications("admin_search_pending_");
    expect(byEmail).toHaveLength(1);
    expect(byEmail[0]?.email).toBe(pendingEmail);
  });
});
