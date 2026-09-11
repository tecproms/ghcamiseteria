import { NextResponse } from "next/server";
import { CustomizerValidationService } from "@/services/customizer-validation.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.modelId || !body.viewSide || !Array.isArray(body.elements)) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          errors: ["Requisição inválida: modelId, viewSide e elements são obrigatórios."],
        },
        { status: 400 }
      );
    }

    const validation = await CustomizerValidationService.validateDesign({
      modelId: body.modelId,
      viewSide: body.viewSide,
      elements: body.elements,
    });

    return NextResponse.json({
      success: true,
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro na validação do design";
    return NextResponse.json(
      {
        success: false,
        valid: false,
        errors: [message],
      },
      { status: 500 }
    );
  }
}
