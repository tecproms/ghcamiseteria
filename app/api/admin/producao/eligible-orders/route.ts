// app/api/admin/producao/eligible-orders/route.ts
// Lista pedidos pagos que podem ingressar na esteira de produção

import { NextResponse } from "next/server";
import { ProductionService } from "@/services/production.service";

export async function GET() {
  try {
    const orders = await ProductionService.listEligiblePaidOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao listar pedidos elegíveis";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
