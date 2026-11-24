"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Flame, ArrowLeft, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/**
 * محاسبه ثانیه‌های باقی‌مانده تا پایان روز (ساعت ۲۴:۰۰)
 */
function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(23, 59, 59, 999);
  const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000);
  return diff > 0 ? diff : 24 * 3600;
}

/**
 * اشتراک زمانی برای شمارش معکوس هر ۱ ثانیه
 */
function subscribe(callback: () => void) {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}

// مقدار اولیه ثابت جهت هماهنگی کامل SSR و جلوگیری از Hydration Mismatch
const SERVER_SNAPSHOT = 8 * 3600 + 42 * 60 + 19;

function getServerSnapshot(): number {
  return SERVER_SNAPSHOT;
}

/**
 * تبدیل عدد به فرمت دو رقمی با اعداد فارسی (مثال: 07 -> ۰۷)
 */
function toPersianDigits(num: number): string {
  return num
    .toString()
    .padStart(2, "0")
    .replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);
}

export default function DealsBanner() {
  const timeLeft = useSyncExternalStore(
    subscribe,
    getSecondsUntilMidnight,
    getServerSnapshot
  );

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <section id="deals" className="container mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-rose-600 via-rose-500 to-amber-500 p-8 text-white shadow-xl md:p-12">
        {/* Decorative background shapes */}
        <div className="pointer-events-none absolute -left-12 -bottom-12 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-12 -top-12 size-72 rounded-full bg-black/10 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Text Content */}
          <div className="text-center md:text-right max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
              <Flame className="size-4 animate-bounce text-amber-200" />
              <span>پیشنهاد شگفت‌انگیز آخر هفته</span>
            </div>

            <h2 className="mt-3 text-2xl font-black sm:text-4xl leading-tight">
              تا ۵۰٪ تخفیف روی هدفون‌ها و لوازم جانبی
            </h2>

            <p className="mt-2 text-sm text-white/90 sm:text-base leading-relaxed">
              فرصت استثنایی خرید برترین برندهای صوتی و جانبی دنیا با گارانتی تعویض و ارسال رایگان
            </p>
          </div>

          {/* Countdown & Action */}
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {/* Visual Countdown Box */}
            <div className="flex items-center gap-2 rounded-2xl bg-black/20 p-2.5 backdrop-blur-md">
              <div className="flex items-center pl-1 text-amber-200">
                <Clock className="size-5" />
              </div>

              <div className="flex flex-col items-center rounded-xl bg-white/15 px-3 py-1.5 min-w-[50px]">
                <span className="text-lg font-black font-mono">
                  {toPersianDigits(hours)}
                </span>
                <span className="text-[10px] text-white/80">ساعت</span>
              </div>
              <span className="font-bold text-lg animate-pulse">:</span>
              <div className="flex flex-col items-center rounded-xl bg-white/15 px-3 py-1.5 min-w-[50px]">
                <span className="text-lg font-black font-mono">
                  {toPersianDigits(minutes)}
                </span>
                <span className="text-[10px] text-white/80">دقیقه</span>
              </div>
              <span className="font-bold text-lg animate-pulse">:</span>
              <div className="flex flex-col items-center rounded-xl bg-white/15 px-3 py-1.5 min-w-[50px]">
                <span className="text-lg font-black font-mono">
                  {toPersianDigits(seconds)}
                </span>
                <span className="text-[10px] text-white/80">ثانیه</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href="#products"
              className={buttonVariants({
                size: "lg",
                className: "rounded-2xl bg-white text-rose-600 hover:bg-white/90 font-bold shadow-md cursor-pointer",
              })}
            >
              <span>مشاهده و خرید</span>
              <ArrowLeft className="size-4 mr-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
