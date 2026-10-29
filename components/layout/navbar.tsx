"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { COMPANY_INFO } from "@/data/catalog";
import { Phone, MessageCircle, Menu, X, ArrowUpRight, Sparkles } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#inicio", label: "Início" },
    { href: "#catalogo", label: "Catálogo Online" },
    { href: "#personalizacao", label: "Técnicas & Acabamentos" },
    { href: "#tecidos", label: "Guia de Tecidos" },
    { href: "#contato", label: "Fale Conosco" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#090A0F]/90 backdrop-blur-md border-b border-amber-500/20 shadow-2xl shadow-black/80 py-3"
          : "bg-gradient-to-b from-[#090A0F]/95 via-[#090A0F]/70 to-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="#inicio" className="group flex items-center transition-transform hover:scale-[1.02]">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors relative py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-full rounded-full" />
              </a>
            ))}
          </nav>

          {/* CTA Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Phone link */}
            <a
              href={`tel:${COMPANY_INFO.phoneRaw}`}
              className="hidden xl:flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-amber-300 px-3 py-2 rounded-lg transition-colors border border-slate-800 bg-slate-900/50"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{COMPANY_INFO.phoneFormatted}</span>
            </a>

            {/* Direct WhatsApp Quote Button */}
            <a
              href={`${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(
                "Olá GH Camiseteria! Gostaria de solicitar um orçamento para uniformes."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Orçamento WhatsApp</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href={`${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(
                "Olá GH Camiseteria! Gostaria de um orçamento."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-amber-400 text-slate-950"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-[#090A0F]/98 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl px-6 py-6 transition-all animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest pb-1 border-b border-slate-800">
              <Sparkles className="w-3.5 h-3.5" />
              Navegação
            </div>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-200 hover:text-amber-400 py-1 transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
              <a
                href={`${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(
                  "Olá GH Camiseteria! Gostaria de solicitar um orçamento para uniformes."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm uppercase text-slate-950 bg-gradient-to-r from-amber-300 to-amber-500 shadow-lg shadow-amber-500/20"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                Pedir Orçamento no WhatsApp
              </a>

              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                Ligar: {COMPANY_INFO.phoneFormatted}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
