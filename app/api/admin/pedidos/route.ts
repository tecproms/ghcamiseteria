// app/api/admin/pedidos/route.ts
// Listagem administrativa de todos os pedidos

import { NextResponse } from "next/server";
import { OrdersService } from "@/services/orders.service";
import type { OrderStatus } from "@/types/orders";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status")?.toUpperCase() as OrderStatus | undefined;
    const searchParam = searchParams.get("search") || undefined;

    const orders = await OrdersService.listAllOrdersAdmin({
      status: statusParam,
      search: searchParam,
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao listar pedidos no painel admin";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}