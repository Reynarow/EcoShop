import { prisma } from "@/lib/prisma";

export interface AnalyticsSummary {
  revenue: {
    total: number;
    delivered: number;
    pending: number;
    growthPercent: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  products: {
    total: number;
    outOfStockCount: number;
  };
  users: {
    total: number;
    customers: number;
    admins: number;
  };
  reviews: {
    total: number;
    averageRating: number;
  };
  recentSalesByDay: {
    date: string;
    dayName: string;
    revenue: number;
    ordersCount: number;
  }[];
  orderStatusDistribution: {
    status: string;
    label: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  topSellingProducts: {
    id: number | null;
    name: string;
    image: string | null;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  recentOrders: {
    id: number;
    customerName: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    itemsCount: number;
  }[];
  recentReviews: {
    id: number;
    userName: string;
    productName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار بررسی", color: "bg-amber-500 text-amber-500 stroke-amber-500 fill-amber-500" },
  PROCESSING: { label: "در حال پردازش", color: "bg-blue-500 text-blue-500 stroke-blue-500 fill-blue-500" },
  SHIPPED: { label: "ارسال شده", color: "bg-indigo-500 text-indigo-500 stroke-indigo-500 fill-indigo-500" },
  DELIVERED: { label: "تحویل داده شده", color: "bg-emerald-500 text-emerald-500 stroke-emerald-500 fill-emerald-500" },
  CANCELLED: { label: "لغو شده", color: "bg-rose-500 text-rose-500 stroke-rose-500 fill-rose-500" },
};

const PERSIAN_DAYS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"];

export async function getAdminAnalytics(): Promise<AnalyticsSummary> {
  const [
    allOrders,
    orderItems,
    productsCount,
    users,
    reviews,
  ] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    }),
    prisma.orderItem.findMany(),
    prisma.product.count(),
    prisma.user.findMany({
      select: { id: true, role: true, createdAt: true },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  // محاسبه درآمد کل و بخش‌های مختلف
  let totalRevenue = 0;
  let deliveredRevenue = 0;
  let pendingRevenue = 0;

  const statusCounts: Record<string, number> = {
    PENDING: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  const now = new Date();
  const last7DaysMap = new Map<string, { date: string; dayName: string; revenue: number; ordersCount: number }>();

  // آماده‌سازی کلیدهای ۷ روز اخیر
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayName = PERSIAN_DAYS[d.getDay()];
    
    // تبدیل تاریخ به فرمت شمسی کوتاه
    const persianDate = new Intl.DateTimeFormat("fa-IR", {
      month: "numeric",
      day: "numeric",
    }).format(d);

    last7DaysMap.set(dateKey, {
      date: persianDate,
      dayName,
      revenue: 0,
      ordersCount: 0,
    });
  }

  // ۷ روز قبل برای محاسبه رشد
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let thisWeekRevenue = 0;
  let lastWeekRevenue = 0;

  allOrders.forEach((order) => {
    totalRevenue += order.totalPrice;

    if (order.status === "DELIVERED") {
      deliveredRevenue += order.totalPrice;
    } else if (order.status === "PENDING") {
      pendingRevenue += order.totalPrice;
    }

    if (statusCounts[order.status] !== undefined) {
      statusCounts[order.status] += 1;
    }

    const orderDate = new Date(order.createdAt);
    const dateKey = orderDate.toISOString().split("T")[0];

    if (last7DaysMap.has(dateKey)) {
      const entry = last7DaysMap.get(dateKey)!;
      entry.revenue += order.totalPrice;
      entry.ordersCount += 1;
    }

    if (orderDate >= sevenDaysAgo) {
      thisWeekRevenue += order.totalPrice;
    } else if (orderDate >= fourteenDaysAgo && orderDate < sevenDaysAgo) {
      lastWeekRevenue += order.totalPrice;
    }
  });

  const growthPercent = lastWeekRevenue === 0 
    ? (thisWeekRevenue > 0 ? 100 : 0)
    : Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100);

  // توزیع وضعیت سفارش‌ها
  const totalOrdersCount = allOrders.length;
  const orderStatusDistribution = Object.keys(statusCounts).map((status) => {
    const count = statusCounts[status];
    const percentage = totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0;
    return {
      status,
      label: STATUS_CONFIG[status]?.label || status,
      count,
      percentage,
      color: STATUS_CONFIG[status]?.color || "bg-zinc-500",
    };
  });

  // محصولات پرفروش
  const productSalesMap = new Map<
    string,
    { id: number | null; name: string; image: string | null; totalQuantity: number; totalRevenue: number }
  >();

  orderItems.forEach((item) => {
    const key = item.productId ? `p-${item.productId}` : `name-${item.productName}`;
    const existing = productSalesMap.get(key);
    if (existing) {
      existing.totalQuantity += item.quantity;
      existing.totalRevenue += item.subtotal;
    } else {
      productSalesMap.set(key, {
        id: item.productId,
        name: item.productName,
        image: item.productImage,
        totalQuantity: item.quantity,
        totalRevenue: item.subtotal,
      });
    }
  });

  const topSellingProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // میانگین امتیاز نظرات
  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1))
    : 0;

  // دسته‌بندی کاربران
  const totalUsers = users.length;
  const adminUsers = users.filter((u) => u.role === "ADMIN").length;
  const customerUsers = totalUsers - adminUsers;

  // ۱۰ سفارش اخیر
  const recentOrders = allOrders.slice(0, 7).map((o) => ({
    id: o.id,
    customerName: o.customerName,
    totalPrice: o.totalPrice,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    itemsCount: o.items.reduce((acc, it) => acc + it.quantity, 0),
  }));

  // ۶ نظر اخیر
  const recentReviews = reviews.slice(0, 6).map((r) => ({
    id: r.id,
    userName: r.user.name,
    productName: r.product.name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    revenue: {
      total: totalRevenue,
      delivered: deliveredRevenue,
      pending: pendingRevenue,
      growthPercent,
    },
    orders: {
      total: totalOrdersCount,
      pending: statusCounts.PENDING,
      processing: statusCounts.PROCESSING,
      shipped: statusCounts.SHIPPED,
      delivered: statusCounts.DELIVERED,
      cancelled: statusCounts.CANCELLED,
    },
    products: {
      total: productsCount,
      outOfStockCount: 0,
    },
    users: {
      total: totalUsers,
      customers: customerUsers,
      admins: adminUsers,
    },
    reviews: {
      total: totalReviewsCount,
      averageRating,
    },
    recentSalesByDay: Array.from(last7DaysMap.values()),
    orderStatusDistribution,
    topSellingProducts,
    recentOrders,
    recentReviews,
  };
}
