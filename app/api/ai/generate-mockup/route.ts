// app/api/ai/generate-mockup/route.ts
// Geração fotorrealista de mockups têxteis em estúdio via IA de imagem (Frente, Costas, Manga/Detalhe)
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import { type UniformDraftState, translateColorToEnglish } from "@/app/api/ai/chat/route";

interface GenerateMockupRequestBody {
  prompts?: {
    frontPrompt?: string;
    backPrompt?: string;
    sleevePrompt?: string;
  };
  draft?: UniformDraftState;
}

function buildPromptsFromDraft(draft: UniformDraftState) {
  const modelName =
    draft.modelType === "POLO"
      ? "classic polo shirt with tailored collar and buttons"
      : draft.modelType === "MANGA_LONGA"
      ? "long sleeve crewneck shirt with ribbed cuffs"
      : draft.modelType === "MOLETOM"
      ? "heavy cotton hoodie pullover sweater"
      : "crewneck short-sleeve t-shirt";

  const colorInfo = translateColorToEnglish(draft.primaryColor?.name);

  let pocketDesc = "";
  if (draft.hasPocket) {
    const pColor = draft.pocketColor && draft.pocketColor.toLowerCase().includes("contraste")
      ? `in contrasting color (${draft.pocketColor})`
      : `in matching ${colorInfo.nameEn}`;
    pocketDesc = `, tailored front chest pocket ${pColor} on the left chest`;
  }

  let collarDesc = "";
  if (draft.collarType) {
    collarDesc = `, ${draft.collarType.toLowerCase()}`;
  }
  if (draft.collarColor) {
    collarDesc += ` in contrasting ${draft.collarColor}`;
  }

  let frontLogoDesc = "";
  if (draft.logoPlacement === "BOLSO") {
    frontLogoDesc = ", crisp embroidered emblem badge logo stitched directly on the chest pocket";
  } else if (draft.logoPlacement === "PEITO_DIREITO") {
    frontLogoDesc = ", elegant embroidered company logo on the right chest";
  } else if (draft.logoPlacement === "CENTRO_FRONTAL") {
    frontLogoDesc = ", modern corporate brand artwork centered across the front chest";
  } else if (draft.logoPlacement === "PEITO_ESQUERDO") {
    frontLogoDesc = ", high-end embroidered emblem logo on the left chest";
  }

  let backCustomDesc = "";
  if (draft.logoPlacement === "COSTAS") {
    backCustomDesc = ", large corporate brand artwork printed across upper back";
  }
  if (draft.customBackText) {
    backCustomDesc += `, bold custom text '${draft.customBackText}' printed across upper shoulders`;
  }
  if (draft.customBackNumber) {
    backCustomDesc += `, athletic squad number '${draft.customBackNumber}' printed in bold centered on the back`;
  }

  const baseStudioStyle =
    "commercial apparel product photography, clean solid plain white background, high-end clothing catalog, invisible ghost mannequin presentation, professional softbox studio lighting, crisp fabric texture details, sharp focus, 8k resolution, photorealistic, centered composition, strictly NO human, NO woman, NO man, NO model, NO face, NO body, clothing product only";

  const frontPrompt = `Front view of a completely ${colorInfo.nameEn} (${colorInfo.hex}) ${modelName}${pocketDesc}${collarDesc}${frontLogoDesc}, completely ${colorInfo.nameEn} fabric, ${baseStudioStyle}`;

  const backPrompt = `Back view of a completely ${colorInfo.nameEn} (${colorInfo.hex}) ${modelName}${collarDesc}${backCustomDesc || ", clean minimalist back without prints"}, completely ${colorInfo.nameEn} fabric, ${baseStudioStyle}`;

  const sleevePrompt = `Side profile 45-degree angle closeup view of the left sleeve of a completely ${colorInfo.nameEn} (${colorInfo.hex}) ${modelName}${
    draft.logoPlacement === "MANGA" ? ", embroidered logo patch stitched on the sleeve" : ""
  }, completely ${colorInfo.nameEn} fabric, ${baseStudioStyle}`;

  return { frontPrompt, backPrompt, sleevePrompt };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateMockupRequestBody;
    const { prompts, draft } = body;

    let frontPrompt = prompts?.frontPrompt;
    let backPrompt = prompts?.backPrompt;
    let sleevePrompt = prompts?.sleevePrompt;

    if (!frontPrompt && draft) {
      const generated = buildPromptsFromDraft(draft);
      frontPrompt = generated.frontPrompt;
      backPrompt = generated.backPrompt;
      sleevePrompt = generated.sleevePrompt;
    }

    if (!frontPrompt) {
      frontPrompt = "Front view of a completely solid pitch jet black polo shirt with chest pocket, commercial apparel product photography, ghost mannequin, clean white background, strictly no human, 8k";
    }
    if (!backPrompt) {
      backPrompt = "Back view of a completely solid pitch jet black polo shirt, clean back, commercial apparel product photography, ghost mannequin, clean white background, strictly no human, 8k";
    }
    if (!sleevePrompt) {
      sleevePrompt = "Side view of a completely solid pitch jet black polo shirt sleeve, commercial apparel product photography, ghost mannequin, clean white background, strictly no human, 8k";
    }

    // Gerar sementes pseudo-únicas baseadas no texto e cor para manter consistência entre as vistas
    const hash = Math.abs(
      frontPrompt.split("").reduce((acc, c) => acc + c.charCodeAt(0), 100)
    );
    const seedFront = (hash * 7) % 999999;
    const seedBack = (hash * 13 + 1) % 999999;
    const seedSleeve = (hash * 19 + 2) % 999999;

    // URLs do Pollinations.ai FLUX (gratuito, sem chave necessária, alta qualidade)
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
    console.error("Erro na rota /api/ai/generate-mockup:", err);
    const message = err instanceof Error ? err.message : "Falha ao gerar mockups com IA";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
