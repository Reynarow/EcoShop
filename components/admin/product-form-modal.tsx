"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Loader2,
  Save,
  Plus,
  UploadCloud,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";

export type AdminProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ProductFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  productToEdit?: AdminProduct | null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // ۵ مگابایت
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function ProductFormInner({
  onClose,
  onSuccess,
  productToEdit,
}: Omit<ProductFormModalProps, "isOpen">) {
  const isEditing = Boolean(productToEdit);

  // راه‌اندازی استیت‌ها مستقیماً از مقادیر اولیه
  const [name, setName] = useState(productToEdit?.name || "");
  const [price, setPrice] = useState(productToEdit?.price ? String(productToEdit.price) : "");
  const [description, setDescription] = useState(productToEdit?.description || "");
  const [image, setImage] = useState(productToEdit?.image || "");

  // استیت‌های آپلود تصویر
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // بستن مودال با کلید Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting && !isUploading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, isUploading, onClose]);

  // پردازش و ارسال فایل به سرور جهت ذخیره محلی
  const processAndUploadFile = async (file: File) => {
    setUploadError(null);

    // اعتبارسنجی اولیه فرمت
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("فرمت فایل مجاز نیست. لطفاً یکی از فرمت‌های JPEG، PNG یا WebP را انتخاب نمایید.");
      return;
    }

    // اعتبارسنجی اندازه
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("حجم فایل بیش از حد مجاز است (حداکثر ۵ مگابایت).");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "خطایی در ذخیره تصویر روی سرور رخ داد.");
        return;
      }

      // تنظیم آدرس تصویر برگردانده شده از سرور
      setImage(data.url);
      setUploadError(null);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("خطا در ارسال تصویر به سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFieldErrors({ name: ["نام محصول نمی‌تواند خالی باشد"] });
      return;
    }

    const numericPrice = Number(price);
    if (!price || isNaN(numericPrice) || !Number.isInteger(numericPrice) || numericPrice <= 0) {
      setFieldErrors({ price: ["قیمت باید یک عدد صحیح و بزرگتر از صفر باشد"] });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: {
        name: string;
        price: number;
        description?: string;
        image?: string;
      } = {
        name: trimmedName,
        price: numericPrice,
      };

      if (description.trim()) {
        payload.description = description.trim();
      }
      if (image.trim()) {
        payload.image = image.trim();
      }

      const url = isEditing
        ? `/api/products/${productToEdit?.id}`
        : "/api/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        setGeneralError(data.error || "خطایی در ثبت اطلاعات رخ داد");
        return;
      }

      onSuccess(isEditing ? "محصول با موفقیت ویرایش شد" : "محصول جدید با موفقیت اضافه شد");
      onClose();
    } catch (err) {
      console.error("Error saving product:", err);
      setGeneralError("خطای ارتباط با سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl transition-all scrollbar-thin">
      {/* هدر مدال */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {isEditing ? <Save className="size-5" /> : <Plus className="size-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {isEditing ? "ویرایش محصول" : "افزودن محصول جدید"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? "اطلاعات محصول را تغییر داده و ذخیره کنید."
                : "اطلاعات محصول جدید را همراه با تصویر وارد نمایید."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting || isUploading}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-50"
          aria-label="بستن"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* خطای کلی فرم */}
      {generalError && (
        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
          {generalError}
        </div>
      )}

      {/* بدنه فرم */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* نام کالا */}
        <div className="space-y-1.5">
          <Label htmlFor="product-name" className="text-xs font-semibold text-foreground">
            نام محصول <span className="text-destructive">*</span>
          </Label>
          <Input
            id="product-name"
            type="text"
            placeholder="مثال: گوشی سامسونگ S25 Ultra"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className={fieldErrors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}
          />
          {fieldErrors.name && (
            <p className="text-[11px] font-medium text-destructive">{fieldErrors.name[0]}</p>
          )}
        </div>

        {/* قیمت کالا */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="product-price" className="text-xs font-semibold text-foreground">
              قیمت (تومان) <span className="text-destructive">*</span>
            </Label>
            {price && !isNaN(Number(price)) && Number(price) > 0 && (
              <span className="text-[11px] font-bold text-primary">
                {formatPrice(Number(price))} تومان
              </span>
            )}
          </div>
          <Input
            id="product-price"
            type="number"
            placeholder="مثال: 35000000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isSubmitting}
            className={fieldErrors.price ? "border-destructive focus-visible:ring-destructive/30" : ""}
          />
          {fieldErrors.price && (
            <p className="text-[11px] font-medium text-destructive">{fieldErrors.price[0]}</p>
          )}
        </div>

        {/* بخش آپلود و ذخیره تصویر روی سرور */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">
              تصویر محصول
            </Label>
            <button
              type="button"
              onClick={() => setShowManualUrl(!showManualUrl)}
              className="text-[11px] font-medium text-primary hover:underline cursor-pointer flex items-center gap-1"
            >
              <LinkIcon className="size-3" />
              <span>{showManualUrl ? "بستن آدرس دستی" : "وارد کردن آدرس دستی (URL)"}</span>
            </button>
          </div>

          {/* مخزن آپلود فایل با قابلیت Drag & Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
              isDragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
            } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isUploading || isSubmitting}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-3 text-primary">
                <Loader2 className="size-7 animate-spin" />
                <span className="text-xs font-semibold">در حال پردازش و ذخیره روی سرور...</span>
              </div>
            ) : (
              <>
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UploadCloud className="size-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground">
                    عکس را اینجا رها کنید یا برای انتخاب کلیک نمایید
                  </span>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    فرمت‌های مجاز: JPEG، PNG، WebP (حداکثر ۵ مگابایت)
                  </p>
                </div>
              </>
            )}
          </div>

          {/* خطای آپلود تصویر */}
          {uploadError && (
            <div className="flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 p-2 text-xs font-semibold text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* پیش‌نمایش تصویر کنونی کالا */}
          {image && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted border border-border/50">
                  <Image
                    src={image}
                    alt="پیش‌نمایش تصویر"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="truncate text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground">تصویر آماده ثبت</span>
                    {image.startsWith("/uploads/") && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        <span>ذخیره در سرور</span>
                      </span>
                    )}
                  </div>
                  <span className="block truncate text-[11px] font-mono text-muted-foreground mt-0.5">
                    {image}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setImage("")}
                disabled={isSubmitting || isUploading}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                title="حذف این تصویر"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}

          {/* ورودی دستی آدرس اینترنتی (اختیاری) */}
          {showManualUrl && (
            <div className="pt-1 space-y-1">
              <Input
                type="text"
                placeholder="آدرس مستقیم تصویر: /uploads/... یا /products/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                disabled={isSubmitting || isUploading}
                className="text-xs"
              />
            </div>
          )}
        </div>

        {/* توضیحات کالا */}
        <div className="space-y-1.5">
          <Label htmlFor="product-description" className="text-xs font-semibold text-foreground">
            توضیحات و مشخصات (اختیاری)
          </Label>
          <textarea
            id="product-description"
            rows={3}
            placeholder="توضیحات تکمیلی، مشخصات فنی و گارانتی کالا..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 resize-none dark:bg-input/30"
          />
        </div>

        {/* دکمه‌های اقدام */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border/50 pt-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="rounded-xl font-medium cursor-pointer"
          >
            انصراف
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="rounded-xl font-bold gap-2 cursor-pointer shadow-xs min-w-28"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>در حال ذخیره...</span>
              </>
            ) : isEditing ? (
              <>
                <Save className="size-4" />
                <span>ذخیره تغییرات</span>
              </>
            ) : (
              <>
                <Plus className="size-4" />
                <span>افزودن محصول</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  productToEdit,
}: ProductFormModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <ProductFormInner
        key={productToEdit ? `edit-${productToEdit.id}` : "create"}
        onClose={onClose}
        onSuccess={onSuccess}
        productToEdit={productToEdit}
      />
    </div>
  );
}
