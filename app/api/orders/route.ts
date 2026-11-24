import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiAuth } from "@/lib/session";
import { createOrderSchema } from "@/lib/validations/order";

/**
 * GET /api/orders
 * دریافت سفارشات:
 * - برای ادمین: همه سفارشات به ترتیب جدیدترین
 * - برای کاربر عادی: فقط سفارشات متعلق به خودش
 */
export async function GET(request: Request) {
  const authCheck = await verifyApiAuth(request);
  if (authCheck.error) {
    return authCheck.error;
  }

  const { user } = authCheck;

  try {
    const where = user.role === "ADMIN" ? {} : { userId: user.id };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "خطا در دریافت لیست سفارشات" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * ثبت سفارش جدید:
 * - کاربر باید لاگین باشد (استخراج شناسه کاربر از نشست مطمئن سرور)
 * - استعلام قیمت‌ها مستقیماً از دیتابیس (رد قیمت‌های ارسالی کلاینت)
 * - ثبت اتمیک سفارش و اقلام آن با Transaction
 */
export async function POST(request: Request) {
  // ۱. احراز هویت کاربر از سشن سرور
  const authCheck = await verifyApiAuth(request);
  if (authCheck.error) {
    return authCheck.error;
  }

  const { user } = authCheck;

  // ۲. دریافت و اعتبارسنجی بدنه درخواست با Zod
  let body: unknown;
  try {
    body = await request.json();
  } catch (err) {
    console.error("Invalid JSON in order POST:", err);
    return NextResponse.json(
      { error: "فرمت بدنه درخواست نامعتبر است" },
      { status: 400 }
    );
  }

  const validation = createOrderSchema.safeParse(body);
  if (!validation.success) {
    const flattened = validation.error.flatten();
    return NextResponse.json(
      {
        error: flattened.formErrors[0] || "اطلاعات ارسالی سفارش ناقص یا نامعتبر است",
        details: flattened.fieldErrors,
      },
      { status: 400 }
    );
  }

  const { items, customerName, phone, address, postalCode } = validation.data;

  // ۳. استخراج شناسه‌های محصولات و استعلام از دیتابیس
  const productIds = items.map((item) => item.productId);

  try {
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // ۴. اطمینان از وجود تمام محصولات در دیتابیس
    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          {
            error: `کالایی با شناسه ${item.productId} در فروشگاه موجود نیست یا حذف شده است.`,
          },
          { status: 400 }
        );
      }
    }

    // ۵. محاسبه کاملاً امن قیمت‌ها و اقلام بر اساس دیتابیس سرور
    let calculatedTotalPrice = 0;
    const orderItemsSnapshot = items.map((item) => {
      const dbProduct = productMap.get(item.productId)!;
      const unitPrice = dbProduct.price;
      const subtotal = unitPrice * item.quantity;
      calculatedTotalPrice += subtotal;

      return {
        productId: dbProduct.id,
        productName: dbProduct.name,
        productImage: dbProduct.image,
        unitPrice,
        quantity: item.quantity,
        subtotal,
      };
    });

    // ۶. اجرای تراکنش اتمیک (Prisma Transaction) برای ذخیره همزمان Order و OrderItemها
    const createdOrder = await prisma.$transaction(async (tx) => {
      return await tx.order.create({
        data: {
          userId: user.id, // استفاده از شناسه نشست سرور (نه داده ارسالی کلاینت)
          totalPrice: calculatedTotalPrice, // قیمت محاسبه‌شده دقیق سمت سرور
          customerName,
          phone,
          address,
          postalCode,
          status: "PENDING",
          items: {
            create: orderItemsSnapshot,
          },
        },
        include: {
          items: true,
        },
      });
    });

    return NextResponse.json(
      {
        message: "سفارش شما با موفقیت ثبت گردید.",
        order: createdOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation transaction error:", error);
    return NextResponse.json(
      { error: "خطایی در پردازش و ذخیره سفارش رخ داد. لطفاً مجدداً تلاش نمایید." },
      { status: 500 }
    );
  }
}
