import { NextResponse } from "next/server";
import { UniformModelService } from "@/services/uniform-model.service";

export async function GET() {
  try {
    const models = await UniformModelService.listModels();
    return NextResponse.json({ success: true, models });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao listar modelos";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "O nome do modelo é obrigatório." },
        { status: 400 }
      );
    }

    const created = await UniformModelService.createModel({
      name: body.name,
      description: body.description,
      product_id: body.product_id,
      base_asset_url: body.base_asset_url,
      is_active: body.is_active ?? true,
    });

    return NextResponse.json({ success: true, model: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao criar modelo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
