import { NextResponse } from "next/server";
import { UniformModelService } from "@/services/uniform-model.service";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await UniformModelService.updateZone(id, {
      zone_name: body.zone_name,
      zone_type: body.zone_type,
      x: body.x !== undefined ? Number(body.x) : undefined,
      y: body.y !== undefined ? Number(body.y) : undefined,
      width: body.width !== undefined ? Number(body.width) : undefined,
      height: body.height !== undefined ? Number(body.height) : undefined,
      rotation: body.rotation !== undefined ? Number(body.rotation) : undefined,
      min_scale: body.min_scale !== undefined ? Number(body.min_scale) : undefined,
      max_scale: body.max_scale !== undefined ? Number(body.max_scale) : undefined,
      allowed_element_types: body.allowed_element_types,
      is_active: body.is_active,
      svg_path: body.svg_path,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Zona não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, zone: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar zona";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await UniformModelService.deleteZone(id);
    return NextResponse.json({ success: deleted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao remover zona";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
