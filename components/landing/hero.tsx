import React from "react";
import Image from "next/image";
import { COMPANY_INFO } from "@/data/catalog";
import { WhatsAppIcon } from "@/components/ui/icons";
import { ArrowRight, ShieldCheck, Sparkles, Award, Clock } from "lucide-react";

export function Hero() {
  return (
    <section id="inicio" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background radial luxury lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none -z-10">
        <div className="absolute -top-24 left-1/4 w-[550px] h-[550px] bg-amber-500/20 rounded-full blur-[140px]" />
        <div className="absolute top-20 right-1/4 w-[450px] h-[450px] bg-amber-600/15 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[250px] bg-gradient-to-r from-transparent via-amber-500/15 to-transparent blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headings & Conversion Hooks */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6 shadow-sm shadow-amber-500/10 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Uniformes em Geral • Do Projeto à Produção</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] mb-6">
              O seu uniforme começa com{" "}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent underline decoration-amber-500/40 decoration-wavy decoration-2 underline-offset-8">
                uma boa ideia.
              </span>
            </h1>

            {/* Value Proposition */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal mb-8">
              Apresentação profissional, conforto e resistência para sua empresa, clínica, escola ou time esportivo. 
              Personalização com bordado computadorizado, sublimação total, DTF e serigrafia de alto padrão.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <a
                href="#catalogo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm tracking-wide uppercase text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-xl shadow-amber-500/25 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span>Explorar Catálogo Online</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </a>

              <a
                href={`${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(
                  "Olá GH Camiseteria! Vi o site e gostaria de falar com um especialista sobre uniformes para minha equipe."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl font-semibold text-sm tracking-wide text-white bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 transition-all duration-200 hover:scale-[1.02]"
              >
                <WhatsAppIcon className="w-5 h-5 text-[#25D366] fill-[#25D366]" />
                <span>Chamar no WhatsApp</span>
              </a>
            </div>

            {/* Quick Proof Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Alta Costura</div>
                  <div className="text-[11px] text-slate-400">Acabamento Reforçado</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">100% Personalizado</div>
                  <div className="text-[11px] text-slate-400">Do seu jeito</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Entrega Ágil</div>
                  <div className="text-[11px] text-slate-400">Todo o MS & Brasil</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase with Official 3D Gold Logo */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Golden Glow Border Frame */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-500/35 via-amber-400/20 to-amber-600/40 rounded-3xl blur-2xl opacity-80 transition duration-1000" />

              <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-gradient-to-b from-[#10131C] via-[#0C0E14] to-[#0A0C12] shadow-2xl shadow-black p-8 sm:p-10 flex flex-col items-center text-center">
                {/* Official 3D Golden Logo */}
                <div className="relative w-full max-w-[340px] aspect-[4/3] flex items-center justify-center mb-6">
                  <Image
                    src="/images/brand/logo-gh.png"
                    alt="GH Camiseteria Oficial"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-contain drop-shadow-[0_8px_30px_rgba(229,169,60,0.45)] transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div className="w-full pt-6 border-t border-amber-500/20 space-y-3">
                  <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Catálogo de Uniformes</span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium">
                    &ldquo;Qualidade, conforto e identidade para empresas, escolas, times e profissionais.&rdquo;
                  </p>
                  <div className="text-xs font-bold text-amber-300/90 pt-1">
                    SUA IDEIA, DO SEU JEITO.
                  </div>
                </div>
              </div>

              {/* Floating Segment Pill 1 */}
              <div className="hidden sm:flex absolute -top-5 -left-6 items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0E1017]/95 border border-amber-500/30 shadow-xl backdrop-blur-md">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">
                  Polos & Camisas Sociais
                </span>
              </div>

              {/* Floating Segment Pill 2 */}
              <div className="hidden sm:flex absolute -bottom-5 -right-6 items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0E1017]/95 border border-amber-500/30 shadow-xl backdrop-blur-md">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">
                  Times • Jalecos • Scrubs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
