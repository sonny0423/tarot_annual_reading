import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(
  toEmail: string,
  resetUrl: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"塔羅流年運勢" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: "重設您的密碼 - 塔羅流年運勢",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #faf5ff; border-radius: 12px;">
          <h2 style="color: #7c3aed; margin-bottom: 8px;">塔羅流年運勢</h2>
          <h3 style="color: #1f2937; margin-bottom: 16px;">重設密碼請求</h3>
          <p style="color: #4b5563; line-height: 1.6;">
            我們收到了您的密碼重設請求。請點擊下方按鈕重設您的密碼：
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed, #d97706); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              重設密碼
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            此連結將在 <strong>1 小時</strong>後失效。<br/>
            如果您沒有提出此請求，請忽略此郵件，您的密碼不會被更改。
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            塔羅流年運勢查詢系統 · 探索內在智慧，洞察人生運勢
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[Mailer] Failed to send email:", error);
    return false;
  }
}

export async function verifyMailerConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}
