"use client";

import { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  PackageOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductCard, { type Product } from "@/components/products/product-card";

type SortOption = "newest" | "price-asc" | "price-desc" | "popular";

interface ProductsCatalogProps {
  products: Product[];
}

const CATEGORY_TAGS = [
  { id: "all", label: "همه کالاها" },
  { id: "mobile", label: "موبایل و تبلت", match: ["samsung", "iphone", "xiaomi", "گوشی", "موبایل"] },
  { id: "laptop", label: "لپ‌تاپ و کامپیوتر", match: ["macbook", "laptop", "asus", "لپ‌تاپ", "کامپیوتر"] },
  { id: "audio", label: "هدفون و صوتی", match: ["airpods", "headphone", "speaker", "هدفون", "اسپیکر", "هندزفری"] },
  { id: "gadget", label: "ساعت و گجت‌ها", match: ["watch", "band", "ساعت", "مچ‌بند"] },
];

export default function ProductsCatalog({ products }: ProductsCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // فیلتر کردن کالاها
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // فیلتر جستجو
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query));

      // فیلتر دسته‌بندی
      let matchesCategory = true;
      if (selectedCategory !== "all") {
        const cat = CATEGORY_TAGS.find((c) => c.id === selectedCategory);
        if (cat && cat.match) {
          const text = `${product.name} ${product.description || ""}`.toLowerCase();
          matchesCategory = cat.match.some((keyword) => text.includes(keyword));
        }
      }

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // مرتب‌سازی کالاها
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "popular":
        return list.sort((a, b) => b.name.length - a.name.length);
      case "newest":
      default:
        return list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
    }
  }, [filteredProducts, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all";

  return (
    <div className="space-y-6">
      {/* نوار ابزار پیشرفته: جستجوی زنده، فیلتر دسته‌بندی و مرتب‌سازی */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* باکس جستجوی زنده در محصولات */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در بین محصولات فروشگاه..."
              className="h-10 pr-10 pl-9 rounded-2xl text-xs bg-background/80"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                title="پاک کردن جستجو"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* تب‌ها و گزینه‌های مرتب‌سازی */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
            <div className="hidden md:flex items-center gap-1 text-muted-foreground pl-1 font-medium">
              <ArrowUpDown className="size-3.5" />
              <span>مرتب‌سازی:</span>
            </div>

            <div className="flex items-center gap-1 rounded-2xl border border-border/60 bg-muted/30 p-1">
              {[
                { id: "newest", label: "جدیدترین" },
                { id: "price-asc", label: "ارزان‌ترین" },
                { id: "price-desc", label: "گران‌ترین" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSortBy(opt.id as SortOption)}
                  className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                    sortBy === opt.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* برچسب‌های سریع دسته‌بندی (Pill Tags) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-border/40 pt-3 scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="size-3.5" />
            <span>دسته‌ها:</span>
          </span>

          {CATEGORY_TAGS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-primary/10 text-primary border border-primary/30 shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              }`}
            >
              {cat.label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-full px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors mr-auto shrink-0 cursor-pointer"
            >
              پاکسازی فیلترها
            </button>
          )}
        </div>
      </div>

      {/* خلاصه تعداد نتایج */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          <span>نمایش </span>
          <span className="font-bold text-foreground">
            {sortedProducts.length.toLocaleString("fa-IR")}
          </span>
          <span> از مجموع </span>
          <span className="font-bold text-foreground">
            {products.length.toLocaleString("fa-IR")}
          </span>
          <span> کالا</span>
        </div>
      </div>

      {/* گرید محصولات */}
      {sortedProducts.length === 0 ? (
        <div className="flex min-h-[35vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 p-8 text-center bg-card/40">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground mb-3">
            <PackageOpen className="size-8 stroke-[1.4] text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            هیچ کالایی با فیلترهای انتخابی یافت نشد!
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            عبارت جستجو را تغییر دهید یا فیلترهای اعمال شده را ریست نمایید.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleClearFilters}
            className="mt-4 rounded-xl text-xs font-bold"
          >
            مشاهده همه محصولات
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
