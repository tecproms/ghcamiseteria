-- ==============================================================================
-- MIGRATION 09: INTEGRAÇÃO MERCADO PAGO (PAGAMENTOS, PIX & WEBHOOKS)
-- GH Camiseteria & Uniformes Personalizados
-- ==============================================================================

-- 1. Extensão de colunas de pagamento na tabela public.orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- 2. Garantir consistência do status de pagamento
ALTER TABLE public.orders ALTER COLUMN payment_status SET DEFAULT 'PENDING';

-- 3. Índices de busca rápida para Webhook e Conciliação
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
