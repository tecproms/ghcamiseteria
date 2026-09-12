// app/api/ai/compile-uniform/route.ts
// Compilação inteligente de uniforme e orçamento com IA Groq (Llama 3)
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import { PricingService } from "@/services/pricing/pricing.service";

// Catálogo Oficial de Modelos Válidos da Fábrica
const VALID_MODELS = {
  TRADITIONAL: {
    id: "TRADITIONAL",
    name: "Camiseta Tradicional Meia Malha / Dry Fit",
    shortName: "Camiseta Tradicional",
    fabric: "Meia Malha 100% Algodão Penteado 30.1 ou Dry Fit 100% Poliéster",
  },
  POLO: {
    id: "POLO",
    name: "Camisa Polo Empresarial Piquet",
    shortName: "Polo Piquet",
    fabric: "Piquet Nobre Duplo 220g/m² com Peitilho e Botões",
  },
  MANGA_LONGA: {
    id: "MANGA_LONGA",
    name: "Camisa Manga Longa Operacional / Proteção UV",
    shortName: "Manga Longa",
    fabric: "Algodão Penteado com Punho em Ribana Canelada",
  },
} as const;

const CATALOG_COLORS: Array<{ name: string; hex: string; aliases: string[] }> = [
  { name: "Branco Neve", hex: "#FFFFFF", aliases: ["branco", "branca", "white"] },
  { name: "Preto Clássico", hex: "#111827", aliases: ["preto", "preta", "black"] },
  { name: "Grafite Chumbo", hex: "#374151", aliases: ["grafite", "chumbo", "cinza escuro"] },
  { name: "Cinza Mescla", hex: "#9CA3AF", aliases: ["cinza", "mescla", "grey", "gray"] },
  { name: "Azul Marinho", hex: "#1E3A8A", aliases: ["marinho", "azul escuro", "navy"] },
  { name: "Azul Royal", hex: "#1D4ED8", aliases: ["royal", "azul bic", "azul vivo"] },
  { name: "Azul Turquesa", hex: "#06B6D4", aliases: ["turquesa", "ciano"] },
  { name: "Azul Celeste", hex: "#38BDF8", aliases: ["celeste", "azul bebe", "azul claro"] },
  { name: "Vermelho Ferrari", hex: "#DC2626", aliases: ["vermelho", "vermelha", "red"] },
  { name: "Vinho Bordô", hex: "#881337", aliases: ["vinho", "bordo", "marsala"] },
  { name: "Coral Salmão", hex: "#F87171", aliases: ["coral", "salmao"] },
  { name: "Laranja Industrial", hex: "#EA580C", aliases: ["laranja", "orange"] },
  { name: "Amarelo Ouro", hex: "#D97706", aliases: ["amarelo", "ouro", "yellow"] },
  { name: "Amarelo Canário", hex: "#FDE047", aliases: ["amarelo claro", "canario"] },
  { name: "Verde Bandeira", hex: "#15803D", aliases: ["verde bandeira", "verde escuro"] },
  { name: "Verde Militar", hex: "#3F6212", aliases: ["verde militar", "musgo", "oliva"] },
  { name: "Verde Petróleo", hex: "#0F766E", aliases: ["verde petroleo"] },
  { name: "Verde Limão", hex: "#84CC16", aliases: ["verde limao", "verde neon"] },
  { name: "Rosa Bebê", hex: "#F472B6", aliases: ["rosa bebe", "rosa claro"] },
  { name: "Rosa Pink", hex: "#DB2777", aliases: ["rosa pink", "pink", "magenta"] },
  { name: "Roxo Imperial", hex: "#7C3AED", aliases: ["roxo", "purple"] },
  { name: "Lilás / Lavanda", hex: "#A855F7", aliases: ["lilas", "lavanda"] },
  { name: "Bege / Khaki", hex: "#D4B996", aliases: ["bege", "khaki", "areia", "cru"] },
  { name: "Marrom Café", hex: "#78350F", aliases: ["marrom", "cafe", "brown"] },
];

type CommandAction =
  | "UPDATE_UNIFORM"
  | "ADD_LOGO"
  | "UPDATE_LOGO"
  | "ADD_TEXT"
  | "UPDATE_TEXT"
  | "ADD_NUMBER"
  | "CALCULATE_QUOTE"
  | "INVALID_REQUEST";

interface StructuredCommand {
  action: CommandAction;
  changes: {
    model?: "TRADITIONAL" | "POLO" | "MANGA_LONGA";
    modelType?: "TRADITIONAL" | "POLO" | "MANGA_LONGA";
    rejectedItem?: string;
    color?: { name: string; hex: string };
    collarType?: string;
    collarColor?: { name: string; hex: string };
    sleeveColor?: { name: string; hex: string };
    quantity?: number;
    sizeDistribution?: Record<string, number>;
    logoPosition?: "PEITO_ESQUERDO" | "CENTRO_FRONTAL" | "PEITO_DIREITO" | "COSTAS" | "MANGA";
    logoScale?: number;
    customText?: string;
    customTextPosition?: "FRONT" | "BACK";
    customNumber?: string;
    customNumberPosition?: "FRONT" | "BACK";
    viewSide?: "FRONT" | "BACK" | "SLEEVE";
  };
  explanation?: string;
}

interface InboundMessage {
  role?: "user" | "assistant" | "system";
  content?: string;
  text?: string;
}

interface InboundProject {
  model?: "TRADITIONAL" | "POLO" | "MANGA_LONGA";
  modelType?: "TRADITIONAL" | "POLO" | "MANGA_LONGA";
  color?: { name: string; hex: string };
  collarType?: string;
  collarColor?: { name: string; hex: string } | null;
  sleeveColor?: { name: string; hex: string } | null;
  sizeDistribution?: Record<string, number>;
  logoUrl?: string | null;
  logoPosition?: "PEITO_ESQUERDO" | "CENTRO_FRONTAL" | "PEITO_DIREITO" | "COSTAS" | "MANGA";
  logoScale?: number;
  quantity?: number;
  customText?: string | null;
  customTextPosition?: "FRONT" | "BACK";
  customNumber?: string | null;
  customNumberPosition?: "FRONT" | "BACK";
  viewSide?: "FRONT" | "BACK" | "SLEEVE";
  [key: string]: unknown;
}

interface CompileRequest {
  messages?: InboundMessage[];
  message?: string;
  hasUploadedLogo?: boolean;
  currentProject?: InboundProject;
  currentConfig?: InboundProject;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CompileRequest;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const rawProject: InboundProject = body.currentProject || body.currentConfig || {};
    const currentProject = {
      model: rawProject.model || rawProject.modelType || "TRADITIONAL",
      modelType: rawProject.modelType || rawProject.model || "TRADITIONAL",
      color: rawProject.color || { name: "Branco Neve", hex: "#FFFFFF" },
      collarType: rawProject.collarType || "Gola Redonda",
      collarColor: rawProject.collarColor || null,
      sleeveColor: rawProject.sleeveColor || null,
      sizeDistribution: rawProject.sizeDistribution || { P: 4, M: 8, G: 6, GG: 2 },
      logoUrl: rawProject.logoUrl || null,
      logoPosition: rawProject.logoPosition || "PEITO_ESQUERDO",
      logoScale: typeof rawProject.logoScale === "number" ? rawProject.logoScale : 1.0,
      quantity: rawProject.quantity || 20,
      customText: rawProject.customText || null,
      customTextPosition: rawProject.customTextPosition || "BACK",
      customNumber: rawProject.customNumber || null,
      customNumberPosition: rawProject.customNumberPosition || "BACK",
      viewSide: rawProject.viewSide || "FRONT",
      ...rawProject,
    };

    const userLastMessage =
      messages.filter((m) => m.role === "user").pop()?.content ||
      body.message ||
      "";
    const lower = userLastMessage.toLowerCase().trim();

    // 1. Verificação de Produtos Inexistentes (Não inventar fora do catálogo)
    const unavailableItems = [
      "jaqueta", "jeans", "moletom", "agasalho", "casaco", "blusao", "bermuda", "calca", "calça",
      "bone", "boné", "chapeu", "avental", "colete", "regata", "cueca", "meia",
    ];
    const foundUnavailable = unavailableItems.find((item) => lower.includes(item));
    if (foundUnavailable) {
      const politeRefusal = `Na **GH Camiseteria** somos indústria especializada na confecção de **Camisetas Tradicionais**, **Camisas Polo Empresariais em Piquet** e **Camisas Manga Longa**.

Não confeccionamos ${foundUnavailable}s. Posso te apresentar nossas **Camisas Polo** ou **Camisetas** para a sua equipe?`;

      return NextResponse.json({
        success: true,
        reply: politeRefusal,
        command: {
          action: "INVALID_REQUEST",
          changes: { rejectedItem: foundUnavailable },
          explanation: `Produto solicitado (${foundUnavailable}) fora da linha fabril.`,
        },
        updatedProject: currentProject,
      });
    }

    // 2. Interpretar dados com Groq ou Heurística
    let aiReply = "";
    let structuredCommand: StructuredCommand | null = null;
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
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content: `Você é o Consultor Técnico Especialista em Uniformes da "GH Camiseteria & Uniformes Personalizados".
Conduza o diálogo com cordialidade e precisão industrial.
Catálogo Oficial:
- Modelos: "TRADITIONAL" (Camiseta Tradicional Meia Malha ou Dry Fit), "POLO" (Camisa Polo em Piquet), "MANGA_LONGA" (Manga Longa com ribana).
- Posições da logo: "PEITO_ESQUERDO", "CENTRO_FRONTAL", "PEITO_DIREITO", "COSTAS", "MANGA".
- Vistas da foto: "FRONT", "BACK", "SLEEVE".
- Golas: "Gola Redonda (Careca)", "Gola V Esportiva", "Gola Polo com Botões".
- Cores: 24 cores têxteis reais (Preto Clássico #111827, Branco Neve #FFFFFF, Azul Marinho #1E3A8A, Azul Royal #1D4ED8, Vermelho Ferrari #DC2626, Cinza Mescla #9CA3AF, Grafite #374151, Verde Militar #3F6212, Vinho Bordô #881337, etc).

Estado atual do uniforme:
${JSON.stringify(currentProject, null, 2)}

Você NÃO pode inventar preços, produtos ou condições comerciais.
Se o cliente perguntar preço ou orçamento, a ação é "CALCULATE_QUOTE".
Se pedir para aumentar ou diminuir a logo, atualize logoScale (ex: 1.25 ou 0.8).
Se pedir texto nas costas (ex: "escreve BRAVO"), retorne customText e customTextPosition: "BACK".
Se pedir número (ex: "número 10"), retorne customNumber e customNumberPosition: "BACK".

SEMPRE termine sua resposta com um bloco JSON delimitado por \`\`\`json { ... } \`\`\`:
\`\`\`json
{
  "action": "UPDATE_UNIFORM" | "ADD_LOGO" | "UPDATE_LOGO" | "ADD_TEXT" | "ADD_NUMBER" | "CALCULATE_QUOTE",
  "changes": {
    "model": "TRADITIONAL" | "POLO" | "MANGA_LONGA",
    "color": { "name": "...", "hex": "#..." },
    "collarType": "...",
    "quantity": 30,
    "logoPosition": "PEITO_ESQUERDO" | "CENTRO_FRONTAL" | "PEITO_DIREITO" | "COSTAS" | "MANGA",
    "logoScale": 1.0,
    "customText": "BRAVO",
    "customTextPosition": "BACK",
    "customNumber": "10",
    "customNumberPosition": "BACK",
    "viewSide": "FRONT" | "BACK" | "SLEEVE"
  }
}
\`\`\``,
              },
              ...messages,
            ],
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const raw = groqData.choices?.[0]?.message?.content || "";
          const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            try {
              structuredCommand = JSON.parse(jsonMatch[1]);
            } catch {
              // Ignore parse error
            }
            aiReply = raw.replace(/```json[\s\S]*?```/, "").trim();
          } else {
            aiReply = raw;
          }
        }
      } catch (err) {
        console.warn("Groq indisponível, usando motor heurístico:", err);
      }
    }

    // 3. Motor Heurístico de Alta Fidelidade (Garante 100% de funcionamento)
    if (!structuredCommand) {
      const changes: StructuredCommand["changes"] = {};
      let action: CommandAction = "UPDATE_UNIFORM";
      const replyParts: string[] = [];

      // Modelo
      if (lower.includes("polo")) {
        changes.model = "POLO";
        changes.modelType = "POLO";
        replyParts.push("Atualizei o manequim para **Camisa Polo Empresarial em Piquet** com peitilho e gola estruturada.");
      } else if (lower.includes("manga longa") || lower.includes("inverno") || lower.includes("frio") || lower.includes("protecao uv") || lower.includes("proteção uv")) {
        changes.model = "MANGA_LONGA";
        changes.modelType = "MANGA_LONGA";
        replyParts.push("Atualizei o manequim para **Camisa Manga Longa** com punho canelado em ribana.");
      } else if (lower.includes("tradicional") || lower.includes("camiseta") || lower.includes("dry")) {
        changes.model = "TRADITIONAL";
        changes.modelType = "TRADITIONAL";
        replyParts.push("Atualizei o manequim para **Camiseta Tradicional** em meia malha penteada de alto conforto.");
      }

      // Cor
      for (const catColor of CATALOG_COLORS) {
        if (catColor.aliases.some((alias) => lower.includes(alias))) {
          changes.color = { name: catColor.name, hex: catColor.hex };
          replyParts.push(`Apliquei o tingimento fotográfico na cor **${catColor.name}**.`);
          break;
        }
      }

      // Gola
      if (lower.includes("gola v")) {
        changes.collarType = "Gola V Esportiva";
        replyParts.push("Defini o acabamento em **Gola V Esportiva**.");
      } else if (lower.includes("gola redonda") || lower.includes("careca")) {
        changes.collarType = "Gola Redonda (Careca)";
        replyParts.push("Defini o acabamento clássico em **Gola Redonda (Careca)**.");
      } else if (lower.includes("gola polo")) {
        changes.collarType = "Gola Polo com Botões";
        replyParts.push("Defini o acabamento em **Gola Polo com Botões**.");
      }

      // Quantidade
      const qtyMatch = lower.match(/(\d+)\s*(pecas|peças|unidades|un|pessoas|camisas|polos)?/);
      if (qtyMatch && parseInt(qtyMatch[1], 10) > 0) {
        const qty = parseInt(qtyMatch[1], 10);
        changes.quantity = qty;
        const p = Math.round(qty * 0.2);
        const m = Math.round(qty * 0.4);
        const g = Math.round(qty * 0.3);
        const gg = Math.max(0, qty - (p + m + g));
        changes.sizeDistribution = { PP: 0, P: p, M: m, G: g, GG: gg, XG: 0, XXG: 0 };
        replyParts.push(`Ajustei o lote para **${qty} unidades** com grade balanceada automática.`);
      }

      // Posição e Escala da Logo
      const currentScale = currentProject.logoScale || 1.0;
      if (body.hasUploadedLogo || lower.includes("anexei") || lower.includes("anexar") || lower.includes("anexada") || lower.includes("enviei minha logo") || lower.includes("minha logo")) {
        action = "ADD_LOGO";
        replyParts.push("Identifiquei a sua logomarca! Ela foi anexada e aplicada diretamente no manequim 3D.");
      }

      if (lower.includes("logo maior") || lower.includes("aumenta a logo") || lower.includes("aumentar logo") || lower.includes("maior")) {
        action = "UPDATE_LOGO";
        changes.logoScale = Math.min(2.5, Math.round((currentScale + 0.25) * 100) / 100);
        replyParts.push(`Aumentei o tamanho da sua logomarca para **${Math.round(changes.logoScale * 100)}%**.`);
      } else if (lower.includes("logo menor") || lower.includes("diminui a logo") || lower.includes("diminuir logo") || lower.includes("menor")) {
        action = "UPDATE_LOGO";
        changes.logoScale = Math.max(0.4, Math.round((currentScale - 0.25) * 100) / 100);
        replyParts.push(`Reduzi o tamanho da sua logomarca para **${Math.round(changes.logoScale * 100)}%**.`);
      }

      if (lower.includes("peito esquerdo") || lower.includes("lado esquerdo") || lower.includes("coracao") || lower.includes("coração")) {
        action = "ADD_LOGO";
        changes.logoPosition = "PEITO_ESQUERDO";
        changes.viewSide = "FRONT";
        replyParts.push("Posicionei sua marca no **Peito Esquerdo**.");
      } else if (lower.includes("peito direito") || lower.includes("lado direito")) {
        action = "ADD_LOGO";
        changes.logoPosition = "PEITO_DIREITO";
        changes.viewSide = "FRONT";
        replyParts.push("Posicionei sua marca no **Peito Direito**.");
      } else if (lower.includes("centro") || lower.includes("meio do peito")) {
        action = "ADD_LOGO";
        changes.logoPosition = "CENTRO_FRONTAL";
        changes.viewSide = "FRONT";
        replyParts.push("Centralizei sua arte no **Centro do Peito**.");
      } else if (lower.includes("costas") || lower.includes("atras") || lower.includes("parte de tras")) {
        action = "ADD_LOGO";
        changes.logoPosition = "COSTAS";
        changes.viewSide = "BACK";
        replyParts.push("Virei o manequim para as **Costas** para destacar a estampa traseira ampla.");
      } else if (lower.includes("manga") || lower.includes("lado") || lower.includes("perfil")) {
        action = "ADD_LOGO";
        changes.logoPosition = "MANGA";
        changes.viewSide = "SLEEVE";
        replyParts.push("Girei o manequim para a **Manga Lateral**.");
      }

      // Texto personalizado (ex: "Escreve BRAVO nas costas")
      const textMatch = lower.match(/(escreve|escrever|nome|texto|frase)\s+["']?([^"'\n]+?)["']?\s*(nas costas|na frente|no peito)?$/);
      if (textMatch) {
        action = "ADD_TEXT";
        changes.customText = textMatch[2].replace(/nas costas|na frente|no peito/gi, "").trim().toUpperCase();
        changes.customTextPosition = lower.includes("costas") ? "BACK" : "FRONT";
        changes.viewSide = changes.customTextPosition;
        replyParts.push(`Inseri o texto **"${changes.customText}"** ${changes.customTextPosition === "BACK" ? "nas costas" : "na frente"}.`);
      }

      // Número esportivo (ex: "Coloca o número 10")
      const numMatch = lower.match(/(numero|número|num|nº)\s*(\d{1,2})/);
      if (numMatch) {
        action = "ADD_NUMBER";
        changes.customNumber = numMatch[2];
        changes.customNumberPosition = "BACK";
        changes.viewSide = "BACK";
        replyParts.push(`Adicionei o número dorsal **"${changes.customNumber}"** nas costas.`);
      }

      // Pergunta de Orçamento / Preço
      if (lower.includes("quanto fica") || lower.includes("preco") || lower.includes("preço") || lower.includes("orcamento") || lower.includes("orçamento") || lower.includes("valor")) {
        action = "CALCULATE_QUOTE";
        replyParts.push("Calculei os valores exatos com o nosso motor industrial de preços. O resumo e o botão de WhatsApp já estão disponíveis abaixo!");
      }

      if (replyParts.length === 0) {
        replyParts.push("Entendido! Estou acompanhando cada especificação do seu uniforme. O que mais gostaria de ajustar (cor, modelo, quantidade, logo ou textos)?");
      }

      structuredCommand = {
        action,
        changes,
        explanation: replyParts.join(" "),
      };

      aiReply = replyParts.join("\n\n");
    }

    // 4. Validar e Aplicar as Mudanças com Segurança (IA NUNCA altera o banco diretamente)
    const validChanges = structuredCommand?.changes || {};

    const updatedModel =
      validChanges.model && VALID_MODELS[validChanges.model]
        ? validChanges.model
        : currentProject.model;
    const updatedColor = validChanges.color || currentProject.color;
    const updatedCollarType = validChanges.collarType || currentProject.collarType;
    const updatedQuantity =
      validChanges.quantity && validChanges.quantity > 0
        ? validChanges.quantity
        : (currentProject.quantity || 20);
    const updatedLogoPosition = validChanges.logoPosition || currentProject.logoPosition;
    const updatedLogoScale =
      validChanges.logoScale !== undefined
        ? Math.max(0.4, Math.min(2.5, validChanges.logoScale))
        : (currentProject.logoScale || 1.0);
    const updatedCustomText =
      validChanges.customText !== undefined ? validChanges.customText : currentProject.customText;
    const updatedCustomTextPosition =
      validChanges.customTextPosition || currentProject.customTextPosition || "BACK";
    const updatedCustomNumber =
      validChanges.customNumber !== undefined ? validChanges.customNumber : currentProject.customNumber;
    const updatedCustomNumberPosition =
      validChanges.customNumberPosition || currentProject.customNumberPosition || "BACK";
    const updatedViewSide = validChanges.viewSide || currentProject.viewSide || "FRONT";

    const mergedProject = {
      ...currentProject,
      model: updatedModel,
      color: updatedColor,
      collarType: updatedCollarType,
      quantity: updatedQuantity,
      logoPosition: updatedLogoPosition,
      logoScale: updatedLogoScale,
      customText: updatedCustomText,
      customTextPosition: updatedCustomTextPosition,
      customNumber: updatedCustomNumber,
      customNumberPosition: updatedCustomNumberPosition,
      viewSide: updatedViewSide,
      sizeDistribution: validChanges.sizeDistribution || currentProject.sizeDistribution,
    };

    // 5. Cálculo Oficial de Preços com o PricingService do Servidor
    const modelBaseName = VALID_MODELS[mergedProject.model]?.shortName || "Camiseta Tradicional";

    const frontCustomizations = [];
    const backCustomizations = [];

    if (mergedProject.logoUrl) {
      if (mergedProject.logoPosition === "COSTAS") {
        backCustomizations.push({
          id: "logo-back",
          type: "IMAGE" as const,
          viewSide: "BACK" as const,
          zoneId: "COSTAS",
          x: 0,
          y: 0,
          width: 120,
          height: 120,
          rotation: 0,
          scaleX: mergedProject.logoScale,
          scaleY: mergedProject.logoScale,
        });
      } else {
        frontCustomizations.push({
          id: "logo-front",
          type: "IMAGE" as const,
          viewSide: "FRONT" as const,
          zoneId: mergedProject.logoPosition || "PEITO_ESQUERDO",
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          rotation: 0,
          scaleX: mergedProject.logoScale,
          scaleY: mergedProject.logoScale,
        });
      }
    }

    if (mergedProject.customText) {
      const isBack = mergedProject.customTextPosition === "BACK";
      const item = {
        id: "text-1",
        type: "TEXT" as const,
        viewSide: isBack ? ("BACK" as const) : ("FRONT" as const),
        zoneId: isBack ? "COSTAS" : "CENTRO_FRONTAL",
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      };
      if (isBack) backCustomizations.push(item);
      else frontCustomizations.push(item);
    }

    if (mergedProject.customNumber) {
      backCustomizations.push({
        id: "num-1",
        type: "NUMBER" as const,
        viewSide: "BACK" as const,
        zoneId: "COSTAS",
        x: 0,
        y: 0,
        width: 80,
        height: 80,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      });
    }

    const basePricing = await PricingService.calculate({
      modelName: modelBaseName,
      quantity: mergedProject.quantity,
      views: {
        FRONT: frontCustomizations,
        BACK: backCustomizations,
      },
    });

    const unitPrice = basePricing.unitPrice || (mergedProject.model === "POLO" ? 48.0 : 35.0);
    const totalPrice = basePricing.total || unitPrice * mergedProject.quantity;

    // Formatar grade de tamanhos
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
      ? `📏 *Grade de Tamanhos:* ${sizeBreakdownStr} (Total: ${mergedProject.quantity} un.)\n`
      : `📦 *Quantidade:* ${mergedProject.quantity} unidades\n`;

    const collarLine = mergedProject.collarType
      ? `👔 *Tipo de Gola:* ${mergedProject.collarType}\n`
      : "";

    const contrastLine =
      mergedProject.collarColor || mergedProject.sleeveColor
        ? `🎨 *Detalhes Bicolor:* Gola: ${mergedProject.collarColor?.name || mergedProject.color.name} | Mangas: ${mergedProject.sleeveColor?.name || mergedProject.color.name}\n`
        : "";

    const textLine = mergedProject.customText
      ? `✍️ *Texto Estampado:* "${mergedProject.customText}" (${mergedProject.customTextPosition === "BACK" ? "Costas" : "Frente"})\n`
      : "";

    const numLine = mergedProject.customNumber
      ? `🔢 *Número Dorsal:* ${mergedProject.customNumber} (Costas)\n`
      : "";

    // Mensagem Oficial para o WhatsApp da Fábrica
    const whatsAppText =
      `Olá, equipe da *GH Camiseteria*! 👋\n\n` +
      `Montei meu uniforme no consultor virtual do site e gostaria de formalizar meu orçamento:\n\n` +
      `👕 *Modelo:* ${modelBaseName}\n` +
      collarLine +
      `🎨 *Cor Principal:* ${mergedProject.color.name} (${mergedProject.color.hex})\n` +
      contrastLine +
      `📍 *Aplicação de Logo:* ${mergedProject.logoPosition || "Peito Esquerdo"}\n` +
      textLine +
      numLine +
      sizeLine +
      `💰 *Estimativa Oficial:* R$ ${unitPrice.toFixed(2)}/un. (Total: R$ ${totalPrice.toFixed(2)})\n\n` +
      `Poderiam me passar os prazos de produção e os detalhes para envio da arte em alta resolução?`;

    return NextResponse.json({
      success: true,
      reply: aiReply,
      command: structuredCommand,
      updatedProject: {
        model: updatedModel,
        color: updatedColor,
        collarType: updatedCollarType,
        quantity: updatedQuantity,
        logoPosition: updatedLogoPosition,
        logoScale: updatedLogoScale,
        customText: updatedCustomText,
        customTextPosition: updatedCustomTextPosition,
        customNumber: updatedCustomNumber,
        customNumberPosition: updatedCustomNumberPosition,
        viewSide: updatedViewSide,
        sizeDistribution: mergedProject.sizeDistribution,
      },
      quoteSummary: {
        modelName: modelBaseName,
        fabricDescription: VALID_MODELS[mergedProject.model]?.fabric,
        colorName: mergedProject.color.name,
        colorHex: mergedProject.color.hex,
        collarType: mergedProject.collarType,
        collarColorName: mergedProject.collarColor?.name,
        sleeveColorName: mergedProject.sleeveColor?.name,
        logoPosition: mergedProject.logoPosition || "PEITO_ESQUERDO",
        logoScale: updatedLogoScale,
        customText: updatedCustomText,
        customNumber: updatedCustomNumber,
        sizeBreakdown: sizeBreakdownStr || `${mergedProject.quantity} un.`,
        quantity: mergedProject.quantity,
        unitPrice,
        totalPrice,
        discountPercent: basePricing.discountPercent || 0,
        leadTimeDays: 7,
        whatsAppText,
      },
      whatsappMessage: whatsAppText,
    });
  } catch (error: unknown) {
    console.error("Erro na compilação do uniforme:", error);
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
