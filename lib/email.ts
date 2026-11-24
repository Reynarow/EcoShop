import nodemailer from "nodemailer";

interface SendOtpEmailParams {
  to: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}

/**
 * ارسال ایمیل حاوی کد ۶ رقمی فعال‌سازی / تایید حساب کاربری
 */
export async function sendVerificationOtpEmail({
  to,
  otp,
  type,
}: SendOtpEmailParams) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || "465");
  const smtpFrom = process.env.SMTP_FROM || `"فروشگاه من" <${smtpUser || "noreply@example.com"}>`;

  // در محیط لوکال اگر تنظیمات ایمیل هنوز وارد نشده باشد، کد در کنسول سرور چاپ می‌شود
  if (!smtpUser || !smtpPass) {
    console.warn(
      `\n========================================\n` +
        `[EMAIL DEV FALLBACK - SMTP تنظیم نشده است]\n` +
        `گیرنده: ${to}\n` +
        `نوع: ${type}\n` +
        `کد تایید (OTP): ${otp}\n` +
        `========================================\n`
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const subjectMap: Record<SendOtpEmailParams["type"], string> = {
    "email-verification": "کد فعال‌سازی حساب کاربری | فروشگاه من",
    "sign-in": "کد ورود به حساب کاربری | فروشگاه من",
    "forget-password": "کد بازیابی رمز عبور | فروشگاه من",
    "change-email": "کد تغییر ایمیل | فروشگاه من",
  };

  const titleMap: Record<SendOtpEmailParams["type"], string> = {
    "email-verification": "تایید و فعال‌سازی حساب کاربری",
    "sign-in": "ورود با کد یکبار مصرف",
    "forget-password": "بازیابی رمز عبور",
    "change-email": "تایید تغییر ایمیل",
  };

  const html = `
    <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 32px 16px; color: #0f172a;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
        <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #0f172a; text-align: center;">
          فروشگاه من
        </h1>
        <p style="margin: 0 0 24px; font-size: 14px; color: #475569; text-align: center;">
          ${titleMap[type]}
        </p>

        <div style="background-color: #f1f5f9; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
            کد فعال‌سازی ۶ رقمی شما:
          </p>
          <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a; direction: ltr;">
            ${otp}
          </div>
        </div>

        <p style="margin: 0 0 12px; font-size: 13px; line-height: 1.7; color: #475569;">
          لطفاً این کد را در صفحه فعال‌سازی وارد کنید. این کد تا <strong>۵ دقیقه</strong> دیگر معتبر است.
        </p>
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          اگر شما این درخواست را ثبت نکرده‌اید، این ایمیل را نادیده بگیرید.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject: subjectMap[type],
    html,
  });
}
