// app/api/admin/producao/route.ts
// Endpoints de listagem e criação de Ordens de Produção (Admin)

import { NextResponse } from "next/server";
import { ProductionService } from "@/services/production.service";
import type { CreateProductionOrderDTO, ProductionStepKey } from "@/types/production";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const step = (url.searchParams.get("step") || undefined) as ProductionStepKey | undefined;
    const status = url.searchParams.get("status") || undefined;
    const search = url.searchParams.get("search") || undefined;

    const orders = await ProductionService.listProductionOrders({ step, status, search });
    return NextResponse.json({ success: true, production_orders: orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao listar ordens de produção";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateProductionOrderDTO;
    if (!body.order_id) {
      return NextResponse.json(
        { success: false, error: "ID do pedido (order_id) é obrigatório." },
        { status: 400 }
      );
    }

    const op = await ProductionService.createProductionOrder(body, "admin-system");
    return NextResponse.json({ success: true, production_order: op }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao criar ordem de produção";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
