import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useSyncExternalStore } from "react";

export type CartProduct = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  description?: string | null;
};

export type CartItem = {
  product: CartProduct;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

/**
 * Zustand Store برای مدیریت سبد خرید با ماندگاری در localStorage
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // افزودن کالا: در صورت وجود، تعداد افزایش می‌یابد؛ در غیر اینصورت به عنوان ردیف جدید اضافه می‌شود
      addItem: (product: CartProduct, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.product.id === product.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + (quantity > 0 ? quantity : 1) }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { product, quantity: quantity > 0 ? quantity : 1 }],
          });
        }
      },

      // حذف کالا بر اساس شناسه
      removeItem: (productId: number) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },

      // افزایش تعداد یک کالا
      increaseQuantity: (productId: number) => {
        set({
          items: get().items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        });
      },

      // کاهش تعداد یک کالا؛ در صورت رسیدن به صفر، کالا از سبد حذف می‌شود
      decreaseQuantity: (productId: number) => {
        const { items } = get();
        const target = items.find((item) => item.product.id === productId);

        if (!target) return;

        if (target.quantity > 1) {
          set({
            items: items.map((item) =>
              item.product.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ),
          });
        } else {
          set({
            items: items.filter((item) => item.product.id !== productId),
          });
        }
      },

      // خالی کردن کامل سبد خرید
      clearCart: () => {
        set({ items: [] });
      },

      // محاسبه مجموع تعداد کل اقلام موجود در سبد خرید
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // محاسبه مجموع مبلغ کل سبد خرید (تومان)
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "eshop-cart-storage", // کلید ذخیره یکتا در localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

const emptySubscribe = () => () => {};

/**
 * هوک اختصاصی برای جلوگیری از خطای عدم تطابق هیدریشن (Hydration Mismatch) در Next.js
 * با استفاده از useSyncExternalStore استاندارد ری‌اکت، در سمت سرور مقدار fallback و در کلاینت مقدار واقعی بازگردانده می‌شود.
 */
export function useCartHydrated<T>(selector: (state: CartState) => T, fallback: T): T {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const value = useCartStore(selector);

  return isHydrated ? value : fallback;
}
