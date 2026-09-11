// Tipos oficiais para o Sistema Administrativo de Modelos e Zonas de Personalização
// GH Camiseteria & Uniformes Personalizados

export type ViewSide = "FRONT" | "BACK" | "LEFT_SLEEVE" | "RIGHT_SLEEVE" | "OTHER";

export type ElementType = "LOGO" | "TEXT" | "NUMBER" | "IMAGE";

export type StandardZoneType =
  | "PEITO_ESQUERDO"
  | "PEITO_DIREITO"
  | "CENTRO_FRONTAL"
  | "COSTAS"
  | "MANGA_ESQUERDA"
  | "MANGA_DIREITA"
  | "PERSONALIZADO";

export interface CustomizationZone {
  id: string;
  shirt_view_id: string;
  zone_name: string;
  zone_type: StandardZoneType | string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  min_scale: number;
  max_scale: number;
  allowed_element_types: ElementType[];
  is_active: boolean;
  svg_path?: string | null;
  svg_bounds?: {
    viewBox?: string;
    points?: string;
  } | null;
  max_print_width_cm?: number | null;
  max_print_height_cm?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface UniformView {
  id: string;
  shirt_model_id: string;
  view_side: ViewSide;
  preview_image_url: string;
  svg_overlay_url?: string | null;
  svg_content?: string | null;
  canvas_width: number;
  canvas_height: number;
  sort_order: number;
  zones?: CustomizationZone[];
  created_at?: string;
  updated_at?: string;
}

export interface UniformModel {
  id: string;
  product_id?: string | null;
  name: string;
  description?: string | null;
  collar_type?: string;
  sleeve_type?: string;
  default_color_id?: string | null;
  default_fabric_id?: string | null;
  base_asset_url?: string | null;
  is_active: boolean;
  product_name?: string | null;
  views?: UniformView[];
  created_at?: string;
  updated_at?: string;
}

export type CreateUniformModelDTO = {
  name: string;
  description?: string;
  product_id?: string | null;
  base_asset_url?: string;
  is_active?: boolean;
};

export type UpdateUniformModelDTO = Partial<CreateUniformModelDTO>;

export type CreateUniformViewDTO = {
  shirt_model_id: string;
  view_side: ViewSide;
  preview_image_url: string;
  svg_overlay_url?: string;
  svg_content?: string;
  canvas_width?: number;
  canvas_height?: number;
  sort_order?: number;
};

export type CreateCustomizationZoneDTO = {
  shirt_view_id: string;
  zone_name: string;
  zone_type: StandardZoneType | string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  min_scale?: number;
  max_scale?: number;
  allowed_element_types?: ElementType[];
  is_active?: boolean;
  svg_path?: string;
};

export type UpdateCustomizationZoneDTO = Partial<Omit<CreateCustomizationZoneDTO, "shirt_view_id">>;
