import { NextResponse } from "next/server";
import { UniformModelService } from "@/services/uniform-model.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.shirt_view_id || !body.zone_name) {
      return NextResponse.json(
        { success: false, error: "Vista e nome da zona são obrigatórios." },
        { status: 400 }
      );
    }

    const created = await UniformModelService.createZone({
      shirt_view_id: body.shirt_view_id,
      zone_name: body.zone_name,
      zone_type: body.zone_type || "PERSONALIZADO",
      x: Number(body.x ?? 100),
      y: Number(body.y ?? 100),
      width: Number(body.width ?? 150),
      height: Number(body.height ?? 150),
      rotation: Number(body.rotation ?? 0),
      min_scale: Number(body.min_scale ?? 0.2),
      max_scale: Number(body.max_scale ?? 3.0),
      allowed_element_types: body.allowed_element_types ?? ["LOGO", "TEXT", "NUMBER", "IMAGE"],
      is_active: body.is_active ?? true,
      svg_path: body.svg_path,
    });

    return NextResponse.json({ success: true, zone: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao criar zona de personalização";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
