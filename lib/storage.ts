import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "products");

/**
 * اطمینان از وجود پوشه public/uploads/products روی سرور
 */
export async function ensureUploadsDir(): Promise<string> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  return UPLOADS_DIR;
}

/**
 * تشخیص فرمت واقعی تصویر بر اساس بایت‌های هدر (Magic Bytes)
 */
export function detectImageExtension(buffer: Buffer): "jpg" | "png" | "webp" | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }

  // WebP: RIFF ... WEBP
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }

  return null;
}

/**
 * ذخیره بافر تصویر روی حافظه دیسک سرور داخل پوشه public/uploads/products
 */
export async function saveImageToDisk(
  buffer: Buffer,
  extension: string
): Promise<string> {
  await ensureUploadsDir();

  const cleanExt = extension.startsWith(".") ? extension : `.${extension}`;
  const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${cleanExt}`;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  await fs.writeFile(filePath, buffer);

  // بازگرداندن مسیر قابل دسترس در وب
  return `/uploads/products/${uniqueName}`;
}

/**
 * حذف ایمن تصویر آپلود شده قبلی از روی دیسک سرور
 * فقط فایل‌هایی که در مسیر /uploads/ قرار دارند پاک می‌شوند (فایل‌های استاتیک اولیه /products/ پاک نخواهند شد).
 */
export async function deleteImageFromDisk(imageUrl: string | null | undefined): Promise<void> {
  if (!imageUrl || typeof imageUrl !== "string") return;
  if (!imageUrl.startsWith("/uploads/")) return;

  try {
    // جلوگیری از آسیب‌پذیری Directory Traversal
    const sanitizedUrl = path.normalize(imageUrl).replace(/^(\.\.[\/\\])+/, "");
    const relativePath = sanitizedUrl.startsWith(path.sep) ? sanitizedUrl.slice(1) : sanitizedUrl;
    const fullPath = path.join(process.cwd(), "public", relativePath);

    const publicUploads = path.join(process.cwd(), "public", "uploads");
    if (!fullPath.startsWith(publicUploads)) {
      console.warn("Forbidden path traversal attempt blocked:", imageUrl);
      return;
    }

    await fs.unlink(fullPath);
  } catch (err: unknown) {
    // اگر فایل قبلاً پاک شده یا وجود ندارد، خطایی پرتاب نمی‌کنیم
    const nodeError = err as { code?: string };
    if (nodeError.code !== "ENOENT") {
      console.error(`Failed to delete local uploaded image (${imageUrl}):`, err);
    }
  }
}
