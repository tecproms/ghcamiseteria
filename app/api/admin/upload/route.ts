import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Apenas imagens JPG, PNG ou WebP são permitidas." },
        { status: 400 }
      );
    }

    // Validate size (max 15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Tamanho máximo permitido: 15MB." },
        { status: 400 }
      );
    }

    // Generate safe unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".jpg";
    const baseName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-");
    const uniqueName = `${Date.now()}-${baseName}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "catalog");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/catalog/${uniqueName}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Erro no upload de imagem:", error);
    return NextResponse.json({ error: "Falha ao salvar imagem no servidor." }, { status: 500 });
  }
}
