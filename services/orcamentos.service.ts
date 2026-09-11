import { createClient } from "@/lib/supabase/client";
import type { Orcamento, CreateOrcamentoDTO, UpdateOrcamentoDTO, StatusOrcamento } from "@/types/orcamentos";

export class OrcamentosService {
  private static getClient() {
    return createClient();
  }

  static async getAll(filtros?: { status?: StatusOrcamento }): Promise<Orcamento[]> {
    const supabase = this.getClient();
    let query = supabase.from("orcamentos").select("*").order("created_at", { ascending: false });

    if (filtros?.status) {
      query = query.eq("status", filtros.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Orcamento[];
  }

  static async getById(id: string): Promise<Orcamento | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("orcamentos").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as Orcamento | null;
  }

  static async create(orcamento: CreateOrcamentoDTO): Promise<Orcamento> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("orcamentos").insert(orcamento).select().single();
    if (error) throw error;
    return data as Orcamento;
  }

  static async updateStatus(id: string, status: StatusOrcamento): Promise<Orcamento> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("orcamentos")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Orcamento;
  }

  static async update(id: string, orcamento: UpdateOrcamentoDTO): Promise<Orcamento> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("orcamentos").update(orcamento).eq("id", id).select().single();
    if (error) throw error;
    return data as Orcamento;
  }
}
