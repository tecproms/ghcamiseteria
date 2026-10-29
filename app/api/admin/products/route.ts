import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getCatalog, addProduct } from "@/lib/catalog-store";
import { Product } from "@/data/catalog";

export async function GET() {
  const products = await getCatalog();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: "Nome e Categoria são obrigatórios." },
        { status: 400 }
      );
    }

    const newProduct: Product = {
      id:
        body.id ||
        body.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "") +
          "-" +
          Date.now(),
      name: body.name.trim(),
      category: body.category,
      categoryLabel: body.categoryLabel || body.category,
      badge: body.badge?.trim() || undefined,
      image: body.image || "/images/brand/logo-gh.png",
      summary: body.summary?.trim() || "",
      description: body.description?.trim() || "",
      fabrics: Array.isArray(body.fabrics) ? body.fabrics : [],
      techniques: Array.isArray(body.techniques) ? body.techniques : [],
      sizes: body.sizes?.trim() || "P ao EXG",
      colors: Array.isArray(body.colors) ? body.colors : ["Preto", "Branco"],
      segments: Array.isArray(body.segments) ? body.segments : ["Geral"],
      minOrder: Number(body.minOrder) || 10,
    };

    const created = await addProduct(newProduct);
    return NextResponse.json({ success: true, product: created });
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    return NextResponse.json({ error: "Erro ao criar produto." }, { status: 500 });
  }
}
