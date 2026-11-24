import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, Flame, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-12 md:py-20 lg:py-24">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-1/4 -right-24 -z-10 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -left-24 -z-10 size-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Right Column: Hero Content */}
          <div className="lg:col-span-7">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary backdrop-blur-md">
              <span className="flex size-2 rounded-full bg-primary animate-pulse" />
              <span>جشنواره شگفت‌انگیز محصولات دیجیتال</span>
              <span className="font-bold text-rose-500 dark:text-rose-400">| تا ۵۰٪ تخفیف</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.15]">
              جدیدترین فناوری‌ها را با{" "}
              <span className="bg-gradient-to-l from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-primary dark:via-sky-400 dark:to-blue-400">
                بهترین قیمت
              </span>{" "}
              تجربه کنید
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base text-muted-foreground sm:text-lg leading-relaxed max-w-2xl">
              گلچینی از جدیدترین گوشی‌های هوشمند، لپ‌تاپ‌های قدرتمند و لوازم جانبی با ضمانت ۱۰۰٪ اصالت و ارسال اکسپرس به سراسر کشور.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#products"
                className={buttonVariants({
                  size: "lg",
                  className: "group gap-2 rounded-xl px-6 font-semibold shadow-md shadow-primary/20 cursor-pointer",
                })}
              >
                <span>مشاهده محصولات</span>
                <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
              </Link>

              <Link
                href="#categories"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "gap-2 rounded-xl border-border/80 px-6 font-medium cursor-pointer hover:bg-muted/70",
                })}
              >
                <Sparkles className="size-4 text-amber-500" />
                <span>دسته‌بندی‌های برتر</span>
              </Link>
            </div>

            {/* Micro Social Proof / Trust Markers */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border/60 pt-6">
              <div>
                <div className="text-xl font-extrabold sm:text-2xl text-foreground">+۱۰,۰۰۰</div>
                <div className="text-xs text-muted-foreground mt-0.5">مشتری راضی</div>
              </div>
              <div>
                <div className="text-xl font-extrabold sm:text-2xl text-foreground">+۵۰۰</div>
                <div className="text-xs text-muted-foreground mt-0.5">محصول اورجینال</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-xl font-extrabold sm:text-2xl text-foreground">
                  <span>۴.۹</span>
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">رضایت خریداران</div>
              </div>
            </div>
          </div>

          {/* Left Column: Visual Showcase Card */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Background gradient frame */}
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-primary/30 via-sky-500/20 to-indigo-500/30 opacity-70 blur-xl" />

              {/* Showcase Card */}
              <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-2xl backdrop-blur-xl">
                
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <Flame className="size-3.5" />
                    پیشنهاد داغ روز
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                    تنها ۲ عدد در انبار باقیست
                  </span>
                </div>

                {/* Featured Product Image */}
                <div className="relative my-6 aspect-square w-full overflow-hidden rounded-2xl bg-muted/30 border border-border/40">
                  <Image
                    src="/products/phone.jpg"
                    alt="گوشی هوشمند سامسونگ"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />

                  {/* Floating pill: Express Delivery */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[11px] font-bold text-foreground shadow-md backdrop-blur-md border border-border/60">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>تحویل اکسپرس امروز</span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-foreground">
                      گوشی موبایل سامسونگ Galaxy S25
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="size-3.5 fill-current" />
                      <span>۴.۹</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    نسخه ۲۵۶ گیگابایت • گارانتی ۱۸ ماهه شرکتی
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60">
                    <div>
                      <div className="text-xs text-muted-foreground line-through">
                        {(38500000).toLocaleString("fa-IR")} تومان
                      </div>
                      <div className="text-base font-extrabold text-foreground sm:text-lg">
                        {(35000000).toLocaleString("fa-IR")} تومان
                      </div>
                    </div>

                    <Link
                      href="#products"
                      className={buttonVariants({
                        size: "sm",
                        className: "rounded-xl font-semibold shadow-xs cursor-pointer",
                      })}
                    >
                      خرید سریع
                    </Link>
                  </div>
                </div>

                {/* Floating pill: Free Delivery */}
               

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
