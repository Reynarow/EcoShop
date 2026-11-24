import { Sparkles, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductsCatalog from "@/components/home/products-catalog";
import type { Product } from "@/components/products/product-card";

/**
 * کامپوننت لودینگ اسکلتون برای بخش محصولات در هنگام استریمینگ یا تعلیق (Suspense)
 */
export function ProductsSectionSkeleton() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-8">
        <div className="h-4 w-28 rounded-md bg-muted/60 animate-pulse" />
        <div className="mt-2 h-7 w-48 rounded-md bg-muted/80 animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded-md bg-muted/60 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-3 shadow-xs animate-pulse"
          >
            <div>
              <div className="aspect-square w-full rounded-xl bg-muted/60" />
              <div className="pt-3 pb-1 space-y-2">
                <div className="h-4 w-3/4 rounded-md bg-muted/70" />
                <div className="h-3 w-1/2 rounded-md bg-muted/50" />
              </div>
            </div>
            <div className="mt-4 border-t border-border/40 pt-3 space-y-2.5">
              <div className="h-5 w-24 rounded-md bg-muted/70" />
              <div className="h-8 w-full rounded-xl bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * کامپوننت سروری بخش محصولات در صفحه اصلی
 * محصولات را مستقیماً از طریق پریزما از پایگاه داده دریافت می‌کند.
 */
export default async function ProductsSection() {
  let products: Product[] = [];
  let errorOccurred = false;

  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch products for homepage:", error);
    errorOccurred = true;
  }

  return (
    <section id="products" className="container mx-auto px-4 py-12 md:py-16">
      {/* هدر بخش محصولات */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <span className="size-2 rounded-full bg-primary" />
            <Sparkles className="size-3.5" />
            <span>جدیدترین محصولات</span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            محصولات فروشگاه
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            برترین و جدیدترین کالاهای موجود با بهترین قیمت و ضمانت اصالت
          </p>
        </div>

        {products.length > 0 && (
          <div className="text-xs font-medium text-muted-foreground">
            <span>تعداد کل کالاها: </span>
            <span className="font-bold text-foreground">
              {products.length.toLocaleString("fa-IR")}
            </span>
            <span> کالا</span>
          </div>
        )}
      </div>

      {/* وضعیت خطا */}
      {errorOccurred && (
        <div className="my-10 flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertCircle className="size-10 text-destructive mb-3" />
          <h3 className="text-base font-bold text-foreground">
            خطا در بارگذاری محصولات
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            متأسفانه در برقراری ارتباط با پایگاه داده مشکلی پیش آمده است. لطفاً بعداً دوباره امتحان کنید.
          </p>
        </div>
      )}

      {/* کاتالوگ تعاملی محصولات به همراه فیلتر و جستجو */}
      {!errorOccurred && <ProductsCatalog products={products} />}
    </section>
  );
}
