import { z } from "zod";

/**
 * اسکیما برای اعتبارسنجی ایجاد محصول جدید (POST)
 */
export const productSchema = z.object({
  name: z
    .string({ message: "نام محصول الزامی است" })
    .trim()
    .min(1, "نام محصول نمی‌تواند خالی باشد"),

  description: z.string().optional(),

  price: z
    .number({ message: "قیمت الزامی است و باید عدد باشد" })
    .int("قیمت باید عدد صحیح باشد")
    .positive("قیمت باید بیشتر از صفر باشد"),

  image: z.string().optional(),
});

/**
 * اسکیما برای اعتبارسنجی ویرایش جزئی محصول (PATCH)
 * فیلدها اختیاری هستند اما حداقل یک فیلد باید ارسال شود.
 */
export const updateProductSchema = productSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "حداقل یکی از مشخصات محصول باید برای به‌روزرسانی ارسال شود",
  });

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
