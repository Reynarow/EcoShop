import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const FEATURES = [
  {
    icon: Truck,
    title: "ارسال سریع و مطمئن",
    description: "تحویل اکسپرس در کوتاه‌ترین زمان به سراسر کشور",
    color: "text-blue-500 bg-blue-500/10 dark:text-blue-400",
  },
  {
    icon: ShieldCheck,
    title: "ضمانت اصالت ۱۰۰٪",
    description: "تضمین اصل بودن کلیه محصولات با گارانتی معتبر",
    color: "text-emerald-500 bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    icon: RotateCcw,
    title: "۷ روز مهلت بازگشت",
    description: "امکان مرجوعی کالا در صورت هرگونه مغایرت یا نقص",
    color: "text-amber-500 bg-amber-500/10 dark:text-amber-400",
  },
  {
    icon: Headphones,
    title: "پشتیبانی ۲۴/۷",
    description: "پاسخگویی سریع کارشناسان در تمام روزهای هفته",
    color: "text-purple-500 bg-purple-500/10 dark:text-purple-400",
  },
];

export default function Features() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-md"
            >
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${item.color} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className="size-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

