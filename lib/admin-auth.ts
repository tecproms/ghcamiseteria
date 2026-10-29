import crypto from "crypto";
import { cookies } from "next/headers";

const ADMIN_SECRET =
  process.env.ADMIN_SECRET || "gh-camiseteria-admin-master-key-2026-secret";
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "ghadmin2026";

/**
 * Valida a senha informada
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  return password.trim() === ADMIN_PASSWORD;
}

/**
 * Cria token de sessão administrativa assinado com HMAC-SHA256
 */
export function createAdminToken(): string {
  const payload = {
    role: "admin",
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 dias
  };
  const str = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(str)
    .digest("base64url");
  return `${str}.${signature}`;
}

/**
 * Valida se o token de sessão é autêntico e não expirou
 */
export function verifyAdminToken(token: string): boolean {
  try {
    if (!token || !token.includes(".")) return false;
    const [payloadB64, signature] = token.split(".");
    const expectedSig = crypto
      .createHmac("sha256", ADMIN_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (signature !== expectedSig) return false;

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );
    if (!payload.exp || Date.now() > payload.exp) return false;
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Verifica autenticação de um request
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("gh_admin_session")?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
