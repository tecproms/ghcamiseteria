"use client";

import React from "react";
import { COMPANY_INFO } from "@/data/catalog";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  const whatsappUrl = `${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(
    "Olá GH Camiseteria! Gostaria de tirar dúvidas e solicitar um orçamento de uniformes."
  )}`;

  return (
    <aside aria-label="Atendimento WhatsApp" className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
      {/* Tooltip label on hover */}
      <span className="hidden sm:inline-block px-3 py-1.5 rounded-lg bg-[#090A0F]/90 backdrop-blur-md text-xs font-bold text-amber-300 border border-amber-500/30 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Orçamento Rápido no WhatsApp
      </span>

      {/* Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {/* Pulse radar ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />

        <MessageCircle className="w-7 h-7 fill-white text-emerald-600" />
      </a>
    </aside>
  );
}
