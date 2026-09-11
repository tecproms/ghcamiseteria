// types/orders.ts
// Tipos para o Módulo de Pedidos Oficiais (Orders & Order Items)
// GH Camiseteria & Uniformes Personalizados

import type { CustomizerElement } from "@/types/configurator";
import type { TeamRoster } from "@/types/team";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "IN_PRODUCTION"
  | "READY"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderPaymentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "REFUNDED"
  | "PAID"
  | "FAILED";

export interface OrderHistoryEntry {
  id: string;
  action: string;
  actor: "client" | "admin" | "system";
  actorId?: string | null;
  actorName?: string | null;
  timestamp: string;
  previousStatus?: OrderStatus | string;
  newStatus?: OrderStatus | string;
  notes?: string | null;
}

/**
 * Snapshot inviolável do uniforme aprovado.
 * Permanece 100% congelado mesmo que o cliente altere o projeto salvo posteriormente.
 */
export interface OrderSnapshot {
  version: number;
  shirt_model_id?: string | null;
  model_name: string;
  product_id?: string | null;
  color: { id: string; name: string; hex: string };
  quantity: number;
  size_breakdown: Record<string, number>;
  views: Record<string, CustomizerElement[]>;
  team_roster?: TeamRoster | null;
  pricing_summary?: {
    unit_price: number;
    discount_amount: number;
    final_total: number;
  };
  approved_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  shirt_model_id?: string | null;
  model_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  size_breakdown: Record<string, number>;
  color?: { id: string; name: string; hex: string };
  snapshot_data: OrderSnapshot;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  order_number: string;              // Ex: "PED-2026-0001"
  quote_id?: string | null;          // Vínculo com o orçamento de origem
  quote_number?: string | null;      // Ex: "ORC-2026-0001"
  user_id: string;
  customer_id?: string | null;
  status: OrderStatus;
  payment_status: OrderPaymentStatus;
  total_amount: number;
  discount_amount: number;
  shipping_amount: number;
  items: OrderItem[];
  customer_info?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
  } | null;
  tracking_code?: string | null;
  estimated_delivery_date?: string | null;
  delivery_date?: string | null;
  notes?: string | null;
  admin_notes?: string | null;
  payment_id?: string | null;
  payment_method?: "pix" | "credit_card" | string | null;
  payment_details?: {
    qr_code?: string;
    qr_code_base64?: string;
    ticket_url?: string;
    preference_id?: string;
    init_point?: string;
    sandbox_init_point?: string;
    installments?: number;
    status_detail?: string;
    [key: string]: unknown;
  } | null;
  paid_at?: string | null;
  history: OrderHistoryEntry[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateOrderFromQuoteDTO {
  quote_id: string;
  notes?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  payment_status?: OrderPaymentStatus;
  tracking_code?: string;
  estimated_delivery_date?: string;
  delivery_date?: string;
  admin_notes?: string;
}

export interface CreatePixPaymentDTO {
  order_id: string;
  payer_cpf?: string;
  payer_name?: string;
  payer_email?: string;
}

export interface CreateCardPreferenceDTO {
  order_id: string;
  payer_name?: string;
  payer_email?: string;
}

export interface PixPaymentResponse {
  payment_id: string | number;
  status: OrderPaymentStatus;
  qr_code: string;
  qr_code_base64: string;
  ticket_url?: string;
  expires_at?: string;
}

export interface CardPreferenceResponse {
  preference_id: string;
  init_point: string;
  sandbox_init_point?: string;
}