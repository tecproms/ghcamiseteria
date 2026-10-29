import React from "react";
import { Hero } from "@/components/landing/hero";
import { CatalogGrid } from "@/components/landing/catalog-grid";
import { TechniquesSection } from "@/components/landing/techniques-section";
import { FabricsGuide } from "@/components/landing/fabrics-guide";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { ContactSection } from "@/components/landing/contact-section";
import { getCatalog } from "@/lib/catalog-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const products = await getCatalog();

  return (
    <div className="space-y-0">
      <Hero />
      <CatalogGrid initialProducts={products} />
      <TechniquesSection />
      <FabricsGuide />
      <TestimonialsSection />
      <ContactSection />
    </div>
  );
}
