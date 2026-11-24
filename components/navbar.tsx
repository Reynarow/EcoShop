"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Menu, 
  X, 
  ShoppingBag
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import HeaderCartButton from "@/components/cart/header-cart-button";
import UserMenu from "@/components/auth/user-menu";
import { authClient } from "@/lib/auth-client";

const BASE_NAV_LINKS = [
  { label: "صفحه اصلی", href: "/" },
  { label: "همه محصولات", href: "/#products" },
  { label: "دسته‌بندی‌ها", href: "/#categories" },
  { label: "پیشنهاد شگفت‌انگیز", href: "/#deals", badge: "تخفیف ویژه" },
];

export default function Navbar() {
  const { data: session } = authClient.useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // نمایش لینک پنل مدیریت تنها برای کاربران ادمین
  const navLinks = useMemo(() => {
    const links = [...BASE_NAV_LINKS];
    if (session?.user?.role === "ADMIN") {
      links.push({ label: "پنل مدیریت", href: "/admin/products", badge: "مدیر" });
    }
    return links;
  }, [session?.user?.role]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 150 && currentScrollY > lastScrollY && !isMobileMenuOpen) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobileMenuOpen]);

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-6 md:px-8">
      <nav
        aria-label="ناوبری اصلی"
        className={`mx-auto max-w-7xl rounded-2xl border border-border/70 bg-background/80 shadow-xs backdrop-blur-xl transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0 pointer-events-none"
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
          <div className="relative hidden flex-1 max-w-xs md:block lg:max-w-sm">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="جستجوی محصول، برند یا دسته..."
              className="h-9 w-full rounded-xl border-border/80 bg-muted/40 pr-9 pl-12 text-xs transition focus:bg-background focus:ring-2 focus:ring-primary/20"
              type="search"
            />
            <kbd className="pointer-events-none absolute left-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border/80 bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground lg:inline-block">
              Ctrl+K
            </kbd>
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
                placeholder="جستجوی محصولات..."
                className="h-10 w-full rounded-xl border-border/80 bg-muted/50 pr-9 text-xs"
                type="search"
              />
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

