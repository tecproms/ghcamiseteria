import { createClient } from "@/lib/supabase/client";
import type { Pedido, CreatePedidoDTO, UpdatePedidoDTO, StatusPedido } from "@/types/pedidos";

export class PedidosService {
  private static getClient() {
    return createClient();
  }

  static async getAll(filtros?: { status?: StatusPedido; clienteId?: string }): Promise<Pedido[]> {
    const supabase = this.getClient();
    let query = supabase
      .from("pedidos")
      .select("*, itens:pedidos_itens(*)")
      .order("created_at", { ascending: false });

    if (filtros?.status) {
      query = query.eq("status", filtros.status);
    }
    if (filtros?.clienteId) {
      query = query.eq("cliente_id", filtros.clienteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Pedido[];
  }

  static async getById(id: string): Promise<Pedido | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("pedidos")
      .select("*, itens:pedidos_itens(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as Pedido | null;
  }

  static async create(pedido: CreatePedidoDTO): Promise<Pedido> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("pedidos").insert(pedido).select().single();
    if (error) throw error;
    return data as Pedido;
  }

  static async updateStatus(id: string, status: StatusPedido): Promise<Pedido> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("pedidos")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Pedido;
  }

  static async update(id: string, pedido: UpdatePedidoDTO): Promise<Pedido> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("pedidos").update(pedido).eq("id", id).select().single();
    if (error) throw error;
    return data as Pedido;
  }
}
