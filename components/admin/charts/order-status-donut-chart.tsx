"use client";

import { PieChart } from "lucide-react";

interface StatusItem {
  status: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface OrderStatusDonutChartProps {
  distribution: StatusItem[];
  totalOrders: number;
}

const STATUS_COLOR_HEX: Record<string, string> = {
  PENDING: "#f59e0b",   // amber-500
  PROCESSING: "#3b82f6",// blue-500
  SHIPPED: "#6366f1",   // indigo-500
  DELIVERED: "#10b981", // emerald-500
  CANCELLED: "#f43f5e", // rose-500
};

export default function OrderStatusDonutChart({
  distribution,
  totalOrders,
}: OrderStatusDonutChartProps) {
  // اگر هیچ سفارشی نباشد
  if (totalOrders === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card p-6 shadow-xs h-full">
        <PieChart className="size-10 text-muted-foreground/40 mb-2" />
        <p className="text-xs font-semibold text-muted-foreground">هنوز سفارشی ثبت نشده است</p>
      </div>
    );
  }

  // محاسبه استروک و آفست برای نمودار SVG دایره‌ای دونات
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // محاسبه آفست بخش‌ها با reduce خالص بدون تغییر متغیر موتاشن
  const segments = distribution.reduce<
    Array<
      StatusItem & {
        strokeDasharray: string;
        strokeDashoffset: number;
      }
    >
  >((acc, item) => {
    const prevOffset = acc.length > 0
      ? acc.reduce((sum, curr) => sum + (curr.count > 0 ? curr.percentage : 0), 0)
      : 0;

    acc.push({
      ...item,
      strokeDasharray: `${(item.percentage / 100) * circumference} ${circumference}`,
      strokeDashoffset: -((prevOffset / 100) * circumference),
    });
    return acc;
  }, []);

  return (
    <div className="flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-xs h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
          <PieChart className="size-4" />
        </span>
        <h3 className="text-base font-bold text-foreground">وضعیت سفارش‌ها</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto pt-2">
        {/* نمودار دایره‌ای دونات SVG */}
        <div className="relative flex items-center justify-center size-40 shrink-0">
          <svg width={size} height={size} className="-rotate-90">
            {/* دایره پس‌زمینه */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/30"
            />

            {/* بخش‌های رنگی */}
            {segments.map((item) => {
              if (item.count === 0) return null;

              return (
                <circle
                  key={item.status}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={STATUS_COLOR_HEX[item.status] || "#888888"}
                  strokeWidth={strokeWidth}
                  strokeDasharray={item.strokeDasharray}
                  strokeDashoffset={item.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* مرکز دونات */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-black text-foreground">
              {totalOrders.toLocaleString("fa-IR")}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">کل سفارشات</span>
          </div>
        </div>

        {/* لژاند و راهنمای مقادیر */}
        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          {distribution.map((item) => (
            <div
              key={item.status}
              className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-none"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLOR_HEX[item.status] || "#888888" }}
                />
                <span className="font-medium text-muted-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <span>{item.count.toLocaleString("fa-IR")}</span>
                <span className="text-[10px] text-muted-foreground">({item.percentage}٪)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
