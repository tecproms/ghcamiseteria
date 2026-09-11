import { Users, Plus } from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminClientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminHeader
          title="Gestão de Clientes"
          description="Controle de empresas (PJ), clientes individuais (PF) e histórico de compras"
        />
        <Button className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Base de Clientes</CardTitle>
          <CardDescription>
            Listagem e filtros integrados ao serviço ClientesService.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Módulo de Clientes Estruturado</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Estrutura pronta para vinculação com autenticação do Supabase e listagem real da tabela clientes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
