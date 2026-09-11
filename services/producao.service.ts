import { createClient } from "@/lib/supabase/client";
import type {
  OrdemProducao,
  CreateOrdemProducaoDTO,
  UpdateOrdemProducaoDTO,
  EtapaProducao,
  StatusEtapa,
} from "@/types/producao";

export class ProducaoService {
  private static getClient() {
    return createClient();
  }

  static async getAll(filtros?: {
    etapa?: EtapaProducao;
    prioridade?: "baixa" | "normal" | "alta" | "urgente";
  }): Promise<OrdemProducao[]> {
    const supabase = this.getClient();
    let query = supabase
      .from("ordens_producao")
      .select("*, historico:producao_historico(*)")
      .order("created_at", { ascending: false });

    if (filtros?.etapa) {
      query = query.eq("etapa_atual", filtros.etapa);
    }
    if (filtros?.prioridade) {
      query = query.eq("prioridade", filtros.prioridade);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as OrdemProducao[];
  }

  static async getById(id: string): Promise<OrdemProducao | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("ordens_producao")
      .select("*, historico:producao_historico(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as OrdemProducao | null;
  }

  static async create(ordem: CreateOrdemProducaoDTO): Promise<OrdemProducao> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("ordens_producao").insert(ordem).select().single();
    if (error) throw error;
    return data as OrdemProducao;
  }

  static async update(id: string, ordem: UpdateOrdemProducaoDTO): Promise<OrdemProducao> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("ordens_producao").update(ordem).eq("id", id).select().single();
    if (error) throw error;
    return data as OrdemProducao;
  }

  static async updateEtapa(
    id: string,
    etapa: EtapaProducao,
    status: StatusEtapa,
    observacoes?: string
  ): Promise<OrdemProducao> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("ordens_producao")
      .update({
        etapa_atual: etapa,
        status_etapa_atual: status,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Registra no histórico de produção
    await supabase.from("producao_historico").insert({
      ordem_producao_id: id,
      etapa,
      status,
      observacoes: observacoes || null,
      data_inicio: new Date().toISOString(),
    });

    return data as OrdemProducao;
  }
}
