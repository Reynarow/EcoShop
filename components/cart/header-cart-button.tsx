"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

const emptySubscribe = () => () => {};

/**
 * دکمه سبد خرید در نوار هدر
 * - در صورت خالی بودن سبد خرید (تعداد = ۰)، هیچ عددی نمایش داده نمی‌شود.
 * - با اضافه یا کم شدن کالا در سبد، تعداد کل اقلام به صورت زنده و پویا آپدیت می‌شود.
 * - با استفاده از useSyncExternalStore از خطای عدم تطابق هیدریشن (Hydration Mismatch) جلوگیری می‌شود.
 */
export default function HeaderCartButton() {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // اشتراک مستقیم به آرایه اقلام سبد خرید برای واکنش‌گرایی آنی به هرگونه تغییر
  const items = useCartStore((state) => state.items);

  // محاسبه مجموع تعداد کل اقلام سبد خرید
  const totalItems = isHydrated
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return (
    <Link
      href="/cart"
      className={buttonVariants({
        variant: "ghost",
        size: "icon",
        className: "relative rounded-xl cursor-pointer hover:bg-muted",
      })}
      aria-label="سبد خرید"
      title="مشاهده سبد خرید"
    >
      <ShoppingCart className="size-5" />

      {/* اگر تعداد اقلام بزرگتر از صفر باشد، بج تعداد نمایش داده می‌شود و در صورت صفر بودن هیچ عددی وجود ندارد */}
      {totalItems > 0 && (
        <span
          key={totalItems}
          className="absolute -top-1 -right-1 flex min-w-5 h-5 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs animate-in zoom-in duration-150"
        >
          {totalItems.toLocaleString("fa-IR")}
        </span>
      )}
    </Link>
  );
}
