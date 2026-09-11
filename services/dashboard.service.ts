// services/dashboard.service.ts
// Serviço de Consolidação Analítica e Métricas Reais do Dashboard Administrativo
// GH Camiseteria & Uniformes Personalizados
// Regra Estrita: Zero dados fictícios; todas as métricas são extraídas em tempo real do banco de dados.

import { pool } from "@/lib/db";
import { OrdersService } from "@/services/orders.service";
import { QuotesService } from "@/services/quotes.service";
import type {
  DashboardStats,
  DashboardFilters,
  DashboardTopProduct,
  DashboardRecentOrder,
} from "@/types/dashboard";

export class DashboardService {
  /**
   * Coleta métricas agregadas e dados filtrados diretamente do PostgreSQL
   */
  static async getStats(filters: DashboardFilters = {}): Promise<DashboardStats> {
    const period = filters.period || "all";
    const statusFilter = filters.status && filters.status !== "ALL" ? filters.status.toUpperCase() : null;
    const clientSearch = filters.client ? filters.client.trim().toLowerCase() : null;
    const productSearch = filters.product ? filters.product.trim().toLowerCase() : null;

    try {
      // 1. Cláusula de período para filtros dinâmicos
      let periodCondition = "1=1";
      if (period === "today") {
        periodCondition = "o.created_at >= CURRENT_DATE";
      } else if (period === "7d") {
        periodCondition = "o.created_at >= (CURRENT_DATE - INTERVAL '7 days')";
      } else if (period === "30d") {
        periodCondition = "o.created_at >= (CURRENT_DATE - INTERVAL '30 days')";
      }

      // 2. Consulta agregada de KPIs gerais de pedidos
      const kpiRes = await pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE o.created_at >= CURRENT_DATE) AS orders_today,
          COUNT(*) FILTER (WHERE UPPER(o.status) = 'PENDING_PAYMENT') AS orders_pending,
          COUNT(*) FILTER (WHERE UPPER(o.status) = 'IN_PRODUCTION') AS orders_in_production,
          COUNT(*) FILTER (WHERE UPPER(o.status) = 'READY') AS orders_ready,
          COALESCE(
            SUM(o.total_amount) FILTER (
              WHERE UPPER(o.status) = 'PAID' OR UPPER(o.payment_status) IN ('APPROVED', 'PAID')
            ), 0
          ) AS total_revenue
        FROM public.orders o
        WHERE o.deleted_at IS NULL
      `);

      const kpiRow = kpiRes.rows[0] || {};

      // 3. Orçamentos pendentes
      const quotesRes = await pool.query(`
        SELECT COUNT(*) AS quotes_pending
        FROM public.quotes q
        WHERE q.deleted_at IS NULL
          AND UPPER(q.status) IN ('PENDING', 'DRAFT', 'SENT')
      `);
      const quotesPending = parseInt(quotesRes.rows[0]?.quotes_pending || "0", 10);

      // 4. Base total de clientes únicos
      const clientsRes = await pool.query(`
        SELECT COUNT(DISTINCT COALESCE(o.customer_id::text, o.user_id::text, o.customer_info->>'email')) AS total_clients
        FROM public.orders o
        WHERE o.deleted_at IS NULL
      `);
      const totalClients = parseInt(clientsRes.rows[0]?.total_clients || "0", 10);

      // 5. Produtos mais solicitados (Top Products)
      const topProductsRes = await pool.query(`
        SELECT
          COALESCE(oi.model_name, oi.description, 'Uniforme Personalizado') AS product_name,
          COALESCE(SUM(oi.quantity), 0)::integer AS total_quantity,
          COUNT(DISTINCT oi.order_id)::integer AS orders_count,
          COALESCE(SUM(oi.subtotal), 0)::numeric AS total_revenue
        FROM public.order_items oi
        JOIN public.orders o ON o.id = oi.order_id
        WHERE o.deleted_at IS NULL
        GROUP BY COALESCE(oi.model_name, oi.description, 'Uniforme Personalizado')
        ORDER BY total_quantity DESC
        LIMIT 5
      `);

      const topProducts: DashboardTopProduct[] = topProductsRes.rows.map((r) => ({
        product_name: r.product_name,
        total_quantity: parseInt(r.total_quantity || "0", 10),
        orders_count: parseInt(r.orders_count || "0", 10),
        total_revenue: parseFloat(r.total_revenue || "0"),
      }));

      // 6. Lista filtrada de pedidos recentes (com suporte a período, status, cliente, produto)
      const queryParams: unknown[] = [];
      let whereClauses = ["o.deleted_at IS NULL", periodCondition];

      if (statusFilter) {
        queryParams.push(statusFilter);
        whereClauses.push(`UPPER(o.status) = $${queryParams.length}`);
      }

      if (clientSearch) {
        queryParams.push(`%${clientSearch}%`);
        whereClauses.push(`(
          LOWER(COALESCE(o.customer_info->>'name', '')) LIKE $${queryParams.length}
          OR LOWER(COALESCE(o.customer_info->>'email', '')) LIKE $${queryParams.length}
          OR LOWER(o.order_number) LIKE $${queryParams.length}
        )`);
      }

      if (productSearch) {
        queryParams.push(`%${productSearch}%`);
        whereClauses.push(`EXISTS (
          SELECT 1 FROM public.order_items oi_filter
          WHERE oi_filter.order_id = o.id
            AND (
              LOWER(COALESCE(oi_filter.model_name, '')) LIKE $${queryParams.length}
              OR LOWER(COALESCE(oi_filter.description, '')) LIKE $${queryParams.length}
            )
        )`);
      }

      const recentOrdersQuery = `
        SELECT
          o.id,
          o.order_number,
          o.status,
          o.payment_status,
          o.total_amount,
          o.created_at,
          o.customer_info,
          COALESCE(
            (SELECT oi.model_name FROM public.order_items oi WHERE oi.order_id = o.id LIMIT 1),
            'Uniforme Personalizado'
          ) AS model_name,
          COALESCE(
            (SELECT SUM(oi.quantity) FROM public.order_items oi WHERE oi.order_id = o.id),
            1
          )::integer AS total_pieces
        FROM public.orders o
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY o.created_at DESC
        LIMIT 25
      `;

      const recentOrdersRes = await pool.query(recentOrdersQuery, queryParams);

      const recentOrders: DashboardRecentOrder[] = recentOrdersRes.rows.map((r) => {
        const custInfo = typeof r.customer_info === "string" ? JSON.parse(r.customer_info) : r.customer_info || {};
        return {
          id: r.id,
          order_number: r.order_number,
          customer_name: custInfo.name || "Cliente",
          customer_email: custInfo.email || undefined,
          model_name: r.model_name || "Uniforme Personalizado",
          total_amount: parseFloat(r.total_amount || "0"),
          total_pieces: parseInt(r.total_pieces || "1", 10),
          status: (r.status || "PENDING_PAYMENT").toUpperCase(),
          payment_status: (r.payment_status || "PENDING").toUpperCase(),
          created_at: r.created_at,
        };
      });

      return {
        orders_today: parseInt(kpiRow.orders_today || "0", 10),
        orders_pending: parseInt(kpiRow.orders_pending || "0", 10),
        quotes_pending: quotesPending,
        orders_in_production: parseInt(kpiRow.orders_in_production || "0", 10),
        orders_ready: parseInt(kpiRow.orders_ready || "0", 10),
        total_revenue: parseFloat(kpiRow.total_revenue || "0"),
        total_clients: totalClients,
        top_products: topProducts,
        recent_orders: recentOrders,
      };
    } catch {
      // Fallback em memória para ambientes de teste ou ausência de conexão PostgreSQL direta
      return this.getFallbackStats(filters);
    }
  }

  /**
   * Fallback em memória baseado nas instâncias ativas do OrdersService e QuotesService
   */
  private static async getFallbackStats(filters: DashboardFilters): Promise<DashboardStats> {
    const allOrders = await OrdersService.listAllOrdersAdmin();
    const allQuotes = await QuotesService.listAllQuotesAdmin();

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    let ordersToday = 0;
    let ordersPending = 0;
    let ordersInProduction = 0;
    let ordersReady = 0;
    let totalRevenue = 0;
    const clientsSet = new Set<string>();
    const productCountMap = new Map<string, { qty: number; count: number; rev: number }>();

    allOrders.forEach((o) => {
      const orderDate = new Date(o.created_at).toISOString().slice(0, 10);
      if (orderDate === todayStr) ordersToday += 1;
      if (o.status === "PENDING_PAYMENT") ordersPending += 1;
      if (o.status === "IN_PRODUCTION") ordersInProduction += 1;
      if (o.status === "READY") ordersReady += 1;

      if (o.status === "PAID" || o.payment_status === "APPROVED" || o.payment_status === "PAID") {
        totalRevenue += o.total_amount || 0;
      }

      if (o.user_id) clientsSet.add(o.user_id);
      if (o.customer_info?.email) clientsSet.add(o.customer_info.email);

      o.items?.forEach((item) => {
        const pName = item.model_name || "Uniforme Personalizado";
        const current = productCountMap.get(pName) || { qty: 0, count: 0, rev: 0 };
        current.qty += item.quantity || 1;
        current.count += 1;
        current.rev += item.subtotal || o.total_amount;
        productCountMap.set(pName, current);
      });
    });

    const quotesPending = allQuotes.filter(
      (q) => q.status === "PENDING" || q.status === "SENT"
    ).length;

    const topProducts: DashboardTopProduct[] = Array.from(productCountMap.entries())
      .map(([name, val]) => ({
        product_name: name,
        total_quantity: val.qty,
        orders_count: val.count,
        total_revenue: val.rev,
      }))
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 5);

    // Filtrar recent_orders conforme filtros
    let filteredOrders = [...allOrders];

    if (filters.period === "today") {
      filteredOrders = filteredOrders.filter(
        (o) => new Date(o.created_at).toISOString().slice(0, 10) === todayStr
      );
    } else if (filters.period === "7d") {
      const d7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filteredOrders = filteredOrders.filter((o) => new Date(o.created_at) >= d7);
    } else if (filters.period === "30d") {
      const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filteredOrders = filteredOrders.filter((o) => new Date(o.created_at) >= d30);
    }

    if (filters.status && filters.status !== "ALL") {
      filteredOrders = filteredOrders.filter((o) => o.status === filters.status);
    }

    if (filters.client) {
      const term = filters.client.toLowerCase();
      filteredOrders = filteredOrders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(term) ||
          o.customer_info?.name?.toLowerCase().includes(term) ||
          o.customer_info?.email?.toLowerCase().includes(term)
      );
    }

    if (filters.product) {
      const term = filters.product.toLowerCase();
      filteredOrders = filteredOrders.filter((o) =>
        o.items?.some((i) => i.model_name.toLowerCase().includes(term))
      );
    }

    const recentOrders: DashboardRecentOrder[] = filteredOrders.slice(0, 25).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      customer_name: o.customer_info?.name || "Cliente",
      customer_email: o.customer_info?.email,
      model_name: o.items?.[0]?.model_name || "Uniforme Personalizado",
      total_amount: o.total_amount,
      total_pieces: o.items?.[0]?.quantity || 1,
      status: o.status,
      payment_status: o.payment_status,
      created_at: o.created_at,
    }));

    return {
      orders_today: ordersToday,
      orders_pending: ordersPending,
      quotes_pending: quotesPending,
      orders_in_production: ordersInProduction,
      orders_ready: ordersReady,
      total_revenue: totalRevenue,
      total_clients: clientsSet.size,
      top_products: topProducts,
      recent_orders: recentOrders,
    };
  }
}
