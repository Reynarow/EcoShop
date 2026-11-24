"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  TrendingUp,
  RotateCw,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, formatPersianDate, getOrderStatusInfo } from "@/lib/utils";
import OrderDetailsModal, {
  type AdminOrder,
} from "@/components/admin/order-details-modal";

const ITEMS_PER_PAGE = 8;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // وضعیت جستجو و فیلتر
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // وضعیت مدال جزئیات
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // اعلان‌ها
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // دریافت تمام سفارش‌ها از سرور
  useEffect(() => {
    let isMounted = true;

    fetch("/api/orders", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          throw new Error("خطا در دریافت لیست سفارش‌ها از سرور");
        }
        return res.json();
      })
      .then((data: AdminOrder[]) => {
        if (isMounted) {
          setOrders(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
        if (isMounted) {
          setError("خطا در برقراری ارتباط با سرور یا دریافت سفارش‌ها.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // حذف خودکار اعلان پس از ۴ ثانیه
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  };

  // تغییر وضعیت سفارش از طریق API
  const handleStatusChange = async (
    orderId: number,
    newStatus: AdminOrder["status"]
  ) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "خطا در به‌روزرسانی وضعیت سفارش");
      }

      const updatedOrder: AdminOrder = await res.json();

      // به‌روزرسانی لیست سفارش‌ها در کلاینت
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: updatedOrder.status } : ord))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: updatedOrder.status } : null));
      }

      setNotification({
        type: "success",
        message: "وضعیت سفارش با موفقیت به‌روزرسانی شد.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطای نامشخص";
      setNotification({
        type: "error",
        message: msg,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // فیلتر سفارش‌ها
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === "ALL" || order.status === selectedStatus;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        order.id.toString().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.phone.includes(query) ||
        order.address.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchQuery]);

  // صفحه‌بندی
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  // آمار کلی سفارش‌ها
  const stats = useMemo(() => {
    const total = orders.length;
    const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalPrice, 0);
    const pendingCount = orders.filter(
      (ord) => ord.status === "PENDING" || ord.status === "PROCESSING"
    ).length;
    const deliveredCount = orders.filter(
      (ord) => ord.status === "DELIVERED"
    ).length;

    return {
      total,
      totalRevenue,
      pendingCount,
      deliveredCount,
    };
  }, [orders]);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      {/* اعلان‌های موفقیت یا خطا */}
      {notification && (
        <div
          role="alert"
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-2xl p-4 shadow-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* تب‌های جابجایی بین بخش‌های پنل مدیریت */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-6">
        <Link
          href="/admin/products"
          className="rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
        >
          مدیریت محصولات
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary"
        >
          مدیریت سفارشات
        </Link>
      </div>

      {/* هدر صفحه و دکمه تازه‌سازی */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <span className="size-2 rounded-full bg-primary" />
            <span>مدیریت فروشگاه</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
            مدیریت سفارشات
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            مشاهده سفارش‌های کاربران، پیگیری و به‌روزرسانی وضعیت فاکتورها
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="rounded-xl gap-1.5 font-medium cursor-pointer"
            title="به‌روزرسانی لیست"
          >
            <RotateCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">تازه‌سازی</span>
          </Button>
        </div>
      </div>

      {/* کارت‌های خلاصه آمار */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="size-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              تعداد کل سفارش‌ها
            </span>
            <div className="text-xl font-black text-foreground mt-0.5">
              {stats.total.toLocaleString("fa-IR")}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                سفارش
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              مجموع درآمد ناخالص
            </span>
            <div className="text-xl font-black text-foreground mt-0.5">
              {formatPrice(stats.totalRevenue)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                تومان
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="size-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              نیازمند پردازش و بررسی
            </span>
            <div className="text-xl font-black text-foreground mt-0.5">
              {stats.pendingCount.toLocaleString("fa-IR")}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                سفارش
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <PackageCheck className="size-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              تحویل داده شده
            </span>
            <div className="text-xl font-black text-foreground mt-0.5">
              {stats.deliveredCount.toLocaleString("fa-IR")}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                سفارش
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* نوار جستجو و فیلتر وضعیت */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-xs mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="جستجو بر اساس شناسه، نام مشتری، شماره تلفن یا آدرس..."
            className="h-10 pr-10 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "همه وضعیت‌ها" },
            { id: "PENDING", label: "در انتظار" },
            { id: "PROCESSING", label: "در حال پردازش" },
            { id: "SHIPPED", label: "ارسال شده" },
            { id: "DELIVERED", label: "تحویل داده شده" },
            { id: "CANCELLED", label: "لغو شده" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedStatus(tab.id);
                setCurrentPage(1);
              }}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* لیست و جدول سفارش‌ها */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-muted/50 animate-pulse border border-border/60"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center text-xs font-bold text-destructive">
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex min-h-[35vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 p-8 text-center bg-card/40">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground mb-3">
            <Package className="size-8 stroke-[1.4] text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground">
            هیچ سفارشی با این مشخصات یافت نشد!
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            فیلترها یا عبارت جستجو را تغییر دهید.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-border/70 bg-card shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-border/60 bg-muted/40 font-bold text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4">شناسه سفارش</th>
                  <th className="py-3.5 px-4">مشتری</th>
                  <th className="py-3.5 px-4">تاریخ ثبت</th>
                  <th className="py-3.5 px-4">تعداد اقلام</th>
                  <th className="py-3.5 px-4">مبلغ کل</th>
                  <th className="py-3.5 px-4">وضعیت</th>
                  <th className="py-3.5 px-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {paginatedOrders.map((order) => {
                  const statusInfo = getOrderStatusInfo(order.status);
                  const totalItems = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground" dir="ltr">
                        #{order.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono" dir="ltr">
                          {order.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground">
                        {formatPersianDate(order.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-foreground">
                        {totalItems.toLocaleString("fa-IR")} قلم
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-foreground">
                          {formatPrice(order.totalPrice)}
                        </span>{" "}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          تومان
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          disabled={isUpdatingStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              order.id,
                              e.target.value as AdminOrder["status"]
                            )
                          }
                          className={`rounded-xl border px-2.5 py-1 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer ${statusInfo.color}`}
                        >
                          <option value="PENDING">در انتظار بررسی</option>
                          <option value="PROCESSING">در حال پردازش</option>
                          <option value="SHIPPED">ارسال شده</option>
                          <option value="DELIVERED">تحویل داده شده</option>
                          <option value="CANCELLED">لغو شده</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailsModalOpen(true);
                          }}
                          className="h-8 rounded-xl gap-1 text-xs font-bold text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          <Eye className="size-3.5" />
                          <span>مشاهده کامل</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* صفحه‌بندی */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/50 pt-4">
              <span className="text-xs text-muted-foreground font-medium">
                صفحه {currentPage.toLocaleString("fa-IR")} از{" "}
                {totalPages.toLocaleString("fa-IR")} (مجموعاً{" "}
                {filteredOrders.length.toLocaleString("fa-IR")} سفارش)
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl size-8 p-0"
                >
                  <ChevronRight className="size-4" />
                </Button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="rounded-xl size-8 p-0 text-xs font-bold"
                  >
                    {(i + 1).toLocaleString("fa-IR")}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl size-8 p-0"
                >
                  <ChevronLeft className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* مدال جزئیات و مدیریت سفارش */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={isUpdatingStatus}
      />
    </main>
  );
}
