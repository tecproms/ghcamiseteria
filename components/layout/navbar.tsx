"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, User, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, isAuthenticated, isAdmin } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/uniformes", label: "Uniformes" },
    { href: "/monte-seu-uniforme", label: "Monte seu uniforme" },
    { href: "/meus-projetos", label: "Meus projetos" },
    { href: "/meus-pedidos", label: "Meus pedidos" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname !== "/") return false;
    return pathname.startsWith(href);
  };

  const displayName = profile?.full_name?.split(" ")[0] || "Perfil";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800/90 dark:bg-zinc-950/95 dark:supports-[backdrop-filter]:bg-zinc-950/70 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
          <div className="relative h-10 w-10 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="GH Camiseteria"
              width={40}
              height={40}
              className="object-contain dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt="GH Camiseteria"
              width={40}
              height={40}
              className="object-contain hidden dark:block"
              priority
            />
          </div>
          <span className="font-extrabold tracking-tight">GH Camiseteria</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-slate-900 dark:hover:text-[#d4af37] ${
                isActive(link.href)
                  ? "text-slate-900 dark:text-[#d4af37] font-semibold"
                  : "text-slate-600 dark:text-zinc-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {(!isAuthenticated || isAdmin) && (
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}

          {isAuthenticated ? (
            <Link
              href="/perfil"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-[#d4af37]" />
              <span className="max-w-[120px] truncate">{displayName}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] dark:font-semibold transition-colors shadow-sm"
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            aria-expanded={mobileMenuOpen}
            aria-label="Abrir menu principal"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-6 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  isActive(link.href)
                    ? "bg-slate-100 text-slate-900 font-semibold dark:bg-zinc-900 dark:text-[#d4af37]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
              {isAuthenticated ? (
                <Link
                  href="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-medium text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:font-semibold"
                >
                  <UserCheck className="h-4 w-4" />
                  Minha Conta ({displayName})
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-medium text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:font-semibold"
                >
                  <User className="h-4 w-4" />
                  Login
                </Link>
              )}

              {(!isAuthenticated || isAdmin) && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-center text-xs font-medium text-slate-700 dark:border-zinc-800 dark:text-zinc-300"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Painel Administrativo
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

