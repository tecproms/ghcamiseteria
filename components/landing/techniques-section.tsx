import React from "react";
import { TECHNIQUES, COMPANY_INFO } from "@/data/catalog";
import { Scissors, CheckCircle, Sparkles, MessageCircle, ArrowRight } from "lucide-react";

export function TechniquesSection() {
  return (
    <section id="personalizacao" className="py-20 lg:py-28 relative bg-[#090A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>Técnicas de Ponta & Acabamento</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Personalização que{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Valoriza sua Marca
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Cada tecido e aplicação exige o método correto. Trabalhamos com maquinário de alta precisão para garantir durabilidade, nitidez e fidelidade absoluta de cores.
          </p>
        </div>

        {/* 4 Techniques Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {TECHNIQUES.map((tech) => (
            <div
              key={tech.id}
              className="rounded-2xl bg-[#0D0F17] border border-slate-800 hover:border-amber-500/40 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {tech.title}
                  </h3>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {tech.tagline.split(" ")[0]}
                  </span>
                </div>
                <p className="text-xs font-semibold text-amber-400/90 mb-3">
                  {tech.tagline}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {tech.description}
                </p>

                {/* Pros */}
                <div className="space-y-2 mb-6">
                  {tech.pros.map((pro, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Indicado principalmente para:
                </span>
                <span className="text-xs font-medium text-slate-300">
                  {tech.bestFor}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Catalog Page 9 Visual Banner: Como Funciona */}
        <div className="rounded-3xl bg-gradient-to-r from-[#121520] via-[#0D0F17] to-[#121520] border border-amber-500/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>Processo Simplificado em 4 Etapas</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Como Funciona a Sua Encomenda na GH Camiseteria
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-amber-400 font-black text-sm mb-1">01. ESCOLHA O MODELO</div>
                  <p className="text-xs text-slate-300">Defina as peças, quantidades estimadas, tecidos e cores da sua preferência.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-amber-400 font-black text-sm mb-1">02. ENVIE SUA IDENTIDADE</div>
                  <p className="text-xs text-slate-300">Envie seu logo, nomes, números, escudos ou referências em alta resolução.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-amber-400 font-black text-sm mb-1">03. DEFINA O ACABAMENTO</div>
                  <p className="text-xs text-slate-300">Nossa equipe orienta a técnica ideal: bordado, silk, sublimação total ou DTF.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-amber-400 font-black text-sm mb-1">04. APROVE O MOCKUP</div>
                  <p className="text-xs text-slate-300">Visualize a arte digital antes da produção para garantir 100% de precisão.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 text-center lg:text-right">
              <a
                href={`${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(
                  "Olá! Gostaria de enviar meu logo para criar uma proposta de uniformes na GH Camiseteria."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                <span>Enviar Logo no WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="block text-[11px] text-slate-400 mt-3">
                Atendimento consultivo e ágil com nossa equipe
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
