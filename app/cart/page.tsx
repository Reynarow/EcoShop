"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore, useCartHydrated } from "@/stores/cart-store";

export default function CartPage() {
  const items = useCartHydrated((state) => state.items, []);
  const isHydrated = useCartHydrated(() => true, false);

  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  // محاسبه مجموع تعداد و مبلغ
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // حالت انتظار برای هیدریشن اولیه جهت جلوگیری از عدم تطابق کلاینت و سرور
  if (!isHydrated) {
    return (
      <main className="container mx-auto px-4 py-10 md:py-16 max-w-6xl">
        <div className="h-8 w-48 rounded-xl bg-muted/60 animate-pulse mb-8" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-3xl border border-border/60 bg-card p-4 animate-pulse"
              />
            ))}
          </div>
          <div className="h-64 rounded-3xl border border-border/60 bg-card p-6 animate-pulse" />
        </div>
      </main>
    );
  }

  // حالت خالی بودن سبد خرید
  if (items.length === 0) {
    return (
      <main className="container mx-auto flex min-h-[65vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex size-24 items-center justify-center rounded-3xl bg-muted/60 text-muted-foreground mb-6 shadow-xs">
          <ShoppingBag className="size-12 stroke-[1.4] text-primary" />
        </div>

        <h1 className="text-2xl font-black text-foreground sm:text-3xl">
          سبد خرید شما خالی است!
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          هنوز هیچ کالایی به سبد خرید خود اضافه نکرده‌اید. برای مشاهده محصولات متنوع به فروشگاه بروید.
        </p>

        <div className="mt-8">
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 hover:shadow-md cursor-pointer"
          >
            <ArrowRight className="size-4" />
            <span>مشاهده و خرید محصولات</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      {/* هدر صفحه سبد خرید */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-border/60 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <span className="size-2 rounded-full bg-primary" />
            <span>خرید آنلاین</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
            سبد خرید شما
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">
            تعداد اقلام:{" "}
            <span className="font-bold text-foreground">
              {totalItems.toLocaleString("fa-IR")} عدد
            </span>
          </span>

          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline cursor-pointer transition-colors"
          >
            <Trash2 className="size-3.5" />
            <span>خالی کردن سبد</span>
          </button>
        </div>
      </div>

      {/* چیدمان دو ستونه ریسپانسیو: لیست اقلام در راست و صورتحساب در چپ */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
        {/* ستون اول: لیست کالاهای سبد خرید */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemTotalPrice = item.product.price * item.quantity;

            return (
              <div
                key={item.product.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/30"
              >
                {/* بخش عکس و مشخصات کالا */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* عکس محصول */}
                  <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-2xl bg-muted/40 border border-border/50">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        unoptimized
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground/40">
                        <Package className="size-8 stroke-[1.2]" />
                      </div>
                    )}
                  </div>

                  {/* نام، قیمت واحد و لینک کالا */}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>

                    <div className="mt-1 flex items-baseline gap-1 text-xs text-muted-foreground">
                      <span>قیمت واحد:</span>
                      <span className="font-semibold text-foreground">
                        {formatPrice(item.product.price)}
                      </span>
                      <span>تومان</span>
                    </div>

                    <div className="mt-2 text-xs font-bold text-primary sm:hidden">
                      مجموع: {formatPrice(itemTotalPrice)} تومان
                    </div>
                  </div>
                </div>

                {/* بخش کنترل تعداد و مجموع قیمت کالا */}
                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
                  {/* استپر کنترل تعداد (+ و -) */}
                  <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 p-1">
                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.product.id)}
                      className="flex size-7 items-center justify-center rounded-xl bg-background text-foreground shadow-xs transition hover:bg-primary hover:text-primary-foreground cursor-pointer"
                      title="افزایش تعداد"
                      aria-label="افزایش تعداد"
                    >
                      <Plus className="size-3.5" />
                    </button>

                    <span className="w-8 text-center text-xs font-bold text-foreground">
                      {item.quantity.toLocaleString("fa-IR")}
                    </span>

                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.product.id)}
                      className="flex size-7 items-center justify-center rounded-xl bg-background text-foreground shadow-xs transition hover:bg-destructive hover:text-white cursor-pointer"
                      title="کاهش تعداد"
                      aria-label="کاهش تعداد"
                    >
                      <Minus className="size-3.5" />
                    </button>
                  </div>

                  {/* مجموع قیمت این کالا در دسکتاپ */}
                  <div className="hidden sm:block text-left min-w-28">
                    <span className="text-sm font-black text-foreground">
                      {formatPrice(itemTotalPrice)}
                    </span>
                    <span className="text-xs text-muted-foreground mr-1">تومان</span>
                  </div>

                  {/* دکمه حذف کامل کالا */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    title="حذف از سبد"
                    aria-label="حذف این کالا از سبد"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* لینک ادامه خرید در پایین لیست */}
          <div className="pt-2">
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              <span>ادامه خرید و مشاهده سایر کالاها</span>
            </Link>
          </div>
        </div>

        {/* ستون دوم: کارت خلاصه سفارش و فاکتور */}
        <div className="sticky top-24 rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-foreground border-b border-border/50 pb-3">
            خلاصه سفارش
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>تعداد کل اقلام:</span>
              <span className="font-semibold text-foreground">
                {totalItems.toLocaleString("fa-IR")} عدد
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>قیمت محصولات:</span>
              <span className="font-semibold text-foreground">
                {formatPrice(totalPrice)} تومان
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>هزینه ارسال:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                رایگان
              </span>
            </div>

            <div className="border-t border-border/60 pt-3 flex items-baseline justify-between">
              <span className="text-base font-bold text-foreground">
                مبلغ قابل پرداخت:
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-foreground">
                  {formatPrice(totalPrice)}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  تومان
                </span>
              </div>
            </div>
          </div>

          {/* دکمه ثبت سفارش نهایی */}
          <Link
            href="/checkout"
            className={buttonVariants({
              size: "lg",
              className:
                "w-full rounded-2xl py-6 font-bold text-base gap-2 cursor-pointer shadow-xs hover:shadow-md",
            })}
          >
            <CheckCircle2 className="size-5" />
            <span>ثبت نهایی و ادامه سفارش</span>
          </Link>

          {/* ویژگی‌ها و مزایای خرید */}
          <div className="border-t border-border/50 pt-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span>ضمانت اصالت و کیفیت کالاها</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-primary shrink-0" />
              <span>ارسال سریع سفارش به سراسر کشور</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="size-4 text-primary shrink-0" />
              <span>۷ روز ضمانت بازگشت وجه</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
