"use client";

import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
  color?: "blue" | "emerald" | "amber" | "purple" | "rose" | "indigo";
}

const COLOR_STYLES = {
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    gradient: "from-blue-500/10 via-transparent to-transparent",
  },
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    gradient: "from-emerald-500/10 via-transparent to-transparent",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    gradient: "from-amber-500/10 via-transparent to-transparent",
  },
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
    gradient: "from-purple-500/10 via-transparent to-transparent",
  },
  rose: {
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    gradient: "from-rose-500/10 via-transparent to-transparent",
  },
  indigo: {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
    gradient: "from-indigo-500/10 via-transparent to-transparent",
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
}: StatCardProps) {
  const styles = COLOR_STYLES[color];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-5 shadow-xs transition-all hover:shadow-md",
        styles.border
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-radial-[at_top_right] opacity-40",
          styles.gradient
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground">{title}</span>
          <span className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {value}
          </span>
          {subtitle && (
            <span className="mt-1 text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>

        <div className={cn("flex size-11 items-center justify-center rounded-2xl", styles.bg, styles.text)}>
          <Icon className="size-5.5" />
        </div>
      </div>

      {trend && (
        <div className="relative mt-4 flex items-center gap-1.5 border-t border-border/50 pt-3 text-xs">
          {trend.value > 0 ? (
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3.5" />
              <span>+{trend.value}%</span>
            </div>
          ) : trend.value < 0 ? (
            <div className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
              <TrendingDown className="size-3.5" />
              <span>{trend.value}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 font-medium text-muted-foreground">
              <Minus className="size-3.5" />
              <span>بدون تغییر</span>
            </div>
          )}
          {trend.label && (
            <span className="text-muted-foreground">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
