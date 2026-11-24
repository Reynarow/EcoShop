import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { verifyApiAdmin } from "@/lib/session";

/**
 * GET /api/products
 * Retrieves a list of all products from the database (Public).
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);

    return NextResponse.json(
      { error: "خطا در دریافت محصولات" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/products
 * Creates a new product in the database after validating the incoming request body.
 * Requires ADMIN authorization.
 */
export async function POST(request: Request) {
  // مرحله ۰: بررسی دسترسی و مجوز سطح مدیر (ADMIN)
  const authCheck = await verifyApiAdmin(request);
  if (authCheck.error) {
    return authCheck.error;
  }

  let body: unknown;

  // مرحله ۱: استخراج و بررسی فرمت JSON بدنه درخواست
  try {
    body = await request.json();
  } catch (error) {
    console.error("Invalid JSON format in request body:", error);

    return NextResponse.json(
      { error: "فرمت JSON ارسالی نامعتبر است" },
      { status: 400 },
    );
  }

  // مرحله ۲: اعتبارسنجی داده‌های ورودی با استفاده از Zod
  const validation = productSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: "اطلاعات وارد شده معتبر نیست",
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // مرحله ۳: ایجاد محصول در پایگاه داده با استفاده از داده‌های معتبر شده (validation.data)
  try {
    const product = await prisma.product.create({
      data: validation.data,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);

    return NextResponse.json(
      { error: "خطا در ایجاد محصول" },
      { status: 500 },
    );
  }
}
