import React from "react";
import { Hero } from "@/components/landing/hero";
import { CatalogGrid } from "@/components/landing/catalog-grid";
import { TechniquesSection } from "@/components/landing/techniques-section";
import { FabricsGuide } from "@/components/landing/fabrics-guide";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { ContactSection } from "@/components/landing/contact-section";

export default function HomePage() {
  return (
    <div className="space-y-0">
      <Hero />
      <CatalogGrid />
      <TechniquesSection />
      <FabricsGuide />
      <TestimonialsSection />
      <ContactSection />
    </div>
  );
}
