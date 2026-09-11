// ==============================================================================
// TIPAGENS DAS ENTIDADES DO BANCO DE DADOS (SUPABASE / POSTGRESQL)
// GH Camiseteria & Uniformes Personalizados
// ==============================================================================

export type UserRole = "cliente" | "admin" | "gerente" | "producao" | "atendimento";
export type CustomerType = "PF" | "PJ";
export type CollarType = "careca" | "v" | "polo" | "padre" | "henley";
export type SleeveType = "curta" | "longa" | "raglan" | "regata";
export type ViewSide = "front" | "back" | "left_sleeve" | "right_sleeve";
export type PrintMethod = "silkscreen" | "bordado" | "dtf" | "sublimacao";
export type SizeCategory = "adulto_unissex" | "feminino" | "infantil" | "plus_size";
export type QuoteStatus = "draft" | "pending_analysis" | "sent" | "approved" | "rejected" | "expired";
export type OrderStatus =
  | "pending_payment"
  | "approved"
  | "in_production"
  | "ready_for_shipping"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "partial" | "refunded" | "cancelled";
export type PaymentMethod = "pix" | "credit_card" | "boleto" | "bank_transfer";
export type ProductionPriority = "low" | "normal" | "high" | "urgent";
export type ProductionStepName = "cut" | "print_embroidery" | "sewing" | "finishing" | "qc_packing";
export type StepStatus = "not_started" | "in_progress" | "paused" | "completed" | "rejected";
export type ProductionOrderStatus = "pending" | "in_progress" | "paused" | "completed" | "cancelled";
export type DesignStatus = "draft" | "saved" | "ordered" | "archived";
export type DesignElementType = "text" | "image" | "shape";
export type FileEntityType = "design" | "quote" | "order" | "company" | "avatar" | "tech_pack";

// 1. Usuários e Clientes
export type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CompanyRow = {
  id: string;
  cnpj: string;
  legal_name: string;
  trade_name: string | null;
  state_registration: string | null;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CustomerRow = {
  id: string;
  user_id: string | null;
  company_id: string | null;
  customer_type: CustomerType;
  full_name: string;
  document: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// 2. Catálogo
export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type FabricRow = {
  id: string;
  name: string;
  slug: string;
  composition: string;
  description: string | null;
  weight_gsm: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ColorRow = {
  id: string;
  name: string;
  hex_code: string;
  pantone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SizeRow = {
  id: string;
  name: string;
  category: SizeCategory;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type ProductRow = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  default_fabric_id: string | null;
  image_url: string | null;
  size_chart_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  fabric_id: string;
  color_id: string;
  size_id: string;
  sku: string;
  additional_price: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// 3. Modelos de Uniforme
export type ShirtModelRow = {
  id: string;
  product_id: string;
  name: string;
  collar_type: CollarType;
  sleeve_type: SleeveType;
  default_color_id: string | null;
  default_fabric_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ShirtViewRow = {
  id: string;
  shirt_model_id: string;
  view_side: ViewSide;
  preview_image_url: string;
  canvas_width: number;
  canvas_height: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ShirtZoneRow = {
  id: string;
  shirt_view_id: string;
  zone_name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  max_print_width_cm: number | null;
  max_print_height_cm: number | null;
  allowed_print_methods: PrintMethod[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// 4. Configurações & Projetos
export type DesignTemplateRow = {
  id: string;
  shirt_model_id: string;
  name: string;
  category: string | null;
  thumbnail_url: string | null;
  template_data: Record<string, unknown>;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type DesignRow = {
  id: string;
  customer_id: string | null;
  user_id: string;
  shirt_model_id: string;
  name: string;
  status: DesignStatus;
  preview_thumbnail_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type DesignElementRow = {
  id: string;
  design_id: string;
  shirt_zone_id: string | null;
  element_type: DesignElementType;
  element_data: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// 5. Comercial
export type QuoteRow = {
  id: string;
  quote_number: string;
  customer_id: string | null;
  user_id: string | null;
  status: QuoteStatus;
  total_estimated: number | null;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type QuoteItemRow = {
  id: string;
  quote_id: string;
  product_id: string | null;
  shirt_model_id: string | null;
  design_id: string | null;
  description: string;
  quantity: number;
  unit_price_estimated: number | null;
  subtotal_estimated: number | null;
  size_breakdown: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  order_number: string;
  quote_id: string | null;
  customer_id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  shipping_amount: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  estimated_delivery_date: string | null;
  delivery_date: string | null;
  tracking_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_variant_id: string | null;
  shirt_model_id: string | null;
  design_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  size_breakdown: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

// 6. Equipe
export type TeamMemberRow = {
  id: string;
  customer_id: string;
  company_id: string | null;
  full_name: string;
  role_title: string | null;
  size_preference: string | null;
  gender: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// 7. Produção
export type ProductionOrderRow = {
  id: string;
  order_id: string;
  code: string;
  priority: ProductionPriority;
  current_step: ProductionStepName;
  status: ProductionOrderStatus;
  start_date: string | null;
  expected_end_date: string | null;
  completion_date: string | null;
  technical_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductionStepRow = {
  id: string;
  production_order_id: string;
  step_name: ProductionStepName;
  status: StepStatus;
  assigned_to: string | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

// 8. Arquivos
export type FileRow = {
  id: string;
  user_id: string;
  customer_id: string | null;
  entity_type: FileEntityType;
  entity_id: string | null;
  file_name: string;
  file_url: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
  deleted_at: string | null;
};

// 9. Pagamentos
export type PaymentRow = {
  id: string;
  order_id: string;
  customer_id: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_id: string | null;
  gateway_payload: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};
