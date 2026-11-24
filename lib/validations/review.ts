import { z } from "zod";

/**
 * اسکیمای اعتبارسنجی ثبت نظر و امتیاز محصول
 */
export const createReviewSchema = z.object({
  rating: z
    .number({ message: "لطفاً امتیاز عددی بین ۱ تا ۵ انتخاب کنید" })
    .int("امتیاز باید عدد صحیح باشد")
    .min(1, "حداقل امتیاز مجاز ۱ ستاره است")
    .max(5, "حداکثر امتیاز مجاز ۵ ستاره است"),

  comment: z
    .string({ message: "متن دیدگاه الزامی است" })
    .trim()
    .min(5, "متن دیدگاه باید حداقل ۵ حرف باشد")
    .max(1000, "متن دیدگاه نمی‌تواند بیشتر از ۱۰۰۰ حرف باشد"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
