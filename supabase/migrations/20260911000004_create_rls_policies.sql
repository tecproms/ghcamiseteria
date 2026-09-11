-- ==============================================================================
-- MIGRATION 04: ROW LEVEL SECURITY (RLS) POLICIES
-- GH Camiseteria & Uniformes Personalizados
-- ==============================================================================

-- Habilitação obrigatória de RLS em todas as 21 tabelas
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

-- ==============================================================================
-- 1. POLÍTICAS DE PERFIS (PROFILES)
-- ==============================================================================
CREATE POLICY "Profiles: Admins possuem acesso total"
    ON public.profiles FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Profiles: Usuários podem visualizar seu próprio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Profiles: Usuários podem atualizar seu próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- 2. POLÍTICAS DE EMPRESAS (COMPANIES) & CLIENTES (CUSTOMERS)
-- ==============================================================================
CREATE POLICY "Companies: Admins possuem acesso total"
    ON public.companies FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Companies: Usuários autenticados podem cadastrar empresa"
    ON public.companies FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Companies: Clientes vinculados podem ver e editar sua empresa"
    ON public.companies FOR ALL
    USING (
        id IN (SELECT company_id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
    );

CREATE POLICY "Customers: Admins possuem acesso total"
    ON public.customers FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Customers: Usuário acessa e edita seu próprio registro de cliente"
    ON public.customers FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ==============================================================================
-- 3. POLÍTICAS DO CATÁLOGO BASE (LEITURA PÚBLICA / ESCRITA ADMIN)
-- ==============================================================================

-- Categories
CREATE POLICY "Categories: Leitura pública para itens ativos"
    ON public.categories FOR SELECT
    USING (is_active = true AND deleted_at IS NULL OR public.is_admin());

CREATE POLICY "Categories: Escrita restrita a administradores"
    ON public.categories FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Fabrics
CREATE POLICY "Fabrics: Leitura pública para itens ativos"
    ON public.fabrics FOR SELECT
    USING (is_active = true AND deleted_at IS NULL OR public.is_admin());

CREATE POLICY "Fabrics: Escrita restrita a administradores"
    ON public.fabrics FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Colors
CREATE POLICY "Colors: Leitura pública para cores ativas"
    ON public.colors FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Colors: Escrita restrita a administradores"
    ON public.colors FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Sizes
CREATE POLICY "Sizes: Leitura pública para tamanhos ativos"
    ON public.sizes FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Sizes: Escrita restrita a administradores"
    ON public.sizes FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Products
CREATE POLICY "Products: Leitura pública para produtos ativos"
    ON public.products FOR SELECT
    USING (is_active = true AND deleted_at IS NULL OR public.is_admin());

CREATE POLICY "Products: Escrita restrita a administradores"
    ON public.products FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Product Variants
CREATE POLICY "Product Variants: Leitura pública para variações ativas"
    ON public.product_variants FOR SELECT
    USING (is_active = true AND deleted_at IS NULL OR public.is_admin());

CREATE POLICY "Product Variants: Escrita restrita a administradores"
    ON public.product_variants FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Shirt Models
CREATE POLICY "Shirt Models: Leitura pública para modelos ativos"
    ON public.shirt_models FOR SELECT
    USING (is_active = true AND deleted_at IS NULL OR public.is_admin());

CREATE POLICY "Shirt Models: Escrita restrita a administradores"
    ON public.shirt_models FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Shirt Views & Zones
CREATE POLICY "Shirt Views: Leitura pública de vistas"
    ON public.shirt_views FOR SELECT
    USING (true);

CREATE POLICY "Shirt Views: Escrita restrita a administradores"
    ON public.shirt_views FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Shirt Zones: Leitura pública de zonas ativas"
    ON public.shirt_zones FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Shirt Zones: Escrita restrita a administradores"
    ON public.shirt_zones FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Design Templates
CREATE POLICY "Design Templates: Leitura de templates públicos"
    ON public.design_templates FOR SELECT
    USING (is_public = true AND deleted_at IS NULL OR public.is_admin());

CREATE POLICY "Design Templates: Escrita restrita a administradores"
    ON public.design_templates FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ==============================================================================
-- 4. POLÍTICAS DE DESIGNS & PERSONALIZAÇÃO DO CLIENTE
-- ==============================================================================
CREATE POLICY "Designs: Admins possuem acesso total"
    ON public.designs FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Designs: Clientes gerenciam exclusivamente seus próprios designs"
    ON public.designs FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Design Elements: Admins possuem acesso total"
    ON public.design_elements FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Design Elements: Clientes gerenciam elementos de seus próprios designs"
    ON public.design_elements FOR ALL
    USING (
        design_id IN (SELECT id FROM public.designs WHERE user_id = auth.uid() AND deleted_at IS NULL)
    )
    WITH CHECK (
        design_id IN (SELECT id FROM public.designs WHERE user_id = auth.uid() AND deleted_at IS NULL)
    );

-- ==============================================================================
-- 5. POLÍTICAS DO COMERCIAL (ORÇAMENTOS & PEDIDOS)
-- ==============================================================================

-- Quotes
CREATE POLICY "Quotes: Admins possuem acesso total"
    ON public.quotes FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Quotes: Clientes visualizam e criam seus próprios orçamentos"
    ON public.quotes FOR ALL
    USING (
        user_id = auth.uid() OR
        customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
    )
    WITH CHECK (
        user_id = auth.uid() OR
        customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
    );

-- Quote Items
CREATE POLICY "Quote Items: Admins possuem acesso total"
    ON public.quote_items FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Quote Items: Clientes acessam itens de seus orçamentos"
    ON public.quote_items FOR ALL
    USING (
        quote_id IN (
            SELECT id FROM public.quotes
            WHERE user_id = auth.uid()
               OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
        )
    )
    WITH CHECK (
        quote_id IN (
            SELECT id FROM public.quotes
            WHERE user_id = auth.uid()
               OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
        )
    );

-- Orders
CREATE POLICY "Orders: Admins possuem acesso total"
    ON public.orders FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Orders: Clientes visualizam seus próprios pedidos"
    ON public.orders FOR SELECT
    USING (
        user_id = auth.uid() OR
        customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
    );

CREATE POLICY "Orders: Clientes podem criar pedidos para si mesmos"
    ON public.orders FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Order Items
CREATE POLICY "Order Items: Admins possuem acesso total"
    ON public.order_items FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Order Items: Clientes visualizam itens de seus pedidos"
    ON public.order_items FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM public.orders
            WHERE user_id = auth.uid()
               OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
        )
    );

-- ==============================================================================
-- 6. POLÍTICAS DE EQUIPE (TEAM MEMBERS)
-- ==============================================================================
CREATE POLICY "Team Members: Admins possuem acesso total"
    ON public.team_members FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Team Members: Clientes gerenciam exclusivamente seus integrantes"
    ON public.team_members FOR ALL
    USING (
        customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
    )
    WITH CHECK (
        customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
    );

-- ==============================================================================
-- 7. POLÍTICAS DE PRODUÇÃO & FÁBRICA
-- ==============================================================================
CREATE POLICY "Production: Equipe de fábrica e admins possuem acesso total"
    ON public.production_orders FOR ALL
    USING (public.is_production_staff())
    WITH CHECK (public.is_production_staff());

CREATE POLICY "Production: Clientes podem acompanhar status da OP de seus pedidos"
    ON public.production_orders FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM public.orders
            WHERE user_id = auth.uid()
               OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
        )
    );

CREATE POLICY "Production Steps: Equipe de fábrica e admins possuem acesso total"
    ON public.production_steps FOR ALL
    USING (public.is_production_staff())
    WITH CHECK (public.is_production_staff());

CREATE POLICY "Production Steps: Clientes podem acompanhar etapas da OP de seus pedidos"
    ON public.production_steps FOR SELECT
    USING (
        production_order_id IN (
            SELECT po.id FROM public.production_orders po
            JOIN public.orders o ON o.id = po.order_id
            WHERE o.user_id = auth.uid()
               OR o.customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
        )
    );

-- ==============================================================================
-- 8. POLÍTICAS DE ARQUIVOS (FILES) & PAGAMENTOS (PAYMENTS)
-- ==============================================================================
CREATE POLICY "Files: Admins possuem acesso total"
    ON public.files FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Files: Clientes gerenciam apenas seus próprios arquivos"
    ON public.files FOR ALL
    USING (
        user_id = auth.uid() OR
        customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
    )
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Payments: Admins possuem acesso total"
    ON public.payments FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Payments: Clientes visualizam pagamentos de seus pedidos"
    ON public.payments FOR SELECT
    USING (
        customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
    );
