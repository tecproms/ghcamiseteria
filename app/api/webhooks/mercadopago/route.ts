// app/api/webhooks/mercadopago/route.ts
// Receptor oficial de Webhooks do Mercado Pago
// Validação estrita no servidor - o status do pedido só é alterado se o Mercado Pago confirmar o pagamento

import { NextResponse } from "next/server";
import { PaymentsService } from "@/services/payments.service";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    let payload: Record<string, unknown> = {};
    try {
      payload = (await req.json()) as Record<string, unknown>;
    } catch {
      // Notificações por query string pura podem não conter corpo JSON
    }

    const result = await PaymentsService.handleWebhookNotification(payload, queryParams);

    return NextResponse.json({
      received: true,
      result,
    });
  } catch (error: unknown) {
    console.error("[Webhook Mercado Pago] Erro ao processar evento:", error);
    // Responder 200 mesmo em caso de falha de análise para evitar reenvio infinito de payload quebrado
    return NextResponse.json(
      { received: true, error: "Erro interno no processamento" },
      { status: 200 }
    );
  }
}

export async function GET() {
  // Teste de conectividade / healthcheck do webhook
  return NextResponse.json({
    active: true,
    service: "GH Camiseteria Mercado Pago Webhook",
    timestamp: new Date().toISOString(),
  });
}
