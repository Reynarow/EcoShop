"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Truck,
  CreditCard
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { useCartStore, useCartHydrated } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { createOrderSchema } from "@/lib/validations/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  const items = useCartHydrated((state) => state.items, []);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  // فرم اطلاعات تحویل
  const [enteredName, setEnteredName] = useState<string | null>(null);
  const customerName = enteredName !== null ? enteredName : (session?.user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // وضعیت موفقیت سفارش
  const [createdOrder, setCreatedOrder] = useState<{
    id: number;
    totalPrice: number;
  } | null>(null);

  // بررسی وضعیت احراز هویت
  useEffect(() => {
    if (!isAuthPending && !session?.user) {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [isAuthPending, session, router]);

  if (isAuthPending) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">در حال بررسی اطلاعات کاربری...</p>
      </div>
    );
  }

  if (!session?.user) {
    return null; // در حال انتقال به صفحه ورود
  }

  // در صورت ثبت موفقیت‌آمیز سفارش
  if (createdOrder) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="rounded-3xl border-emerald-500/30 bg-card p-6 md:p-8 text-center shadow-lg shadow-emerald-500/5 animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
            <CheckCircle2 className="size-10" />
          </div>

          <CardTitle className="text-2xl font-black text-foreground">
            سفارش شما با موفقیت ثبت شد!
          </CardTitle>

          <CardDescription className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
            از خرید شما سپاسگزاریم. سفارش شما ثبت شده و فرآیند آماده‌سازی و ارسال آن به زودی آغاز خواهد شد.
          </CardDescription>

          <div className="my-6 rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-3 text-xs md:text-sm">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>شماره سفارش:</span>
              <span className="font-extrabold text-foreground text-base">#{createdOrder.id}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>مبلغ پرداختی:</span>
              <span className="font-extrabold text-primary text-base">
                {formatPrice(createdOrder.totalPrice)} تومان
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>وضعیت سفارش:</span>
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                در انتظار بررسی
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href={`/account/orders/${createdOrder.id}`}>
              <Button className="w-full sm:w-auto h-11 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 cursor-pointer">
                <span>مشاهده جزئیات سفارش</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto h-11 rounded-xl border-border/80 text-xs font-bold hover:bg-muted cursor-pointer">
                <span>بازگشت به فروشگاه</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // در صورت خالی بودن سبد خرید
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <Card className="rounded-3xl border-border/70 p-8 shadow-xs">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
            <ShoppingBag className="size-7" />
          </div>
          <h1 className="text-xl font-black text-foreground">سبد خرید شما خالی است!</h1>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            کالایی در سبد خرید شما یافت نشد. لطفاً ابتدا کالاهای مورد نظر خود را به سبد خرید اضافه کنید.
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button className="h-10 rounded-xl bg-primary px-6 text-xs font-bold text-primary-foreground shadow-sm cursor-pointer">
                <ArrowRight className="size-4" />
                <span>مشاهده محصولات فروشگاه</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFieldErrors({});
    setServerError(null);

    // ۱. اعتبارسنجی ورودی‌ها با Zod
    const payload = {
      items: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
      customerName,
      phone,
      address,
      postalCode,
    };

    const validation = createOrderSchema.safeParse(payload);
    if (!validation.success) {
      setFieldErrors(validation.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "خطایی در ثبت سفارش رخ داد.");
        setIsSubmitting(false);
        return;
      }

      // موفقیت: فقط پس از تأیید قطعی سرور، سبد خرید کلاینت خالی می‌شود
      clearCart();
      setCreatedOrder({
        id: data.order.id,
        totalPrice: data.order.totalPrice,
      });
    } catch (err) {
      console.error("Order submission error:", err);
      setServerError("خطای ارتباط با سرور. سفارش شما ثبت نشد و محتویات سبد خرید حفظ شده است.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      {/* هدر صفحه تسویه حساب */}
      <div className="mb-8 border-b border-border/60 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
          <Truck className="size-4" />
          <span>مرحله پایانی خرید</span>
        </div>
        <h1 className="text-2xl font-black text-foreground sm:text-3xl">
          تکمیل اطلاعات و ثبت نهایی سفارش
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          لطفاً مشخصات تحویل‌گیرنده و نشانی دقیق پستی را وارد نمایید.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive animate-in fade-in">
          <AlertCircle className="size-5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
          {/* ستون اول (راست): فرم مشخصات تحویل‌گیرنده */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-3xl border-border/70 shadow-xs">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  <span>نشانی و مشخصات تحویل سفارش</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  مرسوله به این آدرس و شخص تحویل داده خواهد شد
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-5">
                {/* نام و نام خانوادگی */}
                <div className="space-y-1.5">
                  <Label htmlFor="customerName" className="text-xs font-semibold">
                    نام و نام خانوادگی تحویل‌گیرنده
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setEnteredName(e.target.value)}
                      placeholder="مثال: رضا محمدی"
                      disabled={isSubmitting}
                      className="h-10 rounded-xl pr-9 text-xs"
                    />
                  </div>
                  {fieldErrors.customerName && (
                    <p className="text-[11px] font-medium text-destructive">{fieldErrors.customerName[0]}</p>
                  )}
                </div>

                {/* شماره تماس و کد پستی (دو ستونه در تبلت به بالا) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">
                      شماره موبایل
                    </Label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        dir="ltr"
                        disabled={isSubmitting}
                        className="h-10 rounded-xl pr-9 text-left text-xs"
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-[11px] font-medium text-destructive">{fieldErrors.phone[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="postalCode" className="text-xs font-semibold">
                      کد پستی (۱۰ رقمی)
                    </Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="۱۲۳۴۵۶۷۸۹۰"
                      dir="ltr"
                      maxLength={10}
                      disabled={isSubmitting}
                      className="h-10 rounded-xl text-left text-xs"
                    />
                    {fieldErrors.postalCode && (
                      <p className="text-[11px] font-medium text-destructive">{fieldErrors.postalCode[0]}</p>
                    )}
                  </div>
                </div>

                {/* آدرس کامل */}
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold">
                    آدرس پستی دقیق
                  </Label>
                  <textarea
                    id="address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="استان، شهر، خیابان اصلی، کوچه، پلاک، واحد..."
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-input bg-transparent p-3 text-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                  />
                  {fieldErrors.address && (
                    <p className="text-[11px] font-medium text-destructive">{fieldErrors.address[0]}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* شیوه پرداخت */}
            <Card className="rounded-3xl border-border/70 shadow-xs">
              <CardHeader className="border-b border-border/50 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="size-4 text-primary" />
                  <span>شیوه پرداخت سفارش</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-4">
                  <div className="size-4 rounded-full border-4 border-primary bg-background" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">پرداخت امن تستی (سفارش آزمایشی)</span>
                    <span className="text-[11px] text-muted-foreground">
                      در این مرحله پرداخت مستقیم شبیه‌سازی شده و سفارش شما فوراً در پنل ثبت می‌گردد.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ستون دوم (چپ): فاکتور و خلاصه اقلام سفارش */}
          <div className="space-y-5">
            <Card className="rounded-3xl border-border/70 shadow-xs sticky top-24">
              <CardHeader className="border-b border-border/50 pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>اقلام سفارش</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {items.length} کالا
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {/* لیست ریز کالاها */}
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between gap-3 text-xs border-b border-border/40 pb-2.5 last:border-none">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/40">
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                              عکس
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-semibold text-foreground">
                            {item.product.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {item.quantity} عدد × {formatPrice(item.product.price)}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 font-bold text-foreground">
                        {formatPrice(item.product.price * item.quantity)} تومان
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/60 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>هزینه بسته‌بندی و ارسال:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">رایگان</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-foreground pt-2 border-t border-border/40">
                    <span>مبلغ قابل پرداخت:</span>
                    <span className="text-base font-extrabold text-primary">
                      {formatPrice(getTotalPrice())} تومان
                    </span>
                  </div>
                </div>

                {/* دکمه ثبت نهایی سفارش */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl py-6 font-bold text-sm gap-2 cursor-pointer shadow-xs hover:shadow-md mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>در حال ثبت سفارش...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-5" />
                      <span>تأیید و ثبت نهایی سفارش</span>
                    </>
                  )}
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    href="/cart"
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>ویرایش اقلام در سبد خرید</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
