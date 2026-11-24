export default function ProductDetailLoading() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl space-y-12">
      {/* اسکلِتون مسیر دسترسی (Breadcrumbs) */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-4 w-4 rounded-md bg-muted/40 animate-pulse" />
        <div className="h-4 w-16 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-4 w-4 rounded-md bg-muted/40 animate-pulse" />
        <div className="h-4 w-40 rounded-md bg-muted/70 animate-pulse" />
      </div>

      {/* اسکلِتون بخش اصلی دو ستونه */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start">
        {/* ستون ۱: تصویر محصول */}
        <div className="lg:col-span-5">
          <div className="aspect-square w-full rounded-3xl border border-border/60 bg-card p-3">
            <div className="size-full rounded-2xl bg-muted/50 animate-pulse" />
          </div>
        </div>

        {/* ستون ۲: مشخصات و باکس خرید */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* سربرگ */}
          <div className="space-y-3 border-b border-border/50 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-6 w-48 rounded-full bg-muted/60 animate-pulse" />
              <div className="h-4 w-24 rounded-md bg-muted/50 animate-pulse" />
            </div>
            <div className="h-8 w-3/4 rounded-xl bg-muted/70 animate-pulse" />
          </div>

          {/* باکس قیمت و دکمه خرید */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded-md bg-muted/50 animate-pulse" />
                <div className="h-8 w-40 rounded-xl bg-muted/70 animate-pulse" />
              </div>
              <div className="h-8 w-36 rounded-2xl bg-muted/50 animate-pulse" />
            </div>

            <div className="space-y-2.5">
              <div className="h-4 w-56 rounded-md bg-muted/40 animate-pulse" />
              <div className="h-4 w-64 rounded-md bg-muted/40 animate-pulse" />
              <div className="h-4 w-52 rounded-md bg-muted/40 animate-pulse" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-12 w-32 rounded-2xl bg-muted/60 animate-pulse" />
              <div className="h-12 flex-1 rounded-2xl bg-primary/20 animate-pulse" />
            </div>
          </div>

          {/* مزایای خرید */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border/50 bg-muted/20 p-4">
            <div className="h-14 rounded-xl bg-muted/40 animate-pulse" />
            <div className="h-14 rounded-xl bg-muted/40 animate-pulse" />
            <div className="h-14 rounded-xl bg-muted/40 animate-pulse" />
          </div>

          {/* توضیحات */}
          <div className="space-y-3 pt-2">
            <div className="h-5 w-44 rounded-lg bg-muted/60 animate-pulse" />
            <div className="h-32 w-full rounded-3xl border border-border/60 bg-card p-6 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
