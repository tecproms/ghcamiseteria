// app/api/orcamentos/[id]/route.ts
// Buscar orçamento específico com validação de permissão

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { QuotesService, UnauthorizedQuoteAccessError } from "@/services/quotes.service";

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

    const quote = await QuotesService.getQuoteById(id, userId, false);

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Orçamento não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, quote });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedQuoteAccessError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao carregar orçamento";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
