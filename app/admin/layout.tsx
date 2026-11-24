import { requireAdmin } from "@/lib/session";

export const metadata = {
  title: "پنل مدیریت | فروشگاه من",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // بررسی امنیتی سمت سرور: کاربر باید لاگین بوده و نقش ADMIN داشته باشد
  await requireAdmin();

  return <>{children}</>;
}
