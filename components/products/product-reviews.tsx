"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  User as UserIcon,
  LogIn,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { createReviewSchema } from "@/lib/validations/review";
import { formatPersianDate } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

export interface ProductReviewItem {
  id: number;
  productId: number;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface ProductReviewsProps {
  productId: number;
  initialReviews: ProductReviewItem[];
}

export default function ProductReviews({
  productId,
  initialReviews,
}: ProductReviewsProps) {
  const { data: session } = authClient.useSession();
  const [reviews, setReviews] = useState<ProductReviewItem[]>(initialReviews);

  // وضعیت فرم ثبت نظر
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // محاسبه میانگین امتیاز و توزیع ستاره‌ها
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        total: 0,
        average: 0,
        counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
      };
    }

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    for (const r of reviews) {
      sum += r.rating;
      if (counts[r.rating] !== undefined) {
        counts[r.rating] += 1;
      }
    }

    return {
      total,
      average: Number((sum / total).toFixed(1)),
      counts,
    };
  }, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setSuccessMessage(null);

    const parsed = createReviewSchema.safeParse({
      rating,
      comment,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "لطفاً فرم نظر را به درستی تکمیل کنید.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "خطا در ثبت دیدگاه. لطفاً دوباره تلاش کنید.");
        setIsSubmitting(false);
        return;
      }

      setReviews((prev) => [data, ...prev]);
      setComment("");
      setRating(5);
      setSuccessMessage("دیدگاه شما با موفقیت ثبت شد!");
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError("خطای ارتباط با سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (deletingId) return;
    setDeletingId(reviewId);
    setError(null);

    try {
      const res = await fetch(
        `/api/products/${productId}/reviews?reviewId=${reviewId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "خطا در حذف دیدگاه.");
        return;
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error("Delete review error:", err);
      setError("خطای ارتباط با سرور هنگام حذف دیدگاه.");
    } finally {
      setDeletingId(null);
    }
  };

  const activeRating = hoveredRating || rating;

  return (
    <section id="reviews" className="border-t border-border/60 pt-10 space-y-8">
      {/* هدر بخش دیدگاه‌ها */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <span className="size-2 rounded-full bg-primary" />
            <MessageSquare className="size-3.5" />
            <span>نظرات و امتیاز کاربران</span>
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-black text-foreground">
            دیدگاه خریداران درباره این محصول
          </h2>
        </div>

        <span className="text-xs font-medium text-muted-foreground">
          تعداد کل دیدگاه‌ها:{" "}
          <span className="font-bold text-foreground">
            {stats.total.toLocaleString("fa-IR")} دیدگاه
          </span>
        </span>
      </div>

      {/* چیدمان دو ستونه: خلاصه امتیاز و فرم ثبت در راست، لیست نظرات در چپ */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* ستون خلاصه امتیاز + فرم ثبت دیدگاه */}
        <div className="lg:col-span-5 space-y-6">
          {/* کارت میانگین امتیاز */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-4">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-foreground">
                    {stats.total > 0 ? stats.average.toLocaleString("fa-IR") : "۰"}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    از ۵
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  بر اساس {stats.total.toLocaleString("fa-IR")} نظر ثبت‌شده
                </p>
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-5 ${
                      star <= Math.round(stats.average)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* نمودار میله‌ای توزیع امتیازها */}
            <div className="space-y-2 text-xs">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.counts[star] || 0;
                const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                return (
                  <div key={star} className="flex items-center gap-2.5">
                    <span className="w-12 text-muted-foreground font-medium shrink-0">
                      {star.toLocaleString("fa-IR")} ستاره
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/60">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-left text-muted-foreground font-mono text-[11px]">
                      {count.toLocaleString("fa-IR")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* فرم ثبت دیدگاه جدید */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-foreground">
              ثبت دیدگاه جدید
            </h3>

            {!session?.user ? (
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-center space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  برای ثبت نظر و امتیازدهی درباره این کالا، لطفاً ابتدا وارد حساب کاربری خود شوید.
                </p>
                <Link
                  href="/login"
                  className={buttonVariants({
                    size: "sm",
                    className: "rounded-xl gap-1.5 font-bold",
                  })}
                >
                  <LogIn className="size-4" />
                  <span>ورود / ثبت‌نام</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive"
                  >
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* انتخاب ستاره */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground block">
                    امتیاز شما به این محصول:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer"
                        aria-label={`امتیاز ${star} ستاره`}
                      >
                        <Star
                          className={`size-6 transition-colors ${
                            star <= activeRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="mr-2 text-xs font-bold text-amber-500">
                      ({activeRating.toLocaleString("fa-IR")} از ۵)
                    </span>
                  </div>
                </div>

                {/* کادر متن نظر */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="review-comment"
                    className="text-xs font-semibold text-foreground block"
                  >
                    متن دیدگاه شما
                  </label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                    maxLength={1000}
                    placeholder="تجربه خود از کیفیت، قیمت و عملکرد این محصول را بنویسید..."
                    className="w-full rounded-2xl border border-border/80 bg-background p-3.5 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>حداقل ۵ کاراکتر</span>
                    <span>
                      {comment.length.toLocaleString("fa-IR")} / ۱۰۰۰
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-xl gap-2 text-xs font-bold cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>در حال ثبت دیدگاه...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>ثبت دیدگاه</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* ستون لیست نظرات ثبت‌شده */}
        <div className="lg:col-span-7 space-y-4">
          {reviews.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card/40 p-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
                <MessageSquare className="size-8 stroke-[1.4] text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                هنوز دیدگاهی ثبت نشده است
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                اولین نفری باشید که نظر و امتیاز خود را درباره این محصول به اشتراک می‌گذارد.
              </p>
            </div>
          ) : (
            reviews.map((review) => {
              const canDelete =
                session?.user &&
                (session.user.id === review.userId || session.user.role === "ADMIN");

              return (
                <article
                  key={review.id}
                  className="rounded-3xl border border-border/70 bg-card p-5 shadow-xs space-y-3 transition hover:border-border"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-sm">
                        {review.user.name ? (
                          review.user.name.charAt(0)
                        ) : (
                          <UserIcon className="size-4" />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {review.user.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {formatPersianDate(review.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span>{review.rating.toLocaleString("fa-IR")}</span>
                      </div>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingId === review.id}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer disabled:opacity-50"
                          title="حذف دیدگاه"
                          aria-label="حذف دیدگاه"
                        >
                          {deletingId === review.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-line pr-13">
                    {review.comment}
                  </p>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
