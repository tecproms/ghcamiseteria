-- ==============================================================================
-- MIGRATION 07: EXTENSÃO DO MÓDULO DE ORÇAMENTOS (QUOTES & QUOTE ITEMS)
-- GH Camiseteria & Uniformes Personalizados
-- ==============================================================================

-- 1. Garantir colunas adicionais em public.quotes
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS final_total NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS customer_info JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Garantir colunas adicionais em public.quote_items
ALTER TABLE public.quote_items ADD COLUMN IF NOT EXISTS model_name TEXT;
ALTER TABLE public.quote_items ADD COLUMN IF NOT EXISTS customization_details JSONB DEFAULT '{}'::jsonb;

-- 3. Índices para performance nas consultas de cotações
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON public.quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_design_id ON public.quote_items(design_id);
