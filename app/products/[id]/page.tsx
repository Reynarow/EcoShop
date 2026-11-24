import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Package,
  ShieldCheck,
  RotateCcw,
  Truck,
  Star,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "@/components/cart/add-to-cart-button";
import ProductCard from "@/components/products/product-card";
import ProductReviews, { type ProductReviewItem } from "@/components/products/product-reviews";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * تابع استخراج و اعتبارسنجی شناسه عددی کالا از پارامترهای مسیر
 */
async function getValidatedProductId(paramsPromise: Promise<{ id: string }>): Promise<number | null> {
  const { id } = await paramsPromise;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  return productId;
}

/**
 * تولید متادیتای داینامیک برای سئو (SEO)
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const productId = await getValidatedProductId(params);

  if (!productId) {
    return {
      title: "محصول یافت نشد | فروشگاه من",
    };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return {
      title: "محصول یافت نشد | فروشگاه من",
    };
  }

  return {
    title: `${product.name} | فروشگاه من`,
    description: product.description || `خرید اینترنتی ${product.name} با بهترین قیمت و ضمانت اصالت کالا`,
    openGraph: {
      title: product.name,
      description: product.description || `خرید اینترنتی ${product.name}`,
      ...(product.image && { images: [{ url: product.image }] }),
    },
  };
}

/**
 * صفحه پیشرفته جزئیات محصول (Advanced Product Detail Page)
 */
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const productId = await getValidatedProductId(params);

  if (!productId) {
    notFound();
  }

  const [product, relatedProducts, rawReviews] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
    }),
    prisma.product.findMany({
      where: { id: { not: productId } },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const serializedReviews: ProductReviewItem[] = rawReviews.map((r) => ({
    id: r.id,
    productId: r.productId,
    userId: r.userId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    user: r.user,
  }));

  const totalReviews = serializedReviews.length;
  const averageRating =
    totalReviews > 0
      ? Number(
          (
            serializedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          ).toFixed(1)
        )
      : 0;

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl space-y-12">
      {/* ناوبری مسیر دسترسی (Breadcrumbs) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          صفحه اصلی
        </Link>
        <ChevronLeft className="size-3.5 text-muted-foreground/60" />
        <Link href="/#products" className="hover:text-foreground transition-colors">
          محصولات
        </Link>
        <ChevronLeft className="size-3.5 text-muted-foreground/60" />
        <span className="text-foreground truncate max-w-[200px] sm:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* بخش اصلی محصول: چیدمان دو ستونه ریسپانسیو مدرن */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start">
        {/* ستون ۱ (چپ): تصویر بزرگ محصول و گالری با کادر بلور */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 relative aspect-square w-full overflow-hidden rounded-3xl border border-border/70 bg-card p-3 shadow-xs">
            <div className="relative size-full overflow-hidden rounded-2xl bg-muted/20 border border-border/40">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 450px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-3 bg-muted/40 p-6 text-center text-muted-foreground/60">
                  <Package className="size-20 stroke-[1.2] text-muted-foreground/40" />
                  <span className="text-sm font-medium text-muted-foreground/70">
                    تصویری برای این محصول بارگذاری نشده است
                  </span>
                </div>
              )}

              {/* نشانگر گارانتی روی عکس */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm backdrop-blur-md border border-border/60">
                <ShieldCheck className="size-3.5" />
                <span>۱۰۰٪ اورجینال</span>
              </div>
            </div>
          </div>
        </div>

        {/* ستون ۲ (راست): مشخصات کامل، قیمت‌گذاری و دکمه خرید تعاملی */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* سربرگ مشخصات */}
          <div className="space-y-3 border-b border-border/50 pb-5">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>موجود در انبار - آماده ارسال اکسپرس</span>
              </span>

              <span className="text-muted-foreground">
                شناسه کالا: <span className="font-mono text-foreground font-semibold" dir="ltr">DKP-{product.id}</span>
              </span>

              <a
                href="#reviews"
                className="flex items-center gap-1 text-amber-500 mr-auto font-bold hover:opacity-80 transition-opacity"
              >
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span>
                  {totalReviews > 0 ? averageRating.toLocaleString("fa-IR") : "جدید"}
                </span>
                <span className="text-muted-foreground font-normal text-[11px]">
                  ({totalReviews.toLocaleString("fa-IR")} دیدگاه خریداران)
                </span>
              </a>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl leading-snug">
              {product.name}
            </h1>
          </div>

          {/* باکس قیمت و افزودن به سبد خرید پیشرفته */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">قیمت مصرف‌کننده:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">
                    تومان
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-2xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                <Truck className="size-4" />
                <span>ارسال رایگان به سراسر کشور</span>
              </div>
            </div>

            {/* ویژگی‌های کلیدی این محصول */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>تضمین سلامت فیزیکی و اصالت کالا</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>تحویل اکسپرس ۱ روزه در تهران و ۲ روزه شهرستان‌ها</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>۷ روز ضمانت بازگشت وجه در صورت هرگونه نقص</span>
              </div>
            </div>

            {/* کنترل تعداد و دکمه خرید */}
            <div className="pt-2">
              <AddToCartButton product={product} />
            </div>
          </div>

          {/* مزایای خرید سریع */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1.5 p-1">
              <ShieldCheck className="size-5 text-primary" />
              <span className="font-bold text-foreground">ضمانت اصالت</span>
              <span className="text-[10px] hidden sm:inline">۱۰۰٪ اورجینال</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-1 border-x border-border/40">
              <Truck className="size-5 text-primary" />
              <span className="font-bold text-foreground">ارسال رایگان</span>
              <span className="text-[10px] hidden sm:inline">برای سفارش‌های آنلاین</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-1">
              <RotateCcw className="size-5 text-primary" />
              <span className="font-bold text-foreground">بازگشت کالا</span>
              <span className="text-[10px] hidden sm:inline">تا ۷ روز کاری</span>
            </div>
          </div>

          {/* توضیحات و نقد کالا */}
          <div className="space-y-3 pt-2">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Sparkles className="size-4 text-primary" />
              <span>نقد، بررسی و مشخصات کالا</span>
            </h2>

            <div className="rounded-3xl border border-border/60 bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-xs">
              {product.description ? (
                <p className="whitespace-pre-line text-foreground/90 leading-loose">
                  {product.description}
                </p>
              ) : (
                <p className="text-muted-foreground/70 italic">
                  توضیحات تکمیلی برای این کالا به زودی افزوده خواهد شد.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* بخش دیدگاه‌ها و امتیازات کاربران */}
      <ProductReviews productId={product.id} initialReviews={serializedReviews} />

      {/* بخش محصولات مرتبط و مشابه */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border/60 pt-10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <span className="size-2 rounded-full bg-primary" />
                <span>پیشنهادات ویژه</span>
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-foreground">
                محصولات مرتبط و مشابه
              </h2>
            </div>

            <Link
              href="/#products"
              className="text-xs font-bold text-primary hover:underline"
            >
              مشاهده همه محصولات
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((relProd) => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
