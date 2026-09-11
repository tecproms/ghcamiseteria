// app/api/admin/dashboard/stats/route.ts
// API de Consolidação de Métricas Reais do Dashboard Administrativo
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import { DashboardService } from "@/services/dashboard.service";
import type { DashboardFilters } from "@/types/dashboard";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const period = (url.searchParams.get("period") || "all") as DashboardFilters["period"];
    const status = url.searchParams.get("status") || undefined;
    const client = url.searchParams.get("client") || undefined;
    const product = url.searchParams.get("product") || undefined;

    const stats = await DashboardService.getStats({
      period,
      status,
      client,
      product,
    });

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao carregar estatísticas do painel";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
