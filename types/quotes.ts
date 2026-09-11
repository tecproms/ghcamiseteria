// types/quotes.ts
// Tipos para o Módulo de Orçamentos Comerciais (Quotes & Quote Items)
// GH Camiseteria & Uniformes Personalizados

import type { CustomizerElement, ViewSide } from "@/types/configurator";
import type { TeamRoster } from "@/types/team";
import type { PricingCalculationResult } from "@/types/pricing";

export type QuoteStatus =
  | "DRAFT"
  | "PENDING"
  | "SENT"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export interface QuoteHistoryEntry {
  id: string;
  action: string;                     // Ex: "CREATED", "PRICE_UPDATED", "DISCOUNT_APPLIED", "SENT_TO_CUSTOMER", "APPROVED_BY_CUSTOMER", "REJECTED_BY_CUSTOMER"
  actor: "client" | "admin" | "system";
  actorId?: string | null;
  actorName?: string | null;
  timestamp: string;
  previousStatus?: QuoteStatus | string;
  newStatus?: QuoteStatus | string;
  previousTotal?: number | null;
  newTotal?: number | null;
  notes?: string | null;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id?: string | null;
  shirt_model_id?: string | null;
  design_id?: string | null;
  model_name?: string | null;
  description: string;
  quantity: number;
  unit_price_estimated: number;
  subtotal_estimated: number;
  size_breakdown: Record<string, number>; // Ex: { PP: 2, P: 5, M: 12, G: 10, GG: 3 }
  customization_details?: {
    color?: { id: string; name: string; hex: string };
    views?: Record<string, CustomizerElement[]>;
    teamRoster?: TeamRoster;
    pricingResult?: PricingCalculationResult;
  } | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Quote {
  id: string;
  quote_number: string;              // Ex: "ORC-2026-0001"
  user_id: string;
  customer_id?: string | null;
  status: QuoteStatus;
  total_estimated: number;           // Valor original estimado pelo sistema
  discount_amount: number;           // Desconto adicional aplicado pelo admin (R$)
  final_total: number;               // Valor final oficial (total_estimated - discount_amount ou ajustado pelo admin)
  valid_until?: string | null;
  notes?: string | null;             // Observações enviadas pelo cliente
  admin_notes?: string | null;       // Observações comerciais enviadas pelo administrador
  customer_info?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  } | null;
  items: QuoteItem[];
  history: QuoteHistoryEntry[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateQuoteDTO {
  shirt_model_id?: string | null;
  model_name?: string | null;
  product_id?: string | null;
  design_id?: string | null;
  color?: { id: string; name: string; hex: string };
  quantity: number;
  views?: Record<string, CustomizerElement[]>;
  teamRoster?: TeamRoster;
  notes?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_company?: string;
}

export interface AdminReviewQuoteDTO {
  unit_price?: number;
  discount_amount?: number;
  final_total?: number;
  admin_notes?: string;
  status?: QuoteStatus;
  valid_until?: string;
}

export interface ClientQuoteResponseDTO {
  action: "APPROVE" | "REJECT";
  reason?: string;
  customer_notes?: string;
}
