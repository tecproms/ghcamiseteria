"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Factory,
  Search,
  CheckCircle2,
  Printer,
  Download,
  Eye,
  Plus,
  RefreshCw,
  X,
  Sparkles,
  AlertCircle,
  Shirt,
  Users,
  Layers,
  FileText,
  FileCode,
  FileDown,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CustomizerElement } from "@/types/configurator";
import {
  PRODUCTION_STEPS_CONFIG,
  type ProductionOrder,
  type ProductionStepKey,
  type ProductionStepStatus,
} from "@/types/production";
import {
  formatProductionFilename,
  generateViewSVG,
  convertSvgToPngDataUrl,
  triggerFileDownload,
  downloadOrderConfigJson,
} from "@/lib/production-export";

export default function AdminProducaoPage() {
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStepFilter, setSelectedStepFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOP, setSelectedOP] = useState<ProductionOrder | null>(null);

  // Modal de Nova Ordem a partir de Pedido Pago
  const [showNewOPModal, setShowNewOPModal] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState<
    { id: string; order_number: string; customer_name: string; total_pieces: number; has_op: boolean }[]
  >([]);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [creatingOP, setCreatingOP] = useState(false);

  // Inspetor de Vistas / Arte
  const [activeViewTab, setActiveViewTab] = useState<"FRONT" | "BACK" | "LEFT" | "RIGHT">("FRONT");

  // Edição de Etapa
  const [stepToUpdate, setStepToUpdate] = useState<ProductionStepKey>("PEDIDO_RECEBIDO");
  const [stepStatusToUpdate, setStepStatusToUpdate] = useState<ProductionStepStatus>("IN_PROGRESS");
  const [operatorName, setOperatorName] = useState("");
  const [stepNotes, setStepNotes] = useState("");
  const [updatingStep, setUpdatingStep] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProductionOrders = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        selectedStepFilter === "ALL"
          ? "/api/admin/producao"
          : `/api/admin/producao?step=${selectedStepFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.production_orders) {
        setProductionOrders(data.production_orders);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [selectedStepFilter]);

  useEffect(() => {
    fetchProductionOrders();
  }, [fetchProductionOrders]);

  const handleOpenNewOPModal = async () => {
    setShowNewOPModal(true);
    setLoadingEligible(true);
    try {
      const res = await fetch("/api/admin/producao/eligible-orders");
      const data = await res.json();
      if (data.success && data.orders) {
        setEligibleOrders(data.orders);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingEligible(false);
    }
  };

  const handleCreateOP = async (orderId: string) => {
    setCreatingOP(true);
    try {
      const res = await fetch("/api/admin/producao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json();
      if (data.success && data.production_order) {
        setShowNewOPModal(false);
        fetchProductionOrders();
        handleOpenOP(data.production_order);
      }
    } catch {
      // Fallback
    } finally {
      setCreatingOP(false);
    }
  };

  const handleOpenOP = (op: ProductionOrder) => {
    setSelectedOP(op);
    setStepToUpdate(op.current_step);
    const currentStepObj = op.steps?.find((s) => s.step_key === op.current_step);
    setStepStatusToUpdate(currentStepObj?.status || "IN_PROGRESS");
    setOperatorName(currentStepObj?.operator_name || "");
    setStepNotes(currentStepObj?.notes || "");
    setFeedback(null);
  };

  const handleUpdateStep = async () => {
    if (!selectedOP) return;
    setUpdatingStep(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/producao/${selectedOP.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_key: stepToUpdate,
          status: stepStatusToUpdate,
          operator_name: operatorName || undefined,
          notes: stepNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.production_order) {
        setSelectedOP(data.production_order);
        setProductionOrders((prev) =>
          prev.map((o) => (o.id === data.production_order.id ? data.production_order : o))
        );
        setFeedback({
          type: "success",
          text: `Etapa atualizada com sucesso! Esteira: ${data.production_order.current_step}`,
        });
      } else {
        setFeedback({ type: "error", text: data.error || "Erro ao atualizar etapa." });
      }
    } catch {
      setFeedback({ type: "error", text: "Erro de conexão ao atualizar etapa." });
    } finally {
      setUpdatingStep(false);
    }
  };

  // Exportações Oficiais
  const handleExportPNG = async (viewSide: "FRONT" | "BACK" | "LEFT" | "RIGHT", suffix: string) => {
    if (!selectedOP) return;
    const svgStr = generateViewSVG(viewSide, selectedOP.snapshot);
    const dataUrl = await convertSvgToPngDataUrl(svgStr, 1800, 1800);
    const filename = formatProductionFilename(selectedOP.order_number, suffix, "png");
    triggerFileDownload(dataUrl, filename);
  };

  const handleExportSVG = (viewSide: "FRONT" | "BACK" | "LEFT" | "RIGHT", suffix: string) => {
    if (!selectedOP) return;
    const svgStr = generateViewSVG(viewSide, selectedOP.snapshot);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const filename = formatProductionFilename(selectedOP.order_number, suffix, "svg");
    triggerFileDownload(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportConfig = () => {
    if (!selectedOP) return;
    downloadOrderConfigJson(selectedOP.order_number, selectedOP.snapshot);
  };

  const handlePrintSheet = () => {
    window.print();
  };

  const filteredOPs = productionOrders.filter((op) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      op.production_number.toLowerCase().includes(term) ||
      op.order_number.toLowerCase().includes(term) ||
      op.customer_name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Top Header (Oculto na impressão) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <AdminHeader
          title="Controle Operacional de Produção"
          description="Acompanhamento fabril das 9 etapas, fichas técnicas, artes e corte"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchProductionOrders}
            disabled={loading}
            className="gap-2 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button
            onClick={handleOpenNewOPModal}
            className="gap-2 bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-semibold shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nova OP (Pedidos Pagos)
          </Button>
        </div>
      </div>

      {/* Stepper Tabs Filter (Oculto na impressão) */}
      <div className="space-y-3 print:hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedStepFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
              selectedStepFilter === "ALL"
                ? "bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-semibold shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 hover:bg-slate-100"
            }`}
          >
            Todas as Ordens ({productionOrders.length})
          </button>
          {PRODUCTION_STEPS_CONFIG.map((cfg) => {
            const count = productionOrders.filter((op) => op.current_step === cfg.key).length;
            return (
              <button
                key={cfg.key}
                onClick={() => setSelectedStepFilter(cfg.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedStepFilter === cfg.key
                    ? "bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-semibold shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 hover:bg-slate-100"
                }`}
              >
                <span className="font-bold">{cfg.order}.</span>
                <span>{cfg.label}</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-800 text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Busca */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por OP (OP-2026-...), Pedido ou Cliente..."
            className="pl-9 bg-white dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Grid de Ordens de Produção (Oculto na impressão) */}
      <div className="print:hidden">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 animate-pulse"
              />
            ))}
          </div>
        ) : filteredOPs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Factory className="mx-auto h-12 w-12 text-slate-300 dark:text-zinc-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-zinc-200">
                Nenhuma ordem de produção em andamento
              </h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                Pedidos com pagamento confirmado podem ser inseridos na esteira clicando em &ldquo;Nova OP (Pedidos Pagos)&rdquo;.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOPs.map((op) => {
              const currentStepObj = PRODUCTION_STEPS_CONFIG.find(
                (c) => c.key === op.current_step
              );
              const stepIndex = currentStepObj?.order || 1;
              const progressPct = Math.round((stepIndex / 9) * 100);

              return (
                <div
                  key={op.id}
                  onClick={() => handleOpenOP(op)}
                  className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#d4af37] hover:shadow-md cursor-pointer dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* Topo: OP Number e Badge de Etapa */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                        {op.production_number}
                      </span>
                      <div className="text-xs text-slate-500 dark:text-zinc-400">
                        Pedido: <span className="font-semibold">{op.order_number}</span>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-semibold">
                      {stepIndex}. {currentStepObj?.label}
                    </Badge>
                  </div>

                  {/* Cliente e Modelo */}
                  <div className="space-y-1 mb-4 text-xs text-slate-600 dark:text-zinc-400">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {op.customer_name}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Shirt className="h-3.5 w-3.5" />
                      <span className="truncate">{op.snapshot?.model_name || "Uniforme Personalizado"}</span>
                    </div>
                    {op.snapshot?.color && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="h-3 w-3 rounded-full border border-slate-300 inline-block"
                          style={{ backgroundColor: op.snapshot.color.hex }}
                        />
                        <span>{op.snapshot.color.name || op.snapshot.color.hex}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {op.total_pieces} {op.total_pieces === 1 ? "peça" : "peças"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Barra de Progresso da Esteira (9 etapas) */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Esteira Fabril</span>
                      <span>{stepIndex} de 9 ({progressPct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 dark:bg-[#d4af37] transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Rodapé: Ação */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-zinc-800 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {new Date(op.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 text-xs text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ficha & Detalhes
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Nova Ordem a partir de Pedido Pago */}
      {showNewOPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:hidden">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[#d4af37]" />
                  Criar Ordem de Produção (OP)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Apenas pedidos com status Pago (PAID) podem ingressar na esteira fabril.
                </p>
              </div>
              <button
                onClick={() => setShowNewOPModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingEligible ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Carregando pedidos pagos...
              </div>
            ) : eligibleOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Não há pedidos pagos pendentes de produção no momento.
              </div>
            ) : (
              <div className="space-y-3">
                {eligibleOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {ord.order_number}
                      </div>
                      <div className="text-slate-500">
                        {ord.customer_name} • <strong>{ord.total_pieces} peças</strong>
                      </div>
                    </div>
                    {ord.has_op ? (
                      <Badge variant="outline" className="text-slate-400">
                        Já em Produção
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        disabled={creatingOP}
                        onClick={() => handleCreateOP(ord.id)}
                        className="bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-bold text-xs"
                      >
                        Iniciar Produção
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drawer / Modal de Detalhes da Ordem de Produção & Ficha Técnica */}
      {selectedOP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:static print:p-0 print:bg-transparent">
          <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 print:max-h-none print:w-full print:border-none print:shadow-none print:p-0">
            {/* Header (Oculto na impressão) */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 print:hidden">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Ficha Técnica: {selectedOP.production_number}
                  </h2>
                  <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 font-semibold">
                    Etapa: {selectedOP.current_step}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">
                  Vinculada ao Pedido: <span className="font-mono font-bold">{selectedOP.order_number}</span> • Cliente: {selectedOP.customer_name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handlePrintSheet}
                  className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-bold text-xs shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimir Ficha (A4)
                </Button>
                <button
                  onClick={() => setSelectedOP(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo Principal / Ficha Técnica (Visível na tela e na impressão) */}
            <div className="p-6 space-y-6 print:p-0 print:space-y-4">
              {feedback && (
                <div
                  className={`p-3 rounded-lg text-sm flex items-center gap-2 print:hidden ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300"
                  }`}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Cabeçalho Oficial da Ficha para Impressão */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    GH Camiseteria — Ficha de Produção Fabril
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Documento Oficial de Corte, Estamparia, Costura e Embalagem
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-lg font-black text-slate-900 dark:text-[#d4af37]">
                    {selectedOP.production_number}
                  </div>
                  <div className="text-xs text-slate-500">PEDIDO: {selectedOP.order_number}</div>
                </div>
              </div>

              {/* Bloco Operacional: Controle de Etapas (Avançar Status) - Oculto na impressão */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-3 print:hidden">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Gerenciar Esteira Operacional da Fábrica
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                      Etapa Alvo
                    </label>
                    <select
                      value={stepToUpdate}
                      onChange={(e) => setStepToUpdate(e.target.value as ProductionStepKey)}
                      className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      {PRODUCTION_STEPS_CONFIG.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.order}. {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                      Status da Etapa
                    </label>
                    <select
                      value={stepStatusToUpdate}
                      onChange={(e) => setStepStatusToUpdate(e.target.value as ProductionStepStatus)}
                      className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <option value="IN_PROGRESS">Em Andamento</option>
                      <option value="COMPLETED">Concluído (Avançar)</option>
                      <option value="PENDING">Pendente</option>
                      <option value="BLOCKED">Bloqueado / Aguardando</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                      Operador / Responsável
                    </label>
                    <Input
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      placeholder="Ex: Carlos (Corte)"
                      className="h-8 text-xs bg-white dark:bg-zinc-950"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      disabled={updatingStep}
                      onClick={handleUpdateStep}
                      className="w-full h-8 bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-bold text-xs gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Salvar Etapa
                    </Button>
                  </div>
                </div>

                {/* Stepper visual dos 9 passos */}
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  {selectedOP.steps?.map((st) => (
                    <div
                      key={st.id}
                      className={`p-2 rounded-lg text-center border text-[10px] ${
                        st.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : st.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 font-bold shadow-xs"
                          : "bg-white text-slate-400 border-slate-200 dark:bg-zinc-950 dark:border-zinc-800"
                      }`}
                    >
                      <div className="font-bold">{st.step_order}</div>
                      <div className="truncate">{st.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo da Especificação Técnica */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cliente</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {selectedOP.customer_name}
                  </span>
                  <span className="text-slate-500 text-[11px]">{selectedOP.customer_phone || "Sem fone"}</span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Modelo do Uniforme</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {selectedOP.snapshot?.model_name || "Uniforme Customizado"}
                  </span>
                  <span className="text-slate-500 text-[11px]">Modelagem GH Padrão</span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cor Aprovada</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="h-3 w-3 rounded-full border border-slate-300 inline-block"
                      style={{ backgroundColor: selectedOP.snapshot?.color?.hex || "#000" }}
                    />
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedOP.snapshot?.color?.name || "Padrão"}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      ({selectedOP.snapshot?.color?.hex})
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Volume Total</span>
                  <span className="text-base font-black text-slate-900 dark:text-[#d4af37]">
                    {selectedOP.total_pieces} peças
                  </span>
                </div>
              </div>

              {/* Grade de Tamanhos para o Corte */}
              {selectedOP.snapshot?.size_breakdown && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    <Layers className="h-4 w-4 text-[#d4af37]" />
                    Grade de Tamanhos para Corte & Confecção:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedOP.snapshot.size_breakdown).map(([tam, qtd]) => (
                      <div
                        key={tam}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        <span className="text-slate-500 uppercase">{tam}:</span>
                        <span className="font-mono text-base text-slate-900 dark:text-[#d4af37]">{qtd}</span>
                        <span className="text-[10px] text-slate-400 font-normal">pçs</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inspetor Visual de Vistas e Arte (Frente, Costas, Mangas) */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Sparkles className="h-4 w-4 text-[#d4af37]" />
                    Visualização das Vistas da Arte & Posições
                  </div>

                  {/* Abas das Vistas */}
                  <div className="flex gap-1.5 print:hidden">
                    {(["FRONT", "BACK", "LEFT", "RIGHT"] as const).map((side) => {
                      const labels = {
                        FRONT: "Frente",
                        BACK: "Costas",
                        LEFT: "Manga Esq.",
                        RIGHT: "Manga Dir.",
                      };
                      return (
                        <button
                          key={side}
                          onClick={() => setActiveViewTab(side)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            activeViewTab === side
                              ? "bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {labels[side]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mockup Renderizado da Vista */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-6 flex items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <div
                      className="w-full max-w-[320px] aspect-square"
                      dangerouslySetInnerHTML={{
                        __html: generateViewSVG(activeViewTab, selectedOP.snapshot, 400, 400),
                      }}
                    />
                  </div>

                  {/* Elementos na Vista Ativa */}
                  <div className="md:col-span-6 space-y-3 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">
                      Elementos Técnicos da Vista (
                      {activeViewTab === "FRONT"
                        ? "Frente"
                        : activeViewTab === "BACK"
                        ? "Costas"
                        : activeViewTab === "LEFT"
                        ? "Manga Esquerda"
                        : "Manga Direita"}
                      ):
                    </div>

                    {((selectedOP.snapshot.views?.[activeViewTab] || []) as unknown as CustomizerElement[]).length === 0 ? (
                      <p className="text-slate-400 italic">
                        Nenhum elemento gráfico ou personalização nesta vista (peça lisa).
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {((selectedOP.snapshot.views?.[activeViewTab] || []) as unknown as CustomizerElement[]).map((el, i) => (
                          <div
                            key={el.id || i}
                            className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/50 space-y-1"
                          >
                            <div className="flex justify-between font-semibold text-slate-900 dark:text-zinc-200">
                              <span>
                                {el.type === "TEXT"
                                  ? `Texto: "${el.text}"`
                                  : el.type === "NUMBER"
                                  ? `Número: "${el.text || 10}"`
                                  : `Logo / Imagem`}
                              </span>
                              <span className="font-mono text-[#d4af37]">{el.zoneId || "Zona"}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex gap-3 font-mono">
                              <span>X: {Math.round(el.x || 0)}px</span>
                              <span>Y: {Math.round(el.y || 0)}px</span>
                              <span>Tam: {Math.round(el.width || 0)}x{Math.round(el.height || 0)}px</span>
                              {el.rotation ? <span>Rot: {el.rotation}°</span> : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Seção de Exportação (Arquivos para Produção) - Oculto na impressão */}
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 print:hidden space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Download className="h-4 w-4 text-[#d4af37]" />
                    Exportações Oficiais de Arquivos para a Produção
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportPNG("FRONT", "FRENTE")}
                      className="gap-1.5 text-xs"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      PNG Frente
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportPNG("BACK", "COSTAS")}
                      className="gap-1.5 text-xs"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      PNG Costas
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportPNG("LEFT", "MANGA_ESQ")}
                      className="gap-1.5 text-xs"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      PNG Manga Esq.
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportPNG("RIGHT", "MANGA_DIR")}
                      className="gap-1.5 text-xs"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      PNG Manga Dir.
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportSVG(activeViewTab, `${activeViewTab}_VETOR`)}
                      className="gap-1.5 text-xs"
                    >
                      <FileCode className="h-3.5 w-3.5 text-amber-600" />
                      SVG Vetor
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportConfig}
                      className="gap-1.5 text-xs"
                    >
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      Config JSON
                    </Button>
                  </div>
                </div>
              </div>

              {/* Roster de Nomes & Números para Estamparia */}
              {selectedOP.snapshot?.team_roster?.members &&
                selectedOP.snapshot.team_roster.members.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                      <Users className="h-4 w-4 text-[#d4af37]" />
                      Relação de Nomes &amp; Números da Equipe ({selectedOP.snapshot.team_roster.members.length} membros):
                    </div>
                    <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 dark:border-zinc-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500">
                          <tr>
                            <th className="p-2">#</th>
                            <th className="p-2">Nome na Camisa</th>
                            <th className="p-2">Número</th>
                            <th className="p-2">Tamanho</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                          {selectedOP.snapshot.team_roster.members.map((m, i) => (
                            <tr key={i}>
                              <td className="p-2 text-slate-400">{i + 1}</td>
                              <td className="p-2 font-bold text-slate-900 dark:text-white uppercase">{m.name || "—"}</td>
                              <td className="p-2 font-mono text-[#d4af37] font-bold">{m.number || "—"}</td>
                              <td className="p-2 uppercase">{m.size || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Campo de Assinatura de Qualidade para Impressão */}
              <div className="pt-8 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-3 gap-6 text-center text-xs text-slate-500">
                <div className="border-t border-slate-400 pt-2">
                  <div className="font-semibold text-slate-800 dark:text-zinc-200">Corte &amp; Separação</div>
                  <div className="text-[10px]">Data: ____/____/________</div>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <div className="font-semibold text-slate-800 dark:text-zinc-200">Estamparia &amp; Costura</div>
                  <div className="text-[10px]">Data: ____/____/________</div>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <div className="font-semibold text-slate-800 dark:text-zinc-200">Conferência &amp; Embalagem</div>
                  <div className="text-[10px]">Data: ____/____/________</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
