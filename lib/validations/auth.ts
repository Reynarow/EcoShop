import { z } from "zod";

/**
 * اسکیمای اعتبارسنجی ثبت‌نام کاربر جدید
 */
export const registerSchema = z
  .object({
    name: z
      .string({ message: "نام و نام خانوادگی الزامی است" })
      .trim()
      .min(2, "نام باید حداقل ۲ حرف باشد")
      .max(50, "نام نمی‌تواند بیش از ۵۰ حرف باشد"),

    email: z
      .string({ message: "ایمیل الزامی است" })
      .trim()
      .email("فرمت ایمیل وارد شده نامعتبر است"),

    password: z
      .string({ message: "رمز عبور الزامی است" })
      .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
      .max(100, "رمز عبور نمی‌تواند بیش از ۱۰۰ کاراکتر باشد"),

    confirmPassword: z
      .string({ message: "تکرار رمز عبور الزامی است" })
      .min(1, "تکرار رمز عبور نمی‌تواند خالی باشد"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن مطابقت ندارند",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * اسکیمای اعتبارسنجی ورود کاربر
 */
export const loginSchema = z.object({
  email: z
    .string({ message: "ایمیل الزامی است" })
    .trim()
    .email("فرمت ایمیل وارد شده نامعتبر است"),

  password: z
    .string({ message: "رمز عبور الزامی است" })
    .min(1, "رمز عبور را وارد کنید"),

  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
