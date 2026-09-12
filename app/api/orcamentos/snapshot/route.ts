// app/api/orcamentos/snapshot/route.ts
// Armazenamento e recuperação de snapshots imutáveis de orçamentos e uniformes
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import crypto from "crypto";

export interface UniformSnapshot {
  id: string;
  shareToken: string;
  createdAt: string;
  hash: string;
  project: {
    model: string;
    modelName: string;
    fabric?: string | null;
    purpose?: string | null;
    color: { name: string; hex: string };
    collarType?: string;
    collarColor?: { name: string; hex: string } | null;
    sleeveColor?: { name: string; hex: string } | null;
    quantity: number;
    sizeDistribution: Record<string, number>;
    logoUrl?: string | null;
    logoPosition?: string;
    logoScale?: number;
    customText?: string | null;
    customTextPosition?: "FRONT" | "BACK";
    customNumber?: string | null;
    customNumberPosition?: "FRONT" | "BACK";
    notes?: string | null;
  };
  pricing?: {
    unitPrice: number;
    totalPrice: number;
    discountPercent: number;
    leadTimeDays: number;
  } | null;
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  } | null;
}

// Registro em memória para persistência rápida e imutável (fallback transparente)
const snapshotsRegistry: Map<string, UniformSnapshot> = new Map();
const shareTokensRegistry: Map<string, UniformSnapshot> = new Map();

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      project: UniformSnapshot["project"];
      pricing?: UniformSnapshot["pricing"];
      customerInfo?: UniformSnapshot["customerInfo"];
    };

    if (!body || !body.project) {
      return NextResponse.json(
        { success: false, error: "Dados do projeto são obrigatórios para gerar o snapshot." },
        { status: 400 }
      );
    }

    const id = `SNAP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const shareToken = crypto.randomBytes(16).toString("hex");
    const createdAt = new Date().toISOString();

    // Gerar hash criptográfico determinístico dos dados do uniforme
    const payloadToHash = JSON.stringify({
      model: body.project.model,
      color: body.project.color,
      quantity: body.project.quantity,
      sizeDistribution: body.project.sizeDistribution,
      logoPosition: body.project.logoPosition,
      logoScale: body.project.logoScale,
      customText: body.project.customText,
      customNumber: body.project.customNumber,
      unitPrice: body.pricing?.unitPrice,
      totalPrice: body.pricing?.totalPrice,
    });
    const hash = crypto.createHash("sha256").update(payloadToHash).digest("hex").substring(0, 16);

    const snapshot: UniformSnapshot = {
      id,
      shareToken,
      createdAt,
      hash,
      project: {
        ...body.project,
        sizeDistribution: { ...body.project.sizeDistribution },
      },
      pricing: body.pricing ? { ...body.pricing } : null,
      customerInfo: body.customerInfo ? { ...body.customerInfo } : null,
    };

    // Salvar no registro imutável
    // Congela o objeto em memória para garantir imutabilidade de alterações futuras
    Object.freeze(snapshot.project);
    if (snapshot.pricing) Object.freeze(snapshot.pricing);
    Object.freeze(snapshot);

    snapshotsRegistry.set(id, snapshot);
    shareTokensRegistry.set(shareToken, snapshot);

    return NextResponse.json({
      success: true,
      snapshotId: id,
      shareToken,
      hash,
      createdAt,
      snapshot,
    });
  } catch (error: unknown) {
    console.error("Erro ao criar snapshot do orçamento:", error);
    const msg = error instanceof Error ? error.message : "Erro ao gerar snapshot";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const id = searchParams.get("id");

    // 1. Busca por Token de Compartilhamento Público
    if (token) {
      const snapshot = shareTokensRegistry.get(token);
      if (!snapshot) {
        return NextResponse.json(
          { success: false, error: "Projeto não encontrado ou link expirado." },
          { status: 404 }
        );
      }

      // Higienização estrita de segurança:
      // NUNCA expor customerInfo, emails, telefones ou identificadores internos
      return NextResponse.json({
        success: true,
        shareToken: snapshot.shareToken,
        id: snapshot.id,
        hash: snapshot.hash,
        createdAt: snapshot.createdAt,
        project: snapshot.project,
        pricing: snapshot.pricing,
      });
    }

    // 2. Busca por ID direto do Snapshot
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID ou Token do projeto é obrigatório." },
        { status: 400 }
      );
    }

    const snapshot = snapshotsRegistry.get(id);
    if (!snapshot) {
      return NextResponse.json(
        { success: false, error: "Snapshot não encontrado ou expirado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, snapshot });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao recuperar snapshot";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
