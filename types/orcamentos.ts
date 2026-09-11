export type StatusOrcamento = "novo" | "em_analise" | "enviado" | "aprovado" | "recusado" | "expirado";

export type ItemOrcamento = {
  produto_id?: string | null;
  descricao: string;
  tipo_tecido?: string | null;
  tipo_personalizacao?: string | null;
  quantidade_estimada: number;
  grade_sugerida?: Record<string, number>;
  preco_unitario_estimado?: number | null;
  subtotal_estimado?: number | null;
};

export type Orcamento = {
  id: string;
  codigo: string;
  cliente_id?: string | null;
  nome_contato: string;
  email_contato: string;
  telefone_contato: string;
  empresa?: string | null;
  itens: ItemOrcamento[];
  valor_total_estimado?: number | null;
  status: StatusOrcamento;
  validade_dias: number;
  observacoes?: string | null;
  pedido_gerado_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateOrcamentoDTO = Omit<Orcamento, "id" | "created_at" | "updated_at">;
export type UpdateOrcamentoDTO = Partial<CreateOrcamentoDTO>;
