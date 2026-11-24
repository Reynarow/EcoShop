import Link from "next/link";
import { PackageX, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * صفحه ۴۰۴ سراسری برنامه (Root Not Found)
 * این صفحه هم برای آدرس‌های ناموجود در کل برنامه و هم هنگام فراخوانی notFound() نمایش داده می‌شود.
 */
export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex size-24 items-center justify-center rounded-3xl bg-muted/60 text-muted-foreground mb-6 shadow-xs">
        <PackageX className="size-12 stroke-[1.5] text-primary" />
      </div>

      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
        خطای ۴۰۴
      </span>

      <h1 className="mt-3 text-2xl font-black text-foreground sm:text-3xl">
        صفحه یا محصول مورد نظر یافت نشد
      </h1>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        متأسفانه آدرسی که وارد کردید یا محصولی که به دنبال آن هستید وجود ندارد، حذف شده یا آدرس اشتباه وارد شده است.
      </p>

      <div className="mt-8">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "gap-2 rounded-xl px-6 font-bold shadow-xs transition-all hover:shadow-md"
          )}
        >
          <Home className="size-4" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>
    </main>
  );
}
