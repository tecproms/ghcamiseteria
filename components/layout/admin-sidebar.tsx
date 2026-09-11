"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  ShoppingCart,
  FileText,
  Factory,
  ArrowLeft,
  Shirt,
} from "lucide-react";

export const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/modelos", label: "Modelos", icon: Layers },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/admin/producao", label: "Produção", icon: Factory },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-screen">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Shirt className="h-4 w-4" />
          </div>
          <div className="leading-none">
            <div className="text-sm font-semibold">GH Camiseteria</div>
            <div className="text-[10px] text-slate-400 font-normal">Painel Administrativo</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="p-4 flex-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gestão</p>
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
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
      <div className="p-4 border-t border-slate-200 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar à Loja Pública</span>
        </Link>
        <div className="px-3 text-[11px] text-slate-400">
          Criado por{" "}
          <a
            href="https://techproms.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Techpro MS
          </a>
        </div>
      </div>
    </aside>
  );
}
