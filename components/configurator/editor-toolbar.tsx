"use client";

import React, { useState } from "react";
import {
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useConfiguratorStore } from "@/stores/configurator.store";
import { Button } from "@/components/ui/button";

export function EditorToolbar() {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    selectedElementId,
    duplicateElement,
    deleteElement,
    showZones,
    toggleShowZones,
    selectedModel,
    selectedViewSide,
    elements,
  } = useConfiguratorStore();

  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Executar validação no backend
  const handleValidateOnBackend = async () => {
    if (!selectedModel) return;
    const currentElements = elements[selectedViewSide] || [];

    setIsValidating(true);
    setValidationMessage(null);

    try {
      const res = await fetch("/api/customizer/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: selectedModel.id,
          viewSide: selectedViewSide,
          elements: currentElements,
        }),
      });
      const data = await res.json();

      if (data.valid) {
        setValidationMessage({
          type: "success",
          text: "Design 100% válido no servidor: posições, escalas e tipos respeitados!",
        });
      } else {
        setValidationMessage({
          type: "error",
          text: data.errors?.[0] || "Existem elementos fora das zonas permitidas.",
        });
      }
    } catch {
      setValidationMessage({
        type: "error",
        text: "Erro ao comunicar com o servidor de validação.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        {/* Histórico: Desfazer e Refazer */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo()}
            title="Desfazer (Ctrl+Z)"
            className="h-8 px-2.5 text-xs text-slate-700 dark:text-zinc-300 disabled:opacity-40"
          >
            <Undo2 className="h-4 w-4 mr-1" />
            Desfazer
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo()}
            title="Refazer (Ctrl+Y)"
            className="h-8 px-2.5 text-xs text-slate-700 dark:text-zinc-300 disabled:opacity-40"
          >
            <Redo2 className="h-4 w-4 mr-1" />
            Refazer
          </Button>
        </div>

        {/* Manipulação do Elemento Selecionado */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectedElementId && duplicateElement(selectedElementId)}
            disabled={!selectedElementId}
            title="Duplicar elemento"
            className="h-8 px-2.5 text-xs text-slate-700 dark:text-zinc-300 disabled:opacity-40"
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            Duplicar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectedElementId && deleteElement(selectedElementId)}
            disabled={!selectedElementId}
            title="Excluir elemento"
            className="h-8 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Excluir
          </Button>
        </div>

        {/* Visualização de Zonas e Validação */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleShowZones}
            className="h-8 px-2.5 text-xs text-slate-700 dark:text-zinc-300 gap-1.5"
            title="Mostrar ou ocultar guias das zonas técnicas permitidas"
          >
            {showZones ? <Eye className="h-3.5 w-3.5 text-blue-500" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
            <span>Áreas Permitidas</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleValidateOnBackend}
            disabled={isValidating}
            className="h-8 px-2.5 text-xs text-slate-700 dark:text-zinc-300 gap-1.5 border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            title="Validar regras de engenharia no backend"
          >
            {isValidating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span>Validar Backend</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Validação */}
      {validationMessage && (
        <div
          className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium border ${
            validationMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {validationMessage.type === "success" ? (
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            )}
            <span>{validationMessage.text}</span>
          </div>
          <button
            onClick={() => setValidationMessage(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
