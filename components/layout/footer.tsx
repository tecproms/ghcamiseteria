import Link from "next/link";
import { Shirt } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Shirt className="h-4 w-4" />
              </div>
              <span>GH Camiseteria</span>
            </div>
            <p className="text-sm text-slate-500 max-w-md">
              Especialistas em uniformes personalizados, camisas para empresas, eventos e equipes com qualidade profissional e acabamento impecável.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-slate-900 transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/uniformes" className="hover:text-slate-900 transition-colors">
                  Catálogo de Uniformes
                </Link>
              </li>
              <li>
                <Link href="/monte-seu-uniforme" className="hover:text-slate-900 transition-colors">
                  Monte seu Uniforme
                </Link>
              </li>
              <li>
                <Link href="/meus-pedidos" className="hover:text-slate-900 transition-colors">
                  Acompanhar Pedido
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Acesso</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-slate-900 transition-colors">
                  Área do Cliente
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">
                  Painel de Gestão
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} GH Camiseteria & Uniformes Personalizados. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
