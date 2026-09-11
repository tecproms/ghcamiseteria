export type CategoriaProduto =
  | "camisetas"
  | "polos"
  | "moletons"
  | "uniformes_profissionais"
  | "esportivos"
  | "acessorios";

export type Produto = {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  categoria: CategoriaProduto;
  tecido_padrao?: string | null;
  composicao?: string | null;
  preco_base: number;
  grade_tamanhos: string[];
  cores_disponiveis: string[];
  ativo: boolean;
  imagem_url?: string | null;
  tabela_medidas_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateProdutoDTO = Omit<Produto, "id" | "created_at" | "updated_at">;
export type UpdateProdutoDTO = Partial<CreateProdutoDTO>;
