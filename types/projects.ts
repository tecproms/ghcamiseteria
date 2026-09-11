// Tipos para Meus Projetos (Uniformes Salvos do Cliente)
// GH Camiseteria & Uniformes Personalizados

import type { FabricColor, CustomizerElement, ViewSide } from "@/types/configurator";

export type ProjectStatus = "draft" | "saved" | "in_review" | "approved" | "rejected" | "archived";

/**
 * Estrutura serializável completa da configuração do uniforme
 */
export interface SerializableProjectConfig {
  version: number;
  modelId: string;
  modelName: string;
  productId?: string | null;
  productName?: string | null;
  color: FabricColor;
  quantity: number;
  views: Record<ViewSide, CustomizerElement[]>;
}

/**
 * Projeto salvo no banco de dados
 */
export interface UniformProject {
  id: string;
  user_id: string;
  customer_id?: string | null;
  shirt_model_id: string;
  name: string;
  status: ProjectStatus;
  preview_thumbnail_url?: string | null;
  metadata: {
    color: FabricColor;
    quantity: number;
    productId?: string | null;
    productName?: string | null;
    modelName: string;
    configuration: SerializableProjectConfig;
  };
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateProjectDTO {
  name: string;
  shirt_model_id: string;
  model_name?: string;
  product_id?: string | null;
  product_name?: string | null;
  status?: ProjectStatus;
  color: FabricColor;
  quantity?: number;
  views: Record<ViewSide, CustomizerElement[]>;
  preview_thumbnail_url?: string | null;
}

export interface UpdateProjectDTO {
  name?: string;
  status?: ProjectStatus;
  color?: FabricColor;
  quantity?: number;
  views?: Record<ViewSide, CustomizerElement[]>;
  preview_thumbnail_url?: string | null;
}
