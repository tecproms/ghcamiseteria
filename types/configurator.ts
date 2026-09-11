// Tipos para o Configurador Visual de Uniformes
// GH Camiseteria & Uniformes Personalizados

import type { ViewSide, ElementType, CustomizationZone, UniformModel } from "@/types/uniform-model";

export type { ViewSide, ElementType };

export interface FabricColor {
  id: string;
  name: string;
  hex: string;
  textColor: string;
}

export interface CustomizerElement {
  id: string;
  type: ElementType;
  zoneId: string;
  viewSide: ViewSide;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  // Propriedades específicas de texto / número
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  // Propriedades específicas de imagem / logo
  src?: string;
  // Vínculo dinâmico com a Grade da Equipe (Nome ou Número)
  linkedMemberField?: "name" | "number" | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ConfiguratorState {
  models: UniformModel[];
  selectedModel: UniformModel | null;
  selectedColor: FabricColor;
  selectedViewSide: ViewSide;
  elements: Record<ViewSide, CustomizerElement[]>;
  selectedElementId: string | null;
  showZones: boolean;
  canUndo: boolean;
  canRedo: boolean;
}
