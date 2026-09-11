// types/production.ts
// Tipos para o Painel Operacional de Produção Fabril
// GH Camiseteria & Uniformes Personalizados

import type { OrderSnapshot } from "@/types/orders";

export type ProductionStepKey =
  | "PEDIDO_RECEBIDO"
  | "ARTE"
  | "SEPARACAO"
  | "CORTE"
  | "ESTAMPARIA"
  | "COSTURA"
  | "CONFERENCIA"
  | "EMBALAGEM"
  | "PRONTO";

export type ProductionStepStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED";

export interface ProductionStepConfig {
  key: ProductionStepKey;
  order: number;
  label: string;
  description: string;
}

export const PRODUCTION_STEPS_CONFIG: ProductionStepConfig[] = [
  {
    key: "PEDIDO_RECEBIDO",
    order: 1,
    label: "Pedido Recebido",
    description: "Ordem gerada a partir de pedido com pagamento confirmado.",
  },
  {
    key: "ARTE",
    order: 2,
    label: "Arte",
    description: "Separação de arquivos, matrizes de estampa e vetorização.",
  },
  {
    key: "SEPARACAO",
    order: 3,
    label: "Separação",
    description: "Separação de rolos de tecido, linhas, aviamentos e golas.",
  },
  {
    key: "CORTE",
    order: 4,
    label: "Corte",
    description: "Enfesto e corte das peças conforme grade de tamanhos.",
  },
  {
    key: "ESTAMPARIA",
    order: 5,
    label: "Estamparia",
    description: "Aplicação de serigrafia, DTF, sublimação ou bordado nas zonas aprovadas.",
  },
  {
    key: "COSTURA",
    order: 6,
    label: "Costura",
    description: "Montagem, união de partes, pesponto e acabamento de golas e mangas.",
  },
  {
    key: "CONFERENCIA",
    order: 7,
    label: "Conferência",
    description: "Controle de qualidade, conferência de medidas e nomes/números.",
  },
  {
    key: "EMBALAGEM",
    order: 8,
    label: "Embalagem",
    description: "Dobra, etiquetagem e embalagem individual/lote de peças.",
  },
  {
    key: "PRONTO",
    order: 9,
    label: "Pronto",
    description: "Ordem finalizada e liberada para retirada ou despacho.",
  },
];

export interface ProductionStep {
  id: string;
  production_order_id: string;
  step_key: ProductionStepKey;
  step_order: number;
  label: string;
  status: ProductionStepStatus;
  started_at?: string | null;
  completed_at?: string | null;
  operator_name?: string | null;
  notes?: string | null;
}

export interface ProductionOrder {
  id: string;
  production_number: string; // Ex: "OP-2026-0001"
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  current_step: ProductionStepKey;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
  priority: "NORMAL" | "HIGH" | "URGENT";
  snapshot: OrderSnapshot;
  total_pieces: number;
  notes?: string | null;
  factory_notes?: string | null;
  steps: ProductionStep[];
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductionOrderDTO {
  order_id: string;
  priority?: "NORMAL" | "HIGH" | "URGENT";
  factory_notes?: string;
}

export interface UpdateProductionStepDTO {
  step_key: ProductionStepKey;
  status: ProductionStepStatus;
  operator_name?: string;
  notes?: string;
}
