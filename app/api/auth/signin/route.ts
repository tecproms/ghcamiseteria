// app/api/auth/signin/route.ts
// Login de usuários no PostgreSQL (public.profiles)
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyPassword, hashPassword, createSessionToken } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Informe e-mail e senha." },
        { status: 400 }
      );
    }

    // Buscar perfil no PostgreSQL
    const res = await pool.query(
      `SELECT id, email, full_name, password_hash, phone, role, avatar_url, created_at, updated_at
       FROM public.profiles
       WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const user = res.rows[0];

    // Se o usuário já tiver hash, verificar com scrypt
    let isValid = false;
    if (user.password_hash) {
      isValid = verifyPassword(password, user.password_hash);
    } else {
      // Caso legado de seed sem hash: permitir o primeiro login e salvar o hash
      isValid = true;
      const newHash = hashPassword(password);
      await pool.query(
        "UPDATE public.profiles SET password_hash = $1 WHERE id = $2",
        [newHash, user.id]
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    // Remover password_hash do retorno
    delete user.password_hash;

    // Gerar token de sessão
    const token = createSessionToken({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
    });

    const response = NextResponse.json({
      success: true,
      user,
      session: {
        access_token: token,
        token_type: "bearer",
        user,
      },
    });

    response.cookies.set("gh_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Erro no login de usuário:", err);
    const msg = err instanceof Error ? err.message : "Erro interno ao processar login.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
