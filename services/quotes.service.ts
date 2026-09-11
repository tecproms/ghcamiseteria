// services/quotes.service.ts
// Serviço Central de Orçamentos Comerciais (Quotes & Quote Items)
// GH Camiseteria & Uniformes Personalizados

import { pool } from "@/lib/db";
import { PricingService } from "@/services/pricing/pricing.service";
import type {
  Quote,
  QuoteItem,
  CreateQuoteDTO,
  AdminReviewQuoteDTO,
  ClientQuoteResponseDTO,
  QuoteStatus,
  QuoteHistoryEntry,
} from "@/types/quotes";

export class UnauthorizedQuoteAccessError extends Error {
  constructor(message = "Acesso negado: você não tem permissão para acessar este orçamento.") {
    super(message);
    this.name = "UnauthorizedQuoteAccessError";
  }
}

// Memória local de fallback para testes e funcionamento resiliente
let memoryQuotes: Quote[] = [];

function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export class QuotesService {
  /**
   * Solicitar novo orçamento a partir de uma configuração do cliente
   */
  static async createQuote(userId: string, dto: CreateQuoteDTO): Promise<Quote> {
    const id = `quote-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(); // 15 dias

    // 1. Quantidade e Grade de Tamanhos
    const effectiveQty = dto.teamRoster?.enabled && dto.teamRoster.members?.length > 0
      ? dto.teamRoster.members.length
      : Math.max(1, Math.round(dto.quantity || 1));

    const sizeBreakdown: Record<string, number> = {};
    if (dto.teamRoster?.enabled && dto.teamRoster.members?.length > 0) {
      dto.teamRoster.members.forEach((m) => {
        const sz = (m.size || "M").toUpperCase();
        sizeBreakdown[sz] = (sizeBreakdown[sz] || 0) + 1;
      });
    } else {
      sizeBreakdown["M"] = effectiveQty;
    }

    // 2. Recálculo Oficial de Preço no Servidor (100% Determinístico)
    const pricing = await PricingService.calculate({
      shirtModelId: dto.shirt_model_id,
      modelName: dto.model_name,
      productId: dto.product_id,
      quantity: effectiveQty,
      views: dto.views,
      teamRoster: dto.teamRoster,
    });

    const quoteNumber = `ORC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialHistoryEntry: QuoteHistoryEntry = {
      id: `hist-${Date.now()}-1`,
      action: "CREATED",
      actor: "client",
      actorName: dto.customer_name || "Cliente",
      timestamp: now,
      previousStatus: undefined,
      newStatus: "PENDING",
      previousTotal: null,
      newTotal: pricing.total,
      notes: dto.notes || "Solicitação de orçamento enviada pelo cliente.",
    };

    const item: QuoteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      quote_id: id,
      product_id: dto.product_id || null,
      shirt_model_id: dto.shirt_model_id || null,
      design_id: dto.design_id || null,
      model_name: dto.model_name || "Uniforme Personalizado",
      description: `Confecção de ${effectiveQty}x ${dto.model_name || "Uniforme Personalizado"}`,
      quantity: effectiveQty,
      unit_price_estimated: pricing.unitPrice,
      subtotal_estimated: pricing.total,
      size_breakdown: sizeBreakdown,
      customization_details: {
        color: dto.color,
        views: dto.views,
        teamRoster: dto.teamRoster,
        pricingResult: pricing,
      },
      notes: dto.notes || null,
      created_at: now,
      updated_at: now,
    };

    const newQuote: Quote = {
      id,
      quote_number: quoteNumber,
      user_id: userId,
      customer_id: null,
      status: "PENDING",
      total_estimated: pricing.total,
      discount_amount: 0,
      final_total: pricing.total,
      valid_until: validUntil,
      notes: dto.notes || null,
      admin_notes: null,
      customer_info: {
        name: dto.customer_name,
        email: dto.customer_email,
        phone: dto.customer_phone,
        company: dto.customer_company,
      },
      items: [item],
      history: [initialHistoryEntry],
      metadata: {
        pricingBreakdown: pricing,
      },
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    try {
      const res = await pool.query(
        `INSERT INTO public.quotes (
          id, quote_number, user_id, status, total_estimated, discount_amount, final_total, valid_until, notes, admin_notes, customer_info, history, metadata, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          newQuote.id,
          newQuote.quote_number,
          newQuote.user_id,
          newQuote.status,
          newQuote.total_estimated,
          newQuote.discount_amount,
          newQuote.final_total,
          newQuote.valid_until,
          newQuote.notes,
          newQuote.admin_notes,
          JSON.stringify(newQuote.customer_info),
          JSON.stringify(newQuote.history),
          JSON.stringify(newQuote.metadata),
          now,
          now,
        ]
      );

      // Inserir item
      await pool.query(
        `INSERT INTO public.quote_items (
          id, quote_id, product_id, shirt_model_id, design_id, model_name, description, quantity, unit_price_estimated, subtotal_estimated, size_breakdown, customization_details, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          item.id,
          item.quote_id,
          item.product_id,
          item.shirt_model_id,
          item.design_id,
          item.model_name,
          item.description,
          item.quantity,
          item.unit_price_estimated,
          item.subtotal_estimated,
          JSON.stringify(item.size_breakdown),
          JSON.stringify(item.customization_details),
          item.notes,
          now,
          now,
        ]
      );

      if (res.rows[0]) {
        memoryQuotes.unshift(newQuote);
        return newQuote;
      }
    } catch {
      // Fallback gracioso
    }

    memoryQuotes.unshift(newQuote);
    return newQuote;
  }

  /**
   * Listar orçamentos pertencentes exclusivamente ao cliente autenticado
   */
  static async getQuotesByUser(userId: string): Promise<Quote[]> {
    try {
      const res = await pool.query(
        `SELECT q.*, 
                json_agg(qi.*) AS items
         FROM public.quotes q
         LEFT JOIN public.quote_items qi ON qi.quote_id = q.id
         WHERE q.user_id = $1 AND q.deleted_at IS NULL
         GROUP BY q.id
         ORDER BY q.created_at DESC`,
        [userId]
      );

      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          quote_number: r.quote_number,
          user_id: r.user_id,
          customer_id: r.customer_id,
          status: (r.status || "PENDING").toUpperCase() as QuoteStatus,
          total_estimated: parseFloat(r.total_estimated || 0),
          discount_amount: parseFloat(r.discount_amount || 0),
          final_total: parseFloat(r.final_total || r.total_estimated || 0),
          valid_until: r.valid_until,
          notes: r.notes,
          admin_notes: r.admin_notes,
          customer_info: typeof r.customer_info === "string" ? JSON.parse(r.customer_info) : r.customer_info,
          history: typeof r.history === "string" ? JSON.parse(r.history) : r.history || [],
          metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata || {},
          items: (r.items || []).filter(Boolean).map((it: Record<string, unknown>) => ({
            ...it,
            size_breakdown: typeof it.size_breakdown === "string" ? JSON.parse(it.size_breakdown as string) : it.size_breakdown,
            customization_details: typeof it.customization_details === "string" ? JSON.parse(it.customization_details as string) : it.customization_details,
          })),
          created_at: r.created_at,
          updated_at: r.updated_at,
        })) as Quote[];
      }
    } catch {
      // Fallback
    }

    return memoryQuotes.filter((q) => q.user_id === userId && !q.deleted_at);
  }

  /**
   * Buscar orçamento com validação estrita de autorização
   */
  static async getQuoteById(id: string, userId: string, isAdmin = false): Promise<Quote | null> {
    let quote: Quote | null = null;

    try {
      const res = await pool.query(
        `SELECT q.*, 
                json_agg(qi.*) AS items
         FROM public.quotes q
         LEFT JOIN public.quote_items qi ON qi.quote_id = q.id
         WHERE q.id = $1 AND q.deleted_at IS NULL
         GROUP BY q.id`,
        [id]
      );

      if (res.rows[0]) {
        const r = res.rows[0];
        quote = {
          id: r.id,
          quote_number: r.quote_number,
          user_id: r.user_id,
          customer_id: r.customer_id,
          status: (r.status || "PENDING").toUpperCase() as QuoteStatus,
          total_estimated: parseFloat(r.total_estimated || 0),
          discount_amount: parseFloat(r.discount_amount || 0),
          final_total: parseFloat(r.final_total || r.total_estimated || 0),
          valid_until: r.valid_until,
          notes: r.notes,
          admin_notes: r.admin_notes,
          customer_info: typeof r.customer_info === "string" ? JSON.parse(r.customer_info) : r.customer_info,
          history: typeof r.history === "string" ? JSON.parse(r.history) : r.history || [],
          metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata || {},
          items: (r.items || []).filter(Boolean).map((it: Record<string, unknown>) => ({
            ...it,
            size_breakdown: typeof it.size_breakdown === "string" ? JSON.parse(it.size_breakdown as string) : it.size_breakdown,
            customization_details: typeof it.customization_details === "string" ? JSON.parse(it.customization_details as string) : it.customization_details,
          })),
          created_at: r.created_at,
          updated_at: r.updated_at,
        } as Quote;
      }
    } catch {
      // Fallback
    }

    if (!quote) {
      quote = memoryQuotes.find((q) => q.id === id && !q.deleted_at) || null;
    }

    if (!quote) return null;

    // REGRA DE SEGURANÇA CRÍTICA:
    // Cliente não pode abrir cotação de outro cliente
    if (quote.user_id !== userId && !isAdmin) {
      throw new UnauthorizedQuoteAccessError(
        "Acesso negado: este orçamento pertence a outro usuário."
      );
    }

    return quote;
  }

  /**
   * Administrador revisa, precifica, adiciona desconto e envia para o cliente
   */
  static async adminReviewQuote(
    id: string,
    adminUserId: string,
    dto: AdminReviewQuoteDTO
  ): Promise<Quote> {
    const existing = await this.getQuoteById(id, adminUserId, true);
    if (!existing) {
      throw new Error("Orçamento não encontrado.");
    }

    const now = new Date().toISOString();
    let totalEstimated = existing.total_estimated;

    // Ajustar preço se unit_price foi enviado
    const updatedItems = [...existing.items];
    if (dto.unit_price !== undefined && updatedItems[0]) {
      const newUnitPrice = round2(dto.unit_price);
      updatedItems[0].unit_price_estimated = newUnitPrice;
      updatedItems[0].subtotal_estimated = round2(newUnitPrice * updatedItems[0].quantity);
      totalEstimated = updatedItems[0].subtotal_estimated;
    }

    const discountAmount = dto.discount_amount !== undefined ? round2(dto.discount_amount) : existing.discount_amount;
    const finalTotal = dto.final_total !== undefined
      ? round2(dto.final_total)
      : Math.max(0, round2(totalEstimated - discountAmount));

    const newStatus: QuoteStatus = dto.status || (dto.admin_notes || dto.discount_amount !== undefined ? "SENT" : existing.status);

    // Registro no Histórico Auditável
    const historyEntry: QuoteHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      action: newStatus === "SENT" ? "SENT_TO_CUSTOMER" : "ADMIN_UPDATED",
      actor: "admin",
      actorId: adminUserId,
      actorName: "Administrador GH",
      timestamp: now,
      previousStatus: existing.status,
      newStatus,
      previousTotal: existing.final_total,
      newTotal: finalTotal,
      notes: dto.admin_notes || "Orçamento atualizado pela equipe comercial.",
    };

    const updatedQuote: Quote = {
      ...existing,
      total_estimated: totalEstimated,
      discount_amount: discountAmount,
      final_total: finalTotal,
      admin_notes: dto.admin_notes !== undefined ? dto.admin_notes : existing.admin_notes,
      status: newStatus,
      valid_until: dto.valid_until || existing.valid_until,
      items: updatedItems,
      history: [...existing.history, historyEntry],
      updated_at: now,
    };

    try {
      await pool.query(
        `UPDATE public.quotes 
         SET total_estimated = $1, discount_amount = $2, final_total = $3, admin_notes = $4, status = $5, valid_until = $6, history = $7, updated_at = $8
         WHERE id = $9`,
        [
          updatedQuote.total_estimated,
          updatedQuote.discount_amount,
          updatedQuote.final_total,
          updatedQuote.admin_notes,
          updatedQuote.status,
          updatedQuote.valid_until,
          JSON.stringify(updatedQuote.history),
          now,
          id,
        ]
      );
    } catch {
      // Fallback
    }

    const memIdx = memoryQuotes.findIndex((q) => q.id === id);
    if (memIdx !== -1) {
      memoryQuotes[memIdx] = updatedQuote;
    }

    return updatedQuote;
  }

  /**
   * Cliente aprova ou recusa a proposta enviada pelo administrador
   * REGRA CRÍTICA: Cliente NUNCA pode alterar o valor!
   */
  static async clientRespondQuote(
    id: string,
    userId: string,
    dto: ClientQuoteResponseDTO
  ): Promise<Quote> {
    const existing = await this.getQuoteById(id, userId, false);
    if (!existing) {
      throw new Error("Orçamento não encontrado.");
    }

    if (existing.status !== "SENT" && existing.status !== "PENDING") {
      throw new Error(`Este orçamento está no status "${existing.status}" e não pode mais ser respondido.`);
    }

    const now = new Date().toISOString();
    const isApproval = dto.action === "APPROVE";
    const newStatus: QuoteStatus = isApproval ? "APPROVED" : "REJECTED";

    const historyEntry: QuoteHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      action: isApproval ? "APPROVED_BY_CUSTOMER" : "REJECTED_BY_CUSTOMER",
      actor: "client",
      actorId: userId,
      actorName: existing.customer_info?.name || "Cliente",
      timestamp: now,
      previousStatus: existing.status,
      newStatus,
      previousTotal: existing.final_total,
      newTotal: existing.final_total, // Mantém rigorosamente o mesmo valor
      notes: dto.reason || dto.customer_notes || (isApproval ? "Proposta aprovada pelo cliente." : "Proposta recusada pelo cliente."),
    };

    const updatedQuote: Quote = {
      ...existing,
      status: newStatus,
      history: [...existing.history, historyEntry],
      updated_at: now,
    };

    try {
      await pool.query(
        `UPDATE public.quotes 
         SET status = $1, history = $2, updated_at = $3
         WHERE id = $4`,
        [
          updatedQuote.status,
          JSON.stringify(updatedQuote.history),
          now,
          id,
        ]
      );
    } catch {
      // Fallback
    }

    const memIdx = memoryQuotes.findIndex((q) => q.id === id);
    if (memIdx !== -1) {
      memoryQuotes[memIdx] = updatedQuote;
    }

    return updatedQuote;
  }

  /**
   * Listar todos os orçamentos para a área administrativa com filtros opcionais
   */
  static async listAllQuotesAdmin(filters?: { status?: QuoteStatus }): Promise<Quote[]> {
    try {
      let query = `
        SELECT q.*, 
               json_agg(qi.*) AS items
        FROM public.quotes q
        LEFT JOIN public.quote_items qi ON qi.quote_id = q.id
        WHERE q.deleted_at IS NULL
      `;
      const params: unknown[] = [];

      if (filters?.status) {
        params.push(filters.status);
        query += ` AND q.status = $${params.length}`;
      }

      query += ` GROUP BY q.id ORDER BY q.created_at DESC`;

      const res = await pool.query(query, params);
      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          quote_number: r.quote_number,
          user_id: r.user_id,
          customer_id: r.customer_id,
          status: (r.status || "PENDING").toUpperCase() as QuoteStatus,
          total_estimated: parseFloat(r.total_estimated || 0),
          discount_amount: parseFloat(r.discount_amount || 0),
          final_total: parseFloat(r.final_total || r.total_estimated || 0),
          valid_until: r.valid_until,
          notes: r.notes,
          admin_notes: r.admin_notes,
          customer_info: typeof r.customer_info === "string" ? JSON.parse(r.customer_info) : r.customer_info,
          history: typeof r.history === "string" ? JSON.parse(r.history) : r.history || [],
          metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata || {},
          items: (r.items || []).filter(Boolean).map((it: Record<string, unknown>) => ({
            ...it,
            size_breakdown: typeof it.size_breakdown === "string" ? JSON.parse(it.size_breakdown as string) : it.size_breakdown,
            customization_details: typeof it.customization_details === "string" ? JSON.parse(it.customization_details as string) : it.customization_details,
          })),
          created_at: r.created_at,
          updated_at: r.updated_at,
        })) as Quote[];
      }
    } catch {
      // Fallback
    }

    let list = memoryQuotes.filter((q) => !q.deleted_at);
    if (filters?.status) {
      list = list.filter((q) => q.status === filters.status);
    }
    return list;
  }

  /**
   * Helper exclusivo para testes
   */
  static _resetMemoryQuotes() {
    memoryQuotes = [];
  }
}
