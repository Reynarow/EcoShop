import { z } from "zod";

/**
 * آیتم‌های سبد خرید برای ثبت سفارش
 */
export const orderItemInputSchema = z.object({
  productId: z
    .number({ message: "شناسه محصول نامعتبر است" })
    .int("شناسه محصول باید عدد صحیح باشد")
    .positive("شناسه محصول باید بزرگتر از صفر باشد"),

  quantity: z
    .number({ message: "تعداد باید عدد باشد" })
    .int("تعداد باید یک عدد صحیح باشد")
    .positive("تعداد سفارش باید حداقل ۱ باشد")
    .max(100, "حداکثر تعداد مجاز برای هر کالا ۱۰۰ عدد می‌باشد"),
});

/**
 * اسکیمای اعتبارسنجی ثبت سفارش جدید در صفحه Checkout
 */
export const createOrderSchema = z.object({
  items: z
    .array(orderItemInputSchema, {
      message: "لیست اقلام سفارش نامعتبر است",
    })
    .min(1, "سبد خرید شما خالی است و نمی‌توان سفارشی ثبت کرد"),

  customerName: z
    .string({ message: "نام و نام خانوادگی تحویل‌گیرنده الزامی است" })
    .trim()
    .min(3, "نام تحویل‌گیرنده باید حداقل ۳ حرف باشد")
    .max(100, "نام نمی‌تواند بیش از ۱۰۰ حرف باشد"),

  phone: z
    .string({ message: "شماره تماس الزامی است" })
    .trim()
    .regex(
      /^09[0-9]{9}$/,
      "شماره تماس باید ۱۱ رقم بوده و با ۰۹ آغاز شود (مثال: ۰۹۱۲۳۴۵۶۷۸۹)"
    ),

  address: z
    .string({ message: "آدرس کامل پستی الزامی است" })
    .trim()
    .min(10, "آدرس پستی جهت ارسال دقیق باید حداقل ۱۰ حرف باشد")
    .max(500, "آدرس نمی‌تواند بیش از ۵۰۰ حرف باشد"),

  postalCode: z
    .string({ message: "کد پستی الزامی است" })
    .trim()
    .regex(/^[0-9]{10}$/, "کد پستی باید دقیقاً یک عدد ۱۰ رقمی باشد"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/**
 * اسکیمای تغییر وضعیت سفارش توسط مدیر
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
    {
      message: "وضعیت انتخابی نامعتبر است",
    }
  ),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
