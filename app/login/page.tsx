"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
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
import { loginSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
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
    const validationResult = loginSchema.safeParse({
      email,
      password,
      rememberMe,
    });

    if (!validationResult.success) {
      const flattened = validationResult.error.flatten();
      setFieldErrors(flattened.fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: validationResult.data.email,
        password: validationResult.data.password,
        rememberMe: validationResult.data.rememberMe,
      });

      if (error) {
        const errorMsg = error.message || "";
        if (
          error.code === "INVALID_EMAIL_OR_PASSWORD" ||
          error.code === "INVALID_PASSWORD" ||
          errorMsg.toLowerCase().includes("invalid email or password") ||
          errorMsg.toLowerCase().includes("invalid password") ||
          errorMsg.toLowerCase().includes("not found")
        ) {
          setServerError("ایمیل یا رمز عبور اشتباه است.");
        } else {
          setServerError(error.message || "خطایی در ورود رخ داد. لطفاً مجدداً تلاش فرمایید.");
        }
        setIsLoading(false);
        return;
      }

      if (data) {
        setSuccessMessage("با موفقیت وارد شدید! در حال انتقال به فروشگاه...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1200);
      }
    } catch (err) {
      console.error("Login error:", err);
      setServerError("خطای ارتباط با سرور. لطفاً دوباره تلاش فرمایید.");
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
            <CardTitle className="text-xl font-bold">ورود به حساب کاربری</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              ایمیل و رمز عبور خود را برای ورود وارد نمایید
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                    رمز عبور
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="رمز عبور خود را وارد کنید"
                    dir="ltr"
                    disabled={isLoading}
                    className="h-10 rounded-xl pr-9 pl-9 text-left text-xs transition"
                    autoComplete="current-password"
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

              {/* ذخیره نشست (مرا به خاطر بسپار) */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="size-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span>مرا به خاطر بسپار</span>
                </label>
              </div>

              {/* دکمه ورود */}
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-10 w-full rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>در حال ورود...</span>
                  </>
                ) : (
                  <span>ورود به حساب</span>
                )}
              </Button>
            </form>

            {/* لینک به صفحه ثبت‌نام */}
            <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
              <span>هنوز حساب کاربری ندارید؟ </span>
              <Link
                href="/register"
                className="font-bold text-primary transition hover:underline inline-flex items-center gap-0.5"
              >
                <span>ثبت‌نام در فروشگاه</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
