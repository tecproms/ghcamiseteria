import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminPassword, createAdminToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Senha administrativa incorreta." },
        { status: 401 }
      );
    }

    const token = createAdminToken();

    const cookieStore = await cookies();
    cookieStore.set("gh_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Acesso autorizado" });
  } catch (error) {
    console.error("Erro interno ao processar login:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar login." },
      { status: 500 }
    );
  }
}
