import Link from "next/link";
import { Palette, Layers, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MonteSeuUniformePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 px-3 py-0.5 text-xs font-medium mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Configurador de Peças
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Monte seu Uniforme</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ambiente de personalização visual sob medida: escolha o modelo, selecione as cores, insira suas estampas e bordados.
          </p>
        </div>
        <Link href="/uniformes">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Ver Modelos Base
          </Button>
        </Link>
      </div>

      {/* Scaffolding Notice / Etapa Placeholder */}
      <div className="my-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">1. Escolha do Tecido e Modelagem</h3>
            <p className="text-xs text-slate-500 mt-2">
              Selecione o corte ideal, padrão de gola, tipo de manga e composição do tecido para a necessidade da sua empresa.
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Palette className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">2. Estilização e Cores</h3>
            <p className="text-xs text-slate-500 mt-2">
              Defina as cores dos painéis, frisos e detalhes com visualização em alta fidelidade.
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">3. Aplicação de Logo & Arte</h3>
            <p className="text-xs text-slate-500 mt-2">
              Envie o logo da sua marca e posicione no peito, costas ou mangas com dimensões precisas.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Canvas Placeholder (Konva será integrado na próxima etapa) */}
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 mb-4">
          <Palette className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Configurador Interativo Konva</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
          A fundação técnica deste módulo está preparada. O canvas de renderização gráfica e manipulação em tempo real de estampas será implementado na etapa subsequente.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/uniformes">
            <Button variant="outline" size="sm">Explorar Catálogo</Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Fazer Login para Salvar Modelos</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
