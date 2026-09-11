import { Package, Plus } from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminProdutosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminHeader
          title="Gestão de Produtos"
          description="Catálogo de peças base (camisetas, polos, moletons e uniformes)"
        />
        <Button className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos Cadastrados</CardTitle>
          <CardDescription>
            Listagem estruturada conectada ao serviço ProdutosService.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Módulo de Produtos Estruturado</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Nenhum dado mockado gerado. As operações de listagem, inclusão e edição direta com Supabase serão ativadas na fase de telas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
