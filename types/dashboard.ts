// types/dashboard.ts
// Tipos para o Dashboard Administrativo com Métricas Reais do Banco
// GH Camiseteria & Uniformes Personalizados

export interface DashboardTopProduct {
  product_name: string;
  total_quantity: number;
  orders_count: number;
  total_revenue: number;
}

export interface DashboardRecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  model_name: string;
  total_amount: number;
  total_pieces: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export interface DashboardStats {
  orders_today: number;
  orders_pending: number;
  quotes_pending: number;
  orders_in_production: number;
  orders_ready: number;
  total_revenue: number;
  total_clients: number;
  top_products: DashboardTopProduct[];
  recent_orders: DashboardRecentOrder[];
}

export interface DashboardFilters {
  period?: "today" | "7d" | "30d" | "all";
  status?: string;
  client?: string;
  product?: string;
}
