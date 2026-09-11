"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PackageSearch,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  XCircle,
  X,
  Eye,
  Loader2,
  LogIn,
  Shirt,
  ShoppingBag,
  History,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import type { Order, OrderStatus } from "@/types/orders";

export default function MeusPedidosPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pedidos");
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Verificar se há parâmetro ?pedido= na URL
  useEffect(() => {
    if (typeof window !== "undefined" && orders.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const pedidoCode = params.get("pedido");
      if (pedidoCode) {
        const found = orders.find(
          (o) => o.order_number.toLowerCase() === pedidoCode.toLowerCase()
        );
        if (found) {
          setSelectedOrder(found);
        }
      }
    }
  }, [orders]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return {
          label: "Aguardando Pagamento",
          classes: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300",
          icon: Clock,
        };
      case "PAID":
        return {
          label: "Pagamento Confirmado",
          classes: "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300",
          icon: CheckCircle2,
        };
      case "IN_PRODUCTION":
        return {
          label: "Em Produção",
          classes: "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300",
          icon: Shirt,
        };
      case "READY":
        return {
          label: "Pronto para Envio",
          classes: "bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300",
          icon: PackageSearch,
        };
      case "SHIPPED":
        return {
          label: "Enviado / Em Trânsito",
          classes: "bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300",
          icon: Truck,
        };
      case "DELIVERED":
        return {
          label: "Entregue",
          classes: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300",
          icon: CheckCircle2,
        };
      case "CANCELLED":
        return {
          label: "Cancelado",
          classes: "bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          classes: "bg-slate-100 text-slate-700 border-slate-300",
          icon: Clock,
        };
    }
  };

  const getStepProgress = (status: OrderStatus) => {
    const steps = [
      { id: "PENDING_PAYMENT", label: "Aguardando Pagamento" },
      { id: "PAID", label: "Pago" },
      { id: "IN_PRODUCTION", label: "Produção" },
      { id: "READY", label: "Pronto" },
      { id: "SHIPPED", label: "Enviado" },
      { id: "DELIVERED", label: "Entregue" },
    ];

    const currentIdx = steps.findIndex((s) => s.id === status);
    return { steps, currentIdx };
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const num = o.order_number.toLowerCase();
    const quoteNum = o.quote_number?.toLowerCase() || "";
    const model = o.items?.[0]?.model_name?.toLowerCase() || "";
    return num.includes(term) || quoteNum.includes(term) || model.includes(term);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Meus Pedidos
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            Acompanhe o status do pagamento, produção e rastreamento dos seus uniformes.
          </p>
        </div>

        <Link href="/meus-orcamentos">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs border-slate-300 dark:border-zinc-700"
          >
            <ShoppingBag className="h-4 w-4 text-[#d4af37]" />
            Ver Meus Orçamentos
          </Button>
        </Link>
      </div>

      {/* Não autenticado */}
      {!authLoading && !isAuthenticated && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardContent className="p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-amber-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Acesso à Lista de Pedidos
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
              Para visualizar o histórico completo dos seus pedidos e o status de confecção, faça login na sua conta.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-bold">
                  <LogIn className="h-4 w-4" />
                  Entrar na Conta
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barra de Filtros e Busca */}
      {isAuthenticated && (
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "ALL", label: "Todos" },
              { id: "PENDING_PAYMENT", label: "Aguardando Pagamento" },
              { id: "PAID", label: "Pagos" },
              { id: "IN_PRODUCTION", label: "Em Produção" },
              { id: "SHIPPED", label: "Enviados" },
              { id: "DELIVERED", label: "Entregues" },
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
              placeholder="Buscar por nº do pedido ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>
      )}

      {/* Lista de Pedidos */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#d4af37] mb-2" />
          <p className="text-xs text-slate-500">Carregando seus pedidos...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-dashed border-2 dark:border-zinc-800">
          <CardContent className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600">
              <PackageSearch className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Nenhum pedido encontrado
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Quando você aprovar uma cotação em <strong>Meus Orçamentos</strong>, ela poderá ser convertida em um pedido oficial e aparecerá aqui.
            </p>
            <div className="pt-2">
              <Link href="/meus-orcamentos">
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-bold">
                  <ShoppingBag className="h-4 w-4" />
                  Ver Orçamentos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const firstItem = order.items?.[0];
            const badge = getStatusBadge(order.status);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={order.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-all overflow-hidden shadow-sm hover:shadow-md"
              >
                {/* Topo do Card */}
                <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs font-bold text-[#d4af37]">
                      {order.order_number}
                    </span>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </div>
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
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {firstItem?.model_name || "Uniforme Personalizado"}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Quantidade: <strong>{firstItem?.quantity || 1} peças</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Valor Total</div>
                        <div className="text-base font-extrabold text-[#d4af37] font-mono">
                          R$ {order.total_amount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Vínculo com orçamento */}
                    {order.quote_number && (
                      <div className="text-[11px] text-slate-500">
                        Cotação de Origem: <strong className="font-mono">{order.quote_number}</strong>
                      </div>
                    )}

                    {/* Grade de Tamanhos */}
                    {firstItem?.size_breakdown &&
                      Object.keys(firstItem.size_breakdown).length > 0 && (
                        <div className="pt-1">
                          <div className="text-[10px] font-semibold text-slate-400 mb-1">
                            Distribuição de Tamanhos:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(firstItem.size_breakdown).map(([size, count]) => (
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

                    {/* Rastreamento se houver */}
                    {order.tracking_code && (
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs flex items-center justify-between text-indigo-900 dark:text-indigo-300">
                        <span className="flex items-center gap-1 font-semibold">
                          <Truck className="h-3.5 w-3.5" />
                          Rastreio:
                        </span>
                        <span className="font-mono font-bold">{order.tracking_code}</span>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                    {order.status === "PENDING_PAYMENT" && (
                      <Link href={`/pagamento/${order.id}`} className="block w-full">
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-bold gap-1.5 shadow-sm"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Pagar Pedido (Pix / Cartão)
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="w-full h-8 text-xs text-slate-700 dark:text-zinc-300 gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Visualizar Pedido & Snapshot
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes Completos do Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Topo do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37]">
                  <PackageSearch className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Pedido {selectedOrder.order_number}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gerado em {new Date(selectedOrder.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stepper de Progresso do Pedido */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                Linha de Progresso:
              </div>
              <div className="flex items-center justify-between text-[11px] overflow-x-auto gap-2">
                {getStepProgress(selectedOrder.status).steps.map((st, i) => {
                  const currentIdx = getStepProgress(selectedOrder.status).currentIdx;
                  const isCompleted = currentIdx >= i && selectedOrder.status !== "CANCELLED";
                  const isCurrent = currentIdx === i && selectedOrder.status !== "CANCELLED";

                  return (
                    <div key={st.id} className="flex flex-col items-center min-w-[70px] text-center">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                          isCurrent
                            ? "bg-[#d4af37] text-zinc-950 ring-2 ring-[#d4af37]/50"
                            : isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 dark:bg-zinc-800 text-slate-400"
                        }`}
                      >
                        {isCompleted ? "✓" : i + 1}
                      </div>
                      <span
                        className={`text-[10px] ${
                          isCurrent
                            ? "font-bold text-[#d4af37]"
                            : isCompleted
                            ? "font-medium text-slate-900 dark:text-zinc-200"
                            : "text-slate-400"
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Especificações Preservadas no Snapshot */}
            {selectedOrder.items?.[0] && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Especificações Congeladas do Pedido (Snapshot Inviolável)
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Modelo:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {selectedOrder.items[0].model_name}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantidade Total:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {selectedOrder.items[0].quantity} unidades
                    </strong>
                  </div>
                  {selectedOrder.items[0].color && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Cor do Tecido:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-3 w-3 rounded-full border border-slate-300"
                          style={{ backgroundColor: selectedOrder.items[0].color.hex }}
                        />
                        <strong className="text-slate-900 dark:text-white">
                          {selectedOrder.items[0].color.name}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Grade de Tamanhos */}
                  {selectedOrder.items[0].size_breakdown && (
                    <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-500 block mb-1">Grade por Tamanho:</span>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(selectedOrder.items[0].size_breakdown).map(([sz, count]) => (
                          <span
                            key={sz}
                            className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 font-mono text-[11px]"
                          >
                            {sz}: <strong>{count}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Integrantes da Equipe */}
                  {selectedOrder.items[0].snapshot_data?.team_roster?.enabled &&
                    selectedOrder.items[0].snapshot_data.team_roster.members?.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-1">
                        <span className="text-slate-500 font-semibold block">
                          Integrantes da Equipe ({selectedOrder.items[0].snapshot_data.team_roster.members.length}):
                        </span>
                        <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                          {selectedOrder.items[0].snapshot_data.team_roster.members.map((m, idx) => (
                            <div
                              key={m.id || idx}
                              className="flex justify-between p-1.5 rounded bg-white dark:bg-zinc-900 text-[11px]"
                            >
                              <span>
                                <strong>{m.name || "Sem nome"}</strong>{" "}
                                {m.number ? `(#${m.number})` : ""}
                              </span>
                              <span className="font-mono text-slate-500">
                                Tam: {m.size} {m.sector ? `• ${m.sector}` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Valores Comerciais Aprovados */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Preço Unitário Aprovado:</span>
                <span className="font-mono font-medium">
                  R$ {selectedOrder.items?.[0]?.unit_price.toFixed(2) || "0.00"}
                </span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Desconto Aplicado:</span>
                  <span className="font-mono">-R$ {selectedOrder.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-1 border-t border-emerald-200 dark:border-emerald-900/40">
                <span>TOTAL DO PEDIDO:</span>
                <span className="font-mono text-[#d4af37]">R$ {selectedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Histórico do Pedido */}
            {selectedOrder.history && selectedOrder.history.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <History className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Histórico de Atualizações</span>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                  {selectedOrder.history.map((h, i) => (
                    <div
                      key={h.id || i}
                      className="p-1.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800/50 text-[11px]"
                    >
                      <div className="flex justify-between text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-zinc-300">{h.action}</span>
                        <span>{new Date(h.timestamp).toLocaleString("pt-BR")}</span>
                      </div>
                      {h.notes && <div className="text-slate-600 dark:text-zinc-400 italic">&ldquo;{h.notes}&rdquo;</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                {selectedOrder.status === "PENDING_PAYMENT" && (
                  <Link href={`/pagamento/${selectedOrder.id}`}>
                    <Button
                      size="sm"
                      className="h-8 px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Pagar Pedido Agora
                    </Button>
                  </Link>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="h-8 px-4 text-xs bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-semibold"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

