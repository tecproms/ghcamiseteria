import { createClient } from "@/lib/supabase/client";
import type { Produto, CreateProdutoDTO, UpdateProdutoDTO, CategoriaProduto } from "@/types/produtos";

export class ProdutosService {
  private static getClient() {
    return createClient();
  }

  static async getAll(filtros?: { categoria?: CategoriaProduto; ativo?: boolean }): Promise<Produto[]> {
    const supabase = this.getClient();
    let query = supabase.from("produtos").select("*").order("nome", { ascending: true });

    if (filtros?.categoria) {
      query = query.eq("categoria", filtros.categoria);
    }
    if (filtros?.ativo !== undefined) {
      query = query.eq("ativo", filtros.ativo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Produto[];
  }

  static async getById(id: string): Promise<Produto | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("produtos").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as Produto | null;
  }

  static async getBySlug(slug: string): Promise<Produto | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("produtos").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data as Produto | null;
  }

  static async create(produto: CreateProdutoDTO): Promise<Produto> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("produtos").insert(produto).select().single();
    if (error) throw error;
    return data as Produto;
  }

  static async update(id: string, produto: UpdateProdutoDTO): Promise<Produto> {
    const supabase = this.getClient();
    const { data, error } = await supabase.from("produtos").update(produto).eq("id", id).select().single();
    if (error) throw error;
    return data as Produto;
  }
}
