import { Layers, Plus } from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminModelosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminHeader
          title="Modelos de Uniformes"
          description="Modelos pré-configurados, tipos de recorte e variações de tecidos"
        />
        <Button className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Novo Modelo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modelos Cadastrados</CardTitle>
          <CardDescription>
            Listagem estruturada conectada ao serviço UniformesService.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Módulo de Modelos Estruturado</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Nenhum dado mockado gerado. A integração com o personalizador visual e banco de dados ocorrerá na próxima fase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
