"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Loader2,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle,
  History,
  X,
  RefreshCw,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Quote, QuoteStatus } from "@/types/quotes";

export default function AdminOrcamentosPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Estados de Edição da Proposta Comercial
  const [editingUnitPrice, setEditingUnitPrice] = useState<number>(0);
  const [editingDiscount, setEditingDiscount] = useState<number>(0);
  const [editingNotes, setEditingNotes] = useState<string>("");
  const [editingValidUntil, setEditingValidUntil] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchQuotes = React.useCallback(async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === "ALL"
          ? "/api/admin/orcamentos"
          : `/api/admin/orcamentos?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.quotes) {
        setQuotes(data.quotes);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleOpenReview = (quote: Quote) => {
    setSelectedQuote(quote);
    const firstItem = quote.items?.[0];
    const initialUnit = firstItem?.unit_price_estimated || (quote.total_estimated / (firstItem?.quantity || 1));
    setEditingUnitPrice(Math.round(initialUnit * 100) / 100);
    setEditingDiscount(quote.discount_amount || 0);
    setEditingNotes(quote.admin_notes || "");
    setEditingValidUntil(
      quote.valid_until
        ? quote.valid_until.slice(0, 10)
        : new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10)
    );
    setFeedbackMessage(null);
  };

  const handleUpdateQuote = async (targetStatus?: QuoteStatus) => {
    if (!selectedQuote) return;
    setIsSubmitting(true);
    setFeedbackMessage(null);

    const firstItem = selectedQuote.items?.[0];
    const qty = firstItem?.quantity || 1;
    const subtotal = editingUnitPrice * qty;
    const finalTotal = Math.max(0, subtotal - editingDiscount);

    try {
      const res = await fetch(`/api/admin/orcamentos/${selectedQuote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit_price: editingUnitPrice,
          discount_amount: editingDiscount,
          final_total: finalTotal,
          admin_notes: editingNotes,
          valid_until: editingValidUntil ? new Date(editingValidUntil).toISOString() : undefined,
          status: targetStatus || (selectedQuote.status === "PENDING" ? "SENT" : selectedQuote.status),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha ao atualizar orçamento.");
      }

      setFeedbackMessage({
        type: "success",
        text: `Orçamento ${data.quote?.quote_number} atualizado com sucesso! Status: ${data.quote?.status}`,
      });

      // Atualizar lista local
      setQuotes((prev) =>
        prev.map((q) => (q.id === data.quote.id ? data.quote : q))
      );
      setSelectedQuote(data.quote);

      setTimeout(() => {
        setFeedbackMessage(null);
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar proposta";
      setFeedbackMessage({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const customer = q.customer_info?.name?.toLowerCase() || "";
    const num = q.quote_number.toLowerCase();
    const model = q.items?.[0]?.model_name?.toLowerCase() || "";
    return customer.includes(term) || num.includes(term) || model.includes(term);
  });

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400">
            <Clock className="h-3 w-3 mr-1" />
            Pendente de Análise
          </Badge>
        );
      case "SENT":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400">
            <Send className="h-3 w-3 mr-1" />
            Proposta Enviada
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aprovado pelo Cliente
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-400">
            <XCircle className="h-3 w-3 mr-1" />
            Recusado
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-zinc-400">
            Expirado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const countPending = quotes.filter((q) => q.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminHeader
          title="Gestão Comercial de Orçamentos"
          description="Receba solicitações personalizadas, ajuste preços comerciais, aplique descontos e envie propostas para aprovação dos clientes."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={fetchQuotes}
          disabled={loading}
          className="gap-2 shrink-0 h-9"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar Lista
        </Button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { id: "ALL", label: "Todos" },
            { id: "PENDING", label: `Pendentes (${countPending})` },
            { id: "SENT", label: "Enviados" },
            { id: "APPROVED", label: "Aprovados" },
            { id: "REJECTED", label: "Recusados" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente, nº ou modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Lista de Orçamentos */}
      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#d4af37] mb-2" />
          <p className="text-xs text-slate-500">Carregando cotações...</p>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3 dark:bg-zinc-800">
              <FileText className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Nenhum orçamento encontrado
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Nenhuma solicitação corresponde ao filtro selecionado. As cotações enviadas pelo configurador aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredQuotes.map((quote) => {
            const firstItem = quote.items?.[0];
            const customerName = quote.customer_info?.name || "Cliente sem identificação";

            return (
              <div
                key={quote.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-all gap-4 shadow-sm"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#d4af37]">
                      {quote.quote_number}
                    </span>
                    {getStatusBadge(quote.status)}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(quote.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 dark:text-zinc-300 font-medium">
                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {customerName}
                    </div>
                    {quote.customer_info?.phone && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {quote.customer_info.phone}
                      </div>
                    )}
                    {quote.customer_info?.email && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {quote.customer_info.email}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span>
                      Modelo: <strong>{firstItem?.model_name || "Uniforme"}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Quantidade: <strong>{firstItem?.quantity || 1} peças</strong>
                    </span>
                    {quote.notes && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-xs italic text-slate-600 dark:text-zinc-400">
                          &ldquo;{quote.notes}&rdquo;
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-zinc-800">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">
                      {quote.discount_amount > 0 ? "Total com Desconto:" : "Valor da Proposta:"}
                    </div>
                    <div className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                      R$ {quote.final_total.toFixed(2)}
                    </div>
                    {quote.discount_amount > 0 && (
                      <div className="text-[10px] text-amber-600 font-medium">
                        (Desc: R$ {quote.discount_amount.toFixed(2)})
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenReview(quote)}
                    className="h-8 px-3.5 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-semibold gap-1.5 shadow-sm"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Analisar / Precificar</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Gaveta de Análise e Precificação do Orçamento */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-[#d4af37]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Orçamento {selectedQuote.quote_number}
                    </h3>
                    {getStatusBadge(selectedQuote.status)}
                  </div>
                  <p className="text-xs text-slate-500">
                    Solicitado em{" "}
                    {new Date(selectedQuote.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mensagem de Feedback */}
            {feedbackMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                  feedbackMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                    : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
                }`}
              >
                {feedbackMessage.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                )}
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            {/* Dados do Cliente e Solicitação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/70 dark:border-zinc-800 space-y-2 text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Identificação do Cliente
                </span>
                <div className="space-y-1 text-slate-600 dark:text-zinc-400">
                  <div>
                    Nome:{" "}
                    <strong className="text-slate-900 dark:text-zinc-200">
                      {selectedQuote.customer_info?.name || "Não informado"}
                    </strong>
                  </div>
                  <div>
                    Telefone:{" "}
                    <strong className="text-slate-900 dark:text-zinc-200">
                      {selectedQuote.customer_info?.phone || "Não informado"}
                    </strong>
                  </div>
                  <div>
                    E-mail:{" "}
                    <strong className="text-slate-900 dark:text-zinc-200">
                      {selectedQuote.customer_info?.email || "Não informado"}
                    </strong>
                  </div>
                </div>

                {selectedQuote.notes && (
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Observações enviadas pelo cliente:
                    </span>
                    <p className="p-2 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 italic text-slate-700 dark:text-zinc-300">
                      &ldquo;{selectedQuote.notes}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Detalhes do Produto / Peça */}
              {selectedQuote.items?.[0] && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/70 dark:border-zinc-800 space-y-2 text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Especificações Técnicas
                  </span>
                  <div className="space-y-1 text-slate-600 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span>Modelo:</span>
                      <strong className="text-slate-900 dark:text-white">
                        {selectedQuote.items[0].model_name || "Uniforme Personalizado"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantidade de Peças:</span>
                      <strong className="text-slate-900 dark:text-white">
                        {selectedQuote.items[0].quantity} un.
                      </strong>
                    </div>
                    {selectedQuote.items[0].customization_details?.color && (
                      <div className="flex justify-between items-center">
                        <span>Cor do Tecido:</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block h-3 w-3 rounded-full border border-slate-300"
                            style={{
                              backgroundColor:
                                selectedQuote.items[0].customization_details.color.hex,
                            }}
                          />
                          <strong className="text-slate-900 dark:text-white">
                            {selectedQuote.items[0].customization_details.color.name}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Grade de Tamanhos */}
                  {selectedQuote.items[0].size_breakdown &&
                    Object.keys(selectedQuote.items[0].size_breakdown).length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                        <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                          Grade de Tamanhos:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(selectedQuote.items[0].size_breakdown).map(
                            ([size, qty]) => (
                              <span
                                key={size}
                                className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-mono"
                              >
                                {size}: <strong>{qty}</strong>
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Formulário de Análise e Precificação Comercial pelo Administrador */}
            <div className="p-4 rounded-xl border-2 border-[#d4af37]/40 bg-amber-500/5 space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#d4af37]" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Precificação Comercial & Condições de Venda (Admin)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Preço Unitário (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingUnitPrice}
                    onChange={(e) => setEditingUnitPrice(parseFloat(e.target.value) || 0)}
                    className="h-9 text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500">
                    Estimado prévio: R${" "}
                    {(
                      selectedQuote.total_estimated /
                      (selectedQuote.items?.[0]?.quantity || 1)
                    ).toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Desconto Especial (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingDiscount}
                    onChange={(e) => setEditingDiscount(parseFloat(e.target.value) || 0)}
                    className="h-9 text-xs font-mono text-emerald-600 font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Abatimento direto no total</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Validade da Proposta
                  </label>
                  <Input
                    type="date"
                    value={editingValidUntil}
                    onChange={(e) => setEditingValidUntil(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <span className="text-[10px] text-slate-500">Expira após esta data</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Observações Comerciais para o Cliente (prazos de produção, tecidos, pagamento)
                </label>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Ex: Proposta com desconto para pagamento à vista. Prazo de confecção de 10 dias úteis após confirmação..."
                  rows={2}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>

              {/* Totalizador em Tempo Real */}
              <div className="p-3 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-slate-600 dark:text-zinc-400">
                  Subtotal:{" "}
                  <span className="font-mono font-medium">
                    R$ {(editingUnitPrice * (selectedQuote.items?.[0]?.quantity || 1)).toFixed(2)}
                  </span>
                  {editingDiscount > 0 && (
                    <span className="text-emerald-600 ml-2">
                      - Desconto: R$ {editingDiscount.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">VALOR FINAL DA PROPOSTA:</span>
                  <span className="text-base font-extrabold font-mono text-[#d4af37]">
                    R${" "}
                    {Math.max(
                      0,
                      editingUnitPrice * (selectedQuote.items?.[0]?.quantity || 1) - editingDiscount
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Linha do Tempo de Auditoria / Histórico */}
            {selectedQuote.history && selectedQuote.history.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <History className="h-4 w-4 text-[#d4af37]" />
                  <span>Histórico de Alterações Auditável</span>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedQuote.history.map((h, i) => (
                    <div
                      key={h.id || i}
                      className="p-2 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/60 text-[11px] space-y-0.5"
                    >
                      <div className="flex justify-between items-center text-slate-500">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                          {h.actorName || h.actor}: {h.action}
                        </span>
                        <span>{new Date(h.timestamp).toLocaleString("pt-BR")}</span>
                      </div>
                      {h.previousTotal !== undefined && h.newTotal !== undefined && (
                        <div className="text-slate-500">
                          Valor: R$ {h.previousTotal?.toFixed(2) || "0.00"} → R${" "}
                          {h.newTotal?.toFixed(2)}
                        </div>
                      )}
                      {h.notes && (
                        <div className="text-slate-600 dark:text-zinc-400 italic">
                          &ldquo;{h.notes}&rdquo;
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de Ação do Administrador */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateQuote("REJECTED")}
                  disabled={isSubmitting}
                  className="h-8 px-3 text-xs text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Recusar Orçamento
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateQuote("APPROVED")}
                  disabled={isSubmitting}
                  className="h-8 px-3 text-xs text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Aprovar Diretamente
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedQuote(null)}
                  className="h-8 px-3 text-xs"
                >
                  Fechar
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleUpdateQuote("SENT")}
                  disabled={isSubmitting}
                  className="h-8 px-4 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-bold gap-1.5 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Salvar e Enviar Proposta ao Cliente</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
