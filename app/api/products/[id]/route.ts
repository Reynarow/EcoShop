import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/lib/validations/product";
import { deleteImageFromDisk } from "@/lib/storage";
import { verifyApiAdmin } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * تابع کمکی برای استخراج و اعتبارسنجی شناسه محصول از پارامترهای مسیر.
 * شناسه باید یک عدد صحیح مثبت معتبر باشد.
 */
async function parseProductId(paramsPromise: Promise<{ id: string }>): Promise<number | null> {
  const { id } = await paramsPromise;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  return productId;
}

/**
 * GET /api/products/[id]
 * دریافت مشخصات یک محصول بر اساس شناسه (ID)
 */
export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const productId = await parseProductId(params);

    if (productId === null) {
      return NextResponse.json(
        { error: "شناسه محصول نامعتبر است (باید عدد صحیح مثبت باشد)" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "محصول مورد نظر یافت نشد" },
        { status: 404 },
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch product:", error);

    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات محصول" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/products/[id]
 * ویرایش جزئی اطلاعات یک محصول (فقط ADMIN)
 */
export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  // ۰. بررسی دسترسی مدیر
  const authCheck = await verifyApiAdmin(request);
  if (authCheck.error) {
    return authCheck.error;
  }

  // ۱. اعتبارسنجی شناسه محصول
  const productId = await parseProductId(params);

  if (productId === null) {
    return NextResponse.json(
      { error: "شناسه محصول نامعتبر است (باید عدد صحیح مثبت باشد)" },
      { status: 400 },
    );
  }

  // ۲. استخراج و بررسی ساختار JSON درخواست
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Invalid JSON format in PATCH request:", error);

    return NextResponse.json(
      { error: "فرمت JSON ارسالی نامعتبر است" },
      { status: 400 },
    );
  }

  // ۳. اعتبارسنجی داده‌های ارسالی با Zod
  const validation = updateProductSchema.safeParse(body);

  if (!validation.success) {
    const flattened = validation.error.flatten();

    return NextResponse.json(
      {
        error: flattened.formErrors[0] || "اطلاعات وارد شده معتبر نیست",
        details: flattened.fieldErrors,
      },
      { status: 400 },
    );
  }

  // ۴. به‌روزرسانی محصول در دیتابیس با داده‌های تایید شده
  try {
    // در صورت تغییر تصویر، تصویر قبلی را جهت حذف ایمن از سرور دریافت می‌کنیم
    let previousImage: string | null = null;
    if (validation.data.image !== undefined) {
      const existing = await prisma.product.findUnique({
        where: { id: productId },
        select: { image: true },
      });
      previousImage = existing?.image || null;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: validation.data,
    });

    // حذف ایمن تصویر قبلی آپلود شده روی سرور پس از موفقیت ذخیره‌سازی در دیتابیس
    if (previousImage && previousImage !== validation.data.image) {
      deleteImageFromDisk(previousImage).catch((e) =>
        console.error("Cleanup old local image error:", e)
      );
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    // کد P2025 در پریزما به معنای عدم وجود ردیف مورد نظر در دیتابیس است
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "محصول مورد نظر یافت نشد" },
        { status: 404 },
      );
    }

    console.error("Failed to update product:", error);

    return NextResponse.json(
      { error: "خطا در به‌روزرسانی محصول" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/products/[id]
 * حذف یک محصول بر اساس شناسه (ID) (فقط ADMIN)
 */
export async function DELETE(
  request: Request,
  { params }: RouteContext,
) {
  // ۰. بررسی دسترسی مدیر
  const authCheck = await verifyApiAdmin(request);
  if (authCheck.error) {
    return authCheck.error;
  }

  // ۱. اعتبارسنجی شناسه محصول
  const productId = await parseProductId(params);

  if (productId === null) {
    return NextResponse.json(
      { error: "شناسه محصول نامعتبر است (باید عدد صحیح مثبت باشد)" },
      { status: 400 },
    );
  }

  // ۲. حذف محصول از پایگاه داده
  try {
    const deletedProduct = await prisma.product.delete({
      where: { id: productId },
    });

    // حذف تصویر کالا از سرور در صورت محلی بودن تصویر آپلود شده
    if (deletedProduct.image) {
      deleteImageFromDisk(deletedProduct.image).catch((e) =>
        console.error("Cleanup deleted local image error:", e)
      );
    }

    return NextResponse.json(
      {
        message: "محصول با موفقیت حذف شد",
        product: deletedProduct,
      },
      { status: 200 },
    );
  } catch (error) {
    // کد P2025 در پریزما به معنای عدم وجود ردیف مورد نظر در دیتابیس است
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "محصول مورد نظر یافت نشد" },
        { status: 404 },
      );
    }

    console.error("Failed to delete product:", error);

    return NextResponse.json(
      { error: "خطا در حذف محصول" },
      { status: 500 },
    );
  }
}
