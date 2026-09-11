// app/api/admin/pricing/route.ts
// Endpoints de gestão administrativa das regras comerciais de precificação

import { NextResponse } from "next/server";
import { PricingService } from "@/services/pricing/pricing.service";
import type { PricingRuleConfig } from "@/types/pricing";

export async function GET() {
  try {
    const rules = await PricingService.getPricingRules();
    return NextResponse.json({ success: true, rules });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao carregar regras de preços";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as Partial<PricingRuleConfig>;

    if (body.baseProductPrice !== undefined && body.baseProductPrice < 0) {
      return NextResponse.json(
        { success: false, error: "O preço base do produto não pode ser negativo." },
        { status: 400 }
      );
    }

    if (body.volumeDiscounts && !Array.isArray(body.volumeDiscounts)) {
      return NextResponse.json(
        { success: false, error: "Formato inválido para a tabela de descontos por volume." },
        { status: 400 }
      );
    }

    const updated = await PricingService.updatePricingRules(body);
    return NextResponse.json({ success: true, rules: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar regras de preços";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
