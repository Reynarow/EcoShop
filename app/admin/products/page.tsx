"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Package,
  Layers,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import ProductFormModal, { type AdminProduct } from "@/components/admin/product-form-modal";
import DeleteConfirmModal from "@/components/admin/delete-confirm-modal";

const ITEMS_PER_PAGE = 8;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // وضعیت جستجو و فیلتر
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // وضعیت مدال‌ها
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<AdminProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);

  // وضعیت اعلان‌ها
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // واکشی لیست محصولات از API
  useEffect(() => {
    let isMounted = true;

    fetch("/api/products", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          throw new Error("خطا در دریافت لیست محصولات از سرور");
        }
        return res.json();
      })
      .then((data: AdminProduct[]) => {
        if (isMounted) {
          setProducts(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        if (isMounted) {
          setError("خطا در ارتباط با سرور یا پایگاه داده. لطفاً دوباره تلاش کنید.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  };

  // حذف خودکار اعلان پس از ۴ ثانیه
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // فیلتر کردن محصولات بر اساس جستجو
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  // صفحه‌بندی (Pagination)
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // آمار کلی
  const stats = useMemo(() => {
    const total = products.length;
    if (total === 0) return { total: 0, averagePrice: 0, maxPrice: 0 };
    const sum = products.reduce((acc, curr) => acc + curr.price, 0);
    const max = Math.max(...products.map((p) => p.price));
    return {
      total,
      averagePrice: Math.round(sum / total),
      maxPrice: max,
    };
  }, [products]);

  // هندلر افزودن محصول
  const handleOpenCreateModal = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  // هندلر ویرایش محصول
  const handleOpenEditModal = (product: AdminProduct) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  // هندلر موفقیت‌آمیز بودن ذخیره یا حذف
  const handleActionSuccess = (message: string) => {
    setNotification({ type: "success", message });
    handleRefresh();
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      {/* اعلان هشدار امنیتی آزمایشی بودن پنل */}
      

      {/* اعلان پیام‌های موفقیت یا خطا */}
      {notification && (
        <div
          className={`mb-6 flex items-center justify-between rounded-2xl p-4 text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="size-5 shrink-0" />
            ) : (
              <AlertCircle className="size-5 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="rounded-lg p-1 transition hover:bg-background/20 cursor-pointer"
            aria-label="بستن اعلان"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* تب‌های جابجایی بین بخش‌های پنل مدیریت */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-6">
        <Link
          href="/admin"
          className="rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
        >
          <TrendingUp className="size-3.5" />
          <span>داشبورد و آمار</span>
        </Link>
        <Link
          href="/admin/products"
          className="rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary flex items-center gap-1.5"
        >
          <Package className="size-3.5" />
          <span>مدیریت محصولات</span>
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
        >
          <Layers className="size-3.5" />
          <span>مدیریت سفارشات</span>
        </Link>
      </div>

      {/* هدر صفحه و دکمه افزودن */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <span className="size-2 rounded-full bg-primary" />
            <span>مدیریت فروشگاه</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
            مدیریت محصولات
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            مشاهده، جستجو، افزودن، ویرایش و حذف محصولات پایگاه داده
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

          <Button
            type="button"
            onClick={handleOpenCreateModal}
            size="sm"
            className="rounded-xl gap-1.5 font-bold shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            <span>افزودن محصول جدید</span>
          </Button>
        </div>
      </div>

      {/* کارت‌های خلاصه آمار */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="size-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">تعداد کل محصولات</span>
            <div className="text-xl font-black text-foreground mt-0.5">
              {stats.total.toLocaleString("fa-IR")} <span className="text-xs font-normal text-muted-foreground">کالا</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Layers className="size-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">میانگین قیمت کالاها</span>
            <div className="text-xl font-black text-foreground mt-0.5">
              {formatPrice(stats.averagePrice)} <span className="text-xs font-normal text-muted-foreground">تومان</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">گران‌ترین محصول</span>
            <div className="text-xl font-black text-foreground mt-0.5">
              {formatPrice(stats.maxPrice)} <span className="text-xs font-normal text-muted-foreground">تومان</span>
            </div>
          </div>
        </div>
      </div>

      {/* نوار جستجو و تعداد نتایج */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="جستجوی محصول بر اساس نام یا توضیحات..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pr-9 rounded-xl text-xs sm:text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-medium self-end sm:self-auto">
          نمایش <span className="font-bold text-foreground">{paginatedProducts.length.toLocaleString("fa-IR")}</span> از{" "}
          <span className="font-bold text-foreground">{filteredProducts.length.toLocaleString("fa-IR")}</span> کالا
        </div>
      </div>

      {/* خطای واکشی داده‌ها */}
      {error && (
        <div className="my-8 flex flex-col items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertCircle className="size-10 text-destructive mb-3" />
          <h3 className="text-base font-bold text-foreground">{error}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-4 rounded-xl gap-2 cursor-pointer"
          >
            <RotateCw className="size-4" />
            <span>تلاش مجدد</span>
          </Button>
        </div>
      )}

      {/* حالت بارگذاری (Loading Skeleton) */}
      {isLoading && (
        <div className="mt-6 rounded-3xl border border-border/70 bg-card overflow-hidden shadow-xs">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 animate-pulse">
                <div className="size-12 rounded-xl bg-muted/70 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded-md bg-muted/80" />
                  <div className="h-3 w-1/4 rounded-md bg-muted/50" />
                </div>
                <div className="h-5 w-24 rounded-md bg-muted/70" />
                <div className="h-8 w-20 rounded-xl bg-muted/60" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* حالت خالی بودن لیست محصولات */}
      {!isLoading && !error && products.length === 0 && (
        <div className="my-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-muted text-muted-foreground mb-4">
            <Package className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">هیچ محصولی در دیتابیس ثبت نشده است</h3>
          <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted-foreground">
            برای شروع، اولین کالای فروشگاه را با کلیک روی دکمه زیر ایجاد کنید.
          </p>
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="mt-5 rounded-xl gap-2 font-bold cursor-pointer"
          >
            <Plus className="size-4" />
            <span>افزودن اولین محصول</span>
          </Button>
        </div>
      )}

      {/* حالت پیدا نشدن نتیجه در جستجو */}
      {!isLoading && !error && products.length > 0 && filteredProducts.length === 0 && (
        <div className="my-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/20 p-10 text-center">
          <Search className="size-10 text-muted-foreground/60 mb-3" />
          <h3 className="text-base font-bold text-foreground">کالایی با این مشخصات یافت نشد</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            محصولی با عبارت «{searchQuery}» پیدا نشد. لطفاً عبارت دیگری را امتحان کنید.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
            }}
            className="mt-4 rounded-xl cursor-pointer"
          >
            پاک کردن جستجو
          </Button>
        </div>
      )}

      {/* جدول دسکتاپ و کارت‌های موبایل */}
      {!isLoading && !error && paginatedProducts.length > 0 && (
        <div className="mt-6">
          {/* جدول برای صفحه دسکتاپ و تبلت (md به بالا) */}
          <div className="hidden md:block overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xs">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-xs font-bold text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4">تصویر</th>
                  <th className="py-3.5 px-4">نام محصول</th>
                  <th className="py-3.5 px-4">قیمت</th>
                  <th className="py-3.5 px-4">تاریخ ثبت</th>
                  <th className="py-3.5 px-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {paginatedProducts.map((product) => {
                  const createdDate = new Date(product.createdAt).toLocaleDateString("fa-IR");

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-muted/30 group"
                    >
                      {/* تصویر */}
                      <td className="py-3 px-4 w-16">
                        <div className="relative size-12 overflow-hidden rounded-xl bg-muted/50 border border-border/50">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-muted-foreground/50">
                              <Package className="size-5" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* نام و توضیحات */}
                      <td className="py-3 px-4 max-w-xs">
                        <Link
                          href={`/products/${product.id}`}
                          target="_blank"
                          className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        {product.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </td>

                      {/* قیمت */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-foreground">
                          {formatPrice(product.price)}
                        </span>{" "}
                        <span className="text-xs text-muted-foreground">تومان</span>
                      </td>

                      {/* تاریخ */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-muted-foreground">
                        {createdDate}
                      </td>

                      {/* دکمه‌های اقدام */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/products/${product.id}`}
                            target="_blank"
                            className="flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
                            title="مشاهده در فروشگاه"
                          >
                            <Eye className="size-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(product)}
                            className="flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition hover:bg-primary/10 hover:border-primary/40 hover:text-primary cursor-pointer"
                            title="ویرایش محصول"
                          >
                            <Pencil className="size-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive cursor-pointer"
                            title="حذف محصول"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* کارت‌های ریسپانسیو برای صفحه موبایل (زیر md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {paginatedProducts.map((product) => {
              const createdDate = new Date(product.createdAt).toLocaleDateString("fa-IR");

              return (
                <div
                  key={product.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted/50 border border-border/50">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground/50">
                          <Package className="size-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${product.id}`}
                        target="_blank"
                        className="font-bold text-foreground text-sm line-clamp-1 hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      {product.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      )}
                      <div className="mt-2 text-xs font-semibold text-primary">
                        {formatPrice(product.price)} تومان
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
                    <span>تاریخ: {createdDate}</span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/products/${product.id}`}
                        target="_blank"
                        className="flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground"
                      >
                        <Eye className="size-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(product)}
                        className="flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductToDelete(product)}
                        className="flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* پیجینیشن (Pagination) */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-xl gap-1 text-xs cursor-pointer"
              >
                <ChevronRight className="size-3.5" />
                <span>قبلی</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`size-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "border border-border/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {pageNum.toLocaleString("fa-IR")}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl gap-1 text-xs cursor-pointer"
              >
                <span>بعدی</span>
                <ChevronLeft className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* مدال ایجاد و ویرایش محصول */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleActionSuccess}
        productToEdit={productToEdit}
      />

      {/* مدال تایید حذف کالا */}
      <DeleteConfirmModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onSuccess={handleActionSuccess}
        product={productToDelete}
      />
    </main>
  );
}
