// app/api/ai/generate-mockup/route.ts
// Geração fotorrealista de mockups têxteis em estúdio via IA (Frente, Costas, Manga)
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";

interface GenerateMockupRequest {
  modelType?: "TRADITIONAL" | "POLO" | "MANGA_LONGA";
  fabric?: string | null;
  color?: { name: string; hex: string };
  collarType?: string;
  collarColor?: { name: string; hex: string } | null;
  sleeveColor?: { name: string; hex: string } | null;
  hasPocket?: boolean;
  pocketColor?: string | null;
  logoUrl?: string | null;
  logoPosition?: string;
  customText?: string | null;
  customTextPosition?: "FRONT" | "BACK";
  customNumber?: string | null;
  customNumberPosition?: "FRONT" | "BACK";
}

function buildPrompts(data: GenerateMockupRequest) {
  const modelName =
    data.modelType === "POLO"
      ? "classic polo shirt with collar and buttons"
      : data.modelType === "MANGA_LONGA"
      ? "long sleeve crewneck shirt with ribbed cuffs"
      : "crewneck short-sleeve t-shirt";

  const colorName = data.color?.name || "black";
  const colorHex = data.color?.hex || "#111827";

  let pocketDesc = "";
  if (data.hasPocket) {
    const pColor = data.pocketColor ? `in contrasting color (${data.pocketColor})` : "matching the shirt";
    pocketDesc = `, with a tailored chest pocket ${pColor}`;
  }

  let collarDesc = "";
  if (data.collarColor) {
    collarDesc = `, contrasting collar in ${data.collarColor.name}`;
  }

  let sleeveDesc = "";
  if (data.sleeveColor) {
    sleeveDesc = `, contrasting sleeve bands in ${data.sleeveColor.name}`;
  }

  let frontLogoDesc = "";
  if (data.logoPosition === "BOLSO") {
    frontLogoDesc = ", embroidered emblem logo placed cleanly on the chest pocket";
  } else if (data.logoPosition === "PEITO_DIREITO") {
    frontLogoDesc = ", clean embroidered corporate logo badge on the right chest";
  } else if (data.logoPosition === "CENTRO_FRONTAL") {
    frontLogoDesc = ", large graphic printed artwork logo centered on the chest";
  } else {
    frontLogoDesc = ", elegant embroidered logo crest on the left chest";
  }

  if (data.customText && data.customTextPosition === "FRONT") {
    frontLogoDesc += `, text printed on chest '${data.customText}'`;
  }
  if (data.customNumber && data.customNumberPosition === "FRONT") {
    frontLogoDesc += `, athletic number '${data.customNumber}' printed on front`;
  }

  let backCustomDesc = "";
  if (data.logoPosition === "COSTAS") {
    backCustomDesc = ", large corporate brand artwork printed across upper back";
  }
  if (data.customText && data.customTextPosition === "BACK") {
    backCustomDesc += `, bold text '${data.customText}' printed across upper shoulders`;
  }
  if (data.customNumber && data.customNumberPosition === "BACK") {
    backCustomDesc += `, large sports athletic squad number '${data.customNumber}' centered on the back`;
  }

  const baseStyle =
    "commercial studio product photography, clean solid white background, high-end apparel catalog, ghost mannequin presentation, professional softbox lighting, crisp fabric texture details, sharp focus, 8k resolution, photorealistic, masterpiece";

  const frontPrompt = `Front view of a ${colorName} (${colorHex}) ${modelName}${pocketDesc}${collarDesc}${sleeveDesc}${frontLogoDesc}, ${baseStyle}`;

  const backPrompt = `Back view of a ${colorName} (${colorHex}) ${modelName}${collarDesc}${backCustomDesc || ", clean minimalist back without prints"}, ${baseStyle}`;

  const sleevePrompt = `Side profile 45-degree closeup view of the left sleeve of a ${colorName} (${colorHex}) ${modelName}${sleeveDesc}${
    data.logoPosition === "MANGA" ? ", embroidered logo badge stitched on the sleeve" : ""
  }, ${baseStyle}`;

  return { frontPrompt, backPrompt, sleevePrompt };
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as GenerateMockupRequest;

    const { frontPrompt, backPrompt, sleevePrompt } = buildPrompts(data);

    // Gerar sementes pseudo-únicas baseadas nas cores e modelo para consistência
    const hash = Math.abs(
      (data.color?.hex || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 100) +
        (data.modelType || "").length * 37
    );
    const seedFront = (hash * 7) % 999999;
    const seedBack = (hash * 13 + 1) % 999999;
    const seedSleeve = (hash * 19 + 2) % 999999;

    // URLs do Pollinations.ai FLUX (gratuito, sem chave, alta qualidade de catálogo)
    const frontUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      frontPrompt
    )}?width=1024&height=1024&model=flux&nologo=true&seed=${seedFront}`;

    const backUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      backPrompt
    )}?width=1024&height=1024&model=flux&nologo=true&seed=${seedBack}`;

    const sleeveUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      sleevePrompt
    )}?width=1024&height=1024&model=flux&nologo=true&seed=${seedSleeve}`;

    return NextResponse.json({
      success: true,
      images: {
        front: frontUrl,
        back: backUrl,
        sleeve: sleeveUrl,
      },
      prompts: {
        front: frontPrompt,
        back: backPrompt,
        sleeve: sleevePrompt,
      },
    });
  } catch (err: unknown) {
    console.error("Erro na rota generate-mockup:", err);
    const message = err instanceof Error ? err.message : "Falha ao gerar mockups com IA";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
