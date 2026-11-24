"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Check, ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartProduct } from "@/stores/cart-store";

type AddToCartButtonProps = {
  product: CartProduct;
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);

    // افزودن کالا به استور Zustand با تعداد انتخاب شده
    addItem(product, quantity);

    setIsAdded(true);
    setShowNotification(true);

    // بازنشانی وضعیت دکمه پس از ۱.۵ ثانیه
    setTimeout(() => {
      setIsAdded(false);
      setIsAdding(false);
    }, 1500);

    // پنهان کردن اعلان پس از ۴.۵ ثانیه
    setTimeout(() => {
      setShowNotification(false);
    }, 4500);
  };

  return (
    <div className="relative w-full space-y-3">
      <div className="flex items-center gap-3">
        {/* استپر انتخاب تعداد */}
        <div className="flex items-center rounded-2xl border border-border/80 bg-muted/40 p-1 shrink-0">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="flex size-9 items-center justify-center rounded-xl bg-background text-foreground shadow-xs transition hover:bg-primary hover:text-primary-foreground cursor-pointer"
            title="افزایش تعداد"
            aria-label="افزایش تعداد"
          >
            <Plus className="size-4" />
          </button>

          <span className="w-10 text-center text-sm font-bold text-foreground">
            {quantity.toLocaleString("fa-IR")}
          </span>

          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="flex size-9 items-center justify-center rounded-xl bg-background text-foreground shadow-xs transition hover:bg-destructive hover:text-white cursor-pointer disabled:opacity-40"
            title="کاهش تعداد"
            aria-label="کاهش تعداد"
          >
            <Minus className="size-4" />
          </button>
        </div>

        {/* دکمه افزودن به سبد خرید */}
        <Button
          type="button"
          size="lg"
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`flex-1 rounded-2xl text-base font-bold gap-2 py-6 cursor-pointer shadow-xs transition-all duration-300 ${
            isAdded
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="size-5 animate-in zoom-in duration-200" />
              <span>به سبد خرید اضافه شد</span>
            </>
          ) : (
            <>
              <ShoppingCart className="size-5" />
              <span>افزودن به سبد خرید</span>
            </>
          )}
        </Button>
      </div>

      {/* اعلان تایید موفقیت با پیوند به سبد خرید */}
      {showNotification && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 truncate">
            <Check className="size-4 shrink-0 text-emerald-600" />
            <span className="truncate">
              «{product.name}» ({quantity.toLocaleString("fa-IR")} عدد) به سبد خرید اضافه شد.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/cart"
              className="flex items-center gap-1 font-bold text-primary underline underline-offset-4 hover:opacity-80"
            >
              <span>مشاهده سبد</span>
              <ArrowLeft className="size-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
