import Link from "next/link";
import { 
  ShoppingBag, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Heart,
  Send
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-card/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <ShoppingBag className="size-5" />
              </span>
              <span className="text-xl font-extrabold text-foreground">فروشگاه من</span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              فروشگاه اینترنتی من، مرجع تخصصی خرید جدیدترین کالاهای دیجیتال، لپ‌تاپ، موبایل و لوازم جانبی با ضمانت اصالت و سلامت فیزیکی در ایران.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {/* Instagram SVG */}
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition hover:border-primary hover:text-primary hover:bg-muted"
                aria-label="اینستاگرام"
              >
                <svg className="size-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              {/* Telegram SVG */}
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition hover:border-primary hover:text-primary hover:bg-muted"
                aria-label="تلگرام"
              >
                <Send className="size-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">دسترسی سریع</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/" className="transition hover:text-primary">صفحه اصلی</Link>
              </li>
              <li>
                <Link href="#products" className="transition hover:text-primary">همه محصولات</Link>
              </li>
              <li>
                <Link href="#categories" className="transition hover:text-primary">دسته‌بندی کالاها</Link>
              </li>
              <li>
                <Link href="#deals" className="transition hover:text-primary">پیشنهادات شگفت‌انگیز</Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-primary">درباره ما</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">خدمات مشتریان</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="#" className="transition hover:text-primary">پرسش‌های متداول (FAQ)</Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-primary">رویه بازگرداندن کالا</Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-primary">شرایط استفاده و حریم خصوصی</Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-primary">راهنمای ثبت سفارش</Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-primary">پیگیری سفارشات</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">ارتباط با ما</h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                <span>تهران، میدان آزادی، بلوار آزادی، ساختمان فناوری</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-primary" />
                <span dir="ltr" className="font-sans font-medium">۰۲۱ - ۱۲۳۴ ۵۶۷۸</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-primary" />
                <span dir="ltr" className="font-sans">support@eshop.ir</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/80 px-2.5 py-1.5 text-[11px] font-semibold text-foreground">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>نماد اعتماد الکترونیکی</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} تمامی حقوق مادی و معنوی این وب‌سایت متعلق به «فروشگاه من» است.</p>
          
        </div>
      </div>
    </footer>
  );
}
