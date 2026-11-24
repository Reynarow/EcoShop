"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { AdminProduct } from "./product-form-modal";

type DeleteConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  product: AdminProduct | null;
};

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "خطایی در حذف محصول رخ داد.");
        return;
      }

      onSuccess(`محصول «${product.name}» با موفقیت حذف شد.`);
      onClose();
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError("خطای ارتباط با سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl border border-destructive/20 bg-card p-6 shadow-2xl transition-all">
        {/* آیکون هشدار */}
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
          <AlertTriangle className="size-6" />
        </div>

        <h2 className="text-lg font-bold text-foreground">
          حذف محصول
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          آیا از حذف محصول <span className="font-bold text-foreground">«{product.name}»</span> با قیمت{" "}
          <span className="font-bold text-foreground">{formatPrice(product.price)} تومان</span> اطمینان دارید؟
        </p>

        <p className="mt-2 text-xs font-semibold text-destructive">
          این عملیات غیرقابل بازگشت است و رکورد کالا برای همیشه از پایگاه داده پاک خواهد شد.
        </p>

        {error && (
          <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-xs font-semibold text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 mt-6 border-t border-border/50 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl font-medium cursor-pointer"
          >
            انصراف
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-xl font-bold gap-2 cursor-pointer shadow-xs min-w-28"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>در حال حذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                <span>بله، حذف شود</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
