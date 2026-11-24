export default function OrderDetailLoading() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-6">
      <div className="h-5 w-44 rounded-md bg-muted/60 animate-pulse" />

      <div className="rounded-3xl border border-border/60 bg-card p-6 space-y-5 animate-pulse">
        <div className="flex items-center justify-between border-b border-border/40 pb-5">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-md bg-muted/50" />
            <div className="h-7 w-40 rounded-lg bg-muted/70" />
          </div>
          <div className="h-8 w-32 rounded-2xl bg-muted/60" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-5 w-48 rounded-md bg-muted/50" />
          <div className="h-5 w-40 rounded-md bg-muted/50" />
          <div className="h-5 w-full sm:col-span-2 rounded-md bg-muted/50" />
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-6 space-y-4 animate-pulse">
        <div className="h-5 w-36 rounded-md bg-muted/60" />
        <div className="h-20 rounded-2xl bg-muted/40" />
        <div className="h-20 rounded-2xl bg-muted/40" />
      </div>
    </main>
  );
}
