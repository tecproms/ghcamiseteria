// lib/auth-server.ts
// Autenticação Segura Nativa PostgreSQL (aaPanel / VPS / Ubuntu)
// GH Camiseteria & Uniformes Personalizados

import crypto from "crypto";
import { pool } from "@/lib/db";
import type { UserProfile, UserRole } from "@/types/auth";

const AUTH_SECRET = process.env.AUTH_SECRET || "gh-camiseteria-secure-jwt-key-2026-secret";

/**
 * Gera hash seguro de senha utilizando scrypt nativo do Node.js
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifica se a senha informada corresponde ao hash scrypt armazenado
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, "hex");
    return crypto.timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}

export interface SessionPayload {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string | null;
  exp: number;
}

/**
 * Cria token de sessão assinado com HMAC-SHA256
 */
export function createSessionToken(user: {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string | null;
}): string {
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    phone: user.phone || null,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 dias
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Valida o token de sessão e retorna os dados do usuário autenticado
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extrai o usuário da requisição através do cookie gh_session ou Header Authorization
 */
export async function getAuthUserFromRequest(
  req: Request
): Promise<UserProfile | null> {
  let token: string | null = null;

  // 1. Tentar ler do Header Authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  // 2. Tentar ler dos cookies da requisição
  if (!token) {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/gh_session=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  try {
    // Buscar perfil atualizado no banco PostgreSQL
    const res = await pool.query(
      "SELECT id, email, full_name, phone, role, avatar_url, created_at, updated_at FROM public.profiles WHERE id = $1 AND deleted_at IS NULL",
      [payload.id]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0] as UserProfile;
  } catch {
    // Fallback com os dados do próprio token válido
    return {
      id: payload.id,
      email: payload.email,
      full_name: payload.full_name,
      phone: payload.phone || null,
      role: payload.role,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}
