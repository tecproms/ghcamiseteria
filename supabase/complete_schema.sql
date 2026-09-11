-- ==============================================================================
-- SCHEMA COMPLETO DO BANCO DE DADOS POSTGRESQL
-- GH Camiseteria & Uniformes Personalizados
-- 100% Compatível com PostgreSQL padrão (aaPanel / VPS / Ubuntu) e Supabase
-- Executa perfeitamente sem necessidade de privilégios de superuser
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('cliente', 'admin', 'gerente', 'producao', 'atendimento');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE customer_type AS ENUM ('PF', 'PJ');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE collar_type AS ENUM ('careca', 'v', 'polo', 'padre', 'henley');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE sleeve_type AS ENUM ('curta', 'longa', 'raglan', 'regata');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE view_side AS ENUM ('front', 'back', 'left_sleeve', 'right_sleeve');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE print_method AS ENUM ('silkscreen', 'bordado', 'dtf', 'sublimacao');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE size_category AS ENUM ('adulto_unissex', 'feminino', 'infantil', 'plus_size');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE quote_status AS ENUM ('draft', 'pending_analysis', 'sent', 'approved', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending_payment', 'approved', 'in_production', 'ready_for_shipping', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'refunded', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('pix', 'credit_card', 'boleto', 'bank_transfer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE production_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE production_step_name AS ENUM ('cut', 'print_embroidery', 'sewing', 'finishing', 'qc_packing');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE step_status AS ENUM ('not_started', 'in_progress', 'paused', 'completed', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE production_order_status AS ENUM ('pending', 'in_progress', 'paused', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE design_status AS ENUM ('draft', 'saved', 'ordered', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE design_element_type AS ENUM ('text', 'image', 'shape');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE file_entity_type AS ENUM ('design', 'quote', 'order', 'company', 'avatar', 'tech_pack');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- 2. TABELAS (PUBLIC SCHEMA)
-- ------------------------------------------------------------------------------

-- Perfis de Usuários
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    password_hash TEXT,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'cliente',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_profile_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Empresas
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    legal_name TEXT NOT NULL,
    trade_name TEXT,
    state_registration TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    cep VARCHAR(9) NOT NULL,
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    complement TEXT,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    state VARCHAR(2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Clientes
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    customer_type customer_type NOT NULL DEFAULT 'PF',
    full_name TEXT NOT NULL,
    document VARCHAR(18) NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    cep VARCHAR(9) NOT NULL,
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    complement TEXT,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    state VARCHAR(2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Tecidos
CREATE TABLE IF NOT EXISTS public.fabrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    composition TEXT NOT NULL,
    description TEXT,
    weight_gsm INTEGER CHECK (weight_gsm > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Cores
CREATE TABLE IF NOT EXISTS public.colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    hex_code VARCHAR(7) NOT NULL CHECK (hex_code ~* '^#[0-9A-Fa-f]{6}$'),
    pantone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tamanhos
CREATE TABLE IF NOT EXISTS public.sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(10) NOT NULL,
    category size_category NOT NULL DEFAULT 'adulto_unissex',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Produtos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (base_price >= 0),
    default_fabric_id UUID REFERENCES public.fabrics(id) ON DELETE SET NULL,
    image_url TEXT,
    size_chart_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Variações de Produto
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    fabric_id UUID NOT NULL REFERENCES public.fabrics(id) ON DELETE RESTRICT,
    color_id UUID NOT NULL REFERENCES public.colors(id) ON DELETE RESTRICT,
    size_id UUID NOT NULL REFERENCES public.sizes(id) ON DELETE RESTRICT,
    sku TEXT NOT NULL UNIQUE,
    additional_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (additional_price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_product_variant UNIQUE (product_id, fabric_id, color_id, size_id)
);

-- Modelos de Uniforme
CREATE TABLE IF NOT EXISTS public.shirt_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    collar_type collar_type NOT NULL DEFAULT 'careca',
    sleeve_type sleeve_type NOT NULL DEFAULT 'curta',
    default_color_id UUID REFERENCES public.colors(id) ON DELETE SET NULL,
    default_fabric_id UUID REFERENCES public.fabrics(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Vistas Técnicas
CREATE TABLE IF NOT EXISTS public.shirt_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shirt_model_id UUID NOT NULL REFERENCES public.shirt_models(id) ON DELETE CASCADE,
    view_side view_side NOT NULL,
    preview_image_url TEXT NOT NULL,
    canvas_width INTEGER NOT NULL DEFAULT 1200 CHECK (canvas_width > 0),
    canvas_height INTEGER NOT NULL DEFAULT 1200 CHECK (canvas_height > 0),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_shirt_view_side UNIQUE (shirt_model_id, view_side)
);

-- Zonas de Aplicação
CREATE TABLE IF NOT EXISTS public.shirt_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shirt_view_id UUID NOT NULL REFERENCES public.shirt_views(id) ON DELETE CASCADE,
    zone_name VARCHAR(50) NOT NULL,
    x NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (x >= 0),
    y NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (y >= 0),
    width NUMERIC(10, 2) NOT NULL CHECK (width > 0),
    height NUMERIC(10, 2) NOT NULL CHECK (height > 0),
    max_print_width_cm NUMERIC(6, 2) CHECK (max_print_width_cm > 0),
    max_print_height_cm NUMERIC(6, 2) CHECK (max_print_height_cm > 0),
    allowed_print_methods print_method[] NOT NULL DEFAULT '{silkscreen,bordado,dtf,sublimacao}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Templates de Design
CREATE TABLE IF NOT EXISTS public.design_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shirt_model_id UUID NOT NULL REFERENCES public.shirt_models(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    category TEXT,
    thumbnail_url TEXT,
    template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Designs Personalizados
CREATE TABLE IF NOT EXISTS public.designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    shirt_model_id UUID NOT NULL REFERENCES public.shirt_models(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    status design_status NOT NULL DEFAULT 'draft',
    preview_thumbnail_url TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Elementos do Design
CREATE TABLE IF NOT EXISTS public.design_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
    shirt_zone_id UUID REFERENCES public.shirt_zones(id) ON DELETE SET NULL,
    element_type design_element_type NOT NULL,
    element_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Orçamentos
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status quote_status NOT NULL DEFAULT 'draft',
    total_estimated NUMERIC(10, 2) DEFAULT 0.00 CHECK (total_estimated >= 0),
    valid_until TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Itens do Orçamento
CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    shirt_model_id UUID REFERENCES public.shirt_models(id) ON DELETE SET NULL,
    design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_estimated NUMERIC(10, 2) CHECK (unit_price_estimated >= 0),
    subtotal_estimated NUMERIC(10, 2) CHECK (subtotal_estimated >= 0),
    size_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status order_status NOT NULL DEFAULT 'pending_payment',
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (shipping_amount >= 0),
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_method payment_method,
    estimated_delivery_date DATE,
    delivery_date DATE,
    tracking_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Itens do Pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    shirt_model_id UUID REFERENCES public.shirt_models(id) ON DELETE SET NULL,
    design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    size_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Integrantes da Equipe
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role_title TEXT,
    size_preference VARCHAR(10),
    gender VARCHAR(20),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Ordens de Produção
CREATE TABLE IF NOT EXISTS public.production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    code TEXT NOT NULL UNIQUE,
    priority production_priority NOT NULL DEFAULT 'normal',
    current_step production_step_name NOT NULL DEFAULT 'cut',
    status production_order_status NOT NULL DEFAULT 'pending',
    start_date TIMESTAMPTZ,
    expected_end_date TIMESTAMPTZ,
    completion_date TIMESTAMPTZ,
    technical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Etapas da Produção
CREATE TABLE IF NOT EXISTS public.production_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
    step_name production_step_name NOT NULL,
    status step_status NOT NULL DEFAULT 'not_started',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Arquivos
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    entity_type file_entity_type NOT NULL,
    entity_id UUID,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Pagamentos
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    gateway_payload JSONB DEFAULT '{}'::jsonb,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. ÍNDICES DE PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON public.customers(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_document ON public.customers(document);
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON public.companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_shirt_models_product_id ON public.shirt_models(product_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_shirt_views_model_id ON public.shirt_views(shirt_model_id);
CREATE INDEX IF NOT EXISTS idx_shirt_zones_view_id ON public.shirt_zones(shirt_view_id);
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON public.designs(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_designs_customer_id ON public.designs(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON public.quotes(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_customer_id ON public.team_members(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_production_orders_order_id ON public.production_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- ------------------------------------------------------------------------------
-- 4. FUNÇÕES E TRIGGERS AUTOMÁTICOS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'profiles', 'companies', 'customers', 'categories', 'fabrics', 'colors',
        'products', 'product_variants', 'shirt_models', 'shirt_views', 'shirt_zones',
        'design_templates', 'designs', 'design_elements', 'quotes', 'quote_items',
        'orders', 'order_items', 'team_members', 'production_orders', 'production_steps', 'payments'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
        ', tbl, tbl);
    END LOOP;
END $$;

-- Função auxiliar que identifica o usuário atual de forma flexível (Supabase JWT ou PostgreSQL session)
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(COALESCE(
        current_setting('request.jwt.claim.sub', true),
        current_setting('app.current_user_id', true),
        ''
    ), '')::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = public.current_user_id()
          AND role IN ('admin', 'gerente')
          AND deleted_at IS NULL
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_production_staff()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = public.current_user_id()
          AND role IN ('admin', 'gerente', 'producao')
          AND deleted_at IS NULL
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shirt_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shirt_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shirt_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se existirem
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Profiles
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "profiles_owner_select" ON public.profiles FOR SELECT USING (public.current_user_id() = id);
CREATE POLICY "profiles_owner_update" ON public.profiles FOR UPDATE USING (public.current_user_id() = id) WITH CHECK (public.current_user_id() = id);

-- Companies & Customers
CREATE POLICY "companies_admin_all" ON public.companies FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "companies_insert" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "companies_owner" ON public.companies FOR ALL USING (id IN (SELECT company_id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL));
CREATE POLICY "customers_admin_all" ON public.customers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "customers_owner_all" ON public.customers FOR ALL USING (user_id = public.current_user_id()) WITH CHECK (user_id = public.current_user_id());

-- Catálogo Público
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (is_active = true AND deleted_at IS NULL OR public.is_admin());
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "fabrics_public_read" ON public.fabrics FOR SELECT USING (is_active = true AND deleted_at IS NULL OR public.is_admin());
CREATE POLICY "fabrics_admin_write" ON public.fabrics FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "colors_public_read" ON public.colors FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "colors_admin_write" ON public.colors FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "sizes_public_read" ON public.sizes FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "sizes_admin_write" ON public.sizes FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (is_active = true AND deleted_at IS NULL OR public.is_admin());
CREATE POLICY "products_admin_write" ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "product_variants_public_read" ON public.product_variants FOR SELECT USING (is_active = true AND deleted_at IS NULL OR public.is_admin());
CREATE POLICY "product_variants_admin_write" ON public.product_variants FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "shirt_models_public_read" ON public.shirt_models FOR SELECT USING (is_active = true AND deleted_at IS NULL OR public.is_admin());
CREATE POLICY "shirt_models_admin_write" ON public.shirt_models FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "shirt_views_public_read" ON public.shirt_views FOR SELECT USING (true);
CREATE POLICY "shirt_views_admin_write" ON public.shirt_views FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "shirt_zones_public_read" ON public.shirt_zones FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "shirt_zones_admin_write" ON public.shirt_zones FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "design_templates_public_read" ON public.design_templates FOR SELECT USING (is_public = true AND deleted_at IS NULL OR public.is_admin());
CREATE POLICY "design_templates_admin_write" ON public.design_templates FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Designs
CREATE POLICY "designs_admin_all" ON public.designs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "designs_owner_all" ON public.designs FOR ALL USING (user_id = public.current_user_id()) WITH CHECK (user_id = public.current_user_id());
CREATE POLICY "design_elements_admin_all" ON public.design_elements FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "design_elements_owner_all" ON public.design_elements FOR ALL USING (design_id IN (SELECT id FROM public.designs WHERE user_id = public.current_user_id() AND deleted_at IS NULL)) WITH CHECK (design_id IN (SELECT id FROM public.designs WHERE user_id = public.current_user_id() AND deleted_at IS NULL));

-- Comercial
CREATE POLICY "quotes_admin_all" ON public.quotes FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "quotes_owner_all" ON public.quotes FOR ALL USING (user_id = public.current_user_id() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL)) WITH CHECK (user_id = public.current_user_id() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL));
CREATE POLICY "quote_items_admin_all" ON public.quote_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "quote_items_owner_all" ON public.quote_items FOR ALL USING (quote_id IN (SELECT id FROM public.quotes WHERE user_id = public.current_user_id() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL))) WITH CHECK (quote_id IN (SELECT id FROM public.quotes WHERE user_id = public.current_user_id() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL)));
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "orders_owner_select" ON public.orders FOR SELECT USING (user_id = public.current_user_id() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL));
CREATE POLICY "orders_owner_insert" ON public.orders FOR INSERT WITH CHECK (user_id = public.current_user_id());
CREATE POLICY "order_items_admin_all" ON public.order_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "order_items_owner_select" ON public.order_items FOR SELECT USING (order_id IN (SELECT id FROM public.orders WHERE user_id = public.current_user_id() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL)));

-- Equipe
CREATE POLICY "team_members_admin_all" ON public.team_members FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "team_members_owner_all" ON public.team_members FOR ALL USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL)) WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL));

-- Produção
CREATE POLICY "production_orders_staff" ON public.production_orders FOR ALL USING (public.is_production_staff()) WITH CHECK (public.is_production_staff());
CREATE POLICY "production_orders_client_read" ON public.production_orders FOR SELECT USING (order_id IN (SELECT id FROM public.orders WHERE user_id = public.current_user_id() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL)));
CREATE POLICY "production_steps_staff" ON public.production_steps FOR ALL USING (public.is_production_staff()) WITH CHECK (public.is_production_staff());
CREATE POLICY "production_steps_client_read" ON public.production_steps FOR SELECT USING (production_order_id IN (SELECT po.id FROM public.production_orders po JOIN public.orders o ON o.id = po.order_id WHERE o.user_id = public.current_user_id() OR o.customer_id IN (SELECT id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL)));

-- Arquivos & Pagamentos
CREATE POLICY "files_admin_all" ON public.files FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "files_owner_all" ON public.files FOR ALL USING (user_id = public.current_user_id() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL)) WITH CHECK (user_id = public.current_user_id());
CREATE POLICY "payments_admin_all" ON public.payments FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "payments_client_read" ON public.payments FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = public.current_user_id() AND deleted_at IS NULL));
