// app/api/pagamento/pix/route.ts
// Geração de cobrança Pix via Mercado Pago

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PaymentsService } from "@/services/payments.service";
import type { CreatePixPaymentDTO } from "@/types/orders";

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
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CreatePixPaymentDTO;
    if (!body.order_id) {
      return NextResponse.json(
        { success: false, error: "ID do pedido (order_id) é obrigatório." },
        { status: 400 }
      );
    }

    const pixData = await PaymentsService.createPixPayment(userId, body);
    return NextResponse.json({ success: true, payment: pixData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao gerar cobrança Pix";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
