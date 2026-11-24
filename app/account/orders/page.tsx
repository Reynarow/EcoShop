import Link from "next/link";
import Image from "next/image";
import { Package, Calendar, ChevronLeft, ShoppingBag } from "lucide-react";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatPersianDate, getOrderStatusInfo } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "سفارش‌های من | فروشگاه من",
  description: "مشاهده تاریخچه و وضعیت سفارش‌های ثبت شده در فروشگاه",
};

export default async function AccountOrdersPage() {
  const user = await requireAuth("/login?callbackUrl=/account/orders");

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* هدر صفحه */}
      <div className="flex flex-col gap-2 border-b border-border/60 pb-6 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <span className="size-2 rounded-full bg-primary" />
            <span>حساب کاربری</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
            سفارش‌های من
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            مشاهده وضعیت سفارش‌ها، پیگیری مرسولات و مشاهده فاکتور خریدها
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          تعداد سفارش‌ها:{" "}
          <span className="font-bold text-foreground">
            {orders.length.toLocaleString("fa-IR")}
          </span>
        </div>
      </div>

      {/* اگر سفارشی ثبت نشده باشد */}
      {orders.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 p-8 text-center bg-card/40">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-muted/70 text-muted-foreground mb-4">
            <Package className="size-10 stroke-[1.4] text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            هنوز هیچ سفارشی ثبت نکرده‌اید!
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
            محصولات متنوع فروشگاه ما را بررسی کنید و اولین سفارش خود را ثبت نمایید.
          </p>
          <Link
            href="/#products"
            className={buttonVariants({
              size: "lg",
              className: "mt-6 rounded-2xl gap-2 font-bold",
            })}
          >
            <ShoppingBag className="size-4" />
            <span>مشاهده و خرید محصولات</span>
          </Link>
        </div>
      ) : (
        /* لیست سفارش‌ها */
        <div className="space-y-5">
          {orders.map((order) => {
            const statusInfo = getOrderStatusInfo(order.status);
            const totalQuantity = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs transition hover:border-primary/40 hover:shadow-md"
              >
                {/* سربرگ کارت سفارش */}
                <div className="flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground">
                      شماره سفارش:
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground" dir="ltr">
                      #{order.id}
                    </span>

                    <span className="text-muted-foreground/40">•</span>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="size-3.5" />
                      <span>{formatPersianDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* پیش‌نمایش اقلام */}
                <div className="my-4 flex flex-wrap items-center gap-3">
                  {order.items.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted/40"
                      title={`${item.productName} (${item.quantity} عدد)`}
                    >
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          unoptimized
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground/40">
                          <Package className="size-6 stroke-[1.2]" />
                        </div>
                      )}
                      {item.quantity > 1 && (
                        <span className="absolute bottom-1 right-1 rounded-md bg-background/90 px-1 text-[10px] font-bold text-foreground shadow-xs">
                          {item.quantity.toLocaleString("fa-IR")}×
                        </span>
                      )}
                    </div>
                  ))}

                  {order.items.length > 5 && (
                    <div className="flex size-16 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 text-xs font-bold text-muted-foreground">
                      +{(order.items.length - 5).toLocaleString("fa-IR")} قلم
                    </div>
                  )}
                </div>

                {/* پاورقی کارت: تعداد، مبلغ و لینک مشاهده جزئیات */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between border-t border-border/40">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">
                      تعداد اقلام:{" "}
                      <span className="font-bold text-foreground">
                        {totalQuantity.toLocaleString("fa-IR")} عدد
                      </span>
                    </span>

                    <span className="text-muted-foreground">
                      مبلغ کل:{" "}
                      <span className="text-sm font-black text-foreground">
                        {formatPrice(order.totalPrice)}
                      </span>{" "}
                      تومان
                    </span>
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground group"
                  >
                    <span>مشاهده جزئیات سفارش</span>
                    <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
