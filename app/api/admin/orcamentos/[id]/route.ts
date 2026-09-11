// app/api/admin/orcamentos/[id]/route.ts
// Endpoints de detalhes e atualização comercial do orçamento pelo administrador

import { NextResponse } from "next/server";
import { QuotesService } from "@/services/quotes.service";
import type { AdminReviewQuoteDTO } from "@/types/quotes";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quote = await QuotesService.getQuoteById(id, "admin", true);

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Orçamento não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, quote });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao carregar orçamento";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as AdminReviewQuoteDTO;

    const updated = await QuotesService.adminReviewQuote(id, "admin-system", body);
    return NextResponse.json({ success: true, quote: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar orçamento";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
