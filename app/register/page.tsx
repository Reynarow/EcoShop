"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setFieldErrors({});
    setServerError(null);
    setSuccessMessage(null);

    // اعتبارسنجی ورودی‌ها با Zod
    const validationResult = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!validationResult.success) {
      const flattened = validationResult.error.flatten();
      setFieldErrors(flattened.fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        name: validationResult.data.name,
        email: validationResult.data.email,
        password: validationResult.data.password,
      });

      if (error) {
        const errorMsg = error.message || "";
        if (
          error.code === "USER_ALREADY_EXISTS" ||
          errorMsg.toLowerCase().includes("already exists") ||
          errorMsg.toLowerCase().includes("unique constraint")
        ) {
          setServerError("حساب کاربری با این ایمیل قبلاً ایجاد شده است. لطفاً وارد شوید.");
        } else {
          setServerError(error.message || "خطایی در ثبت‌نام رخ داد. لطفاً مجدداً تلاش کنید.");
        }
        setIsLoading(false);
        return;
      }

      if (data) {
        setSuccessMessage("حساب کاربری شما با موفقیت ایجاد شد! در حال انتقال به فروشگاه...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setServerError("خطای غیرمنتظره‌ای در ارتباط با سرور رخ داد. لطفاً بعداً تلاش فرمایید.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* برند و لوگوی بالای فرم */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/25">
              <ShoppingBag className="size-5" />
            </span>
            <span className="text-xl font-black">فروشگاه من</span>
          </Link>
        </div>

        <Card className="rounded-2xl border-border/70 shadow-lg shadow-black/5 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-xl font-bold">ایجاد حساب کاربری</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              اطلاعات خود را وارد نمایید تا حساب شما ساخته شود
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* پیام موفقیت */}
            {successMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="size-5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* پیام خطای سرور */}
            {serverError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive animate-in fade-in">
                <AlertCircle className="size-5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* نام و نام خانوادگی */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                  نام و نام خانوادگی
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: علی رضایی"
                    disabled={isLoading}
                    className="h-10 rounded-xl pr-9 text-xs transition"
                    autoComplete="name"
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.name[0]}</p>
                )}
              </div>

              {/* ایمیل */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                  آدرس ایمیل
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    dir="ltr"
                    disabled={isLoading}
                    className="h-10 rounded-xl pr-9 text-left text-xs transition"
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.email[0]}</p>
                )}
              </div>

              {/* رمز عبور */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                  رمز عبور
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="حداقل ۸ کاراکتر"
                    dir="ltr"
                    disabled={isLoading}
                    className="h-10 rounded-xl pr-9 pl-9 text-left text-xs transition"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground cursor-pointer"
                    aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.password[0]}</p>
                )}
              </div>

              {/* تکرار رمز عبور */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                  تکرار رمز عبور
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="تکرار رمز عبور را وارد کنید"
                    dir="ltr"
                    disabled={isLoading}
                    className="h-10 rounded-xl pr-9 pl-9 text-left text-xs transition"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground cursor-pointer"
                    aria-label={showConfirmPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.confirmPassword[0]}</p>
                )}
              </div>

              {/* دکمه ثبت‌نام */}
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-10 w-full rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>در حال ایجاد حساب...</span>
                  </>
                ) : (
                  <span>ثبت‌نام در فروشگاه</span>
                )}
              </Button>
            </form>

            {/* لینک به ورود */}
            <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
              <span>قبلاً ثبت‌نام کرده‌اید؟ </span>
              <Link
                href="/login"
                className="font-bold text-primary transition hover:underline inline-flex items-center gap-0.5"
              >
                <span>ورود به حساب</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
