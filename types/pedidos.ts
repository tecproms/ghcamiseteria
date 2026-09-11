export type StatusPedido =
  | "pendente"
  | "aprovado"
  | "em_producao"
  | "pronto_para_envio"
  | "enviado"
  | "entregue"
  | "cancelado";

export type StatusPagamento = "aguardando" | "pago" | "parcial" | "estornado" | "recusado";

export type ItemPedidoGrade = {
  tamanho: string;
  genero?: "unissex" | "masculino" | "feminino" | "infantil";
  quantidade: number;
};

export type ItemPedido = {
  id: string;
  pedido_id: string;
  produto_id: string;
  uniforme_modelo_id?: string | null;
  descricao: string;
  grade_itens: ItemPedidoGrade[];
  quantidade_total: number;
  preco_unitario: number;
  subtotal: number;
};

export type Pedido = {
  id: string;
  codigo: string;
  cliente_id: string;
  status: StatusPedido;
  status_pagamento: StatusPagamento;
  forma_pagamento?: string | null;
  valor_total: number;
  valor_desconto?: number | null;
  valor_frete?: number | null;
  itens?: ItemPedido[];
  data_previsao_entrega?: string | null;
  data_entrega?: string | null;
  codigo_rastreamento?: string | null;
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreatePedidoDTO = Omit<Pedido, "id" | "created_at" | "updated_at">;
export type UpdatePedidoDTO = Partial<CreatePedidoDTO>;
