"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
  };

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-muted/60 to-card p-8 md:p-12 shadow-xs text-center max-w-4xl mx-auto">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
          <Mail className="size-7" />
        </div>

        <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
          عضویت در باشگاه مشتریان و خبرنامه تخفیف‌ها
        </h2>

        <p className="mt-2 text-sm text-muted-foreground sm:text-base max-w-xl mx-auto leading-relaxed">
          با عضویت در خبرنامه، از اولین کسانی باشید که کدهای تخفیف، حراج‌های فصلی و محصولات جدید را دریافت می‌کنند.
        </p>

        {isSubscribed ? (
          <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
            <span>با تشکر! اشتراک شما با موفقیت ثبت شد.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Input
                type="email"
                placeholder="ایمیل یا شماره موبایل خود را وارد کنید..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl bg-background border-border/80 text-xs sm:text-sm pl-4 pr-4"
              />
            </div>
            <Button
              type="submit"
              className="h-11 rounded-xl px-6 font-semibold shadow-xs cursor-pointer gap-2"
            >
              <span>عضویت</span>
              <Send className="size-4" />
            </Button>
          </form>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          ما به حریم خصوصی شما احترام می‌گذاریم و هرگز ایمیل شما را اسپم نمی‌کنیم.
        </p>
      </div>
    </section>
  );
}

