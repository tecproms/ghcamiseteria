// services/pricing/pricing.service.ts
// Motor de Preços Dinâmico (Pricing Engine)
// GH Camiseteria & Uniformes Personalizados

import { pool } from "@/lib/db";
import type { ElementType, ViewSide } from "@/types/uniform-model";
import type {
  PricingRuleConfig,
  PricingCalculationInput,
  PricingCalculationResult,
  PricingBreakdownItem,
  VolumeDiscountTier,
} from "@/types/pricing";

export const DEFAULT_PRICING_RULES: PricingRuleConfig = {
  version: 1,
  baseProductPrice: 35.0,
  modelOverrides: {},
  elementTypes: {
    LOGO: 5.0,
    TEXT: 4.0,
    NUMBER: 4.0,
    IMAGE: 6.0,
  },
  positions: {
    FRONT: 0.0,
    BACK: 3.0,
    LEFT_SLEEVE: 2.5,
    RIGHT_SLEEVE: 2.5,
    OTHER: 0.0,
  },
  volumeDiscounts: [
    { minQuantity: 1, maxQuantity: 19, discountPercent: 0, label: "1 a 19 peças (Padrão)" },
    { minQuantity: 20, maxQuantity: 49, discountPercent: 10, label: "20 a 49 peças - 10% OFF" },
    { minQuantity: 50, maxQuantity: 99, discountPercent: 15, label: "50 a 99 peças - 15% OFF" },
    { minQuantity: 100, maxQuantity: undefined, discountPercent: 20, label: "100+ peças - 20% OFF (Atacado)" },
  ],
  teamMemberIndividualFee: 0.0, // ou configurável
  additionalSetupFee: 0.0,
};

// Cache em memória para alta performance e fallback resiliente
let memoryRules: PricingRuleConfig = { ...DEFAULT_PRICING_RULES };

function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export class PricingService {
  /**
   * Obter regras comerciais vigentes (busca no banco com fallback em memória)
   */
  static async getPricingRules(): Promise<PricingRuleConfig> {
    try {
      const res = await pool.query(
        `SELECT config FROM public.pricing_rules WHERE is_active = true ORDER BY version DESC LIMIT 1`
      );

      if (res.rows[0]?.config) {
        const dbConfig = typeof res.rows[0].config === "string"
          ? JSON.parse(res.rows[0].config)
          : res.rows[0].config;
        memoryRules = { ...DEFAULT_PRICING_RULES, ...dbConfig };
        return memoryRules;
      }
    } catch {
      // Fallback gracioso para persistência em memória
    }

    return memoryRules;
  }

  /**
   * Atualizar regras comerciais (exclusivo para administradores)
   */
  static async updatePricingRules(
    updates: Partial<PricingRuleConfig>
  ): Promise<PricingRuleConfig> {
    const current = await this.getPricingRules();
    const updated: PricingRuleConfig = {
      ...current,
      ...updates,
      version: (current.version || 1) + 1,
      updatedAt: new Date().toISOString(),
    };

    try {
      await pool.query(
        `INSERT INTO public.pricing_rules (version, config, is_active, updated_at)
         VALUES ($1, $2, true, $3)`,
        [updated.version, JSON.stringify(updated), updated.updatedAt]
      );
    } catch {
      // Fallback
    }

    memoryRules = updated;
    return updated;
  }

  /**
   * Calcular orçamento do uniforme 100% no servidor (Deterministic Server-Side Pricing)
   * NUNCA confia em valores financeiros vindos do cliente.
   */
  static async calculate(input: PricingCalculationInput): Promise<PricingCalculationResult> {
    const rules = await this.getPricingRules();

    // 1. Quantidade efetiva
    const quantity = input.teamRoster?.enabled && input.teamRoster.members?.length > 0
      ? input.teamRoster.members.length
      : Math.max(1, Math.round(input.quantity || 1));

    // 2. Preço base do produto / modelo
    let unitBasePrice = rules.baseProductPrice;
    if (input.shirtModelId && rules.modelOverrides?.[input.shirtModelId]) {
      unitBasePrice = rules.modelOverrides[input.shirtModelId];
    }
    unitBasePrice = round2(unitBasePrice);

    // 3. Adicionais de personalização por elemento e por posição
    const elementsBreakdown: PricingBreakdownItem[] = [];
    const positionsBreakdown: Array<{ viewSide: string; price: number; description: string }> = [];
    let unitCustomizations = 0;

    const views = input.views || {};
    const viewSides = Object.keys(views) as ViewSide[];

    for (const side of viewSides) {
      const viewElements = views[side] || [];
      if (viewElements.length === 0) continue;

      // Adicional por posição/vista decorada (ex: costas, manga)
      const positionCost = rules.positions?.[side] ?? 0;
      if (positionCost > 0) {
        positionsBreakdown.push({
          viewSide: side,
          price: round2(positionCost),
          description: `Impressão na posição: ${side}`,
        });
        unitCustomizations += positionCost;
      }

      // Adicional por cada elemento individual inserido
      for (const elem of viewElements) {
        const typeCost = rules.elementTypes?.[elem.type as ElementType] ?? 0;
        const elemDesc =
          elem.type === "LOGO"
            ? "Logomarca"
            : elem.type === "TEXT"
            ? `Texto: "${elem.text || "Texto"}"`
            : elem.type === "NUMBER"
            ? `Número: "${elem.text || "10"}"`
            : "Imagem Personalizada";

        elementsBreakdown.push({
          id: elem.id,
          type: elem.type,
          viewSide: side,
          unitPrice: round2(typeCost),
          description: `${elemDesc} (${side})`,
        });

        unitCustomizations += typeCost;
      }
    }

    unitCustomizations = round2(unitCustomizations);
    const unitPriceBeforeDiscount = round2(unitBasePrice + unitCustomizations);

    // 4. Desconto por Volume (Faixas progressivas)
    const tiers = (rules.volumeDiscounts || []).sort(
      (a, b) => b.minQuantity - a.minQuantity
    );

    const tierApplied =
      tiers.find((t) => {
        if (quantity < t.minQuantity) return false;
        if (t.maxQuantity !== undefined && t.maxQuantity !== null && quantity > t.maxQuantity) return false;
        return true;
      }) || null;

    const discountPercent = tierApplied ? tierApplied.discountPercent : 0;
    const unitDiscountAmount = round2(unitPriceBeforeDiscount * (discountPercent / 100));
    const unitPrice = round2(unitPriceBeforeDiscount - unitDiscountAmount);

    // 5. Subtotal e Desconto Total
    const subtotal = round2(unitPriceBeforeDiscount * quantity);
    const totalDiscount = round2(unitDiscountAmount * quantity);

    // 6. Adicionais de Grade da Equipe (ex: individualização de nomes) e taxas de setup
    let additionals = 0;
    let teamRosterFee: { totalMembers: number; feePerMember: number; totalFee: number } | undefined;

    if (input.teamRoster?.enabled && input.teamRoster.members?.length > 0) {
      const feePerMember = rules.teamMemberIndividualFee || 0;
      if (feePerMember > 0) {
        const totalMembers = input.teamRoster.members.length;
        const feeTotal = round2(feePerMember * totalMembers);
        additionals += feeTotal;
        teamRosterFee = {
          totalMembers,
          feePerMember,
          totalFee: feeTotal,
        };
      }
    }

    if (rules.additionalSetupFee > 0) {
      additionals += round2(rules.additionalSetupFee);
    }
    additionals = round2(additionals);

    // 7. Total Final Recalculado
    const total = round2(unitPrice * quantity + additionals);

    return {
      unitBasePrice,
      unitCustomizations,
      unitPriceBeforeDiscount,
      discountPercent,
      unitDiscountAmount,
      unitPrice,
      quantity,
      subtotal,
      totalDiscount,
      additionals,
      total,
      tierApplied,
      breakdown: {
        baseProduct: {
          name: input.modelName || "Uniforme Personalizado",
          price: unitBasePrice,
        },
        elements: elementsBreakdown,
        positions: positionsBreakdown,
        teamRosterFee,
      },
    };
  }

  /**
   * Resetar regras para o padrão de fábrica (usado em testes unitários)
   */
  static _resetDefaults() {
    memoryRules = { ...DEFAULT_PRICING_RULES };
  }
}
