import type { UserProfile } from "./auth";
import type { Cliente, CreateClienteDTO, UpdateClienteDTO } from "./clientes";
import type { Produto, CreateProdutoDTO, UpdateProdutoDTO } from "./produtos";
import type { UniformeModelo, CreateUniformeDTO, UpdateUniformeDTO } from "./uniformes";
import type { Pedido, ItemPedido, CreatePedidoDTO, UpdatePedidoDTO } from "./pedidos";
import type { Orcamento, CreateOrcamentoDTO, UpdateOrcamentoDTO } from "./orcamentos";
import type {
  OrdemProducao,
  HistoricoProducao,
  CreateOrdemProducaoDTO,
  UpdateOrdemProducaoDTO,
} from "./producao";

import type {
  CompanyRow,
  CustomerRow,
  CategoryRow,
  FabricRow,
  ColorRow,
  SizeRow,
  ProductRow,
  ProductVariantRow,
  ShirtModelRow,
  ShirtViewRow,
  ShirtZoneRow,
  DesignTemplateRow,
  DesignRow,
  DesignElementRow,
  QuoteRow,
  QuoteItemRow,
  OrderRow,
  OrderItemRow,
  TeamMemberRow,
  ProductionOrderRow,
  ProductionStepRow,
  FileRow,
  PaymentRow,
} from "./db-entities";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      // Entidades compatíveis com a fundação inicial
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserProfile, "id">>;
        Relationships: [];
      };
      clientes: {
        Row: Cliente;
        Insert: CreateClienteDTO;
        Update: UpdateClienteDTO;
        Relationships: [];
      };
      produtos: {
        Row: Produto;
        Insert: CreateProdutoDTO;
        Update: UpdateProdutoDTO;
        Relationships: [];
      };
      uniformes_modelos: {
        Row: UniformeModelo;
        Insert: CreateUniformeDTO;
        Update: UpdateUniformeDTO;
        Relationships: [];
      };
      pedidos: {
        Row: Pedido;
        Insert: CreatePedidoDTO;
        Update: UpdatePedidoDTO;
        Relationships: [];
      };
      pedidos_itens: {
        Row: ItemPedido;
        Insert: Omit<ItemPedido, "id">;
        Update: Partial<Omit<ItemPedido, "id">>;
        Relationships: [];
      };
      orcamentos: {
        Row: Orcamento;
        Insert: CreateOrcamentoDTO;
        Update: UpdateOrcamentoDTO;
        Relationships: [];
      };
      ordens_producao: {
        Row: OrdemProducao;
        Insert: CreateOrdemProducaoDTO;
        Update: UpdateOrdemProducaoDTO;
        Relationships: [];
      };
      producao_historico: {
        Row: HistoricoProducao;
        Insert: Omit<HistoricoProducao, "id" | "created_at">;
        Update: Partial<Omit<HistoricoProducao, "id">>;
        Relationships: [];
      };

      // Entidades relacionais completas do PostgreSQL/Supabase
      companies: {
        Row: CompanyRow;
        Insert: Omit<CompanyRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<CompanyRow, "id">>;
        Relationships: [];
      };
      customers: {
        Row: CustomerRow;
        Insert: Omit<CustomerRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<CustomerRow, "id">>;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: Omit<CategoryRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<CategoryRow, "id">>;
        Relationships: [];
      };
      fabrics: {
        Row: FabricRow;
        Insert: Omit<FabricRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<FabricRow, "id">>;
        Relationships: [];
      };
      colors: {
        Row: ColorRow;
        Insert: Omit<ColorRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ColorRow, "id">>;
        Relationships: [];
      };
      sizes: {
        Row: SizeRow;
        Insert: Omit<SizeRow, "id" | "created_at">;
        Update: Partial<Omit<SizeRow, "id">>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: Omit<ProductRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ProductRow, "id">>;
        Relationships: [];
      };
      product_variants: {
        Row: ProductVariantRow;
        Insert: Omit<ProductVariantRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ProductVariantRow, "id">>;
        Relationships: [];
      };
      shirt_models: {
        Row: ShirtModelRow;
        Insert: Omit<ShirtModelRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ShirtModelRow, "id">>;
        Relationships: [];
      };
      shirt_views: {
        Row: ShirtViewRow;
        Insert: Omit<ShirtViewRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ShirtViewRow, "id">>;
        Relationships: [];
      };
      shirt_zones: {
        Row: ShirtZoneRow;
        Insert: Omit<ShirtZoneRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ShirtZoneRow, "id">>;
        Relationships: [];
      };
      design_templates: {
        Row: DesignTemplateRow;
        Insert: Omit<DesignTemplateRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DesignTemplateRow, "id">>;
        Relationships: [];
      };
      designs: {
        Row: DesignRow;
        Insert: Omit<DesignRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DesignRow, "id">>;
        Relationships: [];
      };
      design_elements: {
        Row: DesignElementRow;
        Insert: Omit<DesignElementRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DesignElementRow, "id">>;
        Relationships: [];
      };
      quotes: {
        Row: QuoteRow;
        Insert: Omit<QuoteRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<QuoteRow, "id">>;
        Relationships: [];
      };
      quote_items: {
        Row: QuoteItemRow;
        Insert: Omit<QuoteItemRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<QuoteItemRow, "id">>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: Omit<OrderRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<OrderRow, "id">>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: Omit<OrderItemRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<OrderItemRow, "id">>;
        Relationships: [];
      };
      team_members: {
        Row: TeamMemberRow;
        Insert: Omit<TeamMemberRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<TeamMemberRow, "id">>;
        Relationships: [];
      };
      production_orders: {
        Row: ProductionOrderRow;
        Insert: Omit<ProductionOrderRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ProductionOrderRow, "id">>;
        Relationships: [];
      };
      production_steps: {
        Row: ProductionStepRow;
        Insert: Omit<ProductionStepRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ProductionStepRow, "id">>;
        Relationships: [];
      };
      files: {
        Row: FileRow;
        Insert: Omit<FileRow, "id" | "created_at">;
        Update: Partial<Omit<FileRow, "id">>;
        Relationships: [];
      };
      payments: {
        Row: PaymentRow;
        Insert: Omit<PaymentRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<PaymentRow, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
