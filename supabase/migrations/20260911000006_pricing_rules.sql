-- ==============================================================================
-- MIGRATION 06: TABELA DE REGRAS DE PRECIFICAÇÃO (PRICING RULES)
-- GH Camiseteria & Uniformes Personalizados
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version INTEGER NOT NULL DEFAULT 1,
    config JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Inserir regras padrão da fábrica caso a tabela esteja vazia
INSERT INTO public.pricing_rules (version, config, is_active)
SELECT 
    1,
    '{
      "baseProductPrice": 35.00,
      "modelOverrides": {},
      "elementTypes": {
        "LOGO": 5.00,
        "TEXT": 4.00,
        "NUMBER": 4.00,
        "IMAGE": 6.00
      },
      "positions": {
        "FRONT": 0.00,
        "BACK": 3.00,
        "LEFT_SLEEVE": 2.50,
        "RIGHT_SLEEVE": 2.50,
        "OTHER": 0.00
      },
      "volumeDiscounts": [
        { "minQuantity": 1, "maxQuantity": 19, "discountPercent": 0, "label": "1 a 19 peças (Tabela padrão)" },
        { "minQuantity": 20, "maxQuantity": 49, "discountPercent": 10, "label": "20 a 49 peças - 10% OFF" },
        { "minQuantity": 50, "maxQuantity": 99, "discountPercent": 15, "label": "50 a 99 peças - 15% OFF" },
        { "minQuantity": 100, "maxQuantity": null, "discountPercent": 20, "label": "100+ peças - 20% OFF (Atacado)" }
      ],
      "teamMemberIndividualFee": 3.00,
      "additionalSetupFee": 0.00
    }'::jsonb,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_rules WHERE is_active = true);
