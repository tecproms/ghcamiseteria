// app/api/pagamento/status/[orderId]/route.ts
// Consulta leve de status de pagamento pelo cliente para polling em tempo real

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PaymentsService } from "@/services/payments.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
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

    const statusData = await PaymentsService.getPaymentStatus(orderId, userId);
    return NextResponse.json({ success: true, ...statusData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao consultar status";
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}
