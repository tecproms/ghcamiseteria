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
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Catálogo de Uniformes</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
            Conheça os modelos base disponíveis para confecção sob medida e personalização da sua marca.
          </p>
        </div>
        <a
          href={`https://api.whatsapp.com/send?phone=${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999"}&text=${encodeURIComponent("Olá! Gostaria de solicitar um orçamento de uniformes.")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="gap-2 bg-[#d4af37] hover:bg-[#c49f27] text-zinc-950 font-bold border-none shadow-md">
            Solicitar Orçamento
            <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
      </div>

      {/* Category Pills */}
      <div className="py-6 flex items-center gap-2 overflow-x-auto">
        <Filter className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0 mr-1" />
        {categorias.map((cat, idx) => (
          <span
            key={cat.id}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              idx === 0
                ? "bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-semibold"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {cat.label}
          </span>
        ))}
      </div>

      {/* Base Catalog Container */}
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-12 text-center my-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-[#d4af37] mb-4">
          <Shirt className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Modelos e Catálogo Especializado</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Consulte nossa equipe para confecção sob medida com tecidos premium, bordados e estampas de alta durabilidade.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href={`https://api.whatsapp.com/send?phone=${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999"}&text=${encodeURIComponent("Olá! Gostaria de solicitar um orçamento para uniformes.")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="bg-[#d4af37] hover:bg-[#c49f27] text-zinc-950 font-bold border-none shadow-md">
              Falar com Consultor
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
