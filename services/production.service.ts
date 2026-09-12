// services/production.service.ts
// Serviço Operacional de Produção Fabril
// GH Camiseteria & Uniformes Personalizados

import { pool } from "@/lib/db";
import { OrdersService } from "@/services/orders.service";
import {
  PRODUCTION_STEPS_CONFIG,
  type ProductionOrder,
  type ProductionStep,
  type ProductionStepKey,
  type ProductionStepStatus,
  type CreateProductionOrderDTO,
  type UpdateProductionStepDTO,
} from "@/types/production";
import type { OrderSnapshot } from "@/types/orders";

// Memória local de fallback para testes e operação resiliente
let memoryProductionOrders: ProductionOrder[] = [];

export class ProductionService {
  /**
   * Gerar número sequencial amigável da Ordem de Produção (Ex: OP-2026-0001)
   */
  private static generateProductionNumber(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `OP-${year}-${rand}`;
  }

  /**
   * Criar nova Ordem de Produção a partir de um Pedido Pago
   */
  static async createProductionOrder(
    dto: CreateProductionOrderDTO,
    adminUserId = "admin-system"
  ): Promise<ProductionOrder> {
    const order = await OrdersService.getOrderById(dto.order_id, adminUserId, true);
    if (!order) {
      throw new Error("Pedido de origem não encontrado.");
    }

    // REGRA ESTREITA: Somente pedidos pagos podem entrar em produção
    const isPaid =
      order.status === "PAID" ||
      order.payment_status === "APPROVED" ||
      order.payment_status === "PAID";

    if (!isPaid) {
      throw new Error(
        `Somente pedidos com pagamento confirmado (PAID) podem entrar na produção. Status atual: "${order.status}" / Pagamento: "${order.payment_status}".`
      );
    }

    // Verificar se já existe OP ativa para este pedido
    const existingOP = await this.getProductionOrderByOrderId(order.id);
    if (existingOP && existingOP.status === "ACTIVE") {
      return existingOP;
    }

    const opId = `op-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const opNumber = this.generateProductionNumber();
    const now = new Date().toISOString();

    const firstItem = order.items?.[0];
    const snapshot: OrderSnapshot = firstItem?.snapshot_data
      ? JSON.parse(JSON.stringify(firstItem.snapshot_data))
      : {
          version: 1,
          model_name: firstItem?.model_name || "Uniforme Personalizado",
          color: firstItem?.color || { id: "default", name: "Padrão", hex: "#FFFFFF" },
          quantity: firstItem?.quantity || 1,
          size_breakdown: firstItem?.size_breakdown || {},
          views: {},
          approved_at: now,
        };

    const totalPieces =
      order.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) || 1;

    // Inicialização rigorosa das 9 Etapas Oficiais
    const steps: ProductionStep[] = PRODUCTION_STEPS_CONFIG.map((cfg) => {
      const isFirst = cfg.order === 1;
      return {
        id: `step-${opId}-${cfg.key.toLowerCase()}`,
        production_order_id: opId,
        step_key: cfg.key,
        step_order: cfg.order,
        label: cfg.label,
        status: isFirst ? "IN_PROGRESS" : "PENDING",
        started_at: isFirst ? now : null,
        completed_at: null,
        operator_name: isFirst ? "Sistema / Recepção Fabril" : null,
        notes: isFirst ? "Entrada na esteira operacional de produção." : null,
      };
    });

    const productionOrder: ProductionOrder = {
      id: opId,
      production_number: opNumber,
      order_id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_info?.name || "Cliente GH",
      customer_phone: order.customer_info?.phone,
      customer_email: order.customer_info?.email,
      current_step: "PEDIDO_RECEBIDO",
      status: "ACTIVE",
      priority: dto.priority || "NORMAL",
      snapshot,
      total_pieces: totalPieces,
      notes: order.notes,
      factory_notes: dto.factory_notes || null,
      steps,
      started_at: now,
      completed_at: null,
      created_at: now,
      updated_at: now,
    };

    // Atualiza status do pedido original para IN_PRODUCTION se ainda não estiver
    if (order.status !== "IN_PRODUCTION") {
      try {
        await OrdersService.updateOrderStatus(order.id, adminUserId, {
          status: "IN_PRODUCTION",
          admin_notes: `Ordem de produção ${opNumber} iniciada na fábrica.`,
        });
      } catch {
        // Fallback silencioso
      }
    }

    // Persistência no Banco PostgreSQL
    try {
      await pool.query(
        `INSERT INTO public.production_orders
         (id, production_number, order_id, order_number, customer_name, customer_phone, customer_email,
          current_step, status, priority, snapshot, total_pieces, notes, factory_notes, started_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          productionOrder.id,
          productionOrder.production_number,
          productionOrder.order_id,
          productionOrder.order_number,
          productionOrder.customer_name,
          productionOrder.customer_phone,
          productionOrder.customer_email,
          productionOrder.current_step,
          productionOrder.status,
          productionOrder.priority,
          JSON.stringify(productionOrder.snapshot),
          productionOrder.total_pieces,
          productionOrder.notes,
          productionOrder.factory_notes,
          now,
          now,
          now,
        ]
      );

      for (const step of steps) {
        await pool.query(
          `INSERT INTO public.production_steps
           (id, production_order_id, step_key, step_order, label, status, started_at, completed_at, operator_name, notes, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            step.id,
            step.production_order_id,
            step.step_key,
            step.step_order,
            step.label,
            step.status,
            step.started_at,
            step.completed_at,
            step.operator_name,
            step.notes,
            now,
            now,
          ]
        );
      }
    } catch {
      // Fallback para ambiente local/em-memória
    }

    memoryProductionOrders.unshift(productionOrder);
    return productionOrder;
  }

  /**
   * Buscar Ordem de Produção por ID do Pedido
   */
  static async getProductionOrderByOrderId(orderId: string): Promise<ProductionOrder | null> {
    try {
      const res = await pool.query(
        `SELECT po.*,
                json_agg(ps.* ORDER BY ps.step_order ASC) AS steps
         FROM public.production_orders po
         LEFT JOIN public.production_steps ps ON ps.production_order_id = po.id
         WHERE po.order_id = $1
         GROUP BY po.id
         LIMIT 1`,
        [orderId]
      );
      if (res.rows[0]) {
        return this.mapRowToProductionOrder(res.rows[0]);
      }
    } catch {
      // Fallback
    }

    return memoryProductionOrders.find((po) => po.order_id === orderId) || null;
  }

  /**
   * Buscar Ordem de Produção por ID com todos os passos
   */
  static async getProductionOrderById(id: string): Promise<ProductionOrder | null> {
    try {
      const res = await pool.query(
        `SELECT po.*,
                json_agg(ps.* ORDER BY ps.step_order ASC) AS steps
         FROM public.production_orders po
         LEFT JOIN public.production_steps ps ON ps.production_order_id = po.id
         WHERE po.id = $1
         GROUP BY po.id`,
        [id]
      );
      if (res.rows[0]) {
        return this.mapRowToProductionOrder(res.rows[0]);
      }
    } catch {
      // Fallback
    }

    return memoryProductionOrders.find((po) => po.id === id) || null;
  }

  /**
   * Listar Ordens de Produção com filtros
   */
  static async listProductionOrders(filters?: {
    step?: ProductionStepKey;
    status?: string;
    search?: string;
  }): Promise<ProductionOrder[]> {
    try {
      let query = `
        SELECT po.*,
               json_agg(ps.* ORDER BY ps.step_order ASC) AS steps
        FROM public.production_orders po
        LEFT JOIN public.production_steps ps ON ps.production_order_id = po.id
        WHERE 1=1
      `;
      const params: unknown[] = [];

      if (filters?.step) {
        params.push(filters.step);
        query += ` AND po.current_step = $${params.length}`;
      }

      if (filters?.status && filters.status !== "ALL") {
        params.push(filters.status);
        query += ` AND po.status = $${params.length}`;
      }

      if (filters?.search) {
        params.push(`%${filters.search.toLowerCase()}%`);
        query += ` AND (LOWER(po.production_number) LIKE $${params.length} OR LOWER(po.order_number) LIKE $${params.length} OR LOWER(po.customer_name) LIKE $${params.length})`;
      }

      query += ` GROUP BY po.id ORDER BY po.created_at DESC`;

      const res = await pool.query(query, params);
      if (res.rows.length > 0) {
        return res.rows.map((r) => this.mapRowToProductionOrder(r));
      }
    } catch {
      // Fallback
    }

    let list = [...memoryProductionOrders];
    if (filters?.step) {
      list = list.filter((po) => po.current_step === filters.step);
    }
    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((po) => po.status === filters.status);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (po) =>
          po.production_number.toLowerCase().includes(s) ||
          po.order_number.toLowerCase().includes(s) ||
          po.customer_name.toLowerCase().includes(s)
      );
    }
    return list;
  }

  /**
   * Atualizar status e notas de uma etapa da produção fabril
   */
  static async updateProductionStep(
    productionOrderId: string,
    dto: UpdateProductionStepDTO,
    adminUserId = "admin-system"
  ): Promise<ProductionOrder> {
    const po = await this.getProductionOrderById(productionOrderId);
    if (!po) {
      throw new Error("Ordem de Produção não encontrada.");
    }

    const now = new Date().toISOString();
    const targetStepIndex = po.steps.findIndex((s) => s.step_key === dto.step_key);
    if (targetStepIndex === -1) {
      throw new Error(`Etapa "${dto.step_key}" não encontrada na Ordem de Produção.`);
    }

    const targetStep = po.steps[targetStepIndex];
    targetStep.status = dto.status;
    if (dto.operator_name) targetStep.operator_name = dto.operator_name;
    if (dto.notes) targetStep.notes = dto.notes;

    if (dto.status === "IN_PROGRESS" && !targetStep.started_at) {
      targetStep.started_at = now;
    }
    if (dto.status === "COMPLETED") {
      targetStep.completed_at = now;

      // Avançar esteira para a próxima etapa caso exista
      const nextStepIndex = targetStepIndex + 1;
      if (nextStepIndex < po.steps.length) {
        const nextStep = po.steps[nextStepIndex];
        po.current_step = nextStep.step_key;
        if (nextStep.status === "PENDING") {
          nextStep.status = "IN_PROGRESS";
          nextStep.started_at = now;
        }
      } else {
        // Todas as etapas foram completadas (9ª Etapa: PRONTO)
        po.current_step = "PRONTO";
        po.status = "COMPLETED";
        po.completed_at = now;

        // Atualiza o pedido original para READY
        try {
          await OrdersService.updateOrderStatus(po.order_id, adminUserId, {
            status: "READY",
            admin_notes: `Produção concluída pela fábrica (OP ${po.production_number}). Pronto para envio/retirada.`,
          });
        } catch {
          // Fallback
        }
      }
    }

    po.updated_at = now;

    // Atualizar no PostgreSQL
    try {
      await pool.query(
        `UPDATE public.production_steps
         SET status = $1, operator_name = $2, notes = $3, started_at = $4, completed_at = $5, updated_at = $6
         WHERE id = $7`,
        [
          targetStep.status,
          targetStep.operator_name,
          targetStep.notes,
          targetStep.started_at,
          targetStep.completed_at,
          now,
          targetStep.id,
        ]
      );

      await pool.query(
        `UPDATE public.production_orders
         SET current_step = $1, status = $2, completed_at = $3, updated_at = $4
         WHERE id = $5`,
        [po.current_step, po.status, po.completed_at, now, po.id]
      );
    } catch {
      // Fallback
    }

    const memIdx = memoryProductionOrders.findIndex((o) => o.id === po.id);
    if (memIdx !== -1) {
      memoryProductionOrders[memIdx] = po;
    }

    return po;
  }

  /**
   * Listar pedidos pagos elegíveis para gerar Ordem de Produção
   */
  static async listEligiblePaidOrders(): Promise<{
    id: string;
    order_number: string;
    customer_name: string;
    total_amount: number;
    total_pieces: number;
    created_at: string;
    has_op: boolean;
  }[]> {
    const allOrders = await OrdersService.listAllOrdersAdmin();
    const paidOrders = allOrders.filter(
      (o) =>
        o.status === "PAID" ||
        o.payment_status === "APPROVED" ||
        o.payment_status === "PAID"
    );

    const activeOPs = await this.listProductionOrders();
    const activeOrderIds = new Set(activeOPs.map((op) => op.order_id));

    return paidOrders.map((o) => {
      const firstItem = o.items?.[0];
      return {
        id: o.id,
        order_number: o.order_number,
        customer_name: o.customer_info?.name || "Cliente",
        total_amount: o.total_amount,
        total_pieces: firstItem?.quantity || 1,
        created_at: o.created_at,
        has_op: activeOrderIds.has(o.id),
      };
    });
  }

  private static mapRowToProductionOrder(r: Record<string, unknown>): ProductionOrder {
    return {
      id: r.id as string,
      production_number: r.production_number as string,
      order_id: r.order_id as string,
      order_number: r.order_number as string,
      customer_name: r.customer_name as string,
      customer_phone: r.customer_phone as string | undefined,
      customer_email: r.customer_email as string | undefined,
      current_step: (r.current_step || "PEDIDO_RECEBIDO") as ProductionStepKey,
      status: (r.status || "ACTIVE") as "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED",
      priority: (r.priority || "NORMAL") as "NORMAL" | "HIGH" | "URGENT",
      snapshot:
        typeof r.snapshot === "string"
          ? JSON.parse(r.snapshot as string)
          : (r.snapshot as OrderSnapshot) || {},
      total_pieces: parseInt(String(r.total_pieces || 1), 10),
      notes: r.notes as string | undefined,
      factory_notes: r.factory_notes as string | undefined,
      started_at: r.started_at as string | undefined,
      completed_at: r.completed_at as string | undefined,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
      steps: ((r.steps as Record<string, unknown>[]) || []).map((s) => ({
        id: s.id as string,
        production_order_id: s.production_order_id as string,
        step_key: s.step_key as ProductionStepKey,
        step_order: parseInt(String(s.step_order || 1), 10),
        label: s.label as string,
        status: (s.status || "PENDING") as ProductionStepStatus,
        started_at: s.started_at as string | undefined,
        completed_at: s.completed_at as string | undefined,
        operator_name: s.operator_name as string | undefined,
        notes: s.notes as string | undefined,
      })),
    };
  }

  /**
   * Helper exclusivo para testes automatizados
   */
  static _seedProductionOrderForTesting(po: ProductionOrder): void {
    memoryProductionOrders = memoryProductionOrders.filter((p) => p.id !== po.id && p.order_id !== po.order_id);
    memoryProductionOrders.unshift(po);
  }

  static _clearProductionOrdersForTesting(): void {
    memoryProductionOrders = [];
  }
}
