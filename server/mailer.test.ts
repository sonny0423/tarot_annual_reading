import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const sendMail = vi.fn();
  const verify = vi.fn();
  return {
    sendMail,
    verify,
    createTransport: vi.fn(() => ({ sendMail, verify })),
  };
});

vi.mock("nodemailer", () => ({
  default: {
    createTransport: mocks.createTransport,
  },
}));

import { sendRegistrationApprovedEmail } from "./mailer";

describe("註冊核准通知信", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createTransport.mockImplementation(() => ({ sendMail: mocks.sendMail, verify: mocks.verify }));
    mocks.sendMail.mockResolvedValue({ messageId: "test-message" });
  });

  it("寄送帳號啟用通知並安全轉義使用者姓名", async () => {
    const result = await sendRegistrationApprovedEmail(
      "student@example.com",
      "小明 <測試>",
      "https://tn.richseedl.com/login",
    );

    expect(result).toBe(true);
    expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: "student@example.com",
      subject: "註冊申請已核准 - 塔羅流年運勢",
      html: expect.stringContaining("小明 &lt;測試&gt; 同學您好"),
    }));
    expect(mocks.sendMail.mock.calls[0]?.[0].html).toContain("https://tn.richseedl.com/login");
  });

  it("寄送服務失敗時回傳 false 而不拋出例外", async () => {
    mocks.sendMail.mockRejectedValueOnce(new Error("mailer unavailable"));
    await expect(sendRegistrationApprovedEmail("student@example.com", "學生", "https://example.com/login")).resolves.toBe(false);
  });
});
