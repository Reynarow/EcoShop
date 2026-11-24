export default function AccountOrdersLoading() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="flex flex-col gap-2 border-b border-border/60 pb-6 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded-md bg-muted/60 animate-pulse" />
          <div className="h-8 w-44 rounded-xl bg-muted/80 animate-pulse" />
          <div className="h-4 w-64 rounded-md bg-muted/50 animate-pulse" />
        </div>
        <div className="h-5 w-28 rounded-md bg-muted/60 animate-pulse" />
      </div>

      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 space-y-4 animate-pulse"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="h-5 w-52 rounded-lg bg-muted/60" />
              <div className="h-6 w-28 rounded-full bg-muted/60" />
            </div>
            <div className="flex gap-3">
              <div className="size-16 rounded-2xl bg-muted/50" />
              <div className="size-16 rounded-2xl bg-muted/50" />
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-3">
              <div className="h-5 w-44 rounded-md bg-muted/60" />
              <div className="h-8 w-36 rounded-xl bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
