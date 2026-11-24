import { auth, type User, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { cache } from "react";

export type { User, Session };

/**
 * دریافت نشست معتبر کاربر از هدرهای سرور (مخصوص Server Components)
 */
export const getCurrentSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});

/**
 * دریافت کاربر احراز هویت شده (مخصوص Server Components)
 */
export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession();
  return session?.user ?? null;
});

/**
 * الزام احراز هویت برای صفحات سرور. در صورت لاگین نبودن، ریدایرکت به صفحه ورود.
 */
export async function requireAuth(redirectTo = "/login") {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect(redirectTo);
  }

  return session.user;
}

/**
 * الزام دسترسی سطح مدیریت (ADMIN) برای صفحات سرور.
 * - در صورت عدم لاگین: هدایت به /login
 * - در صورت لاگین با نقش غیر ADMIN: هدایت به /unauthorized
 */
export async function requireAdmin() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return session.user;
}

/**
 * بررسی احراز هویت در روت‌های API
 * در صورت عدم لاگین، خطای 401 برمی‌گرداند.
 */
export async function verifyApiAuth(request: Request): Promise<
  | { user: User; error: null }
  | { user: null; error: NextResponse }
> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "لطفاً ابتدا وارد حساب کاربری خود شوید." },
        { status: 401 }
      ),
    };
  }

  return { user: session.user, error: null };
}

/**
 * بررسی مجوز دسترسی مدیر در روت‌های API
 * - در صورت عدم لاگین: خطای 401
 * - در صورت لاگین بودن با نقش غیر ADMIN: خطای 403
 */
export async function verifyApiAdmin(request: Request): Promise<
  | { user: User; error: null }
  | { user: null; error: NextResponse }
> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "لطفاً ابتدا وارد حساب کاربری خود شوید." },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      user: null,
      error: NextResponse.json(
        {
          error:
            "دسترسی غیرمجاز: تنها مدیران سایت مجاز به انجام این عملیات هستند.",
        },
        { status: 403 }
      ),
    };
  }

  return { user: session.user, error: null };
}
