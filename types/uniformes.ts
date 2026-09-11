export type TipoGola = "careca" | "v" | "polo" | "padre" | "henley";
export type TipoManga = "curta" | "longa" | "raglan" | "regata";
export type TipoPersonalizacao = "silkscreen" | "bordado" | "dtf" | "sublimacao";

export type AreaPersonalizacao = {
  id: string;
  localizacao: "frente" | "costas" | "manga_esquerda" | "manga_direita" | "peito";
  tipo: TipoPersonalizacao;
  dimensao_largura_cm?: number;
  dimensao_altura_cm?: number;
  arte_url?: string | null;
  observacoes?: string | null;
};

export type UniformeModelo = {
  id: string;
  produto_id: string;
  nome: string;
  tipo_gola: TipoGola;
  tipo_manga: TipoManga;
  cor_principal: string;
  cor_secundaria?: string | null;
  cor_detalhes?: string | null;
  tecido: string;
  configuracao_areas: AreaPersonalizacao[];
  preview_frente_url?: string | null;
  preview_costas_url?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateUniformeDTO = Omit<UniformeModelo, "id" | "created_at" | "updated_at">;
export type UpdateUniformeDTO = Partial<CreateUniformeDTO>;
