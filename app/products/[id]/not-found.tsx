import Link from "next/link";
import { PackageX, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * صفحه ۴۰۴ اختصاصی برای محصول ناموجود
 */
export default function ProductNotFound() {
  return (
    <main className="container mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-muted/60 text-muted-foreground mb-6 shadow-xs">
        <PackageX className="size-10 stroke-[1.5]" />
      </div>

      <h1 className="text-2xl font-black text-foreground sm:text-3xl">
        محصول مورد نظر یافت نشد
      </h1>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        متأسفانه کالایی با این مشخصات در فروشگاه موجود نیست یا ممکن است حذف شده باشد.
      </p>

      <div className="mt-8">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "gap-2 rounded-xl px-6 font-bold shadow-xs transition-all hover:shadow-md"
          )}
        >
          <ArrowRight className="size-4" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>
    </main>
  );
}
