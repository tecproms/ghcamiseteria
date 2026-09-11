// app/api/pedidos/[id]/repeat/route.ts
// Repetir Pedido Anterior - Criação de Novo Pedido/Orçamento Baseado no Histórico
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OrdersService, UnauthorizedOrderAccessError } from "@/services/orders.service";
import { PricingService } from "@/services/pricing/pricing.service";

export async function POST(
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

    const body = await req.json().catch(() => ({}));
    const { quantity, size_breakdown, team_roster, notes, preview_only } = body;

    // Se for apenas prévia/recálculo de preço em tempo real
    if (preview_only) {
      const order = await OrdersService.getOrderById(id, userId, false);
      if (!order) {
        return NextResponse.json(
          { success: false, error: "Pedido não encontrado." },
          { status: 404 }
        );
      }

      const firstItem = order.items?.[0];
      const snapshot = firstItem?.snapshot_data;

      const effectiveRoster = team_roster !== undefined ? team_roster : snapshot?.team_roster;
      const effectiveQuantity = effectiveRoster?.enabled && effectiveRoster.members?.length > 0
        ? effectiveRoster.members.length
        : Math.max(1, Number(quantity) || firstItem?.quantity || 1);

      const pricing = await PricingService.calculate({
        shirtModelId: snapshot?.shirt_model_id || firstItem?.shirt_model_id,
        modelName: snapshot?.model_name || firstItem?.model_name,
        productId: snapshot?.product_id || firstItem?.product_id,
        quantity: effectiveQuantity,
        views: snapshot?.views,
        teamRoster: effectiveRoster,
      });

      return NextResponse.json({
        success: true,
        pricing,
        quantity: effectiveQuantity,
      });
    }

    // Execução da repetição oficial
    const result = await OrdersService.repeatOrder(id, userId, {
      quantity: quantity ? Number(quantity) : undefined,
      size_breakdown,
      team_roster,
      notes,
    });

    return NextResponse.json({
      success: true,
      quote: result.quote,
      originalOrder: result.originalOrder,
      message: `Novo pedido/orçamento ${result.quote.quote_number} gerado com sucesso com base no pedido ${result.originalOrder.order_number}.`,
    });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedOrderAccessError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao repetir pedido.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
