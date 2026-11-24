"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Award, Package, ArrowUpRight } from "lucide-react";

interface TopProduct {
  id: number | null;
  name: string;
  image: string | null;
  totalQuantity: number;
  totalRevenue: number;
}

interface TopProductsChartProps {
  products: TopProduct[];
}

export default function TopProductsChart({ products }: TopProductsChartProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card p-6 shadow-xs h-full min-h-[260px]">
        <Package className="size-10 text-muted-foreground/40 mb-2" />
        <p className="text-xs font-semibold text-muted-foreground">هنوز کالایی به فروش نرسیده است</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...products.map((p) => p.totalRevenue), 1);

  return (
    <div className="flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-xs h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Award className="size-4" />
          </span>
          <h3 className="text-base font-bold text-foreground">محصولات پرفروش و برتر</h3>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>مشاهده همه</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="flex flex-col gap-3.5 mt-2">
        {products.map((product, idx) => {
          const widthPercent = Math.max(Math.round((product.totalRevenue / maxRevenue) * 100), 10);

          return (
            <div key={product.id ?? product.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-black text-muted-foreground shrink-0">
                    {(idx + 1).toLocaleString("fa-IR")}
                  </span>
                  {product.image ? (
                    <div className="relative size-7 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    </div>
                  ) : (
                    <div className="size-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="size-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <span className="font-bold text-foreground truncate">{product.name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-left font-bold" dir="ltr">
                  <span className="text-primary">{formatPrice(product.totalRevenue)}</span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    ({product.totalQuantity.toLocaleString("fa-IR")} عدد)
                  </span>
                </div>
              </div>

              {/* نوار پیشرفت افقی با شیب گرادیان زیبا */}
              <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                <div
                  style={{ width: `${widthPercent}%` }}
                  className="bg-linear-to-r from-amber-500 to-primary h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
