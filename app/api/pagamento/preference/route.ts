// app/api/pagamento/preference/route.ts
// Geração de Checkout Preference do Mercado Pago para Pagamento com Cartão

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PaymentsService } from "@/services/payments.service";
import type { CreateCardPreferenceDTO } from "@/types/orders";

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

    const body = (await req.json()) as CreateCardPreferenceDTO;
    if (!body.order_id) {
      return NextResponse.json(
        { success: false, error: "ID do pedido (order_id) é obrigatório." },
        { status: 400 }
      );
    }

    const preference = await PaymentsService.createCardPreference(userId, body);
    return NextResponse.json({ success: true, preference });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao gerar preferência de pagamento";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
