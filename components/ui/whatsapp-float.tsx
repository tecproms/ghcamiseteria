"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { COMPANY_INFO } from "@/data/catalog";
import { WhatsAppIcon } from "@/components/ui/icons";

export function WhatsAppFloat() {
  const pathname = usePathname();

  // Não exibe o botão flutuante dentro do painel administrativo
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const whatsappUrl = `${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(
    "Olá GH Camiseteria! Gostaria de tirar dúvidas e solicitar um orçamento de uniformes."
  )}`;

  return (
    <aside aria-label="Atendimento WhatsApp" className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
      {/* Tooltip label on hover */}
      <span className="hidden sm:inline-block px-3.5 py-1.5 rounded-xl bg-[#090A0F]/95 backdrop-blur-md text-xs font-bold text-amber-300 border border-amber-500/30 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Orçamento Rápido no WhatsApp
      </span>

      {/* Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#25D366] to-[#1ebe5d] hover:from-[#20bd5a] hover:to-[#17a84e] text-white shadow-2xl shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {/* Pulse radar ring */}
        <span className="absolute -inset-1.5 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />

        {/* Official WhatsApp Logo */}
        <WhatsAppIcon className="w-7 h-7 text-white fill-white relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
      </a>
    </aside>
  );
}
