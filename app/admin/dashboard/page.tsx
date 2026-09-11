import { Users, ShoppingBag, FileText, Factory } from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const cards = [
    { title: "Pedidos Ativos", icon: ShoppingBag, desc: "Acompanhamento em tempo real" },
    { title: "Orçamentos Pendentes", icon: FileText, desc: "Aguardando retorno ou precificação" },
    { title: "Ordens de Produção", icon: Factory, desc: "Em confecção na fábrica" },
    { title: "Base de Clientes", icon: Users, desc: "Empresas e pessoas físicas" },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Painel de Controle"
        description="Visão geral dos pedidos, orçamentos e produção da confecção"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">—</div>
                <p className="text-xs text-slate-500 mt-1">{card.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métricas & Integração</CardTitle>
          <CardDescription>
            Ambiente conectado à base de dados Supabase. Indicadores analíticos serão carregados nesta área.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            Estrutura base do dashboard pronta. As consultas em tempo real serão ativadas na etapa de implementação das telas.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
