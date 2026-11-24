import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiAuth } from "@/lib/session";
import { createReviewSchema } from "@/lib/validations/review";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function parseProductId(paramsPromise: Promise<{ id: string }>): Promise<number | null> {
  const { id } = await paramsPromise;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }
  return productId;
}

/**
 * GET /api/products/[id]/reviews
 * دریافت لیست دیدگاه‌ها و میانگین امتیاز محصول (عمومی)
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const productId = await parseProductId(params);
  if (productId === null) {
    return NextResponse.json(
      { error: "شناسه محصول نامعتبر است" },
      { status: 400 }
    );
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            ).toFixed(1)
          )
        : 0;

    return NextResponse.json(
      {
        reviews,
        totalReviews,
        averageRating,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch product reviews:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دیدگاه‌های محصول" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/[id]/reviews
 * ثبت دیدگاه جدید توسط کاربر احراز هویت شده
 */
export async function POST(request: Request, { params }: RouteContext) {
  const authCheck = await verifyApiAuth(request);
  if (authCheck.error) {
    return authCheck.error;
  }

  const { user } = authCheck;
  const productId = await parseProductId(params);

  if (productId === null) {
    return NextResponse.json(
      { error: "شناسه محصول نامعتبر است" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "فرمت داده‌های ارسالی نامعتبر است" },
      { status: 400 }
    );
  }

  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "اطلاعات ورودی نامعتبر است";
    return NextResponse.json(
      {
        error: firstIssue,
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!productExists) {
      return NextResponse.json(
        { error: "محصول مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    const createdReview = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(createdReview, { status: 201 });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json(
      { error: "خطای سرور هنگام ثبت دیدگاه" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]/reviews?reviewId=123
 * حذف دیدگاه توسط نویسنده آن یا مدیر سیستم
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  const authCheck = await verifyApiAuth(request);
  if (authCheck.error) {
    return authCheck.error;
  }

  const { user } = authCheck;
  const productId = await parseProductId(params);

  if (productId === null) {
    return NextResponse.json(
      { error: "شناسه محصول نامعتبر است" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const reviewId = Number(searchParams.get("reviewId"));

  if (!Number.isInteger(reviewId) || reviewId <= 0) {
    return NextResponse.json(
      { error: "شناسه دیدگاه نامعتبر است" },
      { status: 400 }
    );
  }

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview || existingReview.productId !== productId) {
      return NextResponse.json(
        { error: "دیدگاه مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    if (existingReview.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "شما اجازه حذف این دیدگاه را ندارید" },
        { status: 403 }
      );
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: "دیدگاه با موفقیت حذف شد" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete review:", error);
    return NextResponse.json(
      { error: "خطا در حذف دیدگاه" },
      { status: 500 }
    );
  }
}
