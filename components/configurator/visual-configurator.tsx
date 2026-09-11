"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useConfiguratorStore } from "@/stores/configurator.store";
import { EditorToolbar } from "@/components/configurator/editor-toolbar";
import { ElementControls } from "@/components/configurator/element-controls";
import { Loader2, Sparkles, AlertCircle, PlusCircle, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const projetoId = searchParams.get("projetoId");

  const {
    setModels,
    selectedModel,
    selectedViewSide,
    selectedColor,
    currentProjectId,
    projectName,
    loadProjectState,
    resetProject,
  } = useConfiguratorStore();

  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

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

  // Carregar projeto por ID da URL (com validação estrita de posse e segurança)
  useEffect(() => {
    if (!projetoId) return;

    async function loadProject() {
      setLoadingProject(true);
      setProjectError(null);
      try {
        const res = await fetch(`/api/meus-projetos/${projetoId}`);
        const data = await res.json();

        if (res.status === 401) {
          setProjectError("Você precisa estar autenticado para abrir este projeto.");
          return;
        }

        if (res.status === 403) {
          setProjectError("Acesso negado: este projeto pertence a outro cliente.");
          return;
        }

        if (!res.ok || !data.success || !data.project) {
          setProjectError(data.error || "Projeto não encontrado.");
          return;
        }

        const proj = data.project;
        loadProjectState(proj.metadata.configuration, proj.id, proj.name);
      } catch {
        setProjectError("Falha na comunicação com o servidor ao carregar o projeto.");
      } finally {
        setLoadingProject(false);
      }
    }

    loadProject();
  }, [projetoId, loadProjectState]);

  if (loading || loadingProject) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
        <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
          {loadingProject ? "Carregando seu projeto salvo..." : "Carregando dados dos modelos e zonas técnicas..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerta de Acesso Negado ou Projeto Inexistente */}
      {projectError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-center justify-between text-xs text-red-800 dark:text-red-300 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{projectError}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setProjectError(null);
              resetProject();
              router.push("/monte-seu-uniforme");
            }}
            className="h-7 text-xs gap-1 border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Criar Novo Uniforme
          </Button>
        </div>
      )}

      {/* Barra de Status Superior */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          {currentProjectId ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-semibold">
              <BookmarkCheck className="h-3.5 w-3.5 text-[#d4af37]" />
              <span>Editando: {projectName}</span>
              <button
                onClick={() => {
                  resetProject();
                  router.push("/monte-seu-uniforme");
                }}
                className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-white underline text-[10px]"
                title="Desconectar projeto salvo e iniciar novo"
              >
                (Novo)
              </button>
            </div>
          ) : (
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          )}

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
