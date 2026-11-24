"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Loader2,
  UserPlus,
  Package,
  ClipboardList
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";

interface UserMenuProps {
  isMobile?: boolean;
  onCloseMobileMenu?: () => void;
}

export default function UserMenu({ isMobile = false, onCloseMobileMenu }: UserMenuProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // بستن منوی کشویی دسکتاپ با کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setIsOpen(false);
            if (onCloseMobileMenu) onCloseMobileMenu();
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // حالت موبایل
  if (isMobile) {
    if (isPending) {
      return (
        <div className="h-10 w-full animate-pulse rounded-xl bg-muted/60" />
      );
    }

    if (session?.user) {
      return (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/30 p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserIcon className="size-4" />
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-xs font-bold text-foreground">
                {session.user.name}
              </span>
              <span className="truncate text-[11px] text-muted-foreground" dir="ltr">
                {session.user.email}
              </span>
            </div>
          </div>

          <div className="mt-1 flex flex-col gap-1 border-t border-border/50 pt-2">
            <Link
              href="/account/orders"
              onClick={onCloseMobileMenu}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Package className="size-4 text-primary" />
              <span>سفارش‌های من</span>
            </Link>

            {/* نمایش لینک مدیریت فقط برای کاربران با نقش ADMIN */}
            {session.user.role === "ADMIN" && (
              <>
                <Link
                  href="/admin/orders"
                  onClick={onCloseMobileMenu}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  <ClipboardList className="size-4 text-primary" />
                  <span>مدیریت سفارشات</span>
                </Link>
                <Link
                  href="/admin/products"
                  onClick={onCloseMobileMenu}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  <ShieldCheck className="size-4 text-primary" />
                  <span>مدیریت محصولات</span>
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive/10 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/20 cursor-pointer disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <LogOut className="size-3.5" />
              )}
              <span>خروج از حساب کاربری</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-3 flex flex-col gap-2">
        <Link
          href="/login"
          onClick={onCloseMobileMenu}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-xs"
        >
          <UserIcon className="size-4" />
          <span>ورود به حساب کاربری</span>
        </Link>
        <Link
          href="/register"
          onClick={onCloseMobileMenu}
          className="flex items-center justify-center gap-2 rounded-xl border border-border/80 py-2 text-xs font-semibold text-foreground/80 transition hover:bg-muted"
        >
          <UserPlus className="size-4" />
          <span>ثبت‌نام در فروشگاه</span>
        </Link>
      </div>
    );
  }

  // حالت دسکتاپ
  if (isPending) {
    return (
      <div className="hidden h-9 w-28 animate-pulse rounded-xl bg-muted/60 sm:inline-block" />
    );
  }

  if (session?.user) {
    return (
      <div className="relative hidden sm:inline-block" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-9 items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-3 text-xs font-semibold text-foreground shadow-xs transition hover:bg-muted/70 cursor-pointer"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="size-3.5" />
          </span>
          <span className="max-w-[120px] truncate">{session.user.name}</span>
          <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div
            className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-xl shadow-black/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 z-50"
            role="menu"
          >
            {/* اطلاعات کاربر */}
            <div className="rounded-xl bg-muted/40 p-2.5">
              <p className="truncate text-xs font-bold text-foreground">
                {session.user.name}
              </p>
              <p className="truncate text-[11px] text-muted-foreground mt-0.5" dir="ltr">
                {session.user.email}
              </p>
            </div>

            <div className="my-1.5 h-px bg-border/60" />

            {/* لینک سفارش‌های من برای تمام کاربران وارد شده */}
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              role="menuitem"
            >
              <Package className="size-4 text-primary" />
              <span>سفارش‌های من</span>
            </Link>

            {/* دسترسی سریع به پنل مدیریت فقط برای مدیران */}
            {session.user.role === "ADMIN" && (
              <>
                <div className="my-1.5 h-px bg-border/60" />
                <Link
                  href="/admin/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                  role="menuitem"
                >
                  <ClipboardList className="size-4 text-primary" />
                  <span>مدیریت سفارشات</span>
                </Link>
                <Link
                  href="/admin/products"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                  role="menuitem"
                >
                  <ShieldCheck className="size-4 text-primary" />
                  <span>مدیریت محصولات</span>
                </Link>
              </>
            )}

            <div className="my-1.5 h-px bg-border/60" />

            {/* دکمه خروج */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 cursor-pointer disabled:opacity-50"
              role="menuitem"
            >
              {isLoggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              <span>خروج از حساب</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className={buttonVariants({
        variant: "outline",
        size: "sm",
        className: "hidden gap-1.5 rounded-xl border-border/80 font-medium sm:inline-flex",
      })}
    >
      <UserIcon className="size-4" />
      <span>ورود | ثبت‌نام</span>
    </Link>
  );
}
