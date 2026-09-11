import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              <div className="relative h-10 w-10 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="GH Camiseteria"
                  width={40}
                  height={40}
                  className="object-contain dark:hidden"
                />
                <Image
                  src="/logo-dark.png"
                  alt="GH Camiseteria"
                  width={40}
                  height={40}
                  className="object-contain hidden dark:block"
                />
              </div>
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white">GH Camiseteria</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md">
              Especialistas em uniformes personalizados, camisas para empresas, eventos e equipes com qualidade profissional e acabamento impecável.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-200 uppercase tracking-wider mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-slate-900 dark:hover:text-[#d4af37] transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/uniformes" className="hover:text-slate-900 dark:hover:text-[#d4af37] transition-colors">
                  Catálogo de Uniformes
                </Link>
              </li>
              <li>
                <Link href="/monte-seu-uniforme" className="hover:text-slate-900 dark:hover:text-[#d4af37] transition-colors">
                  Monte seu Uniforme
                </Link>
              </li>
              <li>
                <Link href="/meus-pedidos" className="hover:text-slate-900 dark:hover:text-[#d4af37] transition-colors">
                  Acompanhar Pedido
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-200 uppercase tracking-wider mb-4">Acesso</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-slate-900 dark:hover:text-[#d4af37] transition-colors">
                  Área do Cliente
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-slate-900 dark:hover:text-[#d4af37] transition-colors">
                  Painel de Gestão
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} GH Camiseteria & Uniformes Personalizados. Todos os direitos reservados.</p>
          <p>
            Criado por{" "}
            <a
              href="https://techproms.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-600 hover:text-slate-900 dark:text-[#d4af37] dark:hover:text-amber-300 transition-colors"
            >
              Techpro MS
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
