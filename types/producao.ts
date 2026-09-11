export type EtapaProducao =
  | "corte"
  | "estampagem"
  | "bordado"
  | "costura"
  | "acabamento"
  | "conferencia_embalagem"
  | "finalizado";

export type StatusEtapa = "nao_iniciada" | "em_andamento" | "pausada" | "concluida" | "rejeitada";

export type HistoricoProducao = {
  id: string;
  ordem_producao_id: string;
  etapa: EtapaProducao;
  status: StatusEtapa;
  responsavel_id?: string | null;
  observacoes?: string | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  created_at: string;
};

export type OrdemProducao = {
  id: string;
  codigo: string;
  pedido_id: string;
  etapa_atual: EtapaProducao;
  status_etapa_atual: StatusEtapa;
  prioridade: "baixa" | "normal" | "alta" | "urgente";
  data_inicio_prevista?: string | null;
  data_termino_prevista?: string | null;
  data_conclusao?: string | null;
  observacoes_tecnicas?: string | null;
  historico?: HistoricoProducao[];
  created_at: string;
  updated_at: string;
};

export type CreateOrdemProducaoDTO = Omit<OrdemProducao, "id" | "created_at" | "updated_at">;
export type UpdateOrdemProducaoDTO = Partial<CreateOrdemProducaoDTO>;
