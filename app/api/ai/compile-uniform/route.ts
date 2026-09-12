// app/api/ai/compile-uniform/route.ts
// Compilação inteligente de uniforme e orçamento com IA Groq (Llama 3)
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import { PricingService } from "@/services/pricing/pricing.service";

interface CompileRequest {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  currentProject: {
    model: "TRADITIONAL" | "POLO" | "MANGA_LONGA";
    color: { name: string; hex: string };
    collarColor?: { name: string; hex: string };
    sleeveColor?: { name: string; hex: string };
    collarType?: string;
    sizeDistribution?: Record<string, number>;
    logoUrl?: string | null;
    logoPosition?: "PEITO_ESQUERDO" | "CENTRO_FRONTAL" | "PEITO_DIREITO" | "CENTRO_COSTAS" | "MANGA";
    logoScale?: number;
    quantity?: number;
    customText?: string;
    notes?: string;
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CompileRequest;
    const { messages = [], currentProject } = body;

    const userLastMessage = messages.filter((m) => m.role === "user").pop()?.content || "";

    // 1. Interpretar dados com Groq (se GROQ_API_KEY estiver configurada)
    let aiReply = "";
    let extractedUpdates: Partial<CompileRequest["currentProject"]> = {};

    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
            temperature: 0.3,
            messages: [
              {
                role: "system",
                content: `Você é o Consultor Técnico Especialista e Assistente Virtual da "GH Camiseteria & Uniformes Personalizados".
Sua função é conduzir o cliente cordialmente pelo diálogo de montagem de uniformes para empresas, equipes e eventos.
O cliente pode escolher:
- Modelo: "TRADITIONAL" (Camiseta Tradicional Meia Malha ou Dry-fit), "POLO" (Camisa Polo em Piquet nobre com gola estruturada) ou "MANGA_LONGA" (Camisa Manga Longa com punho ribana).
- Cor: Nome e Hexadecimal sugerido (ex: Preto Clássico #0F172A, Branco Neve #FFFFFF, Azul Marinho #1E3A8A, Vermelho #DC2626, Verde Militar #14532D, Grafite #334155, Amarelo Ouro #D97706, Vinho Bordô #881337).
- Posição da Logo: "PEITO_ESQUERDO", "CENTRO_FRONTAL", "PEITO_DIREITO".
- Quantidade de peças (mínimo recomendado 10 peças).
- Frase ou texto personalizado se houver.

Estado atual do uniforme montado:
${JSON.stringify(currentProject, null, 2)}

RESPONDA SEMPRE em português do Brasil com entusiasmo, objetividade e tom comercial refinado.
SEMPRE inclua no final da sua resposta um bloco JSON delimitado exatamente por \`\`\`json { ... } \`\`\` com os dados que você identificou ou atualizou:
Exemplo:
\`\`\`json
{
  "model": "POLO",
  "color": { "name": "Azul Marinho", "hex": "#1E3A8A" },
  "logoPosition": "PEITO_ESQUERDO",
  "quantity": 30,
  "customText": "TECHPRO"
}
\`\`\`
`,
              },
              ...messages,
            ],
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const rawReply = groqData.choices?.[0]?.message?.content || "";

          // Extrair bloco JSON se o modelo retornou
          const jsonMatch = rawReply.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            try {
              extractedUpdates = JSON.parse(jsonMatch[1]);
            } catch {
              // Ignore parse error
            }
            aiReply = rawReply.replace(/```json[\s\S]*?```/, "").trim();
          } else {
            aiReply = rawReply;
          }
        }
      } catch (groqErr) {
        console.warn("Falha na chamada à API Groq, utilizando motor heurístico:", groqErr);
      }
    }

    // Fallback inteligente caso Groq não esteja configurado ou tenha falhado
    if (!aiReply) {
      const lower = userLastMessage.toLowerCase();

      // Detecção de modelo
      if (lower.includes("polo")) {
        extractedUpdates.model = "POLO";
      } else if (lower.includes("longa") || lower.includes("inverno") || lower.includes("frio")) {
        extractedUpdates.model = "MANGA_LONGA";
      } else if (lower.includes("tradicional") || lower.includes("camiseta") || lower.includes("dry")) {
        extractedUpdates.model = "TRADITIONAL";
      }

      // Detecção de cor
      if (lower.includes("preto") || lower.includes("preta")) {
        extractedUpdates.color = { name: "Preto Clássico", hex: "#0F172A" };
      } else if (lower.includes("branco") || lower.includes("branca")) {
        extractedUpdates.color = { name: "Branco Neve", hex: "#FFFFFF" };
      } else if (lower.includes("marinho") || lower.includes("azul")) {
        extractedUpdates.color = { name: "Azul Marinho", hex: "#1E3A8A" };
      } else if (lower.includes("vermelho") || lower.includes("vermelha")) {
        extractedUpdates.color = { name: "Vermelho Rubi", hex: "#DC2626" };
      } else if (lower.includes("verde")) {
        extractedUpdates.color = { name: "Verde Militar", hex: "#14532D" };
      } else if (lower.includes("cinza") || lower.includes("grafite")) {
        extractedUpdates.color = { name: "Grafite Chumbo", hex: "#334155" };
      }

      // Detecção de quantidade (ex: 30 peças, 50, etc)
      const qtyMatch = lower.match(/(\d+)\s*(pecas|peças|unidades|un)?/);
      if (qtyMatch && parseInt(qtyMatch[1], 10) > 0) {
        extractedUpdates.quantity = parseInt(qtyMatch[1], 10);
      }

      // Detecção de posição
      if (lower.includes("peito esquerdo") || lower.includes("coração")) {
        extractedUpdates.logoPosition = "PEITO_ESQUERDO";
      } else if (lower.includes("centro") || lower.includes("meio") || lower.includes("grande")) {
        extractedUpdates.logoPosition = "CENTRO_FRONTAL";
      } else if (lower.includes("peito direito")) {
        extractedUpdates.logoPosition = "PEITO_DIREITO";
      }

      // Resposta contextual amigável
      const activeModel = extractedUpdates.model || currentProject.model;
      const activeColor = extractedUpdates.color || currentProject.color;
      const modelNameStr =
        activeModel === "POLO"
          ? "Camisa Polo Piquet"
          : activeModel === "MANGA_LONGA"
          ? "Manga Longa Ribana"
          : "Camiseta Tradicional Meia Malha";

      aiReply = `Excelente escolha! Atualizei o mockup fotográfico para **${modelNameStr}** na cor **${activeColor.name}**. O caimento e o acabamento dessa peça em estúdio ficam impecáveis.`;
    }

    // Mesclar atualizações com o projeto
    const mergedProject = {
      ...currentProject,
      ...extractedUpdates,
      color: extractedUpdates.color || currentProject.color,
    };

    const quantity = mergedProject.quantity || 20;

    // 2. Cálculo real e determinístico do orçamento via PricingService
    const modelBaseName =
      mergedProject.model === "POLO"
        ? "Polo Piquet"
        : mergedProject.model === "MANGA_LONGA"
        ? "Manga Longa"
        : "Camiseta Tradicional";

    const basePricing = await PricingService.calculate({
      modelName: modelBaseName,
      quantity,
      views: {
        FRONT: mergedProject.logoUrl
          ? [
              {
                id: "logo-1",
                type: "IMAGE",
                viewSide: "FRONT",
                zoneId: mergedProject.logoPosition || "PEITO_ESQUERDO",
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
              },
            ]
          : [],
      },
    });

    const unitPrice = basePricing.unitPrice || (mergedProject.model === "POLO" ? 48.0 : 35.0);
    const totalPrice = basePricing.total || unitPrice * quantity;

    // Formatar grade de tamanhos se especificada
    let sizeBreakdownStr = "";
    if (mergedProject.sizeDistribution && typeof mergedProject.sizeDistribution === "object") {
      const parts = Object.entries(mergedProject.sizeDistribution)
        .filter(([, q]) => Number(q) > 0)
        .map(([sz, q]) => `${q}x ${sz}`);
      if (parts.length > 0) {
        sizeBreakdownStr = parts.join(", ");
      }
    }

    const sizeLine = sizeBreakdownStr
      ? `📏 *Grade de Tamanhos:* ${sizeBreakdownStr} (Total: ${quantity} un.)\n`
      : `📦 *Quantidade:* ${quantity} unidades\n`;

    const collarLine = mergedProject.collarType
      ? `👔 *Tipo de Gola:* ${mergedProject.collarType}\n`
      : "";

    const contrastLine =
      mergedProject.collarColor || mergedProject.sleeveColor
        ? `🎨 *Detalhes Bicolor:* Gola: ${mergedProject.collarColor?.name || mergedProject.color.name} | Mangas: ${mergedProject.sleeveColor?.name || mergedProject.color.name}\n`
        : "";

    // Texto formatado pronto para WhatsApp
    const whatsAppText =
      `Olá, equipe da *GH Camiseteria*! 👋\n\n` +
      `Montei meu uniforme personalizado no site e gostaria de formalizar meu orçamento:\n\n` +
      `👕 *Modelo:* ${modelBaseName}\n` +
      collarLine +
      `🎨 *Cor Principal:* ${mergedProject.color.name} (${mergedProject.color.hex})\n` +
      contrastLine +
      `📍 *Aplicação de Logo:* ${mergedProject.logoPosition || "Peito Esquerdo"}\n` +
      sizeLine +
      `💰 *Estimativa:* R$ ${unitPrice.toFixed(2)}/un. (Total: R$ ${totalPrice.toFixed(2)})\n\n` +
      `Poderiam me passar os prazos de produção e os detalhes para envio da arte em alta resolução?`;

    return NextResponse.json({
      success: true,
      reply: aiReply,
      updatedProject: extractedUpdates,
      quoteSummary: {
        modelName: modelBaseName,
        colorName: mergedProject.color.name,
        colorHex: mergedProject.color.hex,
        collarType: mergedProject.collarType,
        collarColorName: mergedProject.collarColor?.name,
        sleeveColorName: mergedProject.sleeveColor?.name,
        logoPosition: mergedProject.logoPosition || "PEITO_ESQUERDO",
        sizeBreakdown: sizeBreakdownStr || `${quantity} un.`,
        quantity,
        unitPrice,
        totalPrice,
        discountPercent: basePricing.discountPercent || 0,
        leadTimeDays: 7,
        whatsAppText,
      },
    });
  } catch (error: unknown) {
    console.error("Erro na compilação do uniforme:", error);
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
