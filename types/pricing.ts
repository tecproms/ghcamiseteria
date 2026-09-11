// Tipos para o Motor de Preços (Pricing Engine)
// GH Camiseteria & Uniformes Personalizados

import type { ElementType, ViewSide } from "@/types/uniform-model";
import type { CustomizerElement } from "@/types/configurator";
import type { TeamRoster } from "@/types/team";

export interface VolumeDiscountTier {
  minQuantity: number;
  maxQuantity?: number;
  discountPercent: number; // Porcentagem (ex: 10 para 10%)
  label: string;           // Ex: "20 a 49 peças - 10% OFF"
}

export interface PricingRuleConfig {
  id?: string;
  version: number;
  baseProductPrice: number;                 // Preço padrão da peça (ex: R$ 35,00)
  modelOverrides?: Record<string, number>;  // Preços específicos por ID de modelo
  elementTypes: Record<ElementType, number>;// Preço adicional por tipo de elemento
  positions: Record<ViewSide, number>;      // Preço adicional por posição/vista
  volumeDiscounts: VolumeDiscountTier[];     // Faixas progressivas de desconto por volume
  teamMemberIndividualFee: number;          // Taxa adicional por integrante individual na grade (ex: R$ 3,00)
  additionalSetupFee: number;               // Taxa fixa de setup/matriz (ex: R$ 0,00 ou R$ 20,00)
  updatedAt?: string;
}

export interface PricingCalculationInput {
  shirtModelId?: string | null;
  modelName?: string | null;
  productId?: string | null;
  quantity: number;
  views?: Record<string, CustomizerElement[]> | null;
  teamRoster?: TeamRoster | null;
}

export interface PricingBreakdownItem {
  id: string;
  type: string;
  viewSide: string;
  unitPrice: number;
  description: string;
}

export interface PricingCalculationResult {
  unitBasePrice: number;            // Ex: 35.00
  unitCustomizations: number;       // Ex: 13.00 (Logo 5 + Nome 4 + Num 4)
  unitPriceBeforeDiscount: number;  // Ex: 48.00 (base + adicionais unitários)
  discountPercent: number;          // Ex: 10 (%)
  unitDiscountAmount: number;       // Ex: 4.80 (desconto por unidade)
  unitPrice: number;                // Ex: 43.20 (preço unitário líquido)
  quantity: number;                 // Ex: 20
  subtotal: number;                 // Ex: 960.00 (20 * 48.00)
  totalDiscount: number;            // Ex: 96.00 (20 * 4.80)
  additionals: number;              // Ex: 0.00 (ou taxas adicionais totais)
  total: number;                    // Ex: 864.00 (total a pagar)
  tierApplied?: VolumeDiscountTier | null;
  breakdown: {
    baseProduct: { name: string; price: number };
    elements: PricingBreakdownItem[];
    positions: Array<{ viewSide: string; price: number; description: string }>;
    teamRosterFee?: { totalMembers: number; feePerMember: number; totalFee: number };
  };
}
