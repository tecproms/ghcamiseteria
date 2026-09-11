import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProjectsService } from "@/services/projects.service";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Identificar usuário autenticado (com suporte a header em ambiente não-produção/testes)
    let userId = user?.id;
    if (!userId && process.env.NODE_ENV !== "production") {
      userId = req.headers.get("x-user-id") || undefined;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado. Faça login para ver seus projetos." },
        { status: 401 }
      );
    }

    const projects = await ProjectsService.getProjectsByUser(userId);
    return NextResponse.json({ success: true, projects });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao listar projetos";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    if (!userId && process.env.NODE_ENV !== "production") {
      userId = req.headers.get("x-user-id") || undefined;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado. Faça login para salvar este projeto." },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.shirt_model_id || !body.color || !body.views) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados incompletos. Informe shirt_model_id, color e views da montagem.",
        },
        { status: 400 }
      );
    }

    const project = await ProjectsService.createProject(userId, {
      name: body.name || "Meu Uniforme Personalizado",
      shirt_model_id: body.shirt_model_id,
      model_name: body.model_name,
      product_id: body.product_id,
      product_name: body.product_name,
      status: body.status || "saved",
      color: body.color,
      quantity: body.quantity || 10,
      views: body.views,
      preview_thumbnail_url: body.preview_thumbnail_url,
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao salvar projeto";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
