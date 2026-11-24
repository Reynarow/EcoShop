"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Menu,
  X,
  ShoppingBag,
  Package,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import HeaderCartButton from "@/components/cart/header-cart-button";
import UserMenu from "@/components/auth/user-menu";
import { authClient } from "@/lib/auth-client";
import { formatPrice } from "@/lib/utils";

interface SearchProduct {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
}

const BASE_NAV_LINKS = [
  { label: "صفحه اصلی", href: "/" },
  { label: "همه محصولات", href: "/#products" },
  { label: "دسته‌بندی‌ها", href: "/#categories" },
  { label: "پیشنهاد شگفت‌انگیز", href: "/#deals", badge: "تخفیف ویژه" },
];

export default function Navbar() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // وضعیت جستجوی زنده و کلید میانبر Ctrl+K
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const hasFetchedProducts = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // نمایش لینک پنل مدیریت تنها برای کاربران ادمین
  const navLinks = useMemo(() => {
    const links = [...BASE_NAV_LINKS];
    if (session?.user?.role === "ADMIN") {
      links.push({ label: "پنل مدیریت", href: "/admin/products", badge: "مدیر" });
    }
    return links;
  }, [session?.user?.role]);

  // دریافت لیست محصولات برای جستجوی آنی در اولین فوکوس
  const ensureProductsLoaded = async () => {
    if (hasFetchedProducts.current || isLoadingProducts) return;
    hasFetchedProducts.current = true;
    setIsLoadingProducts(true);

    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data: SearchProduct[] = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products for search:", err);
      hasFetchedProducts.current = false;
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // فعال‌سازی کلید میانبر Ctrl+K (و Cmd+K در مک) برای تمرکز روی جستجوی فروشگاه
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); // جلوگیری از باز شدن جستجوی پیش‌فرض مرورگر کروم
        setIsVisible(true);
        setIsSearchOpen(true);
        void ensureProductsLoaded();

        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        });
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // بستن لیست نتایج با کلیک خارج از کادر جستجو
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // کنترل نمایش/مخفی شدن نوبار هنگام اسکرول
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (
        currentScrollY > 150 &&
        currentScrollY > lastScrollY &&
        !isMobileMenuOpen &&
        !isSearchOpen
      ) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobileMenuOpen, isSearchOpen]);

  // فیلتر کردن محصولات مطابق عبارت جستجو
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products.slice(0, 5);

    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      )
      .slice(0, 6);
  }, [products, searchQuery]);

  const handleSelectProduct = (productId: number) => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery("");
    router.push(`/products/${productId}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      e.preventDefault();
      handleSelectProduct(searchResults[0].id);
    }
  };

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-6 md:px-8">
      <nav
        aria-label="ناوبری اصلی"
        className={`mx-auto max-w-7xl rounded-2xl border border-border/70 bg-background/80 shadow-xs backdrop-blur-xl transition-all duration-300 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          {/* Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition hover:bg-muted md:hidden"
              aria-label={isMobileMenuOpen ? "بستن منو" : "باز کردن منو"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            <Link
              href="/"
              className="group flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/25 transition group-hover:scale-105">
                <ShoppingBag className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-extrabold sm:text-lg">فروشگاه من</span>
                <span className="hidden text-[10px] font-medium text-muted-foreground sm:inline-block">
                  خرید آنلاین مدرن و آسان
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
                {link.badge && (
                  <span className="inline-flex items-center rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Search Bar (Desktop / Tablet) */}
          <div
            ref={searchContainerRef}
            className="relative hidden flex-1 max-w-xs md:block lg:max-w-sm"
          >
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onFocus={() => {
                setIsSearchOpen(true);
                void ensureProductsLoaded();
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="جستجوی محصول، برند یا دسته..."
              className="h-9 w-full rounded-xl border-border/80 bg-muted/40 pr-9 pl-14 text-xs transition focus:bg-background focus:ring-2 focus:ring-primary/20"
              type="search"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="پاک کردن جستجو"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <kbd
                className="pointer-events-none absolute left-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border/80 bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground lg:inline-block"
                dir="ltr"
              >
                Ctrl+K
              </kbd>
            )}

            {/* دراپ‌داون نتایج زنده جستجو */}
            {isSearchOpen && (
              <div className="absolute right-0 left-0 top-full mt-2 rounded-2xl border border-border/80 bg-background/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>در حال بارگذاری محصولات...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    محصولی با عبارت «{searchQuery}» یافت نشد.
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground">
                      {searchQuery.trim() ? "نتایج جستجو" : "پیشنهادهای سریع"}
                    </div>

                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectProduct(product.id)}
                        className="flex w-full items-center gap-3 rounded-xl p-2 text-right transition-colors hover:bg-muted cursor-pointer group"
                      >
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted/40">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              unoptimized
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-muted-foreground/40">
                              <Package className="size-4" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[11px] font-semibold text-muted-foreground">
                            {formatPrice(product.price)} تومان
                          </p>
                        </div>

                        <ArrowLeft className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />

            {/* Cart Link with Dynamic Badge */}
            <HeaderCartButton />

            {/* Login / Profile User Menu */}
            <UserMenu />
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-border/60 p-4 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Mobile Search */}
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onFocus={() => void ensureProductsLoaded()}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="جستجوی محصولات..."
                className="h-10 w-full rounded-xl border-border/80 bg-muted/50 pr-9 text-xs"
                type="search"
              />

              {searchQuery.trim() && (
                <div className="mt-2 rounded-xl border border-border/70 bg-card p-1.5 space-y-1">
                  {searchResults.length === 0 ? (
                    <p className="py-3 text-center text-xs text-muted-foreground">
                      محصولی یافت نشد.
                    </p>
                  ) : (
                    searchResults.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectProduct(product.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg p-2 text-right text-xs hover:bg-muted cursor-pointer"
                      >
                        <span className="truncate font-bold text-foreground">
                          {product.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-primary font-semibold">
                          {formatPrice(product.price)} تومان
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-500">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}

              {/* Mobile Auth User Menu */}
              <UserMenu isMobile onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
