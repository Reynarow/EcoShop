import Link from "next/link";
import { ShieldAlert, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "دسترسی غیرمجاز (۴۰۳) | فروشگاه من",
  description: "شما مجوز لازم برای دسترسی به این صفحه را ندارید.",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <Card className="rounded-2xl border-destructive/20 shadow-xl shadow-destructive/5 backdrop-blur-xl">
          <CardHeader className="space-y-3 pb-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-sm">
              <ShieldAlert className="size-9" />
            </div>
            <CardTitle className="text-xl font-extrabold text-foreground">
              خطای ۴۰۳: دسترسی غیرمجاز
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              شما با حساب کاربری عادی وارد شده‌اید و مجوز لازم برای ورود به بخش مدیریت را ندارید. دسترسی به این بخش مختص مدیران سامانه است.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <div className="flex flex-col gap-2.5">
              <Link href="/">
                <Button className="h-10 w-full rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 cursor-pointer">
                  <span>بازگشت به صفحه اصلی</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>

              <Link href="/login">
                <Button variant="outline" className="h-10 w-full rounded-xl border-border/80 text-xs font-semibold hover:bg-muted cursor-pointer">
                  <User className="size-4" />
                  <span>ورود با حساب کاربری دیگر</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
