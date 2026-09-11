// app/api/auth/signup/route.ts
// Cadastro direto de novos usuários no PostgreSQL (public.profiles)
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword, createSessionToken } from "@/lib/auth-server";
import type { UserRole } from "@/types/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const fullName = (body.fullName || "").trim();
    const phone = (body.phone || "").trim();
    const role: UserRole = body.role || "cliente";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Informe um e-mail válido." },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { success: false, error: "Por favor, informe seu nome completo ou razão social." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    // Verificar se já existe perfil com este e-mail
    const checkUser = await pool.query(
      "SELECT id FROM public.profiles WHERE email = $1 AND deleted_at IS NULL",
      [email]
    );

    if (checkUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Este e-mail já está cadastrado. Faça login ou recupere sua senha." },
        { status: 409 }
      );
    }

    // Gerar hash de senha seguro via scrypt
    const passwordHash = hashPassword(password);

    // Inserir novo perfil
    const insertRes = await pool.query(
      `INSERT INTO public.profiles (email, full_name, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, phone, role, avatar_url, created_at, updated_at`,
      [email, fullName, passwordHash, phone || null, role]
    );

    const newUser = insertRes.rows[0];

    // Gerar token de sessão assinado
    const token = createSessionToken({
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
      phone: newUser.phone,
    });

    const response = NextResponse.json({
      success: true,
      user: newUser,
      session: {
        access_token: token,
        token_type: "bearer",
        user: newUser,
      },
    });

    // Definir cookie seguro de sessão
    response.cookies.set("gh_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Erro no cadastro de usuário:", err);
    const msg = err instanceof Error ? err.message : "Erro interno ao cadastrar usuário.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
