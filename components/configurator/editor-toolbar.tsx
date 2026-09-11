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
  Coins,
  FileText,
  Send,
  Camera,
  Download,
  Share2,
  Sparkles,
} from "lucide-react";
import { useConfiguratorStore } from "@/stores/configurator.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PricingCalculationResult } from "@/types/pricing";
import { useAuth } from "@/hooks/use-auth";
import { getGarmentType } from "@/lib/svg-templates";
import { generateViewSVG, convertSvgToPngDataUrl, triggerFileDownload } from "@/lib/production-export";
import type { ViewSide } from "@/types/uniform-model";
import type { OrderSnapshot } from "@/types/orders";

export function EditorToolbar() {
  const {
    models,
    selectModel,
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
    getTeamRosterSummary,
  } = useConfiguratorStore();

  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estados da Foto de Estúdio / Catálogo Fotográfico
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [isGeneratingStudio, setIsGeneratingStudio] = useState(false);
  const [studioImage, setStudioImage] = useState<string | null>(null);
  const [studioActiveView, setStudioActiveView] = useState<ViewSide>("FRONT");

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { user, profile } = useAuth();

  // Estados da Solicitação de Orçamento
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteContactName, setQuoteContactName] = useState("");
  const [quoteContactPhone, setQuoteContactPhone] = useState("");
  const [quoteResult, setQuoteResult] = useState<{
    success: boolean;
    quoteNumber?: string;
    message?: string;
  } | null>(null);

  // Estados do Motor de Preços (Server-Side Recalculation)
  const [pricingResult, setPricingResult] = useState<PricingCalculationResult | null>(null);
  const [isPriceDetailsOpen, setIsPriceDetailsOpen] = useState(false);

  // Recalcular preço 100% no servidor sempre que houver alterações
  React.useEffect(() => {
    let isMounted = true;
    const calculatePrice = async () => {
      try {
        const effectiveQty = teamRoster.enabled && teamRoster.members.length > 0
          ? teamRoster.members.length
          : quantity;

        const res = await fetch("/api/pricing/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shirtModelId: selectedModel?.id,
            modelName: selectedModel?.name,
            quantity: effectiveQty,
            views: elements,
            teamRoster: teamRoster.enabled ? teamRoster : undefined,
          }),
        });
        const data = await res.json();
        if (isMounted && data.success && data.pricing) {
          setPricingResult(data.pricing);
        }
      } catch {
        // Fallback silencioso
      }
    };

    const timer = setTimeout(calculatePrice, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedModel, elements, quantity, teamRoster]);

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

  // Solicitar Orçamento Oficial
  const handleRequestQuote = async () => {
    if (!selectedModel) return;
    setIsSubmittingQuote(true);
    setQuoteResult(null);

    const config = getSerializableConfig();
    const effectiveQty =
      teamRoster.enabled && teamRoster.members.length > 0
        ? teamRoster.members.length
        : quantity;

    try {
      const res = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shirt_model_id: selectedModel.id,
          model_name: selectedModel.name,
          color: config.color,
          quantity: effectiveQty,
          views: elements,
          teamRoster: teamRoster.enabled ? teamRoster : undefined,
          notes: quoteNotes,
          customer_name: quoteContactName || profile?.full_name || undefined,
          customer_email: user?.email || undefined,
          customer_phone: quoteContactPhone || undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setQuoteResult({
          success: false,
          message: "Você precisa fazer login para enviar uma solicitação de orçamento.",
        });
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha ao solicitar orçamento.");
      }

      setQuoteResult({
        success: true,
        quoteNumber: data.quote?.quote_number || "ORC-NOVO",
        message: "Orçamento solicitado com sucesso! Nossa equipe analisará os detalhes.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao solicitar orçamento";
      setQuoteResult({
        success: false,
        message: msg,
      });
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // Abertura e Renderização de Foto de Estúdio Fotográfico
  const handleOpenStudio = async (viewSideToRender: ViewSide = selectedViewSide) => {
    setIsStudioModalOpen(true);
    setIsGeneratingStudio(true);
    setStudioActiveView(viewSideToRender);

    try {
      // Se a vista for a mesma exibida no Canvas Konva, tenta captura direta ultra HD
      const konvaExport = (
        window as unknown as { __konva_export_studio__?: () => string | null }
      ).__konva_export_studio__;

      if (viewSideToRender === selectedViewSide && typeof konvaExport === "function") {
        const url = konvaExport();
        if (url) {
          setStudioImage(url);
          setIsGeneratingStudio(false);
          return;
        }
      }

      // Renderização SVG -> PNG ultra nítida de qualquer vista (1800x1800)
      const config = getSerializableConfig();
      const snapshot: OrderSnapshot = {
        version: 1,
        shirt_model_id: selectedModel?.id || "model-1",
        model_name: selectedModel?.name || "Camiseta",
        color: {
          id: config.color.id,
          name: config.color.name,
          hex: config.color.hex,
        },
        quantity: quantity,
        size_breakdown: {},
        views: elements,
        team_roster: teamRoster.enabled ? teamRoster : null,
        pricing_summary: {
          unit_price: pricingResult?.unitPrice || 0,
          discount_amount: pricingResult?.totalDiscount || 0,
          final_total: pricingResult?.total || 0,
        },
        approved_at: new Date().toISOString(),
      };

      const svgString = generateViewSVG(viewSideToRender, snapshot, 1200, 1200);
      const pngUrl = await convertSvgToPngDataUrl(svgString, 1800, 1800);
      setStudioImage(pngUrl);
    } catch (err) {
      console.error("Erro ao gerar foto de estúdio:", err);
    } finally {
      setIsGeneratingStudio(false);
    }
  };

  const handleDownloadStudioImage = () => {
    if (!studioImage) return;
    const cleanModel = (selectedModel?.name || "UNIFORME").replace(/[^a-zA-Z0-9]/g, "_");
    triggerFileDownload(studioImage, `CATALOGO_GH_${cleanModel}_${studioActiveView}.png`);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Montei meu uniforme na GH Camiseteria (*${selectedModel?.name || "Uniforme"}* na cor *${selectedColor?.name || "Personalizada"}*) e gostaria de solicitar um orçamento para ${quantity} peças!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-2">
      {/* Seletor Rápido de Modelo / Corte & Botão Foto de Estúdio */}
      {models.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider px-1">
              Modelo / Corte:
            </span>
            {models.map((m) => {
              const isSelected = selectedModel?.id === m.id;
              const gType = getGarmentType(m.name || m.id);
              const icon = gType === "POLO" ? "👔" : gType === "MANGA_LONGA" ? "🧥" : "👕";
              return (
                <button
                  key={m.id}
                  onClick={() => selectModel(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 shadow-sm ring-2 ring-[#d4af37]/40"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:border-[#d4af37]/50"
                  }`}
                  title={`Selecionar corte: ${m.name}`}
                >
                  <span>{icon}</span>
                  <span className="truncate max-w-[150px] sm:max-w-[210px]">{m.name}</span>
                </button>
              );
            })}
          </div>

          <Button
            size="sm"
            onClick={() => handleOpenStudio(selectedViewSide)}
            className="h-8 px-3.5 text-xs bg-gradient-to-r from-amber-500 via-[#d4af37] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold gap-1.5 shadow-sm ml-auto"
            title="Gerar foto de catálogo profissional em alta definição com iluminação de estúdio"
          >
            <Camera className="h-3.5 w-3.5 text-zinc-950" />
            <span>Foto de Estúdio</span>
          </Button>
        </div>
      )}
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

          {/* Orçamento Dinâmico Calculado no Servidor */}
          {pricingResult && (
            <button
              onClick={() => setIsPriceDetailsOpen(true)}
              className="flex items-center gap-1.5 px-3 h-8 rounded-md bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-300 transition-colors shadow-xs"
              title="Clique para ver o detalhamento do orçamento oficial recalculado no servidor"
            >
              <Coins className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>R$ {pricingResult.unitPrice.toFixed(2)}/un.</span>
              <span className="text-emerald-700/80 dark:text-emerald-400/80 font-normal hidden sm:inline">
                (Total: R$ {pricingResult.total.toFixed(2)})
              </span>
              {pricingResult.discountPercent > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-600 text-white font-bold">
                  {pricingResult.discountPercent}% OFF
                </span>
              )}
            </button>
          )}

          {/* Botão Solicitar Orçamento */}
          <Button
            size="sm"
            onClick={() => {
              if (profile?.full_name && !quoteContactName) {
                setQuoteContactName(profile.full_name);
              }
              setIsQuoteModalOpen(true);
            }}
            className="h-8 px-3 text-xs bg-[#d4af37] hover:bg-[#c59b27] text-zinc-950 font-bold gap-1.5 shadow-sm"
            title="Transformar esta configuração em uma solicitação real de orçamento"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Solicitar Orçamento</span>
          </Button>

          <Link href="/meus-orcamentos">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs text-slate-700 dark:text-zinc-300 gap-1.5 border-slate-300 dark:border-zinc-700"
              title="Acessar cotações e orçamentos solicitados"
            >
              <FileText className="h-3.5 w-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Orçamentos</span>
            </Button>
          </Link>
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

      {/* Modal de Detalhamento do Orçamento (Cálculo Oficial do Servidor) */}
      {isPriceDetailsOpen && pricingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Detalhamento do Orçamento
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Cálculo oficial recalculado no servidor em tempo real.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPriceDetailsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Preço Base ({selectedModel?.name || "Camiseta"}):</span>
                <span className="font-mono font-medium">R$ {pricingResult.unitBasePrice.toFixed(2)}</span>
              </div>

              {pricingResult.breakdown.elements.length > 0 && (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                  <div className="font-semibold text-slate-700 dark:text-zinc-300 mb-1">Personalizações por Peça:</div>
                  {pricingResult.breakdown.elements.map((el, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-slate-500">
                      <span>• {el.description}</span>
                      <span className="font-mono">+R$ {el.unitPrice.toFixed(2)}</span>
                    </div>
                  ))}
                  {pricingResult.breakdown.positions.map((pos, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-slate-500">
                      <span>• {pos.description}</span>
                      <span className="font-mono">+R$ {pos.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between font-semibold text-slate-800 dark:text-zinc-200 pt-1 border-t">
                <span>Preço Bruto Unitário:</span>
                <span className="font-mono">R$ {pricingResult.unitPriceBeforeDiscount.toFixed(2)}</span>
              </div>

              {pricingResult.discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Desconto por Volume ({pricingResult.discountPercent}% OFF):</span>
                  <span className="font-mono">-R$ {pricingResult.unitDiscountAmount.toFixed(2)} / un</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex justify-between items-center font-bold">
                <span className="text-slate-900 dark:text-white">Preço Unitário Líquido:</span>
                <span className="text-base font-mono text-emerald-700 dark:text-emerald-400">
                  R$ {pricingResult.unitPrice.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Quantidade:</span>
                  <strong className="text-slate-900 dark:text-white">{pricingResult.quantity} peças</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Bruto:</span>
                  <span className="font-mono">R$ {pricingResult.subtotal.toFixed(2)}</span>
                </div>
                {pricingResult.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Economia Total:</span>
                    <span className="font-mono">-R$ {pricingResult.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                {pricingResult.additionals > 0 && (
                  <div className="flex justify-between text-amber-600 font-medium">
                    <span>Taxas Adicionais:</span>
                    <span className="font-mono">+R$ {pricingResult.additionals.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t">
                  <span>VALOR TOTAL DO PEDIDO:</span>
                  <span className="font-mono text-[#d4af37]">R$ {pricingResult.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <Button
                size="sm"
                onClick={() => setIsPriceDetailsOpen(false)}
                className="h-8 px-4 text-xs bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950"
              >
                Fechar Detalhes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Solicitação de Orçamento */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37]">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Solicitar Orçamento Oficial
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Nossa equipe comercial analisará os detalhes técnicos e enviará a proposta com valores e prazos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsQuoteModalOpen(false);
                  setQuoteResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {quoteResult?.success ? (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Orçamento Solicitado com Sucesso!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Número de Protocolo:{" "}
                    <strong className="font-mono text-emerald-700 dark:text-emerald-400">
                      {quoteResult.quoteNumber}
                    </strong>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-sm mx-auto pt-2">
                    Sua solicitação está como <span className="font-semibold text-amber-600">PENDENTE</span>. Você receberá a notificação assim que nossa equipe precificar e enviar o valor formal.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Link href="/meus-orcamentos" className="w-full sm:w-auto">
                    <Button
                      size="sm"
                      className="w-full h-9 px-4 text-xs bg-[#d4af37] hover:bg-[#c59b27] text-zinc-950 font-bold gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Ver Meus Orçamentos</span>
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsQuoteModalOpen(false);
                      setQuoteResult(null);
                    }}
                    className="w-full sm:w-auto h-9 px-4 text-xs"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Resumo da Peça e Quantidade */}
                <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl text-xs space-y-2 border border-slate-200/60 dark:border-zinc-800">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Modelo Selecionado:</span>
                    <strong className="text-slate-900 dark:text-white font-medium">{selectedModel?.name}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Cor do Tecido:</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-slate-300"
                        style={{ backgroundColor: selectedColor?.hex || "#FFFFFF" }}
                      />
                      <span className="font-medium text-slate-800 dark:text-zinc-200">{selectedColor?.name}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Quantidade Total:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {teamRoster.enabled && teamRoster.members.length > 0
                        ? `${teamRoster.members.length} peças (Grade de Equipe)`
                        : `${quantity} peças`}
                    </strong>
                  </div>

                  {teamRoster.enabled && teamRoster.members.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Distribuição de Tamanhos:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(getTeamRosterSummary().sizeBreakdown).map(([sz, qty]) => (
                          <span key={sz} className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 font-mono font-medium">
                            {sz}: {qty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {pricingResult && (
                    <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300">Estimativa Prévia do Sistema:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                        R$ {pricingResult.total.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Campos do Formulário */}
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Observações / Requisitos Especiais (opcional)
                    </label>
                    <textarea
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="Ex: Prazo limite para entrega, tipo de acabamento, detalhes da serigrafia/bordado..."
                      rows={3}
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Nome para Contato
                      </label>
                      <Input
                        value={quoteContactName}
                        onChange={(e) => setQuoteContactName(e.target.value)}
                        placeholder="Seu nome ou empresa"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        WhatsApp / Telefone
                      </label>
                      <Input
                        value={quoteContactPhone}
                        onChange={(e) => setQuoteContactPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {quoteResult && !quoteResult.success && (
                  <div className="p-2.5 rounded-lg text-xs font-medium border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{quoteResult.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsQuoteModalOpen(false);
                      setQuoteResult(null);
                    }}
                    className="h-8 px-3 text-xs"
                  >
                    Cancelar
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleRequestQuote}
                    disabled={isSubmittingQuote}
                    className="h-8 px-4 text-xs bg-[#d4af37] hover:bg-[#c59b27] text-zinc-950 font-bold gap-1.5 shadow-sm"
                  >
                    {isSubmittingQuote ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>{isSubmittingQuote ? "Enviando..." : "Confirmar Solicitação"}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Foto de Estúdio & Apresentação de Catálogo */}
      {isStudioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 sm:p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-[#d4af37] flex items-center justify-center text-zinc-950 shadow-md">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Foto de Estúdio & Catálogo
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                      Alta Resolução
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Apresentação fotográfica de estúdio do seu uniforme personalizado.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsStudioModalOpen(false);
                  setStudioImage(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Alternador de Vistas dentro do Modal de Estúdio */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">Vista:</span>
                {(["FRONT", "BACK", "LEFT_SLEEVE", "RIGHT_SLEEVE"] as ViewSide[]).map((side) => {
                  const labels: Record<ViewSide, string> = {
                    FRONT: "Frente",
                    BACK: "Costas",
                    LEFT_SLEEVE: "Manga Esq.",
                    RIGHT_SLEEVE: "Manga Dir.",
                    OTHER: "Outro",
                  };
                  const isCur = studioActiveView === side;
                  return (
                    <button
                      key={side}
                      disabled={isGeneratingStudio}
                      onClick={() => handleOpenStudio(side)}
                      className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                        isCur
                          ? "bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {labels[side]}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
                <span>Textura e caimento realistas</span>
              </div>
            </div>

            {/* Card de Apresentação de Estúdio Fotográfico */}
            <div className="relative rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-zinc-800 p-6 flex flex-col items-center justify-center min-h-[340px] sm:min-h-[400px] overflow-hidden shadow-inner">
              {/* Iluminação Spot de Fundo */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />

              {/* Marca d'água de Grife */}
              <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pointer-events-none">
                <Sparkles className="h-3 w-3 text-[#d4af37]" />
                GH Camiseteria • Estúdio Virtual
              </div>

              {isGeneratingStudio ? (
                <div className="flex flex-col items-center gap-3 py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-[#d4af37]" />
                  <p className="text-xs text-zinc-400 font-medium">
                    Renderizando foto de estúdio em alta resolução...
                  </p>
                </div>
              ) : studioImage ? (
                <div className="relative flex items-center justify-center w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={studioImage}
                    alt="Uniforme GH Camiseteria Estúdio"
                    className="max-h-[360px] max-w-full object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.6)]"
                  />
                </div>
              ) : (
                <div className="text-xs text-zinc-500 py-16">Nenhuma imagem gerada.</div>
              )}

              {/* Tag de especificações no rodapé da foto */}
              <div className="absolute bottom-3 right-4 flex items-center gap-2 text-[10px] text-zinc-400 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-zinc-800">
                <span>{selectedModel?.name}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-zinc-700"
                    style={{ backgroundColor: selectedColor?.hex }}
                  />
                  <span>{selectedColor?.name}</span>
                </div>
              </div>
            </div>

            {/* Ações de Download e Compartilhamento */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsStudioModalOpen(false);
                  setStudioImage(null);
                }}
                className="h-9 px-3 text-xs"
              >
                Fechar
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareWhatsApp}
                  className="h-9 px-3.5 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1.5 font-semibold"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleDownloadStudioImage}
                  disabled={!studioImage || isGeneratingStudio}
                  className="h-9 px-4 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-bold gap-1.5 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Baixar Foto em Alta Resolução (PNG)</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
