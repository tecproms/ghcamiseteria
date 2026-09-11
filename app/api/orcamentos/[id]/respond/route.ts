// app/api/orcamentos/[id]/respond/route.ts
// Endpoint para cliente aprovar ou recusar proposta enviada pelo administrador
// REGRA: Cliente NUNCA altera valores.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { QuotesService, UnauthorizedQuoteAccessError } from "@/services/quotes.service";
import type { ClientQuoteResponseDTO } from "@/types/quotes";

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

    const body = (await req.json()) as ClientQuoteResponseDTO;

    if (!body.action || (body.action !== "APPROVE" && body.action !== "REJECT")) {
      return NextResponse.json(
        { success: false, error: "Ação inválida. Escolha APPROVE ou REJECT." },
        { status: 400 }
      );
    }

    const updated = await QuotesService.clientRespondQuote(id, userId, body);
    return NextResponse.json({ success: true, quote: updated });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedQuoteAccessError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao responder proposta de orçamento";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
