"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  History,
  X,
  RefreshCw,
  Eye,
  CreditCard,
  Factory,
  CheckCheck,
  Ban,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Order, OrderStatus } from "@/types/orders";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING_PAYMENT", label: "Aguardando Pagamento" },
  { value: "PAID", label: "Pagos" },
  { value: "IN_PRODUCTION", label: "Em Produção" },
  { value: "READY", label: "Prontos" },
  { value: "SHIPPED", label: "Enviados" },
  { value: "DELIVERED", label: "Entregues" },
  { value: "CANCELLED", label: "Cancelados" },
];

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case "PENDING_PAYMENT":
      return (
        <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 font-medium">
          <Clock className="h-3 w-3" /> Aguardando Pagamento
        </Badge>
      );
    case "PAID":
      return (
        <Badge className="bg-blue-100 text-blue-900 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1.5 font-medium">
          <CreditCard className="h-3 w-3" /> Pago
        </Badge>
      );
    case "IN_PRODUCTION":
      return (
        <Badge className="bg-indigo-100 text-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 flex items-center gap-1.5 font-medium">
          <Factory className="h-3 w-3" /> Em Produção
        </Badge>
      );
    case "READY":
      return (
        <Badge className="bg-teal-100 text-teal-900 dark:bg-teal-950/70 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="h-3 w-3" /> Pronto p/ Envio
        </Badge>
      );
    case "SHIPPED":
      return (
        <Badge className="bg-sky-100 text-sky-900 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center gap-1.5 font-medium">
          <Truck className="h-3 w-3" /> Enviado
        </Badge>
      );
    case "DELIVERED":
      return (
        <Badge className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 font-medium">
          <CheckCheck className="h-3 w-3" /> Entregue
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1.5 font-medium">
          <Ban className="h-3 w-3" /> Cancelado
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status transition state
  const [trackingCode, setTrackingCode] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === "ALL"
          ? "/api/admin/pedidos"
          : `/api/admin/pedidos?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setTrackingCode(order.tracking_code || "");
    setAdminNotes(order.admin_notes || "");
    setFeedback(null);
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/pedidos/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          tracking_code: trackingCode || undefined,
          admin_notes: adminNotes || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setFeedback({
          type: "success",
          text: `Pedido atualizado com sucesso para ${data.order.status}!`,
        });
        setOrders((prev) =>
          prev.map((o) => (o.id === data.order.id ? data.order : o))
        );
      } else {
        setFeedback({
          type: "error",
          text: data.error || "Erro ao atualizar pedido.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Erro de conexão ao atualizar status.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      o.order_number.toLowerCase().includes(term) ||
      o.quote_number?.toLowerCase().includes(term) ||
      o.customer_info?.name?.toLowerCase().includes(term) ||
      o.customer_info?.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminHeader
          title="Gestão de Pedidos"
          description="Controle operacional de pedidos, status de pagamento, grade de peças e envio"
        />
        <Button
          variant="outline"
          onClick={fetchOrders}
          disabled={loading}
          className="gap-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar Lista
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === tab.value
                  ? "bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-semibold shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Nº do Pedido, Orçamento, Cliente..."
            className="pl-9 bg-white dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 animate-pulse"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-zinc-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-zinc-200">
              Nenhum pedido encontrado
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {statusFilter !== "ALL"
                ? `Não há pedidos no status "${statusFilter}".`
                : "Quando orçamentos aprovados forem convertidos, os pedidos aparecerão aqui."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const firstItem = order.items?.[0];
            const snapshot = firstItem?.snapshot_data;
            const pieces = firstItem?.quantity || 1;

            return (
              <div
                key={order.id}
                onClick={() => handleOpenOrder(order)}
                className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#d4af37] hover:shadow-md cursor-pointer dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Header: Numbers & Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                      {order.order_number}
                    </span>
                    {order.quote_number && (
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Orç: {order.quote_number}
                      </div>
                    )}
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Customer info */}
                <div className="space-y-1 mb-4 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>{order.customer_info?.name || "Cliente"}</span>
                  </div>
                  {order.customer_info?.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{order.customer_info.email}</span>
                    </div>
                  )}
                  {order.customer_info?.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{order.customer_info.phone}</span>
                    </div>
                  )}
                </div>

                {/* Item brief */}
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/60 mb-4 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {snapshot?.model_name || firstItem?.model_name || "Uniforme Customizado"}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-slate-500 dark:text-zinc-400">
                    <span>{pieces} {pieces === 1 ? "peça" : "peças"}</span>
                    {snapshot?.color?.hex && (
                      <div className="flex items-center gap-1">
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-slate-300 dark:border-zinc-700 inline-block"
                          style={{ backgroundColor: snapshot.color.hex }}
                        />
                        <span>{snapshot.color.name || snapshot.color.hex}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Price & Inspect */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">TOTAL APROVADO</span>
                    <span className="text-base font-bold text-slate-900 dark:text-[#d4af37]">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total_amount)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 text-xs text-slate-600 group-hover:text-slate-900 dark:text-zinc-300 dark:group-hover:text-white"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Detalhes
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspection Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Pedido #{selectedOrder.order_number}
                  </h2>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400">
                  Gerado a partir do Orçamento: <span className="font-semibold">{selectedOrder.quote_number || "—"}</span> •{" "}
                  {new Date(selectedOrder.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {feedback && (
                <div
                  className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300"
                  }`}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Status Actions Bar */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                  Ações de Status do Pedido
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={isSubmitting || selectedOrder.status === "PAID"}
                    onClick={() => handleUpdateStatus("PAID")}
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Confirmar Pagamento
                  </Button>

                  <Button
                    size="sm"
                    disabled={isSubmitting || selectedOrder.status === "IN_PRODUCTION"}
                    onClick={() => handleUpdateStatus("IN_PRODUCTION")}
                    className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                  >
                    <Factory className="h-3.5 w-3.5" />
                    Iniciar Produção
                  </Button>

                  <Button
                    size="sm"
                    disabled={isSubmitting || selectedOrder.status === "READY"}
                    onClick={() => handleUpdateStatus("READY")}
                    className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Marcar como Pronto
                  </Button>

                  <Button
                    size="sm"
                    disabled={isSubmitting || selectedOrder.status === "SHIPPED"}
                    onClick={() => handleUpdateStatus("SHIPPED")}
                    className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    Marcar como Enviado
                  </Button>

                  <Button
                    size="sm"
                    disabled={isSubmitting || selectedOrder.status === "DELIVERED"}
                    onClick={() => handleUpdateStatus("DELIVERED")}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Confirmar Entrega
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isSubmitting || selectedOrder.status === "CANCELLED"}
                    onClick={() => handleUpdateStatus("CANCELLED")}
                    className="gap-1.5 border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/30 text-xs"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Cancelar Pedido
                  </Button>
                </div>

                {/* Tracking & Notes input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                      Código de Rastreio dos Correios / Transportadora
                    </label>
                    <Input
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      placeholder="Ex: BR123456789BR"
                      className="text-xs h-8 bg-white dark:bg-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                      Observações Internas (Admin)
                    </label>
                    <Input
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Ex: Pagamento confirmado via PIX, lote enviado para corte"
                      className="text-xs h-8 bg-white dark:bg-zinc-950"
                    />
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Dados do Cliente
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
                    <div>
                      <span className="text-slate-400">Nome:</span>{" "}
                      <strong className="text-slate-900 dark:text-white">{selectedOrder.customer_info?.name || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">E-mail:</span> {selectedOrder.customer_info?.email || "—"}
                    </div>
                    <div>
                      <span className="text-slate-400">Telefone:</span> {selectedOrder.customer_info?.phone || "—"}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Entrega & Rastreio
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
                    <div>
                      <span className="text-slate-400">Código de Rastreio:</span>{" "}
                      <strong className="font-mono text-slate-900 dark:text-[#d4af37]">
                        {selectedOrder.tracking_code || "Ainda não informado"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Endereço de Entrega:</span>{" "}
                      {selectedOrder.customer_info?.address || "Não especificado (Retirada na Loja ou Combinar)"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items & Frozen Snapshot Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#d4af37]" />
                    Especificação Congelada da Produção (Snapshot Imutável)
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Mesmo se o cliente editar o projeto salvo, estes dados estão protegidos
                  </span>
                </div>

                {selectedOrder.items?.map((item, idx) => {
                  const snap = item.snapshot_data;
                  const grade = snap?.size_breakdown || item.size_breakdown || {};
                  const roster = snap?.team_roster?.members || [];
                  const elements = snap?.views ? Object.values(snap.views).flat() : [];

                  return (
                    <div
                      key={item.id || idx}
                      className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-white">
                            {snap?.model_name || item.model_name}
                          </h5>
                          <div className="text-xs text-slate-500">
                            Modelo: {snap?.model_name || "Padrão"} • Quantidade Total: {item.quantity} peças
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Unitário Aprovado</span>
                          <span className="font-bold text-slate-900 dark:text-[#d4af37]">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.unit_price)}
                          </span>
                        </div>
                      </div>

                      {/* Color & General specs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/60">
                          <span className="text-slate-400 block text-[10px]">COR BASE</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="h-3 w-3 rounded-full border border-slate-300"
                              style={{ backgroundColor: snap?.color?.hex || "#000" }}
                            />
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{snap?.color?.name || "Padrão"}</span>
                          </div>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/60">
                          <span className="text-slate-400 block text-[10px]">COR HEX</span>
                          <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
                            {snap?.color?.hex || "#000000"}
                          </span>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/60">
                          <span className="text-slate-400 block text-[10px]">ESTAMPA / LOGO</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">
                            {elements.length > 0 ? `${elements.length} elemento(s)` : "Liso / Sem estampa"}
                          </span>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/60">
                          <span className="text-slate-400 block text-[10px]">SUBTOTAL DO ITEM</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.subtotal)}
                          </span>
                        </div>
                      </div>

                      {/* Grade Breakdown */}
                      {Object.keys(grade).length > 0 && (
                        <div>
                          <h6 className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                            Grade de Tamanhos Solicitada:
                          </h6>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(grade).map(([tam, qtd]) => (
                              <div
                                key={tam}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                              >
                                <span className="font-bold text-slate-900 dark:text-white uppercase">{tam}:</span>
                                <span className="font-mono font-semibold text-[#d4af37]">{qtd}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Roster / Personalizations */}
                      {roster.length > 0 && (
                        <div>
                          <h6 className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                            Lista de Nomes e Números ({roster.length} jogadores/membros):
                          </h6>
                          <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-zinc-800">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500">
                                <tr>
                                  <th className="p-2">#</th>
                                  <th className="p-2">Nome</th>
                                  <th className="p-2">Número</th>
                                  <th className="p-2">Tamanho</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {roster.map((m, i) => (
                                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                                    <td className="p-2 text-slate-400">{i + 1}</td>
                                    <td className="p-2 font-medium text-slate-900 dark:text-white">{m.name || "—"}</td>
                                    <td className="p-2 font-mono text-[#d4af37] font-bold">{m.number || "—"}</td>
                                    <td className="p-2 uppercase">{m.size || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Order Financial Summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-0.5 text-xs text-slate-600 dark:text-zinc-400">
                  <div>Subtotal Original: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedOrder.items?.reduce((acc, it) => acc + (it.subtotal || 0), 0) || selectedOrder.total_amount)}</div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="text-emerald-600 font-medium">
                      Desconto Aplicado: -{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedOrder.discount_amount)}
                    </div>
                  )}
                  {selectedOrder.shipping_amount > 0 && (
                    <div>Frete: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedOrder.shipping_amount)}</div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">TOTAL DO PEDIDO</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-[#d4af37]">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

              {/* Audit History Timeline */}
              {selectedOrder.history && selectedOrder.history.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" /> Histórico de Transições
                  </h4>
                  <div className="space-y-2 border-l-2 border-slate-200 pl-4 dark:border-zinc-800">
                    {selectedOrder.history.map((h, i) => (
                      <div key={i} className="text-xs text-slate-600 dark:text-zinc-400">
                        <div className="font-semibold text-slate-900 dark:text-zinc-200">
                          {h.action} ({h.actorName || h.actor})
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(h.timestamp).toLocaleString("pt-BR")}
                        </div>
                        {h.notes && <div className="mt-0.5 italic text-slate-500">&ldquo;{h.notes}&rdquo;</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

