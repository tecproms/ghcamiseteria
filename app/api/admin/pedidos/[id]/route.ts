// app/api/admin/pedidos/[id]/route.ts
// Endpoints de detalhes e atualização de status do pedido pelo administrador

import { NextResponse } from "next/server";
import { OrdersService } from "@/services/orders.service";
import type { UpdateOrderStatusDTO } from "@/types/orders";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await OrdersService.getOrderById(id, "admin-system", true);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao carregar pedido";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as UpdateOrderStatusDTO;

    const updated = await OrdersService.updateOrderStatus(id, "admin-system", body);
    return NextResponse.json({ success: true, order: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar status do pedido";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}