"use client";

import React, { useState } from "react";
import { COMPANY_INFO } from "@/data/catalog";
import { Calculator, MessageCircle, Check, ArrowRight, Sparkles, Clock, ShieldCheck } from "lucide-react";

export function QuoteSimulator() {
  const [selectedModel, setSelectedModel] = useState("Camisa Polo Corporativa");
  const [selectedQuantity, setSelectedQuantity] = useState("10 a 25 peças");
  const [selectedTechnique, setSelectedTechnique] = useState("Bordado Computadorizado");
  const [companyName, setCompanyName] = useState("");
  const [notes, setNotes] = useState("");

  const models = [
    "Camisa Polo Corporativa",
    "Camisa Social Executiva",
    "Uniforme Esportivo (Times)",
    "Jaleco Clínico / Saúde",
    "Pijama Cirúrgico (Scrub)",
    "Uniforme Escolar Completo",
    "Camiseta Profissional / Eventos",
    "Kit Misto Coordenação Visual",
  ];

  const quantities = [
    { label: "10 a 25 peças", badge: "Lote Mínimo" },
    { label: "26 a 50 peças", badge: "Desconto Médio" },
    { label: "51 a 100 peças", badge: "Preço Especial" },
    { label: "Mais de 100 peças", badge: "Melhor Custo Unitário" },
  ];

  const techniques = [
    { name: "Bordado Computadorizado", desc: "Elegante e resistente a lavagens" },
    { name: "Sublimação Total Digital", desc: "Toque zero e cores vivas sem limite" },
    { name: "Serigrafia / Silk-screen", desc: "Econômico para grandes volumes" },
    { name: "DTF Ultra HD", desc: "Alta definição e degradês detalhados" },
    { name: "A definir com especialista", desc: "Recomendações técnicas sob medida" },
  ];

  // WhatsApp Message Composer
  const generateWhatsAppMessage = () => {
    let msg = `*SOLICITAÇÃO DE ORÇAMENTO - GH CAMISETERIA*\n\n`;
    msg += `👕 *Modelo Escolhido:* ${selectedModel}\n`;
    msg += `📦 *Quantidade Estimada:* ${selectedQuantity}\n`;
    msg += `🧵 *Técnica Pretendida:* ${selectedTechnique}\n`;
    if (companyName.trim()) {
      msg += `🏢 *Empresa / Time:* ${companyName.trim()}\n`;
    }
    if (notes.trim()) {
      msg += `📝 *Observações:* ${notes.trim()}\n`;
    }
    msg += `\nOlá, vi o simulador no site e gostaria de receber a proposta de valores e prazo de entrega!`;
    return encodeURIComponent(msg);
  };

  return (
    <section id="simulador" className="py-20 lg:py-28 relative bg-[#0C0E15]">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulador Interativo • Rápido & Sem Compromisso</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Simule seu Orçamento em{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Menos de 1 Minuto
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Selecione o modelo, a quantidade estimada e o tipo de personalização. Nossa equipe comercial responderá com a proposta detalhada e mockup visual.
          </p>
        </div>

        {/* Simulator Card Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* Inputs Column */}
          <div className="lg:col-span-7 bg-[#090A0F] border border-amber-500/25 rounded-2xl p-6 sm:p-8 space-y-7 shadow-xl">
            {/* Step 1: Model */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-3">
                1. Selecione o Tipo de Peça / Linha:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {models.map((model) => {
                  const isSelected = selectedModel === model;
                  return (
                    <button
                      key={model}
                      type="button"
                      onClick={() => setSelectedModel(model)}
                      className={`text-left px-3.5 py-3 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? "bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/20 font-bold"
                          : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {model}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Quantity */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-3">
                2. Quantidade Estimada de Peças:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {quantities.map((q) => {
                  const isSelected = selectedQuantity === q.label;
                  return (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => setSelectedQuantity(q.label)}
                      className={`p-3 rounded-xl text-center transition-all border flex flex-col items-center justify-center ${
                        isSelected
                          ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-400/20"
                          : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xs font-bold block">{q.label}</span>
                      <span className={`text-[10px] mt-0.5 ${isSelected ? "text-slate-900 font-semibold" : "text-amber-400/80"}`}>
                        {q.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Technique */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-3">
                3. Técnica de Personalização:
              </label>
              <div className="space-y-2">
                {techniques.map((t) => {
                  const isSelected = selectedTechnique === t.name;
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setSelectedTechnique(t.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-400 text-white"
                          : "bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block">{t.name}</span>
                        <span className="text-[11px] text-slate-400">{t.desc}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-amber-400 bg-amber-400 text-slate-950" : "border-slate-700"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Optional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">
                  Sua Empresa / Equipe (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Clínica Alpha, Auto Center..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">
                  Observações / Cores:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Queremos gola preta com ouro..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Summary / Output Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#090A0F] border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Resumo da Sua Simulação</span>
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-800 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-400 text-xs">Modelo:</span>
                  <span className="font-bold text-white text-right text-xs">{selectedModel}</span>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-400 text-xs">Tiragem Estimada:</span>
                  <span className="font-bold text-amber-300 text-right text-xs">{selectedQuantity}</span>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-400 text-xs">Técnica:</span>
                  <span className="font-bold text-white text-right text-xs">{selectedTechnique}</span>
                </div>

                {companyName && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-400 text-xs">Identidade:</span>
                    <span className="font-bold text-slate-200 text-right text-xs">{companyName}</span>
                  </div>
                )}
              </div>

              {/* Perks list */}
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Amostra virtual & mockup sem compromisso</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Atendimento rápido com consultor têxtil</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Grade completa de tamanhos sob demanda</span>
                </div>
              </div>

              {/* Direct WhatsApp Send Button */}
              <a
                href={`${COMPANY_INFO.whatsappUrl}?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-xl shadow-amber-500/25 transition-all duration-200 hover:scale-[1.02]"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                <span>Enviar Cotação no WhatsApp</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </a>

              <p className="text-[11px] text-center text-slate-500 mt-3">
                *O envio abre o WhatsApp com a mensagem formatada para atendimento imediato.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
