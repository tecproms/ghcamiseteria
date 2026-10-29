"use client";

import React, { useState } from "react";
import { COMPANY_INFO } from "@/data/catalog";
import { MapPin, Clock, Send, Sparkles } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";

export function ContactSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let text = `*CONTATO VIA SITE - GH CAMISETERIA*\n\n`;
    if (name) text += `👤 *Nome:* ${name}\n`;
    if (phone) text += `📱 *Telefone:* ${phone}\n`;
    if (message) text += `💬 *Mensagem:* ${message}\n`;
    text += `\nOlá, gostaria de falar com um especialista sobre uniformes.`;

    window.open(`${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section id="contato" className="py-20 lg:py-28 relative bg-[#0C0E15]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Direct info & contact options */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Atendimento Personalizado</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
                Fale com a{" "}
                <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  GH Camiseteria
                </span>
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                Tire dúvidas, solicite tabelas completas de preços, envie seu logotipo ou receba uma visita virtual do nosso consultor têxtil.
              </p>
            </div>

            {/* Contact channels */}
            <div className="space-y-4">
              {/* WhatsApp direct card */}
              <a
                href={`${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(
                  "Olá GH Camiseteria! Gostaria de atendimento para orçamento de uniformes."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#090A0F] border border-amber-500/30 hover:border-amber-400 transition-all hover:scale-[1.01] shadow-lg group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-6 h-6 text-[#25D366] fill-[#25D366]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    WhatsApp Comercial Direto
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors">
                    {COMPANY_INFO.phoneFormatted}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Resposta rápida • Segunda a Sábado
                  </span>
                </div>
              </a>

              {/* Instagram Card */}
              <a
                href={COMPANY_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#090A0F] border border-slate-800 hover:border-pink-500/40 transition-all hover:scale-[1.01] shadow-lg group"
              >
                <div className="w-12 h-12 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center shrink-0">
                  <InstagramIcon className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Siga no Instagram
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-white group-hover:text-pink-300 transition-colors">
                    {COMPANY_INFO.instagram}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Confira bastidores, novos lançamentos e clientes reais
                  </span>
                </div>
              </a>

              {/* Location & Delivery */}
              <div className="p-4 rounded-2xl bg-[#090A0F] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{COMPANY_INFO.city} • Atendimento para todo o MS e Brasil</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{COMPANY_INFO.hours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual QR Code & Fast Form */}
          <div className="lg:col-span-6 bg-[#090A0F] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2">
              Envie uma Mensagem Rápida
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Preencha os dados abaixo para ser direcionado ao WhatsApp com a sua solicitação pronta.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Seu Nome ou Empresa:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva ou Auto Posto..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Seu WhatsApp:
                </label>
                <input
                  type="tel"
                  placeholder="(XX) 9XXXX-XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  O que você precisa? (Modelos, quantidade, dúvidas):
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Gostaria de saber valores para 30 polos com bordado no peito..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02]"
              >
                <Send className="w-4 h-4" />
                <span>Iniciar Atendimento no WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
