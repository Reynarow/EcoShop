import Link from "next/link";
import { 
  Smartphone, 
  Laptop, 
  Headphones, 
  Watch, 
  Gamepad2, 
  MousePointer, 
  ArrowLeft 
} from "lucide-react";

const CATEGORIES = [
  {
    title: "موبایل و تبلت",
    count: "۱۵۰+ کالا",
    href: "#products",
    icon: Smartphone,
    color: "from-blue-500/20 to-cyan-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    title: "لپ‌تاپ و کامپیوتر",
    count: "۸۵+ کالا",
    href: "#products",
    icon: Laptop,
    color: "from-purple-500/20 to-pink-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    title: "هدفون و اسپیکر",
    count: "۹۵+ کالا",
    href: "#products",
    icon: Headphones,
    color: "from-rose-500/20 to-orange-500/10 text-rose-600 dark:text-rose-400",
  },
  {
    title: "ساعت و مچ‌بند",
    count: "۶۰+ کالا",
    href: "#products",
    icon: Watch,
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "کنسول و گیمینگ",
    count: "۴۵+ کالا",
    href: "#products",
    icon: Gamepad2,
    color: "from-amber-500/20 to-yellow-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    title: "ماوس و لوازم جانبی",
    count: "۲۱۰+ کالا",
    href: "#products",
    icon: MousePointer,
    color: "from-indigo-500/20 to-blue-500/10 text-indigo-600 dark:text-indigo-400",
  },
];

export default function Categories() {
  return (
    <section id="categories" className="container mx-auto px-4 py-12 md:py-16">
      {/* Section Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <span className="size-2 rounded-full bg-primary" />
            <span>دسته‌بندی‌ها</span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            دسته‌بندی‌های محبوب
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            بر اساس نیاز خود در میان صدها محصول باکیفیت جستجو کنید
          </p>
        </div>

        <Link
          href="#products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80 sm:text-sm"
        >
          <span>مشاهده همه دسته‌ها</span>
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.title}
              href={category.href}
              className="group relative flex flex-col items-center rounded-2xl border border-border/70 bg-card p-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div
                className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${category.color} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className="size-7" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                {category.title}
              </h3>

              <span className="mt-1 text-xs text-muted-foreground">
                {category.count}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
