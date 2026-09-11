// app/api/admin/producao/[id]/route.ts
// Endpoints de detalhes e atualização de etapas da Ordem de Produção

import { NextResponse } from "next/server";
import { ProductionService } from "@/services/production.service";
import type { UpdateProductionStepDTO } from "@/types/production";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const op = await ProductionService.getProductionOrderById(id);
    if (!op) {
      return NextResponse.json(
        { success: false, error: "Ordem de Produção não encontrada." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, production_order: op });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao carregar OP";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as UpdateProductionStepDTO;
    const updated = await ProductionService.updateProductionStep(id, body, "admin-system");
    return NextResponse.json({ success: true, production_order: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar etapa de produção";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
