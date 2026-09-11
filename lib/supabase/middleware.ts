import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isRoleAdminOrManager } from "@/types/auth";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Parameters<NextResponse["cookies"]["set"]>[2] }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api") || pathname.startsWith("/auth");
  const isAdminRoute = pathname.startsWith("/admin");
  const isCustomerPrivateRoute = pathname.startsWith("/perfil") || pathname.startsWith("/meus-pedidos");
  const isAuthRoute = pathname === "/login" || pathname === "/cadastro" || pathname === "/recuperar-senha";

  // Se for rota de API interna ou recurso de auth direto, apenas processa a sessão
  if (isApiRoute) {
    return supabaseResponse;
  }

  // Se a URL for placeholder em ambiente de teste sem variáveis configuradas, não bloqueia estaticamente
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co" || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co") {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Usuário NÃO AUTENTICADO tentando acessar área restrita (Regra 2)
  if (!user && (isAdminRoute || isCustomerPrivateRoute)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);

    const res = NextResponse.redirect(redirectUrl);
    copyCookies(supabaseResponse, res);
    return res;
  }

  // 2. Usuário AUTENTICADO tentando acessar área administrativa /admin (Regra 1 e RBAC)
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const allowed = isRoleAdminOrManager(profile?.role);
    if (!allowed) {
      // Cliente comum não pode acessar /admin: redireciona para home com aviso
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.searchParams.set("error", "unauthorized_admin");

      const res = NextResponse.redirect(redirectUrl);
      copyCookies(supabaseResponse, res);
      return res;
    }
  }

  // 3. Usuário JÁ AUTENTICADO tentando acessar tela de login/cadastro
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const redirectUrl = request.nextUrl.clone();
    const redirectToParam = request.nextUrl.searchParams.get("redirectTo");

    if (redirectToParam && !redirectToParam.startsWith("/login")) {
      redirectUrl.pathname = redirectToParam;
      redirectUrl.searchParams.delete("redirectTo");
    } else if (isRoleAdminOrManager(profile?.role)) {
      redirectUrl.pathname = "/admin/dashboard";
    } else {
      redirectUrl.pathname = "/meus-pedidos";
    }

    const res = NextResponse.redirect(redirectUrl);
    copyCookies(supabaseResponse, res);
    return res;
  }

  return supabaseResponse;
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value, cookie);
  });
}

