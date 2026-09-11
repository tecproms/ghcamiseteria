import Link from "next/link";
import { Shirt, Filter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UniformesPage() {
  const categorias = [
    { id: "todos", label: "Todos os Modelos" },
    { id: "camisetas", label: "Camisetas Tradicionais" },
    { id: "polos", label: "Camisas Polo" },
    { id: "moletons", label: "Moletons & Casacos" },
    { id: "profissionais", label: "Linha Profissional" },
    { id: "esportivos", label: "Uniformes Esportivos" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Catálogo de Uniformes</h1>
          <p className="mt-2 text-sm text-slate-600">
            Conheça os modelos base disponíveis para confecção sob medida e personalização da sua marca.
          </p>
        </div>
        <Link href="/monte-seu-uniforme">
          <Button className="gap-2">
            Monte seu Uniforme
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Category Pills */}
      <div className="py-6 flex items-center gap-2 overflow-x-auto">
        <Filter className="h-4 w-4 text-slate-400 shrink-0 mr-1" />
        {categorias.map((cat, idx) => (
          <span
            key={cat.id}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              idx === 0
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {cat.label}
          </span>
        ))}
      </div>

      {/* Base Catalog Container */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center my-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4">
          <Shirt className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Catálogo Conectado ao Supabase</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
          Os modelos e especificações técnicas de tecidos serão carregados diretamente do banco de dados na próxima etapa.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/monte-seu-uniforme">
            <Button size="sm">Acessar Personalizador</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
