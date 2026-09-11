import { PackageSearch, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function MeusPedidosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meus Pedidos</h1>
        <p className="mt-2 text-sm text-slate-600">
          Acompanhe o status de confecção, aprovação de arte e envio dos seus uniformes.
        </p>
      </div>

      {/* Consulta rápida de pedido */}
      <div className="my-8 max-w-xl">
        <label htmlFor="codigo-pedido" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Buscar por Código de Pedido ou CPF/CNPJ
        </label>
        <div className="flex gap-2">
          <Input
            id="codigo-pedido"
            placeholder="Ex: PED-2026-001 ou 00.000.000/0001-00"
            className="flex-1"
          />
          <Button className="gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Container de Pedidos */}
      <Card className="my-6">
        <CardContent className="py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
            <PackageSearch className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Nenhum pedido selecionado</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Informe o código do seu pedido acima ou acesse sua conta para listar automaticamente todo o seu histórico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
