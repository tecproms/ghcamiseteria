-- ==============================================================================
-- MIGRATION 01: EXTENSIONS & ENUMS
-- GH Camiseteria & Uniformes Personalizados
-- ==============================================================================

-- Habilitação das extensões essenciais para UUIDs e criptografia
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Enums do Módulo de Usuários & Perfis
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'cliente',
        'admin',
        'gerente',
        'producao',
        'atendimento'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE customer_type AS ENUM (
        'PF',
        'PJ'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Enums do Módulo de Modelagem & Confecção
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE collar_type AS ENUM (
        'careca',
        'v',
        'polo',
        'padre',
        'henley'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sleeve_type AS ENUM (
        'curta',
        'longa',
        'raglan',
        'regata'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE view_side AS ENUM (
        'front',
        'back',
        'left_sleeve',
        'right_sleeve'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE print_method AS ENUM (
        'silkscreen',
        'bordado',
        'dtf',
        'sublimacao'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE size_category AS ENUM (
        'adulto_unissex',
        'feminino',
        'infantil',
        'plus_size'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 3. Enums do Módulo Comercial & Pedidos
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE quote_status AS ENUM (
        'draft',
        'pending_analysis',
        'sent',
        'approved',
        'rejected',
        'expired'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'pending_payment',
        'approved',
        'in_production',
        'ready_for_shipping',
        'shipped',
        'delivered',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'pending',
        'paid',
        'partial',
        'refunded',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'pix',
        'credit_card',
        'boleto',
        'bank_transfer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 4. Enums do Módulo de Produção & Fábrica
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE production_priority AS ENUM (
        'low',
        'normal',
        'high',
        'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE production_step_name AS ENUM (
        'cut',
        'print_embroidery',
        'sewing',
        'finishing',
        'qc_packing'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE step_status AS ENUM (
        'not_started',
        'in_progress',
        'paused',
        'completed',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE production_order_status AS ENUM (
        'pending',
        'in_progress',
        'paused',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 5. Enums do Módulo de Configurações & Arquivos
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE design_status AS ENUM (
        'draft',
        'saved',
        'ordered',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE design_element_type AS ENUM (
        'text',
        'image',
        'shape'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE file_entity_type AS ENUM (
        'design',
        'quote',
        'order',
        'company',
        'avatar',
        'tech_pack'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
