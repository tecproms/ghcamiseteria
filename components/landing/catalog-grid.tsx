"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { CATEGORIES, PRODUCTS, Product, COMPANY_INFO } from "@/data/catalog";
import { ProductModal } from "@/components/landing/product-modal";
import { WhatsAppIcon } from "@/components/ui/icons";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Shirt,
  Briefcase,
  Trophy,
  Stethoscope,
  HeartPulse,
  GraduationCap,
  Tag,
  MessageCircle,
  Eye,
} from "lucide-react";

interface CatalogGridProps {
  initialProducts?: Product[];
}

export function CatalogGrid({ initialProducts }: CatalogGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Sync if initialProducts changes
  React.useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  // Dynamic Icon Mapping
  const iconMap: Record<string, React.ReactNode> = {
    Sparkles: <Sparkles className="w-4 h-4" />,
    Shirt: <Shirt className="w-4 h-4" />,
    Briefcase: <Briefcase className="w-4 h-4" />,
    Trophy: <Trophy className="w-4 h-4" />,
    Stethoscope: <Stethoscope className="w-4 h-4" />,
    HeartPulse: <HeartPulse className="w-4 h-4" />,
    GraduationCap: <GraduationCap className="w-4 h-4" />,
    Tag: <Tag className="w-4 h-4" />,
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory =
        selectedCategory === "todas" || item.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCategory;

      const matchText =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.fabrics.some((f) => f.toLowerCase().includes(q)) ||
        item.techniques.some((t) => t.toLowerCase().includes(q)) ||
        item.segments.some((s) => s.toLowerCase().includes(q));

      return matchCategory && matchText;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <section id="catalogo" className="py-20 lg:py-28 relative bg-[#090A0F]">
      {/* Decorative background border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Mostruário Completo & Modelos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Catálogo Online{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              GH Camiseteria
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Conheça nossas principais linhas de produção. Escolha o modelo ideal para seu segmento e solicite sua amostra virtual personalizada.
          </p>
        </div>

        {/* Search Bar & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {CATEGORIES.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]"
                      : "bg-[#0E1119] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {iconMap[tab.iconName]}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input Filter */}
        <div className="relative max-w-md mx-auto sm:mx-0 mb-10">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por modelo, tecido (Dry Fit, Piquet...) ou segmento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0F17] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const whatsappQuickMsg = `Olá GH Camiseteria! Gostaria de um orçamento para: *${product.name}*`;

              return (
                <div
                  key={product.id}
                  className="group relative rounded-2xl bg-[#0D0F17] border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1"
                >
                  {/* Image Container */}
                  <div
                    className="relative aspect-[4/5] w-full overflow-hidden bg-slate-950 cursor-pointer"
                    onClick={() => setActiveProduct(product)}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F17] via-transparent to-transparent opacity-60" />

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-amber-300 border border-amber-500/30">
                        {product.categoryLabel}
                      </span>
                      {product.badge && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Hover Peek Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[2px]">
                      <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 shadow-lg">
                        <Eye className="w-3.5 h-3.5" />
                        Ver Especificações
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3
                        onClick={() => setActiveProduct(product)}
                        className="text-base font-bold text-white group-hover:text-amber-300 transition-colors cursor-pointer line-clamp-1 mb-1.5"
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.summary}
                      </p>
                    </div>

                    {/* Fabric pill tags */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                        Tecidos & Técnicas:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {product.fabrics.slice(0, 1).map((f, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 text-amber-300/90 border border-amber-500/20"
                          >
                            {f.split("(")[0]}
                          </span>
                        ))}
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-800">
                          {product.techniques[0]?.split(" ")[0]}
                        </span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => setActiveProduct(product)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detalhes
                      </button>

                      <a
                        href={`${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(whatsappQuickMsg)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                        Cotar
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl bg-[#0D0F17] border border-slate-800 max-w-md mx-auto">
            <SlidersHorizontal className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">
              Nenhum modelo encontrado
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Não encontramos nenhum item correspondente à busca &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("todas");
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-400 text-slate-950"
            >
              Ver Todos os Modelos
            </button>
          </div>
        )}
      </div>

      {/* Active Modal */}
      <ProductModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
      />
    </section>
  );
}
