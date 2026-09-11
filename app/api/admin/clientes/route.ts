// app/api/admin/clientes/route.ts
// Listagem e busca de clientes reais cadastrados no PostgreSQL (public.profiles)
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase();

    let queryText = `
      SELECT 
        p.id,
        p.email,
        p.full_name,
        p.phone,
        p.role,
        p.created_at,
        COUNT(o.id)::int as orders_count,
        COALESCE(SUM(o.total_price), 0)::float as total_spent
      FROM public.profiles p
      LEFT JOIN public.orders o ON (o.customer_email = p.email OR o.customer_id = p.id)
      WHERE p.deleted_at IS NULL
    `;

    const params: unknown[] = [];

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (LOWER(p.full_name) LIKE $1 OR LOWER(p.email) LIKE $1 OR p.phone LIKE $1)`;
    }

    queryText += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const res = await pool.query(queryText, params);

    return NextResponse.json({
      success: true,
      clients: res.rows,
      total: res.rows.length,
    });
  } catch (err: unknown) {
    console.error("Erro ao listar clientes:", err);
    const msg = err instanceof Error ? err.message : "Erro ao consultar base de clientes.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
