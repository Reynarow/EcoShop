"use client";

import { useState, useEffect } from "react";
import {
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ArrowRight,
  MailCheck,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OtpVerificationFormProps {
  email: string;
  mode: "email-verification" | "sign-in";
  onSuccess: () => void;
  onBack?: () => void;
  initialMessage?: string;
}

export default function OtpVerificationForm({
  email,
  mode,
  onSuccess,
  onBack,
  initialMessage,
}: OtpVerificationFormProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(
    initialMessage || `کد ۶ رقمی فعال‌سازی به ایمیل ${email} ارسال شد.`
  );
  const [isVerified, setIsVerified] = useState(false);

  // تایمر معکوس برای ارسال مجدد کد
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying || isVerified) return;

    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("لطفاً کد ۶ رقمی عددی را به‌طور کامل وارد نمایید.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsVerifying(true);

    try {
      const result =
        mode === "email-verification"
          ? await authClient.emailOtp.verifyEmail({
              email,
              otp: cleanOtp,
            })
          : await authClient.signIn.emailOtp({
              email,
              otp: cleanOtp,
            });

      if (result.error) {
        const msg = (result.error.message || "").toLowerCase();
        if (msg.includes("expired")) {
          setError("کد فعال‌سازی منقضی شده است. لطفاً درخواست ارسال مجدد دهید.");
        } else if (msg.includes("invalid") || msg.includes("otp")) {
          setError("کد وارد شده اشتباه است. لطفاً دقت فرمایید.");
        } else {
          setError(result.error.message || "خطا در تایید کد. لطفاً مجدداً تلاش کنید.");
        }
        setIsVerifying(false);
        return;
      }

      setIsVerified(true);
      onSuccess();
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("خطای ارتباط با سرور. لطفاً دوباره تلاش کنید.");
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setError(null);
    setInfoMessage(null);
    setIsResending(true);

    try {
      const { error: resendErr } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: mode,
      });

      if (resendErr) {
        setError(resendErr.message || "خطا در ارسال مجدد کد.");
      } else {
        setCooldown(60);
        setInfoMessage("کد فعال‌سازی جدید به ایمیل شما ارسال شد.");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("خطا در ارتباط با سرور هنگام ارسال مجدد کد.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* باکس نمایش ایمیل مقصد */}
      <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-xs">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MailCheck className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground">
            {mode === "email-verification"
              ? "فعال‌سازی حساب کاربری"
              : "ورود با کد یکبار مصرف"}
          </p>
          <p className="truncate text-muted-foreground mt-0.5" dir="ltr">
            {email}
          </p>
        </div>
      </div>

      {/* پیام اطلاع‌رسانی */}
      {infoMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs font-medium text-blue-600 dark:text-blue-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* پیام خطا */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive animate-in fade-in"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* پیام تایید موفق */}
      {isVerified && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>حساب شما با موفقیت فعال و تایید شد! در حال انتقال...</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="otp" className="text-xs font-semibold">
            کد فعال‌سازی ۶ رقمی
          </Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="------"
              value={otp}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(onlyDigits);
              }}
              disabled={isVerifying || isVerified}
              className="h-12 rounded-xl pr-9 pl-4 text-center font-mono text-lg font-black tracking-[0.5em]"
              dir="ltr"
              autoFocus
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            پوشه Spam / Junk ایمیل خود را نیز در صورت عدم مشاهده پیام بررسی کنید.
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isVerifying || isVerified || otp.length !== 6}
          className="h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 cursor-pointer disabled:opacity-60"
        >
          {isVerifying ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>در حال بررسی کد...</span>
            </>
          ) : (
            <span>تایید و فعال‌سازی حساب</span>
          )}
        </Button>
      </form>

      {/* دکمه ارسال مجدد و بازگشت */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending || isVerified}
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
        >
          <RotateCw className={`size-3.5 ${isResending ? "animate-spin" : ""}`} />
          {cooldown > 0 ? (
            <span>ارسال مجدد کد ({cooldown.toLocaleString("fa-IR")} ثانیه)</span>
          ) : (
            <span>ارسال مجدد کد</span>
          )}
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isVerifying || isVerified}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowRight className="size-3.5" />
            <span>ویرایش ایمیل</span>
          </button>
        )}
      </div>
    </div>
  );
}
