import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiAuth, verifyApiAdmin } from "@/lib/session";
import { updateOrderStatusSchema } from "@/lib/validations/order";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function parseOrderId(paramsPromise: Promise<{ id: string }>): Promise<number | null> {
  const { id } = await paramsPromise;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return null;
  }

  return orderId;
}

/**
 * GET /api/orders/[id]
 * دریافت جزئیات یک سفارش
 * - فقط صاحب سفارش یا مدیر سیستم حق مشاهده آن را دارند
 */
export async function GET(request: Request, { params }: RouteContext) {
  const authCheck = await verifyApiAuth(request);
  if (authCheck.error) {
    return authCheck.error;
  }

  const { user } = authCheck;
  const orderId = await parseOrderId(params);

  if (orderId === null) {
    return NextResponse.json(
      { error: "شناسه سفارش نامعتبر است" },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "سفارش مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    // بررسی مالکیت سفارش: فقط کاربر صاحب سفارش یا مدیر اجازه دیدن دارند
    if (order.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "شما اجازه دسترسی به این سفارش را ندارید" },
        { status: 403 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات سفارش" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * تغییر وضعیت سفارش (فقط ADMIN)
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  const authCheck = await verifyApiAdmin(request);
  if (authCheck.error) {
    return authCheck.error;
  }

  const orderId = await parseOrderId(params);
  if (orderId === null) {
    return NextResponse.json(
      { error: "شناسه سفارش نامعتبر است" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (err) {
    console.error("Invalid JSON in PATCH order:", err);
    return NextResponse.json(
      { error: "فرمت بدنه درخواست نامعتبر است" },
      { status: 400 }
    );
  }

  const validation = updateOrderStatusSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "وضعیت انتخابی نامعتبر است" },
      { status: 400 }
    );
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: validation.data.status,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(
      {
        message: "وضعیت سفارش با موفقیت به‌روزرسانی شد",
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "سفارش مورد نظر یافت نشد" },
        { status: 404 }
      );
    }
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی وضعیت سفارش" },
      { status: 500 }
    );
  }
}
