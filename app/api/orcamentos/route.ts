// app/api/orcamentos/route.ts
// Endpoints de solicitação e listagem de orçamentos para o cliente

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { QuotesService } from "@/services/quotes.service";
import type { CreateQuoteDTO } from "@/types/quotes";

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
        { success: false, error: "Usuário não autenticado. Faça login para ver seus orçamentos." },
        { status: 401 }
      );
    }

    const quotes = await QuotesService.getQuotesByUser(userId);
    return NextResponse.json({ success: true, quotes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao listar orçamentos";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

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
        { success: false, error: "Usuário não autenticado. Faça login para solicitar um orçamento." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CreateQuoteDTO;

    if (!body.quantity && (!body.teamRoster?.members || body.teamRoster.members.length === 0)) {
      return NextResponse.json(
        { success: false, error: "Informe a quantidade ou adicione integrantes na grade da equipe." },
        { status: 400 }
      );
    }

    const quote = await QuotesService.createQuote(userId, body);
    return NextResponse.json({ success: true, quote }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao solicitar orçamento";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
