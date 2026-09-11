-- ==============================================================================
-- MIGRATION 10: MÓDULO OPERACIONAL DE PRODUÇÃO FABRIL
-- GH Camiseteria & Uniformes Personalizados
-- ==============================================================================

-- 1. Tabela de Ordens de Produção (production_orders)
CREATE TABLE IF NOT EXISTS public.production_orders (
  id TEXT PRIMARY KEY,
  production_number TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  current_step TEXT NOT NULL DEFAULT 'PEDIDO_RECEBIDO',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_pieces INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  factory_notes TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Etapas da Produção (production_steps)
CREATE TABLE IF NOT EXISTS public.production_steps (
  id TEXT PRIMARY KEY,
  production_order_id TEXT NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  operator_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices de performance
CREATE INDEX IF NOT EXISTS idx_production_orders_order_id ON public.production_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_current_step ON public.production_orders(current_step);
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON public.production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_steps_op_id ON public.production_steps(production_order_id);
CREATE INDEX IF NOT EXISTS idx_production_steps_step_key ON public.production_steps(step_key);
