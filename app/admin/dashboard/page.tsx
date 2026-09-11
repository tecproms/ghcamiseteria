"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  FileText,
  Factory,
  CheckCircle2,
  TrendingUp,
  Users,
  Calendar,
  Search,
  RefreshCw,
  ExternalLink,
  Shirt,
  Package,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DashboardStats, DashboardFilters } from "@/types/dashboard";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    period: "all",
    status: "ALL",
    client: "",
    product: "",
  });

  const fetchStats = useCallback(async (currentFilters: DashboardFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.period) params.set("period", currentFilters.period);
      if (currentFilters.status && currentFilters.status !== "ALL") {
        params.set("status", currentFilters.status);
      }
      if (currentFilters.client) params.set("client", currentFilters.client);
      if (currentFilters.product) params.set("product", currentFilters.product);

      const res = await fetch(`/api/admin/dashboard/stats?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStats, filters.period, filters.status]);

  // Debounced search para inputs de texto (cliente e produto)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchStats(filters);
    }, 450);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.client, filters.product, fetchStats]);

  const handlePeriodChange = (period: DashboardFilters["period"]) => {
    setFilters((prev) => ({ ...prev, period }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return { label: "Aguardando Pagamento", cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" };
      case "PAID":
        return { label: "Pago", cls: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" };
      case "IN_PRODUCTION":
        return { label: "Em Produção", cls: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" };
      case "READY":
        return { label: "Pronto", cls: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300" };
      case "SHIPPED":
        return { label: "Enviado", cls: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300" };
      case "DELIVERED":
        return { label: "Entregue", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" };
      case "CANCELLED":
        return { label: "Cancelado", cls: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" };
      default:
        return { label: status, cls: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300" };
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Painel de Controle Operacional"
        description="Indicadores comerciais, fabris e analíticos consolidados com dados reais do banco."
      />

      {/* Barra de Filtros Rápidos */}
      <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Seletor de Período */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                <Calendar className="h-3.5 w-3.5" />
                Período:
              </span>
              {[
                { id: "today", label: "Hoje" },
                { id: "7d", label: "Últimos 7 dias" },
                { id: "30d", label: "Últimos 30 dias" },
                { id: "all", label: "Todo o Histórico" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePeriodChange(p.id as DashboardFilters["period"])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    filters.period === p.id
                      ? "bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Ação de Atualização */}
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchStats(filters)}
                disabled={loading}
                className="h-8 text-xs gap-1.5 text-slate-700 dark:text-zinc-300"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Atualizar Dados
              </Button>
            </div>
          </div>

          {/* Filtros Secundários: Status, Cliente, Produto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Filtro de Status */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Filtrar por Status:
              </label>
              <select
                value={filters.status || "ALL"}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full h-8 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 font-medium"
              >
                <option value="ALL">Todos os Status</option>
                <option value="PENDING_PAYMENT">Aguardando Pagamento</option>
                <option value="PAID">Pagos (Aguardando Produção)</option>
                <option value="IN_PRODUCTION">Em Produção Fabril</option>
                <option value="READY">Prontos</option>
                <option value="SHIPPED">Enviados</option>
                <option value="DELIVERED">Entregues</option>
                <option value="CANCELLED">Cancelados</option>
              </select>
            </div>

            {/* Busca por Cliente */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Buscar por Cliente / Nº:
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Nome, e-mail ou PED-..."
                  value={filters.client || ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, client: e.target.value }))}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>

            {/* Busca por Produto */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Filtrar por Produto / Modelo:
              </label>
              <div className="relative">
                <Shirt className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Ex: Dry Fit, Polo, Moletom..."
                  value={filters.product || ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, product: e.target.value }))}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Métricas Principais (KPIs Reais do Banco) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {/* 1. Pedidos Hoje */}
        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pedidos Hoje
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {loading ? "..." : stats?.orders_today ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Criados na data atual</p>
          </CardContent>
        </Card>

        {/* 2. Pedidos Pendentes */}
        <Card className="border-amber-200 dark:border-amber-900/40 bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Pendentes
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {loading ? "..." : stats?.orders_pending ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Aguardando pagamento</p>
          </CardContent>
        </Card>

        {/* 3. Orçamentos Pendentes */}
        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Orçamentos
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {loading ? "..." : stats?.quotes_pending ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Aguardando retorno</p>
          </CardContent>
        </Card>

        {/* 4. Em Produção */}
        <Card className="border-purple-200 dark:border-purple-900/40 bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              Em Produção
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <Factory className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
              {loading ? "..." : stats?.orders_in_production ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Na linha fabril</p>
          </CardContent>
        </Card>

        {/* 5. Pedidos Prontos */}
        <Card className="border-cyan-200 dark:border-cyan-900/40 bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
              Prontos
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
              {loading ? "..." : stats?.orders_ready ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Prontos p/ entrega/envio</p>
          </CardContent>
        </Card>

        {/* 6. Faturamento Real */}
        <Card className="border-[#d4af37]/40 bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-bold text-[#b38f26] dark:text-[#d4af37] uppercase tracking-wider">
              Faturamento
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-[#d4af37]/15 text-[#b38f26] dark:text-[#d4af37] flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-extrabold text-[#b38f26] dark:text-[#d4af37] font-mono truncate">
              R$ {loading ? "..." : (stats?.total_revenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Receita liquidada</p>
          </CardContent>
        </Card>

        {/* 7. Clientes Únicos */}
        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Clientes
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {loading ? "..." : stats?.total_clients ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Base cadastrada</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Produtos Mais Solicitados & Últimos Pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produtos Mais Solicitados (Top Products) */}
        <Card className="lg:col-span-1 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shirt className="h-4 w-4 text-[#d4af37]" />
              Produtos Mais Solicitados
            </CardTitle>
            <CardDescription className="text-xs">
              Modelos com maior volume de peças encomendadas no banco.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Carregando produtos mais vendidos...
              </div>
            ) : !stats?.top_products || stats.top_products.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhum produto registrado no período.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.top_products.map((tp, idx) => {
                  const maxQty = stats.top_products[0]?.total_quantity || 1;
                  const percent = Math.round((tp.total_quantity / maxQty) * 100);

                  return (
                    <div
                      key={tp.product_name}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/70 dark:border-zinc-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="h-5 w-5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-[10px] flex items-center justify-center font-bold">
                            #{idx + 1}
                          </span>
                          {tp.product_name}
                        </span>
                        <span className="font-mono font-bold text-[#d4af37]">
                          {tp.total_quantity} pçs
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#d4af37] h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>{tp.orders_count} pedidos</span>
                        <span className="font-mono">
                          R$ {tp.total_revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Pedidos no Período Selecionado */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-[#d4af37]" />
                Pedidos no Período Selecionado ({stats?.recent_orders.length || 0})
              </CardTitle>
              <CardDescription className="text-xs">
                Listagem em tempo real conforme os filtros aplicados acima.
              </CardDescription>
            </div>
            <Link href="/admin/pedidos">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#b38f26] dark:text-[#d4af37]">
                Ver Todos
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Carregando pedidos do banco...
              </div>
            ) : !stats?.recent_orders || stats.recent_orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum pedido encontrado com os filtros selecionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 font-semibold border-y border-slate-100 dark:border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-4">Nº Pedido</th>
                      <th className="py-2.5 px-4">Cliente</th>
                      <th className="py-2.5 px-4">Modelo / Qtd</th>
                      <th className="py-2.5 px-4">Total</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {stats.recent_orders.map((o) => {
                      const badge = getStatusBadge(o.status);
                      return (
                        <tr
                          key={o.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-zinc-950/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {o.order_number}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800 dark:text-zinc-200">
                              {o.customer_name}
                            </div>
                            {o.customer_email && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                {o.customer_email}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-700 dark:text-zinc-300 font-medium">
                              {o.model_name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {o.total_pieces} {o.total_pieces === 1 ? "peça" : "peças"}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            R$ {o.total_amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.cls}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(o.created_at).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
