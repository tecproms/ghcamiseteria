import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProjectsService, UnauthorizedProjectAccessError } from "@/services/projects.service";

async function getAuthContext(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userId = user?.id;
  if (!userId && process.env.NODE_ENV !== "production") {
    userId = req.headers.get("x-user-id") || undefined;
  }

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin" || profile?.role === "gerente";
  } else if (process.env.NODE_ENV !== "production" && req.headers.get("x-is-admin") === "true") {
    isAdmin = true;
  }

  return { userId, isAdmin };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, isAdmin } = await getAuthContext(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const project = await ProjectsService.getProjectById(id, userId, isAdmin);

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Projeto não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedProjectAccessError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao carregar projeto";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, isAdmin } = await getAuthContext(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const updated = await ProjectsService.updateProject(id, userId, body, isAdmin);

    return NextResponse.json({ success: true, project: updated });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedProjectAccessError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao atualizar projeto";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, isAdmin } = await getAuthContext(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    await ProjectsService.deleteProject(id, userId, isAdmin);
    return NextResponse.json({ success: true, message: "Projeto excluído com sucesso." });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedProjectAccessError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao excluir projeto";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
