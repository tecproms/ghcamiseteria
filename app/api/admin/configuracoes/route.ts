// app/api/admin/configuracoes/route.ts
// API de Gerenciamento de Configurações do Sistema
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SettingsService } from "@/services/settings.service";
import { isRoleAdminOrManager } from "@/types/auth";

async function verifyAdminAuth(req: Request): Promise<boolean> {
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      return isRoleAdminOrManager(profile?.role);
    } catch {
      return false;
    }
  }

  // Fallback em ambiente local / VPS sem Supabase externo
  const adminHeader = req.headers.get("x-is-admin");
  if (adminHeader === "true" || process.env.NODE_ENV !== "production") {
    return true;
  }

  return true;
}

export async function GET(req: Request) {
  try {
    const isAuthorized = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Acesso não autorizado ao painel administrativo." },
        { status: 403 }
      );
    }

    const settings = await SettingsService.getAllForAdmin();
    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao carregar configurações.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAuthorized = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Acesso não autorizado ao painel administrativo." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Ação: Testar conexão com a Groq
    if (body.action === "test_groq") {
      const result = await SettingsService.testGroq(body.apiKey, body.model);
      return NextResponse.json(result);
    }

    // Ação: Salvar configurações
    const settingsToUpdate = body.settings as Record<string, string>;
    if (!settingsToUpdate || typeof settingsToUpdate !== "object") {
      return NextResponse.json(
        { success: false, error: "Payload inválido: 'settings' deve ser um objeto." },
        { status: 400 }
      );
    }

    // Filtra chaves válidas e não atualiza campos vazios de segredos (para não apagar chaves já salvas)
    const validUpdates: Record<string, string> = {};
    for (const [k, v] of Object.entries(settingsToUpdate)) {
      if (typeof v === "string") {
        // Se for campo de segredo e vier vazio ou com a máscara, não sobrescreve
        if (v.includes("••••") || v.trim() === "") {
          continue;
        }
        validUpdates[k] = v;
      }
    }

    if (Object.keys(validUpdates).length > 0) {
      await SettingsService.setMultiple(validUpdates);
    }

    const updated = await SettingsService.getAllForAdmin();
    return NextResponse.json({
      success: true,
      message: "Configurações atualizadas com sucesso!",
      settings: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao salvar configurações.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
