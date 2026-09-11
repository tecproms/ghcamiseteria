// app/api/pedidos/[id]/route.ts
// Detalhes de um pedido específico para o cliente

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OrdersService, UnauthorizedOrderAccessError } from "@/services/orders.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    if (!userId && process.env.NODE_ENV !== "production") {
      userId = req.headers.get("x-user-id") || undefined;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const order = await OrdersService.getOrderById(id, userId, false);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedOrderAccessError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Erro ao carregar pedido";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}