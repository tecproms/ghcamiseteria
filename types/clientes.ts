export type TipoPessoa = "PF" | "PJ";

export type Cliente = {
  id: string;
  user_id?: string | null;
  tipo_pessoa: TipoPessoa;
  nome_razao_social: string;
  nome_fantasia?: string | null;
  cpf_cnpj: string;
  inscricao_estadual?: string | null;
  email: string;
  telefone: string;
  whatsapp?: string | null;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  observacoes?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateClienteDTO = Omit<Cliente, "id" | "created_at" | "updated_at">;
export type UpdateClienteDTO = Partial<CreateClienteDTO>;
