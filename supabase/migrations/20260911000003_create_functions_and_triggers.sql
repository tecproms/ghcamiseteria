-- ==============================================================================
-- MIGRATION 03: FUNCTIONS & TRIGGERS
-- GH Camiseteria & Uniformes Personalizados
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Função e Triggers para Atualização Automática de updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicação do trigger em todas as tabelas com updated_at
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'profiles',
        'companies',
        'customers',
        'categories',
        'fabrics',
        'colors',
        'products',
        'product_variants',
        'shirt_models',
        'shirt_views',
        'shirt_zones',
        'design_templates',
        'designs',
        'design_elements',
        'quotes',
        'quote_items',
        'orders',
        'order_items',
        'team_members',
        'production_orders',
        'production_steps',
        'payments'
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

-- ------------------------------------------------------------------------------
-- 2. Trigger de Sincronização de Novos Usuários (auth.users -> public.profiles)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        avatar_url,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'nome_completo', split_part(NEW.email, '@', 1)),
        'cliente',
        NEW.raw_user_meta_data->>'avatar_url',
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = now();

    RETURN NEW;
END;
$$;

-- Criar o trigger após inserção em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. Funções Auxiliares de Permissão (Security Definer para RLS)
-- ------------------------------------------------------------------------------

-- Verifica se o usuário atual é Administrador ou Gerente
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('admin', 'gerente')
          AND deleted_at IS NULL
    );
END;
$$;

-- Verifica se o usuário atual faz parte da equipe de Produção ou Admin
CREATE OR REPLACE FUNCTION public.is_production_staff()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('admin', 'gerente', 'producao')
          AND deleted_at IS NULL
    );
END;
$$;

-- Obtém os IDs de customers vinculados ao usuário autenticado atual
CREATE OR REPLACE FUNCTION public.get_current_customer_ids()
RETURNS TABLE (customer_id UUID)
SECURITY DEFINER
SET search_path = public
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT id FROM public.customers
    WHERE user_id = auth.uid()
      AND deleted_at IS NULL;
END;
$$;
