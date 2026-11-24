"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface SalesDataPoint {
  date: string;
  dayName: string;
  revenue: number;
  ordersCount: number;
}

interface SalesRevenueChartProps {
  data: SalesDataPoint[];
}

export default function SalesRevenueChart({ data }: SalesRevenueChartProps) {
  const [activeMetric, setActiveMetric] = useState<"revenue" | "orders">("revenue");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000000);
  const maxOrders = Math.max(...data.map((d) => d.ordersCount), 5);

  const currentMax = activeMetric === "revenue" ? maxRevenue : maxOrders;
  const totalPeriodRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalPeriodOrders = data.reduce((sum, item) => sum + item.ordersCount, 0);

  // ۵ گام در محور Y
  const yTicks = [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.round(currentMax * ratio));

  return (
    <div className="flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
      {/* هدر نمودار و کلید تغییر متغیر */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="size-4" />
            </span>
            <h3 className="text-base font-bold text-foreground">روند فروش و سفارش‌ها (۷ روز اخیر)</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            مجموع ۷ روز گذشته:{" "}
            <span className="font-bold text-foreground">
              {formatPrice(totalPeriodRevenue)}
            </span>{" "}
            ({totalPeriodOrders.toLocaleString("fa-IR")} سفارش)
          </p>
        </div>

        {/* سوییچر بین درآمد و تعداد سفارش */}
        <div className="inline-flex rounded-xl bg-muted/70 p-1 border border-border/50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMetric("revenue")}
            className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              activeMetric === "revenue"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            مبلغ فروش
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("orders")}
            className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              activeMetric === "orders"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            تعداد سفارشات
          </button>
        </div>
      </div>

      {/* نمودار میله‌ای بصری با افکت و هاور */}
      <div className="mt-8 flex flex-col">
        {/* خطوط پس‌زمینه افقی و میله‌ها */}
        <div className="relative h-56 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2">
          {/* خطوط راهنما Grid lines */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between opacity-30">
            {yTicks.map((_, idx) => (
              <div key={idx} className="w-full border-b border-dashed border-border" />
            ))}
          </div>

          {/* میله‌های روزانه */}
          {data.map((item, index) => {
            const currentValue = activeMetric === "revenue" ? item.revenue : item.ordersCount;
            const heightPercent = currentMax > 0 ? Math.max((currentValue / currentMax) * 100, 4) : 4;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={item.date}
                className="relative flex flex-1 flex-col items-center h-full justify-end group cursor-pointer z-10"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* تول‌تیپ اطلاعات هنگام هاور */}
                {isHovered && (
                  <div className="absolute -top-12 z-30 flex flex-col items-center rounded-xl bg-popover px-3 py-1.5 text-xs font-bold text-popover-foreground shadow-xl border border-border animate-in fade-in zoom-in-95 pointer-events-none whitespace-nowrap">
                    <span>
                      {activeMetric === "revenue"
                        ? formatPrice(item.revenue)
                        : `${item.ordersCount.toLocaleString("fa-IR")} سفارش`}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      {item.dayName} {item.date}
                    </span>
                  </div>
                )}

                {/* میله ستونی */}
                <div className="w-full max-w-[42px] flex flex-col items-center justify-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                      isHovered
                        ? "bg-primary shadow-lg shadow-primary/25 scale-[1.03]"
                        : "bg-primary/75 hover:bg-primary"
                    }`}
                  >
                    {/* جلوه هایلایت براق بالای میله */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-white/40" />
                  </div>
                </div>

                {/* برچسب روز در زیر میله */}
                <div className="mt-3 text-center">
                  <span className="block text-[11px] font-semibold text-foreground">
                    {item.dayName}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {item.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
