"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Save,
  FolderOpen,
  CheckCircle2,
  X,
  Users,
} from "lucide-react";
import { useConfiguratorStore } from "@/stores/configurator.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    selectedColor,
    selectedViewSide,
    elements,
    currentProjectId,
    setCurrentProjectId,
    projectName,
    setProjectName,
    quantity,
    setQuantity,
    getSerializableConfig,
    teamRoster,
  } = useConfiguratorStore();

  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  // Salvar ou atualizar projeto no Meus Projetos
  const handleSaveProject = async () => {
    if (!selectedModel) return;
    setIsSaving(true);
    setSaveStatus(null);

    const config = getSerializableConfig();

    try {
      const isUpdating = Boolean(currentProjectId);
      const url = isUpdating ? `/api/meus-projetos/${currentProjectId}` : "/api/meus-projetos";
      const method = isUpdating ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName || "Meu Uniforme Personalizado",
          shirt_model_id: selectedModel.id,
          model_name: selectedModel.name,
          color: config.color,
          quantity: config.teamRoster?.enabled ? config.teamRoster.members.length : quantity,
          views: elements,
          teamRoster: config.teamRoster,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setSaveStatus({
          type: "error",
          text: "Você precisa fazer login para salvar seu projeto.",
        });
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha ao salvar projeto.");
      }

      if (!isUpdating && data.project?.id) {
        setCurrentProjectId(data.project.id);
      }

      setSaveStatus({
        type: "success",
        text: isUpdating
          ? "Projeto atualizado com sucesso!"
          : "Projeto salvo com sucesso no Meus Projetos!",
      });

      setTimeout(() => {
        setIsSaveModalOpen(false);
        setSaveStatus(null);
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar projeto";
      setSaveStatus({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
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

        {/* Visualização de Zonas, Validação e Salvar Projeto */}
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
            <span>Validar</span>
          </Button>

          {/* Botão Salvar / Atualizar Projeto */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsSaveModalOpen(true)}
            className="h-8 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-semibold gap-1.5 shadow-sm"
            title={currentProjectId ? "Atualizar montagem salva" : "Salvar montagem no Meus Projetos"}
          >
            <Save className="h-3.5 w-3.5" />
            <span>{currentProjectId ? "Salvar Alterações" : "Salvar Projeto"}</span>
          </Button>

          <Link href="/meus-projetos">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs text-slate-700 dark:text-zinc-300 gap-1.5 border-slate-300 dark:border-zinc-700"
              title="Acessar lista de projetos salvos"
            >
              <FolderOpen className="h-3.5 w-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Projetos</span>
            </Button>
          </Link>

          {teamRoster.enabled && (
            <div
              className="flex items-center gap-1.5 px-2.5 h-8 rounded-md bg-[#d4af37]/15 border border-[#d4af37]/40 text-xs font-semibold text-slate-900 dark:text-[#d4af37]"
              title={`Grade de Equipe ativa com ${teamRoster.members.length} integrantes`}
            >
              <Users className="h-3.5 w-3.5 text-[#d4af37]" />
              <span>Equipe ({teamRoster.members.length})</span>
            </div>
          )}
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

      {/* Modal de Salvar Projeto */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-[#d4af37]">
                  <Save className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentProjectId ? "Atualizar Projeto" : "Salvar no Meus Projetos"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Salve sua montagem para acessar ou editar posteriormente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSaveModalOpen(false);
                  setSaveStatus(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Nome do Projeto
                </label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ex: Uniforme Futebol GH 2026"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Quantidade pretendida de peças
                  {teamRoster.enabled && (
                    <span className="ml-1 text-[11px] text-[#d4af37] font-normal">
                      (sincronizada com a Grade da Equipe)
                    </span>
                  )}
                </label>
                <Input
                  type="number"
                  min={1}
                  disabled={teamRoster.enabled}
                  value={teamRoster.enabled ? teamRoster.members.length : quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-9 text-xs disabled:opacity-80 disabled:bg-slate-100 dark:disabled:bg-zinc-800"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg text-xs space-y-1 text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-800/60">
                <div className="flex justify-between">
                  <span>Modelo:</span>
                  <strong className="text-slate-900 dark:text-white">{selectedModel?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cor da Peça:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-slate-300"
                      style={{ backgroundColor: selectedColor?.hex || "#FFFFFF" }}
                    />
                    <strong className="text-slate-900 dark:text-white">{selectedColor?.name || "Padrão"}</strong>
                  </div>
                </div>
              </div>

              {saveStatus && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                    saveStatus.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                      : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
                  }`}
                >
                  {saveStatus.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                  )}
                  <span>{saveStatus.text}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsSaveModalOpen(false);
                  setSaveStatus(null);
                }}
                className="h-8 px-3 text-xs"
              >
                Cancelar
              </Button>

              <Button
                size="sm"
                onClick={handleSaveProject}
                disabled={isSaving}
                className="h-8 px-4 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-semibold gap-1.5"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>{isSaving ? "Salvando..." : currentProjectId ? "Atualizar" : "Salvar Projeto"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
