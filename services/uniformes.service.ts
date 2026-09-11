import { createClient } from "@/lib/supabase/client";
import type { UniformeModelo, CreateUniformeDTO, UpdateUniformeDTO } from "@/types/uniformes";

export class UniformesService {
  private static getClient() {
    return createClient();
  }

  static async getAll(filtros?: { produtoId?: string; ativo?: boolean }): Promise<UniformeModelo[]> {
    const supabase = this.getClient();
    let query = supabase.from("uniformes_modelos").select("*").order("nome", { ascending: true });

    if (filtros?.produtoId) {
      query = query.eq("produto_id", filtros.produtoId);
    }
    if (filtros?.ativo !== undefined) {
      query = query.eq("ativo", filtros.ativo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as UniformeModelo[];
  }

  static async getById(id: string): Promise<UniformeModelo | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("uniformes_modelos").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as UniformeModelo | null;
  }

  static async create(modelo: CreateUniformeDTO): Promise<UniformeModelo> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("uniformes_modelos").insert(modelo).select().single();
    if (error) throw error;
    return data as UniformeModelo;
  }

  static async update(id: string, modelo: UpdateUniformeDTO): Promise<UniformeModelo> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("uniformes_modelos").update(modelo).eq("id", id).select().single();
    if (error) throw error;
    return data as UniformeModelo;
  }
}
