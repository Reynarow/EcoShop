import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
        <Loader2 className="size-7 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-muted-foreground animate-pulse">
        در حال بارگذاری...
      </p>
    </div>
  );
}
