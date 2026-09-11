import { NextResponse } from "next/server";
import { UniformModelService } from "@/services/uniform-model.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const model = await UniformModelService.getModelById(id);
    if (!model) {
      return NextResponse.json(
        { success: false, error: "Modelo não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, model });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao buscar modelo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await UniformModelService.updateModel(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Modelo não encontrado para atualização" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, model: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar modelo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await UniformModelService.deleteModel(id);
    return NextResponse.json({ success: deleted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao excluir modelo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
