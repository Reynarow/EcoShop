import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Package,
  Calendar,
  User,
  Phone,
  MapPin,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatPersianDate, getOrderStatusInfo } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return {
    title: `جزئیات سفارش #${id} | فروشگاه من`,
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    notFound();
  }

  const user = await requireAuth(`/login?callbackUrl=/account/orders/${id}`);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  // بررسی مالکیت سفارش: تنها کاربر صاحب سفارش یا ادمین اجازه مشاهده دارند
  if (order.userId !== user.id && user.role !== "ADMIN") {
    return (
      <main className="container mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
          <ShieldAlert className="size-8" />
        </div>
        <h1 className="text-xl font-bold text-foreground">عدم دسترسی به سفارش</h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          شما اجازه دسترسی و مشاهده اطلاعات این سفارش را ندارید.
        </p>
        <Link
          href="/account/orders"
          className={buttonVariants({
            variant: "outline",
            className: "mt-6 rounded-xl",
          })}
        >
          <span>بازگشت به لیست سفارش‌ها</span>
        </Link>
      </main>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status);
  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      {/* دکمه بازگشت */}
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          <span>بازگشت به لیست سفارش‌های من</span>
        </Link>
      </div>

      {/* کارت سربرگ سفارش */}
      <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
              <Package className="size-3.5" />
              <span>فاکتور رسمی سفارش</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">
              سفارش <span className="font-mono text-base font-bold text-muted-foreground" dir="ltr">#{order.id}</span>
            </h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>ثبت شده در: {formatPersianDate(order.createdAt)}</span>
            </div>
          </div>

          <div>
            <span
              className={`inline-flex items-center rounded-2xl border px-3.5 py-1.5 text-xs font-bold ${statusInfo.color}`}
            >
              وضعیت: {statusInfo.label}
            </span>
          </div>
        </div>

        {/* مشخصات تحویل گیرنده */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <User className="size-4 text-primary shrink-0" />
            <span>نام تحویل‌گیرنده:</span>
            <span className="font-bold text-foreground">{order.customerName}</span>
          </div>

          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Phone className="size-4 text-primary shrink-0" />
            <span>شماره تماس:</span>
            <span className="font-bold text-foreground font-mono" dir="ltr">{order.phone}</span>
          </div>

          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Mail className="size-4 text-primary shrink-0" />
            <span>کد پستی:</span>
            <span className="font-bold text-foreground font-mono" dir="ltr">{order.postalCode}</span>
          </div>

          <div className="flex items-start gap-2.5 text-muted-foreground sm:col-span-2">
            <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
            <span>آدرس کامل:</span>
            <span className="font-medium text-foreground leading-relaxed">{order.address}</span>
          </div>
        </div>
      </div>

      {/* اقلام خریداری شده */}
      <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs mb-6">
        <h2 className="text-base font-bold text-foreground border-b border-border/50 pb-4 mb-4">
          اقلام سفارش ({totalItemsCount.toLocaleString("fa-IR")} عدد)
        </h2>

        <div className="divide-y divide-border/40">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      unoptimized
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground/40">
                      <Package className="size-7 stroke-[1.2]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-foreground line-clamp-2">
                    {item.productName}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1 text-xs text-muted-foreground">
                    <span>قیمت واحد در زمان خرید:</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(item.unitPrice)}
                    </span>
                    <span>تومان</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 text-xs border-t sm:border-t-0 border-border/30 pt-2 sm:pt-0">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span>تعداد:</span>
                  <span className="font-bold text-foreground">
                    {item.quantity.toLocaleString("fa-IR")} عدد
                  </span>
                </div>

                <div className="text-left min-w-28">
                  <span className="text-muted-foreground block text-[11px]">مبلغ کل قلم:</span>
                  <span className="text-sm font-black text-foreground">
                    {formatPrice(item.subtotal)}
                  </span>
                  <span className="text-[11px] text-muted-foreground mr-1">تومان</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* خلاصه مالی فاکتور */}
      <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs">
        <h2 className="text-base font-bold text-foreground border-b border-border/50 pb-3 mb-4">
          خلاصه پرداخت
        </h2>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>مجموع اقلام ({totalItemsCount.toLocaleString("fa-IR")} کالا):</span>
            <span className="font-semibold text-foreground">
              {formatPrice(order.totalPrice)} تومان
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span>هزینه ارسال پستی:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              رایگان
            </span>
          </div>

          <div className="border-t border-border/60 pt-4 flex items-baseline justify-between">
            <span className="text-base font-black text-foreground">
              مبلغ کل فاکتور:
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-foreground">
                {formatPrice(order.totalPrice)}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                تومان
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
