-- ==============================================================================
-- MIGRATION 02: TABLES, CONSTRAINTS & INDEXES
-- GH Camiseteria & Uniformes Personalizados
-- ==============================================================================

-- ==============================================================================
-- 1. MÓDULO USUÁRIOS & EMPRESAS
-- ==============================================================================

-- Tabela de Perfis (vinculada à auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'cliente',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_profile_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Tabela de Empresas (Pessoas Jurídicas)
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

-- Tabela de Clientes (vinculada a perfil individual ou empresa)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- ==============================================================================
-- 2. MÓDULO CATÁLOGO & MATERIAIS
-- ==============================================================================

-- Categorias de Produtos
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

-- Tecidos e Composições
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

-- Paleta de Cores
CREATE TABLE IF NOT EXISTS public.colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    hex_code VARCHAR(7) NOT NULL CHECK (hex_code ~* '^#[0-9A-Fa-f]{6}$'),
    pantone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Grade de Tamanhos
CREATE TABLE IF NOT EXISTS public.sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(10) NOT NULL,
    category size_category NOT NULL DEFAULT 'adulto_unissex',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Produtos Base
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

-- Variações de Produtos (Tecido + Cor + Tamanho)
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

-- ==============================================================================
-- 3. MÓDULO MODELOS DE UNIFORME & ÁREAS TÉCNICAS
-- ==============================================================================

-- Modelos de Uniforme Base
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

-- Vistas do Modelo (Frente, Costas, Mangas)
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

-- Zonas de Aplicação / Impressão
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

-- ==============================================================================
-- 4. MÓDULO CONFIGURAÇÕES & PROJETOS VISUAIS
-- ==============================================================================

-- Modelos Prontos de Inspiração (Templates)
CREATE TABLE IF NOT EXISTS public.design_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shirt_model_id UUID NOT NULL REFERENCES public.shirt_models(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    category TEXT,
    thumbnail_url TEXT,
    template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Projetos / Uniformes Personalizados do Cliente
CREATE TABLE IF NOT EXISTS public.designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shirt_model_id UUID NOT NULL REFERENCES public.shirt_models(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    status design_status NOT NULL DEFAULT 'draft',
    preview_thumbnail_url TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Elementos de Design (Camadas de Texto, Imagens e Formas)
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

-- ==============================================================================
-- 5. MÓDULO COMERCIAL (ORÇAMENTOS & PEDIDOS)
-- ==============================================================================

-- Orçamentos Comerciais
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- Pedidos Concluídos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
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

-- Itens do Pedido com Grade
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

-- ==============================================================================
-- 6. MÓDULO EQUIPE (MEMBROS DA EMPRESA CLIENTE)
-- ==============================================================================

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

-- ==============================================================================
-- 7. MÓDULO PRODUÇÃO & ESTEIRA FABRIL
-- ==============================================================================

-- Ordens de Produção (OP)
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

-- Etapas da Ordem de Produção
CREATE TABLE IF NOT EXISTS public.production_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
    step_name production_step_name NOT NULL,
    status step_status NOT NULL DEFAULT 'not_started',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 8. MÓDULO ARQUIVOS & ANEXOS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- ==============================================================================
-- 9. MÓDULO PAGAMENTOS
-- ==============================================================================

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

-- ==============================================================================
-- 10. ÍNDICES DE PERFORMANCE (B-TREE)
-- ==============================================================================

-- Índices Profiles & Clientes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON public.customers(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_document ON public.customers(document);
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON public.companies(cnpj);

-- Índices Catálogo
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

-- Índices Modelos & Zonas
CREATE INDEX IF NOT EXISTS idx_shirt_models_product_id ON public.shirt_models(product_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_shirt_views_model_id ON public.shirt_views(shirt_model_id);
CREATE INDEX IF NOT EXISTS idx_shirt_zones_view_id ON public.shirt_zones(shirt_view_id);

-- Índices Designs
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON public.designs(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_designs_customer_id ON public.designs(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_designs_shirt_model_id ON public.designs(shirt_model_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_design_elements_design_id ON public.design_elements(design_id);

-- Índices Comercial
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON public.quotes(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON public.quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Índices Equipe
CREATE INDEX IF NOT EXISTS idx_team_members_customer_id ON public.team_members(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_company_id ON public.team_members(company_id) WHERE deleted_at IS NULL;

-- Índices Produção
CREATE INDEX IF NOT EXISTS idx_production_orders_order_id ON public.production_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON public.production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_steps_order_id ON public.production_steps(production_order_id);
CREATE INDEX IF NOT EXISTS idx_production_steps_assigned_to ON public.production_steps(assigned_to);

-- Índices Arquivos & Pagamentos
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_files_customer_id ON public.files(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_files_entity ON public.files(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
