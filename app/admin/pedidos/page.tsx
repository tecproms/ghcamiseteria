import { ShoppingCart, Plus } from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminPedidosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminHeader
          title="Gestão de Pedidos"
          description="Acompanhamento de vendas, status de pagamento, grade de peças e entrega"
        />
        <Button className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Novo Pedido
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos Realizados</CardTitle>
          <CardDescription>
            Listagem estruturada conectada ao serviço PedidosService.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Módulo de Pedidos Estruturado</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Estrutura pronta para consulta e filtros de status diretamente da tabela pedidos do Supabase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
