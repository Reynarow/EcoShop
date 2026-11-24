import { Suspense } from "react";
import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import DealsBanner from "@/components/home/deals-banner";
import Categories from "@/components/home/categories";
import ProductsSection, { ProductsSectionSkeleton } from "@/components/home/products-section";
import Newsletter from "@/components/home/newsletter";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <DealsBanner />
      <Categories />
      <Suspense fallback={<ProductsSectionSkeleton />}>
        <ProductsSection />
      </Suspense>
      <Newsletter />
    </main>
  );
}
