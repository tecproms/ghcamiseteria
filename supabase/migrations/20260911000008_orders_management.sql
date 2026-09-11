-- ==============================================================================
-- MIGRATION 08: EXTENSÃO DO MÓDULO DE PEDIDOS (ORDERS & ORDER ITEMS)
-- GH Camiseteria & Uniformes Personalizados
-- ==============================================================================

-- 1. Garantir colunas adicionais em public.orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quote_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_info JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Garantir colunas adicionais em public.order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS model_name TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS color JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS snapshot_data JSONB DEFAULT '{}'::jsonb;

-- 3. Índices para consultas de pedidos
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_quote_id ON public.orders(quote_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);