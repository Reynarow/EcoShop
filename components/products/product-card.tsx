"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Eye,
  ShoppingCart,
  Check,
  Star,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

export type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type ProductCardProps = {
  product: Product;
};

/**
 * کامپوننت پیشرفته کارت محصول (Advanced Product Card)
 * ویژگی‌ها:
 * - بج‌های وضعیت («ارسال رایگان»، «تضمین اصالت»)
 * - امتیاز و ستاره‌های محصول
 * - افزودن سریع به سبد خرید از روی کارت (Quick Add to Cart) با فیدبک بصری فوری
 * - افکت‌های نوری و ترنزیشن‌های نرم روی هاور
 */
export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(product, 1);
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card p-3.5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
      <div>
        {/* بخش بالای کارت: تصویر، بج‌های ویژه و اقدامات سریع */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/30 border border-border/40">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground/60 transition-colors group-hover:bg-muted/60">
              <Package className="size-12 stroke-[1.2] text-muted-foreground/40" />
              <span className="text-[11px] font-medium text-muted-foreground/60">
                بدون تصویر
              </span>
            </div>
          )}

          {/* بج ویژگی‌های کالا (ارسال رایگان / ضمانت) */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shadow-xs backdrop-blur-xs border border-border/50">
              <Truck className="size-3" />
              <span>ارسال رایگان</span>
            </span>
          </div>

          {/* امتیاز ستاره‌ای در گوشه چپ */}
          <div className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold text-amber-500 shadow-xs backdrop-blur-xs border border-border/50">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span>۴.۸</span>
          </div>

          {/* دکمه پیش‌نمایش سریع روی تصویر در هاور */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <span className="rounded-2xl bg-background/90 px-3 py-1.5 text-xs font-bold text-foreground shadow-md backdrop-blur-sm flex items-center gap-1.5 transition-transform duration-300 scale-90 group-hover:scale-100">
              <Eye className="size-3.5 text-primary" />
              <span>مشاهده جزئیات</span>
            </span>
          </div>
        </div>

        {/* مشخصات محصول */}
        <div className="pt-3.5 pb-2">
          {/* عنوان محصول */}
          <h3 className="line-clamp-2 text-sm font-bold text-foreground transition-colors group-hover:text-primary leading-snug">
            <Link
              href={`/products/${product.id}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {product.name}
            </Link>
          </h3>

          {/* توضیحات مختصر کالا */}
          {product.description && (
            <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
              {product.description}
            </p>
          )}

          {/* ویژگی تحویل اکسپرس */}
          <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3 text-primary shrink-0" />
            <span>ضمانت اصالت و سلامت فیزیکی</span>
          </div>
        </div>
      </div>

      {/* بخش پایین کارت: قیمت و دکمه افزودن سریع */}
      <div className="mt-3 border-t border-border/50 pt-3">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-[11px] font-medium text-muted-foreground">قیمت:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-foreground">
              {formatPrice(product.price)}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              تومان
            </span>
          </div>
        </div>

        {/* دکمه‌های عملیات: افزودن سریع به سبد خرید */}
        <div className="relative z-10 flex items-center gap-2">
          <Button
            type="button"
            onClick={handleQuickAdd}
            className={`w-full rounded-xl text-xs font-bold gap-1.5 h-9 transition-all duration-300 cursor-pointer ${
              isAdded
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs hover:shadow-md"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="size-4 animate-in zoom-in duration-200" />
                <span>به سبد اضافه شد</span>
              </>
            ) : (
              <>
                <ShoppingCart className="size-4" />
                <span>افزودن به سبد</span>
              </>
            )}
          </Button>

          <Link
            href={`/products/${product.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "size-9 shrink-0 p-0 rounded-xl border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            )}
            title="مشاهده مشخصات کامل"
            aria-label="مشاهده مشخصات کامل"
          >
            <Eye className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
