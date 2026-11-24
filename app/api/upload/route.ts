import { NextResponse } from "next/server";
import { detectImageExtension, saveImageToDisk } from "@/lib/storage";
import { verifyApiAdmin } from "@/lib/session";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // حداکثر ۵ مگابایت
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * POST /api/upload
 * آپلود و ذخیره فایل تصویر مستقیماً روی سرور محلی (فقط ADMIN)
 */
export async function POST(request: Request) {
  // ۰. بررسی دسترسی مدیر
  const authCheck = await verifyApiAdmin(request);
  if (authCheck.error) {
    return authCheck.error;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    // ۱. بررسی وجود فایل در درخواست
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "هیچ فایلی برای آپلود ارسال نشده است." },
        { status: 400 }
      );
    }

    // ۲. بررسی اندازه فایل (حداکثر ۵ مگابایت)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "حجم فایل تصویر بیش از حد مجاز است (حداکثر ۵ مگابایت)." },
        { status: 400 }
      );
    }

    // ۳. بررسی MIME Type مجاز
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "فرمت تصویر نامعتبر است. فقط فرمت‌های JPEG، PNG و WebP مجاز می‌باشند.",
        },
        { status: 400 }
      );
    }

    // ۴. اعتبارسنجی بایت‌های واقعی فایل در سمت سرور
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const detectedExt = detectImageExtension(buffer);
    if (!detectedExt) {
      return NextResponse.json(
        {
          error: "محتوای فایل نامعتبر است و با ساختار تصویر واقعی تطابق ندارد.",
        },
        { status: 400 }
      );
    }

    // ۵. ذخیره فایل روی دیسک سرور
    const fileUrl = await saveImageToDisk(buffer, detectedExt);

    return NextResponse.json(
      {
        url: fileUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Local upload error:", error);

    return NextResponse.json(
      { error: "خطا در پردازش و ذخیره تصویر روی سرور" },
      { status: 500 }
    );
  }
}
