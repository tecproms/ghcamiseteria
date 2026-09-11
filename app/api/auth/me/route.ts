// app/api/auth/me/route.ts
// Consulta de perfil do usuário logado via sessão PostgreSQL
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, user: null, profile: null });
    }

    return NextResponse.json({
      success: true,
      user,
      profile: user,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao carregar sessão";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
