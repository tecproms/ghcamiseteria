// app/api/pedidos/from-quote/route.ts
// Conversão de orçamento comercial aprovado em pedido oficial

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OrdersService } from "@/services/orders.service";
import type { CreateOrderFromQuoteDTO } from "@/types/orders";

export async function POST(req: Request) {
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
        { success: false, error: "Usuário não autenticado. Faça login para gerar o pedido." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CreateOrderFromQuoteDTO;

    if (!body.quote_id) {
      return NextResponse.json(
        { success: false, error: "ID do orçamento é obrigatório para gerar o pedido." },
        { status: 400 }
      );
    }

    const order = await OrdersService.createOrderFromQuote(userId, body);
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao gerar pedido do orçamento";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}