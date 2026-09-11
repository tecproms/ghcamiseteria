import { createClient } from "@/lib/supabase/client";
import type { Cliente, CreateClienteDTO, UpdateClienteDTO } from "@/types/clientes";

export class ClientesService {
  private static getClient() {
    return createClient();
  }

  static async getAll(filtros?: { ativo?: boolean; busca?: string }): Promise<Cliente[]> {
    const supabase = this.getClient();
    let query = supabase.from("clientes").select("*").order("nome_razao_social", { ascending: true });

    if (filtros?.ativo !== undefined) {
      query = query.eq("ativo", filtros.ativo);
    }
    if (filtros?.busca) {
      query = query.or(`nome_razao_social.ilike.%${filtros.busca}%,cpf_cnpj.ilike.%${filtros.busca}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Cliente[];
  }

  static async getById(id: string): Promise<Cliente | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("clientes").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as Cliente | null;
  }

  static async create(cliente: CreateClienteDTO): Promise<Cliente> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("clientes").insert(cliente).select().single();
    if (error) throw error;
    return data as Cliente;
  }

  static async update(id: string, cliente: UpdateClienteDTO): Promise<Cliente> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("clientes").update(cliente).eq("id", id).select().single();
    if (error) throw error;
    return data as Cliente;
  }
}
