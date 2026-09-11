// app/api/auth/signout/route.ts
// Encerramento de sessão com limpeza de cookies
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("gh_session");
  return response;
}
