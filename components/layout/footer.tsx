import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { COMPANY_INFO } from "@/data/catalog";
import { MessageCircle, Phone, ArrowUp } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="bg-[#07080D] border-t border-amber-500/20 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <Logo size="md" />
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Uniformes em geral com qualidade premium, caimento alinhado e técnicas avançadas de personalização. Atendemos empresas, times, escolas e hospitais em todo o Mato Grosso do Sul e Brasil.
            </p>
            <div className="text-xs text-amber-400 font-semibold tracking-wide">
              {COMPANY_INFO.tagline}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#inicio" className="hover:text-amber-400 transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-amber-400 transition-colors">
                  Catálogo Online Completo
                </a>
              </li>
              <li>
                <a href="#personalizacao" className="hover:text-amber-400 transition-colors">
                  Bordado, Silk, Sublimação & DTF
                </a>
              </li>
              <li>
                <a href="#tecidos" className="hover:text-amber-400 transition-colors">
                  Guia de Tecidos
                </a>
              </li>
              <li>
                <a href="#simulador" className="hover:text-amber-400 transition-colors">
                  Simulador de Orçamento
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Channels */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Canais Oficiais
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: {COMPANY_INFO.phoneFormatted}</span>
              </a>

              <a
                href={COMPANY_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <InstagramIcon className="w-4 h-4 text-pink-400" />
                <span>Instagram: {COMPANY_INFO.instagram}</span>
              </a>

              <div className="pt-2 text-[11px] text-slate-500">
                Atendimento: {COMPANY_INFO.hours}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} GH Camiseteria. Todos os direitos reservados.
          </div>
          <div className="text-[11px] text-slate-600">
            Qualidade, Conforto & Identidade Visual
          </div>
        </div>
      </div>
    </footer>
  );
}
