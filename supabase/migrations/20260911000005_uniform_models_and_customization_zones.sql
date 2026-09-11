-- ==============================================================================
-- MIGRATION: MODELOS DE UNIFORME, VISTAS E ZONAS DE PERSONALIZAÇÃO
-- Data: 2026-09-11
-- Compatível com PostgreSQL padrão e Supabase
-- ==============================================================================

-- 1. Garante colunas necessárias em shirt_models
ALTER TABLE public.shirt_models ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.shirt_models ADD COLUMN IF NOT EXISTS base_asset_url TEXT;
ALTER TABLE public.shirt_models ALTER COLUMN product_id DROP NOT NULL;

-- 2. Garante colunas de suporte a SVG e customização em shirt_views
ALTER TABLE public.shirt_views ADD COLUMN IF NOT EXISTS svg_overlay_url TEXT;
ALTER TABLE public.shirt_views ADD COLUMN IF NOT EXISTS svg_content TEXT;

-- 3. Garante colunas de configuração de zonas em shirt_zones
ALTER TABLE public.shirt_zones ADD COLUMN IF NOT EXISTS zone_type VARCHAR(50) NOT NULL DEFAULT 'PERSONALIZADO';
ALTER TABLE public.shirt_zones ADD COLUMN IF NOT EXISTS rotation NUMERIC(6, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.shirt_zones ADD COLUMN IF NOT EXISTS min_scale NUMERIC(4, 2) NOT NULL DEFAULT 0.20;
ALTER TABLE public.shirt_zones ADD COLUMN IF NOT EXISTS max_scale NUMERIC(4, 2) NOT NULL DEFAULT 3.00;
ALTER TABLE public.shirt_zones ADD COLUMN IF NOT EXISTS allowed_element_types TEXT[] NOT NULL DEFAULT '{LOGO,TEXT,NUMBER,IMAGE}';
ALTER TABLE public.shirt_zones ADD COLUMN IF NOT EXISTS svg_path TEXT;
ALTER TABLE public.shirt_zones ADD COLUMN IF NOT EXISTS svg_bounds JSONB;

-- 4. Índices para performance nas consultas de modelos e zonas
CREATE INDEX IF NOT EXISTS idx_shirt_views_model_id ON public.shirt_views(shirt_model_id);
CREATE INDEX IF NOT EXISTS idx_shirt_zones_view_id ON public.shirt_zones(shirt_view_id);
CREATE INDEX IF NOT EXISTS idx_shirt_zones_type ON public.shirt_zones(zone_type);
