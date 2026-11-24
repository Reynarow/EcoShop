"use client";

import Image from "next/image";
import {
  X,
  Package,
  User,
  Phone,
  MapPin,
  Mail,
  Clock,
} from "lucide-react";
import { formatPrice, formatPersianDate, getOrderStatusInfo } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface AdminOrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  productName: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface AdminOrder {
  id: number;
  userId: string;
  totalPrice: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  customerName: string;
  phone: string;
  address: string;
  postalCode: string;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
  user?: {
    name: string;
    email: string;
  };
}

interface OrderDetailsModalProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: number, newStatus: AdminOrder["status"]) => Promise<void>;
  isUpdatingStatus: boolean;
}

const STATUS_OPTIONS: { value: AdminOrder["status"]; label: string }[] = [
  { value: "PENDING", label: "در انتظار بررسی" },
  { value: "PROCESSING", label: "در حال پردازش" },
  { value: "SHIPPED", label: "تحویل به پست / ارسال شده" },
  { value: "DELIVERED", label: "تحویل داده شده" },
  { value: "CANCELLED", label: "لغو شده" },
];

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onStatusChange,
  isUpdatingStatus,
}: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const statusInfo = getOrderStatusInfo(order.status);
  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-6">
        {/* هدر مدال */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Package className="size-4" />
              <span>جزئیات و مدیریت سفارش</span>
            </div>
            <h2 className="mt-1 text-lg font-black text-foreground">
              سفارش <span className="font-mono text-sm text-muted-foreground" dir="ltr">#{order.id}</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* وضعیت سفارش و تغییر سریع */}
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs text-muted-foreground block mb-1 font-medium">
                وضعیت فعلی:
              </span>
              <span
                className={`inline-flex items-center rounded-xl border px-3 py-1 text-xs font-bold ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                تغییر وضعیت:
              </span>
              <select
                value={order.status}
                disabled={isUpdatingStatus}
                onChange={(e) =>
                  onStatusChange(order.id, e.target.value as AdminOrder["status"])
                }
                className="h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-bold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
            <Clock className="size-3.5" />
            <span>زمان ثبت: {formatPersianDate(order.createdAt)}</span>
          </div>
        </div>

        {/* مشخصات مشتری و ارسال */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-primary">مشخصات گیرنده و نشانی پستی</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs rounded-2xl border border-border/60 p-4 bg-card">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">نام تحویل‌گیرنده:</span>
              <span className="font-bold text-foreground">{order.customerName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">شماره تماس:</span>
              <span className="font-bold text-foreground font-mono" dir="ltr">{order.phone}</span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">کد پستی:</span>
              <span className="font-bold text-foreground font-mono" dir="ltr">{order.postalCode}</span>
            </div>

            <div className="flex items-start gap-2 sm:col-span-2">
              <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-muted-foreground">آدرس کامل:</span>
              <span className="font-medium text-foreground leading-relaxed">{order.address}</span>
            </div>
          </div>
        </div>

        {/* لیست اقلام سفارش */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-primary">
            اقلام خریداری شده ({totalItemsCount.toLocaleString("fa-IR")} عدد)
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-3 bg-muted/20"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/40">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        unoptimized
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground/40">
                        <Package className="size-5 stroke-[1.2]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">
                      {item.productName}
                    </p>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      <span>{item.quantity.toLocaleString("fa-IR")} عدد</span> ×{" "}
                      <span>{formatPrice(item.unitPrice)} تومان</span>
                    </div>
                  </div>
                </div>

                <div className="text-left font-bold text-xs text-foreground whitespace-nowrap">
                  {formatPrice(item.subtotal)} <span className="text-[10px] text-muted-foreground font-normal">تومان</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* پاورقی و مجموع مبلغ */}
        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <div>
            <span className="text-xs text-muted-foreground block">مجموع مبلغ کل فاکتور:</span>
            <div className="text-lg font-black text-foreground">
              {formatPrice(order.totalPrice)}{" "}
              <span className="text-xs font-semibold text-muted-foreground">تومان</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl font-bold cursor-pointer"
          >
            بستن
          </Button>
        </div>
      </div>
    </div>
  );
}
