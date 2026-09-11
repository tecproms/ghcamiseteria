// app/api/pedidos/route.ts
// Endpoints de listagem de pedidos para o cliente

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OrdersService } from "@/services/orders.service";

export async function GET(req: Request) {
  try {
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
        { success: false, error: "Usuário não autenticado. Faça login para ver seus pedidos." },
        { status: 401 }
      );
    }

    const orders = await OrdersService.getOrdersByUser(userId);
    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao listar pedidos";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}