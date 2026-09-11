import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProjectsService, UnauthorizedProjectAccessError } from "@/services/projects.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const duplicated = await ProjectsService.duplicateProject(id, userId);

    return NextResponse.json({ success: true, project: duplicated }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedProjectAccessError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao duplicar projeto";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
