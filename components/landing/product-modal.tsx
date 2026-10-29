"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Product, COMPANY_INFO } from "@/data/catalog";
import { X, MessageCircle, CheckCircle2, Layers, Scissors, Palette, Users, ArrowUpRight } from "lucide-react";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (product) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const whatsappMessage = `Olá GH Camiseteria! Gostaria de um orçamento detalhado para o modelo: *${product.name}* (Ref: ${product.categoryLabel}). Poderiam me informar sobre prazos e quantidades?`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl bg-[#0D0F17] border border-amber-500/30 rounded-2xl shadow-2xl shadow-black overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0A0C13]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {product.categoryLabel}
            </span>
            {product.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950">
                {product.badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Image Preview */}
            <div className="md:col-span-5">
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-amber-500/20 bg-slate-950 shadow-inner">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="mt-3 text-center">
                <span className="text-[11px] text-slate-400 italic">
                  *Foto oficial do catálogo GH Camiseteria
                </span>
              </div>
            </div>

            {/* Details Content */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                  {product.name}
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Fabrics */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Tecidos Disponíveis</span>
                </div>
                <div className="space-y-1.5">
                  {product.fabrics.map((fabric, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{fabric}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalization Techniques */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2.5">
                  <Scissors className="w-4 h-4 text-amber-400" />
                  <span>Técnicas de Personalização Recomendadas</span>
                </div>
                <div className="space-y-1.5">
                  {product.techniques.map((tech, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes and Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Grade de Tamanhos</span>
                  </div>
                  <p className="text-xs text-slate-400">{product.sizes}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cores em Catálogo</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {product.colors.join(", ")}
                  </p>
                </div>
              </div>

              {/* Segments */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Ideal para:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.segments.map((seg, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/50"
                    >
                      {seg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Direct WhatsApp CTA */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-[#0A0C13] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-xs text-slate-400 block">
              Pedido mínimo a partir de {product.minOrder || 10} peças • Atendimento personalizado
            </span>
            <span className="text-xs font-bold text-amber-400">
              Desenvolvemos a arte virtual e mockup sem custo!
            </span>
          </div>

          <a
            href={`${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950" />
            <span>Pedir Orçamento no WhatsApp</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </a>
        </div>
      </div>
    </div>
  );
}
