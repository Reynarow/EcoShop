import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Star,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { getAdminAnalytics } from "@/lib/admin-analytics";
import { formatPrice, formatPersianDate, getOrderStatusInfo } from "@/lib/utils";
import StatCard from "@/components/admin/charts/stat-card";
import SalesRevenueChart from "@/components/admin/charts/sales-revenue-chart";
import OrderStatusDonutChart from "@/components/admin/charts/order-status-donut-chart";
import TopProductsChart from "@/components/admin/charts/top-products-chart";

export const metadata = {
  title: "داشبورد مدیریت و تحلیل آمار | فروشگاه من",
};

export default async function AdminDashboardPage() {
  const analytics = await getAdminAnalytics();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* هدر صفحه و تب‌های راهبری */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="size-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              داشبورد و آمار تحلیلی فروشگاه
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
            بررسی جامع وضعیت فروش، نمودارهای عملکرد، جریان سفارش‌ها و دیدگاه‌های خریداران
          </p>
        </div>

        {/* دکمه‌های ناوبری تب‌های ادمین */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-xs"
          >
            <TrendingUp className="size-4" />
            <span>داشبورد و آمار</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/80 bg-background px-3.5 text-xs font-semibold text-foreground shadow-xs transition hover:bg-muted"
          >
            <ShoppingCart className="size-4 text-muted-foreground" />
            <span>مدیریت سفارشات</span>
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/80 bg-background px-3.5 text-xs font-semibold text-foreground shadow-xs transition hover:bg-muted"
          >
            <Package className="size-4 text-muted-foreground" />
            <span>مدیریت محصولات</span>
          </Link>
        </div>
      </div>

      {/* ردیف کارت‌های آماری شاخص کلیدی (KPIs) */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="فروش کل فروشگاه"
          value={formatPrice(analytics.revenue.total)}
          subtitle={`تحویل شده: ${formatPrice(analytics.revenue.delivered)}`}
          icon={DollarSign}
          color="emerald"
          trend={{
            value: analytics.revenue.growthPercent,
            label: "نسبت به هفته پیش",
          }}
        />

        <StatCard
          title="کل سفارشات ثبت شده"
          value={`${analytics.orders.total.toLocaleString("fa-IR")} سفارش`}
          subtitle={`${analytics.orders.pending.toLocaleString("fa-IR")} سفارش در انتظار`}
          icon={ShoppingCart}
          color="blue"
        />

        <StatCard
          title="کالاهای موجود در کاتالوگ"
          value={`${analytics.products.total.toLocaleString("fa-IR")} کالا`}
          subtitle="فعال در فروشگاه"
          icon={Package}
          color="amber"
        />

        <StatCard
          title="کاربران و مشتریان"
          value={`${analytics.users.total.toLocaleString("fa-IR")} کاربر`}
          subtitle={`${analytics.users.customers.toLocaleString("fa-IR")} مشتری ثبت‌نامی`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* بخش ردیف نمودارها: نمودار روند فروش + نمودار دونات وضعیت سفارشات */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* نمودار روند روزانه فروش (ستون بزرگ ۲ بخشی) */}
        <div className="lg:col-span-2">
          <SalesRevenueChart data={analytics.recentSalesByDay} />
        </div>

        {/* نمودار دونات تفکیک وضعیت سفارش‌ها */}
        <div className="lg:col-span-1">
          <OrderStatusDonutChart
            distribution={analytics.orderStatusDistribution}
            totalOrders={analytics.orders.total}
          />
        </div>
      </div>

      {/* بخش ردیف دوم تحلیلی: محصولات برتر + آخرین سفارشات ثبت شده */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* محصولات پرفروش و برتر */}
        <div className="lg:col-span-1">
          <TopProductsChart products={analytics.topSellingProducts} />
        </div>

        {/* جدول سفارش‌های اخیر */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Clock className="size-4" />
              </span>
              <h3 className="text-base font-bold text-foreground">سفارش‌های جدید اخیر</h3>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>مشاهده تمام سفارش‌ها</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {analytics.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <ShoppingCart className="size-10 mb-2 opacity-40" />
              <p className="text-xs">هنوز سفارشی به ثبت نرسیده است</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="border-b border-border/60 text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-2.5 pr-2">شماره سفارش</th>
                    <th className="py-2.5">مشتری</th>
                    <th className="py-2.5">تعداد اقلام</th>
                    <th className="py-2.5">مبلغ کل</th>
                    <th className="py-2.5">وضعیت</th>
                    <th className="py-2.5 pl-2">تاریخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {analytics.recentOrders.map((order) => {
                    const statusInfo = getOrderStatusInfo(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-muted/40 transition">
                        <td className="py-3 pr-2 font-black text-foreground">
                          #{order.id.toLocaleString("fa-IR")}
                        </td>
                        <td className="py-3 font-semibold text-foreground">
                          {order.customerName}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {order.itemsCount.toLocaleString("fa-IR")} عدد
                        </td>
                        <td className="py-3 font-bold text-primary">
                          {formatPrice(order.totalPrice)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3 pl-2 text-muted-foreground">
                          {formatPersianDate(order.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ردیف نظرات اخیر مشتریان و امتیاز کلی */}
      <div className="mt-6 flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Star className="size-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">بازخورد و نظرات خریداران</h3>
              <p className="text-xs text-muted-foreground">
                میانگین رضایت:{" "}
                <span className="font-bold text-foreground">
                  {analytics.reviews.averageRating.toLocaleString("fa-IR")} از ۵
                </span>{" "}
                (مجموع {analytics.reviews.total.toLocaleString("fa-IR")} نظر)
              </p>
            </div>
          </div>
        </div>

        {analytics.recentReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Star className="size-8 mb-2 opacity-40" />
            <p className="text-xs">هنوز دیدگاهی برای محصولات ثبت نشده است</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-2">
            {analytics.recentReviews.map((rev) => (
              <div
                key={rev.id}
                className="flex flex-col justify-between rounded-xl border border-border/60 bg-muted/20 p-3.5 hover:bg-muted/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-foreground truncate">{rev.userName}</span>
                    <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`size-3 ${
                            s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="mt-1 block text-[11px] font-medium text-primary truncate">
                    محصول: {rev.productName}
                  </span>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {rev.comment}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                  {formatPersianDate(rev.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
