import { Factory, Plus } from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminProducaoPage() {
  const etapas = [
    "Corte",
    "Estampagem / Bordado",
    "Costura",
    "Acabamento",
    "Conferência & Embalagem",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminHeader
          title="Controle de Produção"
          description="Kanban e esteira fabril de ordens de produção por etapas operacionais"
        />
        <Button className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Nova Ordem de Produção
        </Button>
      </div>

      {/* Etapas do fluxo produtivo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {etapas.map((etapa, idx) => (
          <div
            key={etapa}
            className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-xs"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase">Etapa {idx + 1}</div>
            <div className="text-xs font-semibold text-slate-800 mt-1">{etapa}</div>
            <div className="text-xs text-slate-400 mt-2">0 ordens</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ordens de Produção em Andamento</CardTitle>
          <CardDescription>
            Esteira conectada ao serviço ProducaoService.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
              <Factory className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Módulo de Produção Estruturado</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Estrutura de acompanhamento de status de confecção pronta para vinculação com operadores de fábrica e ordens do Supabase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
