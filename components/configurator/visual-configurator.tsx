"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useConfiguratorStore } from "@/stores/configurator.store";
import { EditorToolbar } from "@/components/configurator/editor-toolbar";
import { ElementControls } from "@/components/configurator/element-controls";
import { Loader2, Sparkles } from "lucide-react";

// Carregamento dinâmico estrito no cliente (sem SSR) para o Konva HTML5 Canvas
const KonvaConfiguratorStage = dynamic(
  () =>
    import("@/components/configurator/konva-stage").then(
      (mod) => mod.KonvaConfiguratorStage
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square max-w-[680px] mx-auto rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
          Carregando motor gráfico Konva...
        </p>
      </div>
    ),
  }
);

export function VisualConfigurator() {
  const { setModels, selectedModel, selectedViewSide, selectedColor } = useConfiguratorStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/modelos");
        const data = await res.json();
        if (data.success && data.models) {
          setModels(data.models);
        }
      } catch (err) {
        console.error("Erro ao carregar modelos para o configurador:", err);
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, [setModels]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
        <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
          Carregando dados dos modelos e zonas técnicas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Status Superior */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-900 dark:text-white">
            {selectedModel?.name || "Modelo Selecionado"}
          </span>
          <span className="text-slate-400 dark:text-zinc-500">•</span>
          <span className="text-slate-500 dark:text-zinc-400">
            Vista: <strong>{selectedViewSide}</strong>
          </span>
          <span className="text-slate-400 dark:text-zinc-500">•</span>
          <span className="text-slate-500 dark:text-zinc-400">
            Cor: <strong>{selectedColor.name}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 text-[11px]">
          <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
          <span>Konva 2D Engine • Restrições em Tempo Real</span>
        </div>
      </div>

      {/* Grid Principal: Canvas do Uniforme (Esquerda) e Painel de Ferramentas (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lado Esquerdo: Barra de Ferramentas + Canvas Konva (7 colunas no Desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <EditorToolbar />
          <KonvaConfiguratorStage />
        </div>

        {/* Lado Direito: Painel de Controle e Propriedades (5 colunas no Desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 h-full min-h-[580px]">
          <ElementControls />
        </div>
      </div>
    </div>
  );
}
