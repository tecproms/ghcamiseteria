"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Palette,
  Layers,
  Package,
  FileText,
  Factory,
  ArrowLeft,
  Coins,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const adminNavItems = [
  { href: "/admin/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/admin/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/admin/pedidos", label: "Pedidos", icon: Package },
  { href: "/admin/producao", label: "Produção", icon: Factory },
  { href: "/admin/modelos", label: "Modelos & Zonas", icon: Palette },
  { href: "/admin/precos", label: "Tabela de Preços", icon: Coins },
  { href: "/admin/produtos", label: "Catálogo Base", icon: Layers },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-screen dark:border-zinc-800/90 dark:bg-zinc-950 transition-colors">
      {/* Brand & ThemeToggle */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-zinc-800/90">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
          <div className="relative h-8 w-8 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="GH Camiseteria"
              width={32}
              height={32}
              className="object-contain dark:hidden"
            />
            <Image
              src="/logo-dark.png"
              alt="GH Camiseteria"
              width={32}
              height={32}
              className="object-contain hidden dark:block"
            />
          </div>
          <div className="leading-none">
            <div className="text-sm font-bold">GH Camiseteria</div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">Painel Administrativo</div>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <div className="p-4 flex-1">
        <p className="px-3 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Gestão</p>
        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm dark:bg-[#d4af37] dark:text-zinc-950 dark:font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer link to public site & credits */}
      <div className="p-4 border-t border-slate-200 dark:border-zinc-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar à Loja Pública</span>
        </Link>
        <div className="px-3 text-[11px] text-slate-400 dark:text-zinc-500">
          Criado por{" "}
          <a
            href="https://techproms.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 hover:text-slate-900 dark:text-[#d4af37] dark:hover:text-amber-300 transition-colors"
          >
            Techpro MS
          </a>
        </div>
      </div>
    </aside>
  );
}
