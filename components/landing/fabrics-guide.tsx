import React from "react";
import { FABRICS_GUIDE } from "@/data/catalog";
import { Layers, ShieldCheck, Feather, Sparkles } from "lucide-react";

export function FabricsGuide() {
  return (
    <section id="tecidos" className="py-20 lg:py-28 relative bg-[#0C0E15]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Matéria-Prima de Alta Performance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Guia de Tecidos{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              GH Camiseteria
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            A qualidade de um uniforme começa na fibra têxtil. Conheça as composições que garantem conforto térmico, durabilidade extrema e toque suave.
          </p>
        </div>

        {/* Fabric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FABRICS_GUIDE.map((fabric, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#090A0F] border border-slate-800 hover:border-amber-500/30 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {fabric.name}
                  </h3>
                  <Feather className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xs font-semibold text-amber-400/90 mb-3">
                  Composição: {fabric.composition}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  {fabric.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Uso recomendado:
                </span>
                <span className="text-xs font-medium text-slate-300">
                  {fabric.usage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
