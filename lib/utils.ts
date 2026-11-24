export { cn } from "cn";

/**
 * تبدیل عدد به فرمت قیمت فارسی (مثال: ۲۵٬۰۰۰٬۰۰۰)
 */
export function formatPrice(price: number): string {
  return price.toLocaleString("fa-IR");
}

/**
 * فرمت تاریخ و ساعت به تقویم شمسی فارسی
 */
export function formatPersianDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * دریافت برچسب و استایل بصری وضعیت سفارش
 */
export function getOrderStatusInfo(status: string) {
  switch (status) {
    case "PENDING":
      return {
        label: "در انتظار بررسی",
        color: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
      };
    case "PROCESSING":
      return {
        label: "در حال پردازش",
        color: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
      };
    case "SHIPPED":
      return {
        label: "تحویل به پست / ارسال شده",
        color: "bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400",
      };
    case "DELIVERED":
      return {
        label: "تحویل داده شده",
        color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
      };
    case "CANCELLED":
      return {
        label: "لغو شده",
        color: "bg-destructive/10 text-destructive border-destructive/30",
      };
    default:
      return {
        label: status,
        color: "bg-muted text-muted-foreground border-border",
      };
  }
}

