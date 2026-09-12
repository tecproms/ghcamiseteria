"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Shirt,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Send,
  Loader2,
  LogIn,
  Eye,
  Plus,
  History,
  X,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Quote, QuoteStatus } from "@/types/quotes";

export default function MeusOrcamentosPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [quoteToReject, setQuoteToReject] = useState<Quote | null>(null);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    setIsUnauthorized(false);
    try {
      const res = await fetch("/api/orcamentos");
      const data = await res.json();

      if (res.status === 401) {
        setIsUnauthorized(true);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha ao carregar seus orçamentos.");
      }

      setQuotes(data.quotes || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar orçamentos";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // Cliente responde à proposta (Aprovar)
  const handleApprove = async (quoteId: string) => {
    if (!confirm("Deseja aprovar esta proposta comercial?")) return;
    setRespondingId(quoteId);
    try {
      const res = await fetch(`/api/orcamentos/${quoteId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Falha ao aprovar orçamento.");
        return;
      }
      await fetchQuotes();
      if (selectedQuote?.id === quoteId) {
        setSelectedQuote(data.quote);
      }
    } catch {
      alert("Erro ao comunicar com o servidor.");
    } finally {
      setRespondingId(null);
    }
  };

  // Abrir modal de recusa
  const handleOpenReject = (quote: Quote) => {
    setQuoteToReject(quote);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  // Confirmar recusa
  const handleConfirmReject = async () => {
    if (!quoteToReject) return;
    setRespondingId(quoteToReject.id);
    try {
      const res = await fetch(`/api/orcamentos/${quoteToReject.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          reason: rejectReason.trim() || "Proposta recusada pelo cliente.",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Falha ao recusar orçamento.");
        return;
      }
      setIsRejectModalOpen(false);
      setQuoteToReject(null);
      await fetchQuotes();
      if (selectedQuote?.id === quoteToReject.id) {
        setSelectedQuote(data.quote);
      }
    } catch {
      alert("Erro ao comunicar com o servidor.");
    } finally {
      setRespondingId(null);
    }
  };

  // Transformar orçamento aprovado em pedido oficial
  const handleConvertToOrder = async (quoteId: string) => {
    setRespondingId(quoteId);
    try {
      const res = await fetch("/api/pedidos/from-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote_id: quoteId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Falha ao gerar pedido.");
        return;
      }
      window.location.href = `/meus-pedidos?pedido=${data.order.order_number}`;
    } catch {
      alert("Erro ao comunicar com o servidor para gerar pedido.");
    } finally {
      setRespondingId(null);
    }
  };

  // Rótulo e cor do status
  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Aguardando Análise",
          classes: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60",
          icon: Clock,
        };
      case "SENT":
        return {
          label: "Proposta Enviada",
          classes: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60",
          icon: Send,
        };
      case "APPROVED":
        return {
          label: "Orçamento Aprovado",
          classes: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
          icon: CheckCircle2,
        };
      case "REJECTED":
        return {
          label: "Recusado",
          classes: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60",
          icon: XCircle,
        };
      case "EXPIRED":
        return {
          label: "Expirado",
          classes: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
          icon: AlertCircle,
        };
      case "DRAFT":
      default:
        return {
          label: "Rascunho",
          classes: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-900 dark:text-zinc-400",
          icon: Clock,
        };
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 px-3 py-0.5 text-xs font-medium mb-2">
            <FileText className="h-3.5 w-3.5 text-[#d4af37]" />
            Cotações & Propostas Comerciais
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Meus Orçamentos
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            Acompanhe a análise da equipe GH Camiseteria, revise valores propostos e aprove ou recuse orçamentos.
          </p>
        </div>

        <Link href="/uniformes">
          <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-semibold shadow-sm">
            <Plus className="h-4 w-4" />
            Ver Catálogo
          </Button>
        </Link>
      </div>

      {/* Estado: Carregando */}
      {loading && (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Carregando seus orçamentos...
          </p>
        </div>
      )}

      {/* Estado: Não Autenticado */}
      {!loading && isUnauthorized && (
        <Card className="border-dashed border-2 dark:border-zinc-800">
          <CardContent className="py-16 text-center max-w-md mx-auto space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#d4af37]">
              <LogIn className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Acesse sua conta para ver seus orçamentos
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Você precisa estar autenticado para acompanhar a análise de orçamentos e aprovar propostas de preços.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link href="/login?redirectTo=/meus-orcamentos">
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950">
                  <LogIn className="h-4 w-4" />
                  Fazer Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado: Erro */}
      {!loading && error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-center justify-between text-xs text-red-800 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={fetchQuotes} className="h-7 text-xs">
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Estado: Vazio */}
      {!loading && !isUnauthorized && !error && quotes.length === 0 && (
        <Card className="border-dashed border-2 dark:border-zinc-800">
          <CardContent className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Nenhuma solicitação de orçamento encontrada
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Consulte os modelos em nosso catálogo de uniformes e solicite uma proposta oficial da fábrica.
            </p>
            <div className="pt-2">
              <Link href="/uniformes">
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-semibold">
                  <Shirt className="h-4 w-4" />
                  Ver Catálogo de Uniformes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade de Orçamentos */}
      {!loading && !isUnauthorized && !error && quotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((quote) => {
            const badge = getStatusBadge(quote.status);
            const BadgeIcon = badge.icon;
            const item = quote.items[0];
            const isOperating = respondingId === quote.id;
            const createdDate = new Date(quote.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={quote.id}
                className="flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Cabeçalho do Card */}
                <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {quote.quote_number}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {createdDate}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.classes}`}
                  >
                    <BadgeIcon className="h-3 w-3" />
                    {badge.label}
                  </span>
                </div>

                {/* Conteúdo */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {item?.model_name || "Uniforme Personalizado"}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Quantidade: <strong>{item?.quantity || 1} peças</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Valor Proposto</div>
                        <div className="text-base font-extrabold text-[#d4af37] font-mono">
                          R$ {quote.final_total.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Resumo da Grade de Tamanhos */}
                    {item?.size_breakdown && Object.keys(item.size_breakdown).length > 0 && (
                      <div className="pt-2">
                        <div className="text-[10px] font-semibold text-slate-400 mb-1">Grade do Pedido:</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item.size_breakdown).map(([size, count]) => (
                            <span
                              key={size}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-medium text-slate-700 dark:text-zinc-300 font-mono"
                            >
                              {size}: <strong>{count}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Observações do Admin (se houver) */}
                    {quote.admin_notes && (
                      <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300">
                        <span className="font-semibold block text-[11px] text-blue-700 dark:text-blue-400">Nota da GH Camiseteria:</span>
                        {quote.admin_notes}
                      </div>
                    )}
                  </div>

                  {/* Ações conforme o Status */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                    {/* Se o status for SENT: Cliente pode Aprovar ou Recusar */}
                    {quote.status === "SENT" && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(quote.id)}
                          disabled={isOperating}
                          className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Aprovar Valor
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReject(quote)}
                          disabled={isOperating}
                          className="h-9 text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40 font-medium gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Recusar
                        </Button>
                      </div>
                    )}

                    {/* Se o status for APPROVED: Cliente pode Avançar para Pedido Oficial */}
                    {quote.status === "APPROVED" && (
                      <Button
                        size="sm"
                        onClick={() => handleConvertToOrder(quote.id)}
                        disabled={respondingId === quote.id}
                        className="w-full h-9 text-xs bg-[#d4af37] hover:bg-[#c59b27] text-zinc-950 font-bold gap-1.5 shadow-sm"
                      >
                        {respondingId === quote.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-3.5 w-3.5" />
                        )}
                        <span>Avançar para Pedido Oficial</span>
                      </Button>
                    )}

                    {/* Botão para abrir detalhes completos */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuote(quote)}
                      className="w-full h-8 text-xs text-slate-700 dark:text-zinc-300 gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Visualizar Detalhes & Histórico
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes Completos do Orçamento */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-[#d4af37]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Orçamento {selectedQuote.quote_number}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Status Atual: <strong>{selectedQuote.status}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Informações do Pedido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800 space-y-1.5">
                <div className="font-semibold text-slate-800 dark:text-zinc-200">Detalhes do Uniforme:</div>
                <div>Modelo: <strong>{selectedQuote.items[0]?.model_name || "Uniforme"}</strong></div>
                <div>Quantidade: <strong>{selectedQuote.items[0]?.quantity} unidades</strong></div>
                {selectedQuote.notes && (
                  <div className="pt-1 text-slate-500">
                    Sua observação: <em>&ldquo;{selectedQuote.notes}&rdquo;</em>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800 space-y-1.5">
                <div className="font-semibold text-slate-800 dark:text-zinc-200">Valores Comerciais:</div>
                <div className="flex justify-between">
                  <span>Valor Estimado Inicial:</span>
                  <span className="font-mono">R$ {selectedQuote.total_estimated.toFixed(2)}</span>
                </div>
                {selectedQuote.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Desconto Concedido:</span>
                    <span className="font-mono">-R$ {selectedQuote.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t">
                  <span>Valor Final da Proposta:</span>
                  <span className="font-mono text-[#d4af37]">R$ {selectedQuote.final_total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Grade de Tamanhos */}
            {selectedQuote.items[0]?.size_breakdown && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800 space-y-2">
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Grade de Tamanhos:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedQuote.items[0].size_breakdown).map(([sz, qty]) => (
                    <div
                      key={sz}
                      className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono"
                    >
                      <span className="text-slate-400">{sz}:</span> <strong>{qty}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linha do Tempo / Histórico de Alterações Importantes */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <History className="h-4 w-4 text-[#d4af37]" />
                <span>Histórico de Alterações Auditável:</span>
              </div>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {selectedQuote.history.map((hist, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {hist.action === "CREATED"
                          ? "Orçamento Solicitado"
                          : hist.action === "SENT_TO_CUSTOMER"
                          ? "Proposta Enviada pela GH"
                          : hist.action === "APPROVED_BY_CUSTOMER"
                          ? "Proposta Aprovada pelo Cliente"
                          : hist.action === "REJECTED_BY_CUSTOMER"
                          ? "Proposta Recusada pelo Cliente"
                          : hist.action}
                      </span>
                      <span className="text-slate-400">
                        {new Date(hist.timestamp).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    {hist.notes && <p className="text-slate-600 dark:text-zinc-400 text-[11px]">{hist.notes}</p>}
                    {hist.newTotal !== undefined && hist.newTotal !== null && (
                      <div className="text-[10px] text-[#d4af37] font-mono">
                        Valor registrado: R$ {hist.newTotal.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ações no Modal */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              {selectedQuote.status === "SENT" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenReject(selectedQuote)}
                    className="h-8 px-3 text-xs text-red-600 border-red-200"
                  >
                    Recusar Proposta
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(selectedQuote.id)}
                    className="h-8 px-4 text-xs bg-emerald-600 text-white font-semibold"
                  >
                    Aprovar Proposta
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedQuote(null)}
                className="h-8 px-3 text-xs"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Recusa com Motivo */}
      {isRejectModalOpen && quoteToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Recusar Proposta {quoteToReject.quote_number}
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Motivo da Recusa (opcional):
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: Valor acima do orçamento previsto, prazo de entrega longo, etc."
                className="w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2.5 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRejectModalOpen(false)}
                className="h-8 px-3 text-xs"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReject}
                className="h-8 px-4 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Confirmar Recusa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
