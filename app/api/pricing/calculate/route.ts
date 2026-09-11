// app/api/pricing/calculate/route.ts
// Endpoint público/autenticado para recálculo determinístico de preços no servidor

import { NextResponse } from "next/server";
import { PricingService } from "@/services/pricing/pricing.service";
import type { PricingCalculationInput } from "@/types/pricing";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PricingCalculationInput;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Parâmetros inválidos para cálculo de preço." },
        { status: 400 }
      );
    }

    const pricing = await PricingService.calculate({
      shirtModelId: body.shirtModelId,
      modelName: body.modelName,
      productId: body.productId,
      quantity: body.quantity || 1,
      views: body.views || {},
      teamRoster: body.teamRoster,
    });

    return NextResponse.json({ success: true, pricing });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao calcular preço";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
