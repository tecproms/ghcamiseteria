// app/api/admin/orcamentos/route.ts
// Listagem administrativa de todos os orçamentos

import { NextResponse } from "next/server";
import { QuotesService } from "@/services/quotes.service";
import type { QuoteStatus } from "@/types/quotes";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status")?.toUpperCase() as QuoteStatus | undefined;

    const quotes = await QuotesService.listAllQuotesAdmin(
      statusParam ? { status: statusParam } : undefined
    );

    return NextResponse.json({ success: true, quotes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao listar orçamentos no painel admin";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
