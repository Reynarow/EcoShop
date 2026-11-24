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
  ArrowRight,
  KeyRound,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/validations/auth";
import OtpVerificationForm from "@/components/auth/otp-verification-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();

  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [otpStep, setOtpStep] = useState<"email-verification" | "sign-in" | null>(null);
  const [otpInitialMessage, setOtpInitialMessage] = useState<string | undefined>(undefined);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const redirectAfterLogin = () => {
    setSuccessMessage("با موفقیت وارد شدید! در حال انتقال به فروشگاه...");
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1000);
  };

  // ورود با ایمیل و رمز عبور (همراه با تشخیص حساب غیرفعال و ارسال کد فعال‌سازی)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setFieldErrors({});
    setServerError(null);
    setSuccessMessage(null);

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
        const errorMsg = (error.message || "").toLowerCase();

        // اگر حساب هنوز تایید/فعال نشده باشد، به مرحله ورود کد فعال‌سازی هدایت می‌شود
        if (
          error.code === "EMAIL_NOT_VERIFIED" ||
          error.status === 403 ||
          errorMsg.includes("not verified") ||
          errorMsg.includes("verify")
        ) {
          setIsLoading(false);
          setOtpInitialMessage(
            "حساب کاربری شما هنوز فعال نشده است. کد ۶ رقمی فعال‌سازی به ایمیل شما ارسال شد."
          );
          setOtpStep("email-verification");
          return;
        }

        if (
          error.code === "INVALID_EMAIL_OR_PASSWORD" ||
          error.code === "INVALID_PASSWORD" ||
          errorMsg.includes("invalid email or password") ||
          errorMsg.includes("invalid password") ||
          errorMsg.includes("not found")
        ) {
          setServerError("ایمیل یا رمز عبور اشتباه است.");
        } else {
          setServerError(error.message || "خطایی در ورود رخ داد. لطفاً مجدداً تلاش فرمایید.");
        }
        setIsLoading(false);
        return;
      }

      if (data) {
        redirectAfterLogin();
      }
    } catch (err) {
      console.error("Login error:", err);
      setServerError("خطای ارتباط با سرور. لطفاً دوباره تلاش فرمایید.");
      setIsLoading(false);
    }
  };

  // ارسال کد یکبار مصرف برای ورود بدون رمز عبور
  const handleSendSignInOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setFieldErrors({});
    setServerError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFieldErrors({ email: ["لطفاً یک آدرس ایمیل معتبر وارد کنید."] });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: trimmedEmail,
        type: "sign-in",
      });

      if (error) {
        setServerError(error.message || "خطا در ارسال کد ورود به ایمیل.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setOtpInitialMessage(`کد ۶ رقمی ورود به ایمیل ${trimmedEmail} ارسال شد.`);
      setOtpStep("sign-in");
    } catch (err) {
      console.error("Send OTP login error:", err);
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
            <CardTitle className="text-xl font-bold">
              {otpStep === "email-verification"
                ? "فعال‌سازی حساب کاربری"
                : otpStep === "sign-in"
                ? "تایید کد ورود"
                : "ورود به حساب کاربری"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {otpStep
                ? "کد ۶ رقمی ارسال شده به ایمیل خود را وارد نمایید"
                : "روش ورود خود را انتخاب کنید"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {otpStep ? (
              <OtpVerificationForm
                email={email.trim()}
                mode={otpStep}
                initialMessage={otpInitialMessage}
                onSuccess={redirectAfterLogin}
                onBack={() => {
                  setOtpStep(null);
                  setServerError(null);
                }}
              />
            ) : (
              <>
                {/* سوییچر انتخاب روش ورود */}
                <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/40 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("password");
                      setServerError(null);
                      setFieldErrors({});
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                      loginMethod === "password"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Lock className="size-3.5" />
                    <span>رمز عبور</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("otp");
                      setServerError(null);
                      setFieldErrors({});
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                      loginMethod === "otp"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <KeyRound className="size-3.5" />
                    <span>کد ایمیل (OTP)</span>
                  </button>
                </div>

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

                {loginMethod === "password" ? (
                  <form onSubmit={handlePasswordLogin} className="space-y-4" noValidate>
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
                ) : (
                  <form onSubmit={handleSendSignInOtp} className="space-y-4" noValidate>
                    {/* ایمیل برای ورود با OTP */}
                    <div className="space-y-1.5">
                      <Label htmlFor="otp-email" className="text-xs font-semibold text-foreground">
                        آدرس ایمیل
                      </Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="otp-email"
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
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        یک کد ۶ رقمی یکبار مصرف به ایمیل شما ارسال می‌شود و نیازی به وارد کردن رمز عبور نیست.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="mt-2 h-10 w-full rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>در حال ارسال کد...</span>
                        </>
                      ) : (
                        <span>ارسال کد فعال‌سازی / ورود</span>
                      )}
                    </Button>
                  </form>
                )}

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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
