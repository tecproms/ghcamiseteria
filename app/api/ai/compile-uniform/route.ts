// app/api/ai/compile-uniform/route.ts
// Compilação inteligente de uniforme e orçamento com IA Groq (Llama 3)
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import { PricingService } from "@/services/pricing/pricing.service";
import { OrdersService } from "@/services/orders.service";
import { createClient } from "@/lib/supabase/server";
import type { CustomizerElement } from "@/types/configurator";

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
  | "QUERY_ORDER_STATUS"
  | "INVALID_REQUEST";

interface StructuredCommand {
  action: CommandAction;
  changes: {
    model?: "TRADITIONAL" | "POLO" | "MANGA_LONGA";
    modelType?: "TRADITIONAL" | "POLO" | "MANGA_LONGA";
    rejectedItem?: string;
    purpose?: string;
    fabric?: string;
    desiredDeadline?: string;
    observations?: string;
    color?: { name: string; hex: string };
    collarType?: string;
    collarColor?: { name: string; hex: string };
    sleeveColor?: { name: string; hex: string };
    quantity?: number;
    sizeDistribution?: Record<string, number>;
    logoUrl?: string | null;
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
  purpose?: string | null;
  fabric?: string | null;
  desiredDeadline?: string | null;
  observations?: string | null;
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
  currentQuoteNumber?: string;
  quoteVersion?: number;
  userId?: string;
  orderId?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CompileRequest;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const rawProject: InboundProject = body.currentProject || body.currentConfig || {};
    const currentProject = {
      model: rawProject.model || rawProject.modelType || "TRADITIONAL",
      modelType: rawProject.modelType || rawProject.model || "TRADITIONAL",
      purpose: (rawProject.purpose as string) || null,
      fabric: (rawProject.fabric as string) || null,
      desiredDeadline: (rawProject.desiredDeadline as string) || null,
      observations: (rawProject.observations as string) || null,
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

    // 0. Consulta de Status Real do Pedido & Etapas de Produção via IA (100% Somente-Leitura)
    const isOrderStatusQuery =
      lower.includes("como está meu pedido") ||
      lower.includes("como esta meu pedido") ||
      lower.includes("meu pedido já foi produzido") ||
      lower.includes("meu pedido ja foi produzido") ||
      lower.includes("já foi produzido") ||
      lower.includes("ja foi produzido") ||
      lower.includes("está pronto") ||
      lower.includes("esta pronto") ||
      lower.includes("já está pronto") ||
      lower.includes("ja esta pronto") ||
      lower.includes("qual a situação") ||
      lower.includes("qual a situacao") ||
      lower.includes("qual a situação do meu pedido") ||
      lower.includes("qual o status") ||
      lower.includes("qual é o status") ||
      lower.includes("qual e o status") ||
      lower.includes("status do meu pedido") ||
      lower.includes("status do pedido") ||
      lower.includes("onde está meu pedido") ||
      lower.includes("onde esta meu pedido") ||
      lower.includes("rastrear pedido") ||
      lower.includes("andamento do pedido") ||
      lower.includes("andamento da produção") ||
      lower.includes("andamento da producao") ||
      lower.includes("como está a produção") ||
      lower.includes("como esta a producao") ||
      lower.includes("produção do pedido") ||
      lower.includes("producao do pedido") ||
      (lower.includes("pedido") &&
        (lower.includes("pronto") ||
          lower.includes("produzido") ||
          lower.includes("situacao") ||
          lower.includes("situação") ||
          lower.includes("andamento") ||
          lower.includes("status")));

    if (isOrderStatusQuery) {
      let userId: string | null = body.userId || null;
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.id) userId = user.id;
      } catch {
        // Fallback
      }

      if (!userId && process.env.NODE_ENV !== "production") {
        userId = req.headers.get("x-user-id") || userId;
      }

      const orderMatch = lower.match(/(ped-\d{4}-\d+|#\d{4,}|\border-[a-z0-9-]+\b)/i);
      const targetOrderIdentifier = body.orderId || (orderMatch ? orderMatch[0].replace("#", "") : null);

      const queryResult = await OrdersService.queryOrderStatusForClient(userId, targetOrderIdentifier);

      return NextResponse.json({
        success: true,
        reply: queryResult.reply,
        command: {
          action: "QUERY_ORDER_STATUS",
          changes: {},
          explanation: queryResult.reply,
        },
        orderInfo: {
          orderNumber: queryResult.orderNumber,
          status: queryResult.status,
          productionStep: queryResult.productionStep,
          unauthorized: queryResult.unauthorized,
        },
        updatedProject: currentProject,
      });
    }

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
Seu objetivo é orientar o cliente de forma consultiva, acolhedora e eficiente, como um alfaiate/consultor industrial de fábrica.

Catálogo Oficial:
- Modelos: "TRADITIONAL" (Camiseta Tradicional Meia Malha ou Dry Fit), "POLO" (Camisa Polo em Piquet), "MANGA_LONGA" (Manga Longa com ribana).
- Tecidos: "Piquet Nobre Duplo 220g/m²" (empresas, formal), "Dry Fit 100% Poliéster" (times, esportes, atividades externas), "Meia Malha 100% Algodão Penteado 30.1" (dia a dia, macio).
- Posições da logo: "PEITO_ESQUERDO", "CENTRO_FRONTAL", "PEITO_DIREITO", "COSTAS", "MANGA".
- Cores: 24 cores têxteis reais (Preto Clássico, Branco Neve, Azul Marinho, Azul Royal, Vermelho Ferrari, Cinza Mescla, Grafite, Verde Militar, etc).

Regras de Atendimento do Consultor:
1. NÃO FAÇA INTERROGATÓRIO: Pergunte apenas o que realmente estiver faltando para avançar. Se o cliente já informou dados (ex: "Quero 30 polos pretas"), NUNCA pergunte novamente quantidade, modelo ou cor.
2. SUGESTÃO CONSULTIVA INTELIGENTE:
   - Para times/esportes ou equipes externas: sugira ativamente "Dry Fit 100% Poliéster" com secagem rápida e proteção UV.
   - Para empresas/escritórios: sugira "Camisa Polo em Piquet" ou "Camiseta em Algodão Penteado 30.1".
   - Para eventos/promoções: sugira "Camiseta Tradicional".
3. CATÁLOGO REAL: Se o cliente pedir algo fora de linha (jaquetas, jeans, moletom, boné), recuse educadamente e ofereça alternativas do nosso catálogo.
4. NUNCA invente preços ou descontos. Quando o cliente perguntar ou disser "Quanto fica?", "Pode fazer o orçamento?", "Quero fechar." ou solicitar valores/orçamento, selecione action: "CALCULATE_QUOTE". O cálculo é realizado 100% no servidor.
5. Lembre de todo o contexto anterior do uniforme:
${JSON.stringify(currentProject, null, 2)}

SEMPRE termine sua resposta com um bloco JSON delimitado por \`\`\`json { ... } \`\`\`:
\`\`\`json
{
  "action": "UPDATE_UNIFORM" | "ADD_LOGO" | "UPDATE_LOGO" | "ADD_TEXT" | "ADD_NUMBER" | "CALCULATE_QUOTE",
  "changes": {
    "purpose": "EMPRESA" | "TIME" | "EVENTO" | "OUTRO",
    "fabric": "...",
    "model": "TRADITIONAL" | "POLO" | "MANGA_LONGA",
    "color": { "name": "...", "hex": "#..." },
    "collarType": "...",
    "quantity": 30,
    "logoPosition": "PEITO_ESQUERDO" | "CENTRO_FRONTAL" | "PEITO_DIREITO" | "COSTAS" | "MANGA",
    "logoScale": 1.0,
    "customText": "...",
    "customTextPosition": "BACK",
    "customNumber": "...",
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

    // 3. Motor Heurístico de Alta Fidelidade (Garante 100% de funcionamento e postura consultiva)
    if (!structuredCommand) {
      const changes: StructuredCommand["changes"] = {};
      let action: CommandAction = "UPDATE_UNIFORM";
      const replyParts: string[] = [];

      // 1. Finalidade (Empresa, Time, Evento, Outro)
      if (lower.includes("empresa") || lower.includes("corporativ") || lower.includes("escritorio") || lower.includes("trabalho") || lower.includes("firma")) {
        changes.purpose = "EMPRESA";
      } else if (lower.includes("time") || lower.includes("esporte") || lower.includes("futebol") || lower.includes("atlet") || lower.includes("corrida") || lower.includes("academia")) {
        changes.purpose = "TIME";
      } else if (lower.includes("evento") || lower.includes("festa") || lower.includes("promocao") || lower.includes("promocional") || lower.includes("congresso") || lower.includes("feiras")) {
        changes.purpose = "EVENTO";
      } else if (lower.includes("outra") || lower.includes("outro")) {
        changes.purpose = "OUTRO";
      }

      // 2. Tecido
      if (lower.includes("dry fit") || lower.includes("dryfit") || lower.includes("dry") || lower.includes("poliester") || lower.includes("poliéster")) {
        changes.fabric = "Dry Fit 100% Poliéster";
        changes.model = changes.model || "TRADITIONAL";
        changes.modelType = changes.modelType || "TRADITIONAL";
        replyParts.push("Defini o tecido em **Dry Fit 100% Poliéster**, com secagem rápida e proteção térmica.");
      } else if (lower.includes("piquet") || lower.includes("piquet duplo")) {
        changes.fabric = "Piquet Nobre Duplo 220g/m²";
        changes.model = "POLO";
        changes.modelType = "POLO";
        replyParts.push("Defini o tecido em **Piquet Nobre Duplo 220g/m²**, padrão executivo alinhado.");
      } else if (lower.includes("algodao") || lower.includes("algodão") || lower.includes("meia malha") || lower.includes("30.1")) {
        changes.fabric = "Meia Malha 100% Algodão Penteado 30.1";
        replyParts.push("Defini o tecido em **Meia Malha 100% Algodão Penteado 30.1**, macio e confortável.");
      }

      // 3. Modelo
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

      // 4. Cor
      for (const catColor of CATALOG_COLORS) {
        if (catColor.aliases.some((alias) => lower.includes(alias))) {
          changes.color = { name: catColor.name, hex: catColor.hex };
          replyParts.push(`Apliquei o tingimento fotográfico na cor **${catColor.name}**.`);
          break;
        }
      }
      if (!changes.color && (lower.includes("mudar a cor") || lower.includes("muda a cor") || lower.includes("trocar a cor") || lower.includes("trocar de cor") || lower.includes("outra cor"))) {
        replyParts.push("Claro! Para qual cor você gostaria de mudar? Temos 24 opções no catálogo como Azul Marinho, Preto Clássico, Branco Neve, Vermelho Ferrari, Cinza Mescla, Verde Militar...");
      }

      // 5. Gola
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

      // 6. Quantidade
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
      } else if (lower.includes("aumentar a quantidade") || lower.includes("aumenta a quantidade") || lower.includes("mais pecas") || lower.includes("mais peças")) {
        action = "UPDATE_UNIFORM";
        const newQty = (currentProject.quantity || 20) + 10;
        changes.quantity = newQty;
        const p = Math.round(newQty * 0.2);
        const m = Math.round(newQty * 0.4);
        const g = Math.round(newQty * 0.3);
        const gg = Math.max(0, newQty - (p + m + g));
        changes.sizeDistribution = { PP: 0, P: p, M: m, G: g, GG: gg, XG: 0, XXG: 0 };
        replyParts.push(`Aumentei o lote para **${newQty} unidades** (+10 peças) com grade balanceada.`);
      }

      // 7. Posição e Escala da Logo / Remoção
      const currentScale = currentProject.logoScale || 1.0;
      if (lower.includes("tirar a logo") || lower.includes("tira a logo") || lower.includes("remover a logo") || lower.includes("remove a logo") || lower.includes("sem logo")) {
        action = "UPDATE_LOGO";
        if (lower.includes("costas") || currentProject.logoPosition === "COSTAS") {
          changes.logoPosition = "PEITO_ESQUERDO";
          changes.viewSide = "FRONT";
          replyParts.push("Removi a aplicação da logo das costas e reposicionei no peito esquerdo.");
        } else {
          changes.logoPosition = "PEITO_ESQUERDO";
          changes.logoUrl = null;
          replyParts.push("Removi a logomarca do manequim.");
        }
      } else if (body.hasUploadedLogo || lower.includes("anexei") || lower.includes("anexar") || lower.includes("anexada") || lower.includes("enviei minha logo") || lower.includes("minha logo")) {
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

      const isRemovingLogo =
        lower.includes("tirar a logo") ||
        lower.includes("tira a logo") ||
        lower.includes("remover a logo") ||
        lower.includes("remove a logo") ||
        lower.includes("sem logo");

      if (!isRemovingLogo) {
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
      }

      // 8. Texto personalizado (ex: "Escreve BRAVO nas costas")
      const textMatch = lower.match(/(escreve|escrever|nome|texto|frase)\s+["']?([^"'\n]+?)["']?\s*(nas costas|na frente|no peito)?$/);
      if (textMatch) {
        action = "ADD_TEXT";
        changes.customText = textMatch[2].replace(/nas costas|na frente|no peito/gi, "").trim().toUpperCase();
        changes.customTextPosition = lower.includes("costas") ? "BACK" : "FRONT";
        changes.viewSide = changes.customTextPosition;
        replyParts.push(`Inseri o texto **"${changes.customText}"** ${changes.customTextPosition === "BACK" ? "nas costas" : "na frente"}.`);
      }

      // 9. Número esportivo (ex: "Coloca o número 10")
      const numMatch = lower.match(/(numero|número|num|nº)\s*(\d{1,2})/);
      if (numMatch) {
        action = "ADD_NUMBER";
        changes.customNumber = numMatch[2];
        changes.customNumberPosition = "BACK";
        changes.viewSide = "BACK";
        replyParts.push(`Adicionei o número dorsal **"${changes.customNumber}"** nas costas.`);
      }

      // 10. Pergunta de Orçamento / Preço / Fechar Pedido
      const isQuoteTrigger =
        lower.includes("quanto fica") ||
        lower.includes("quanto custa") ||
        lower.includes("pode fazer o orçamento") ||
        lower.includes("pode fazer o orcamento") ||
        lower.includes("fazer o orçamento") ||
        lower.includes("fazer o orcamento") ||
        lower.includes("fazer orçamento") ||
        lower.includes("fazer orcamento") ||
        lower.includes("quero fechar") ||
        lower.includes("fechar pedido") ||
        lower.includes("fechar agora") ||
        lower.includes("vamos fechar") ||
        lower.includes("preco") ||
        lower.includes("preço") ||
        lower.includes("orcamento") ||
        lower.includes("orçamento") ||
        lower.includes("valor");

      if (isQuoteTrigger) {
        action = "CALCULATE_QUOTE";
        replyParts.push(
          "Processei a sua configuração com o nosso motor industrial de preços oficial. Seu cartão de orçamento está pronto com valores calculados no servidor!"
        );
      }

      // 11. Condução Consultiva Inteligente (Anti-Interrogatório)
      if (action !== "CALCULATE_QUOTE") {
        const isPurposeJustSelected = changes.purpose && !changes.model && !changes.color && !changes.quantity;
        const hasLogoOrArt = !!(currentProject.logoUrl || body.hasUploadedLogo || changes.customText || currentProject.customText || lower.includes("logo") || lower.includes("anex"));

        if (isPurposeJustSelected) {
          if (changes.purpose === "TIME") {
            replyParts.push("Show de bola! Para times e equipes esportivas, temos o tecido **Dry Fit 100% Poliéster** com secagem rápida e proteção UV. Gostaria de montar na Camiseta Dry Fit ou prefere outro modelo?");
          } else if (changes.purpose === "EMPRESA") {
            replyParts.push("Excelente! Para equipes e empresas, nossas opções mais buscadas são a **Camisa Polo em Piquet Nobre** (mais formal e alinhada) ou a **Camiseta Tradicional em Meia Malha Penteada 30.1**. Qual combina mais com o estilo da sua equipe?");
          } else if (changes.purpose === "EVENTO") {
            replyParts.push("Perfeito! Para eventos e ações comemorativas, a **Camiseta Tradicional** oferece o melhor custo-benefício e caimento. Gostaria de ver em algodão ou prefere polo?");
          } else {
            replyParts.push("Perfeito! Nossos modelos principais são **Camiseta Tradicional**, **Camisa Polo** e **Manga Longa**. Qual deles você gostaria de personalizar?");
          }
        } else if (!hasLogoOrArt) {
          replyParts.push("Você já possui a logomarca para aplicarmos? Pode anexá-la pelo botão do chat ou me dizer se deseja colocar no peito ou nas costas.");
        } else if (!changes.quantity && (!currentProject.quantity || currentProject.quantity === 20)) {
          replyParts.push("Quantas peças você estima produzir para o lote da equipe?");
        } else if (replyParts.length === 0) {
          replyParts.push("Entendido! Estou acompanhando cada detalhe do seu uniforme. O que mais gostaria de ajustar?");
        }
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
      purpose: validChanges.purpose || currentProject.purpose || null,
      fabric: validChanges.fabric || currentProject.fabric || null,
      desiredDeadline: validChanges.desiredDeadline || currentProject.desiredDeadline || null,
      observations: validChanges.observations || currentProject.observations || null,
    };

    // 5. Cálculo Oficial de Preços com o PricingService do Servidor
    const modelBaseName = VALID_MODELS[mergedProject.model]?.shortName || "Camiseta Tradicional";

    const frontCustomizations: CustomizerElement[] = [];
    const backCustomizations: CustomizerElement[] = [];
    const sleeveCustomizations: CustomizerElement[] = [];
    const customizationDescriptions: string[] = [];

    if (mergedProject.logoUrl || body.hasUploadedLogo) {
      if (mergedProject.logoPosition === "COSTAS") {
        backCustomizations.push({
          id: "logo-back",
          type: "IMAGE",
          viewSide: "BACK",
          zoneId: "COSTAS",
          x: 0,
          y: 0,
          width: 120,
          height: 120,
          rotation: 0,
          scaleX: mergedProject.logoScale,
          scaleY: mergedProject.logoScale,
        });
        customizationDescriptions.push("Logo costas");
      } else if (mergedProject.logoPosition === "MANGA") {
        sleeveCustomizations.push({
          id: "logo-sleeve",
          type: "IMAGE",
          viewSide: "LEFT_SLEEVE",
          zoneId: "MANGA",
          x: 0,
          y: 0,
          width: 80,
          height: 80,
          rotation: 0,
          scaleX: mergedProject.logoScale,
          scaleY: mergedProject.logoScale,
        });
        customizationDescriptions.push("Logo manga lateral");
      } else {
        const posLabel =
          mergedProject.logoPosition === "PEITO_DIREITO"
            ? "Logo peito direito"
            : mergedProject.logoPosition === "CENTRO_FRONTAL"
            ? "Logo centro do peito"
            : "Logo peito esquerdo";
        frontCustomizations.push({
          id: "logo-front",
          type: "IMAGE",
          viewSide: "FRONT",
          zoneId: mergedProject.logoPosition || "PEITO_ESQUERDO",
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          rotation: 0,
          scaleX: mergedProject.logoScale,
          scaleY: mergedProject.logoScale,
        });
        customizationDescriptions.push(posLabel);
      }
    }

    if (mergedProject.customText) {
      const isBack = mergedProject.customTextPosition === "BACK";
      const item: CustomizerElement = {
        id: "text-1",
        type: "TEXT",
        viewSide: isBack ? "BACK" : "FRONT",
        zoneId: isBack ? "COSTAS" : "CENTRO_FRONTAL",
        x: 0,
        y: 0,
        width: 140,
        height: 40,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        text: mergedProject.customText,
      };
      if (isBack) {
        backCustomizations.push(item);
        customizationDescriptions.push(`Nome nas costas ("${mergedProject.customText}")`);
      } else {
        frontCustomizations.push(item);
        customizationDescriptions.push(`Nome na frente ("${mergedProject.customText}")`);
      }
    }

    if (mergedProject.customNumber) {
      const isBack = mergedProject.customNumberPosition === "BACK";
      const item: CustomizerElement = {
        id: "num-1",
        type: "NUMBER",
        viewSide: isBack ? "BACK" : "FRONT",
        zoneId: isBack ? "COSTAS" : "CENTRO_FRONTAL",
        x: 0,
        y: 0,
        width: 100,
        height: 60,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        text: mergedProject.customNumber,
      };
      if (isBack) {
        backCustomizations.push(item);
        customizationDescriptions.push(`Número dorsal ${mergedProject.customNumber} nas costas`);
      } else {
        frontCustomizations.push(item);
        customizationDescriptions.push(`Número ${mergedProject.customNumber} na frente`);
      }
    }

    if (customizationDescriptions.length === 0) {
      customizationDescriptions.push("Sem personalizações adicionais");
    }

    const basePricing = await PricingService.calculate({
      shirtModelId: mergedProject.model,
      modelName: modelBaseName,
      quantity: mergedProject.quantity,
      views: {
        FRONT: frontCustomizations,
        BACK: backCustomizations,
        LEFT_SLEEVE: sleeveCustomizations,
      },
    });

    const unitPrice = typeof basePricing?.unitPrice === "number" ? basePricing.unitPrice : (mergedProject.model === "POLO" ? 48.0 : 35.0);
    const totalPrice = typeof basePricing?.total === "number" ? basePricing.total : unitPrice * mergedProject.quantity;

    const quoteNumber =
      body.currentQuoteNumber ||
      `#${Math.floor(1000 + Math.random() * 9000)}`;
    const version = typeof body.quoteVersion === "number" ? body.quoteVersion + 1 : 1;

    const sizeBreakdownStr = Object.entries(mergedProject.sizeDistribution || {})
      .filter(([, qty]) => typeof qty === "number" && qty > 0)
      .map(([sz, qty]) => `${qty}x ${sz}`)
      .join(", ");

    const collarLine = mergedProject.collarType ? `👔 *Tipo de Gola:* ${mergedProject.collarType}\n` : "";
    const purposeLine = mergedProject.purpose ? `🎯 *Finalidade:* ${mergedProject.purpose}\n` : "";
    const fabricLine = mergedProject.fabric ? `🧵 *Tecido Escolhido:* ${mergedProject.fabric}\n` : "";
    const contrastLine =
      mergedProject.collarColor || mergedProject.sleeveColor
        ? `✨ *Contrastes:* ${mergedProject.collarColor ? `Gola: ${mergedProject.collarColor.name}` : ""} ${
            mergedProject.sleeveColor ? `| Manga: ${mergedProject.sleeveColor.name}` : ""
          }\n`
        : "";
    const textLine = mergedProject.customText
      ? `✍️ *Texto Estampado:* "${mergedProject.customText}" (${mergedProject.customTextPosition === "BACK" ? "Costas" : "Frente"})\n`
      : "";
    const numLine = mergedProject.customNumber
      ? `🔢 *Número Dorsal:* ${mergedProject.customNumber} (${mergedProject.customNumberPosition === "BACK" ? "Costas" : "Frente"})\n`
      : "";
    const sizeLine = sizeBreakdownStr
      ? `📏 *Grade de Tamanhos:* ${sizeBreakdownStr} (Total: ${mergedProject.quantity} un.)\n`
      : "";

    // Mensagem Oficial para o WhatsApp da Fábrica
    const whatsAppText =
      `Olá, equipe da *GH Camiseteria*! 👋\n\n` +
      `Montei meu uniforme no consultor virtual do site e gostaria de formalizar meu orçamento:\n\n` +
      purposeLine +
      `👕 *Modelo:* ${modelBaseName}\n` +
      fabricLine +
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
        purpose: mergedProject.purpose,
        fabric: mergedProject.fabric,
        desiredDeadline: mergedProject.desiredDeadline,
        observations: mergedProject.observations,
      },
      quoteSummary: {
        quoteNumber,
        version,
        status: "AGUARDANDO APROVAÇÃO",
        modelName: modelBaseName,
        fabricDescription: mergedProject.fabric || VALID_MODELS[mergedProject.model]?.fabric,
        purpose: mergedProject.purpose,
        colorName: mergedProject.color.name,
        colorHex: mergedProject.color.hex,
        collarType: mergedProject.collarType,
        collarColorName: mergedProject.collarColor?.name,
        sleeveColorName: mergedProject.sleeveColor?.name,
        logoPosition: mergedProject.logoPosition || "PEITO_ESQUERDO",
        logoScale: updatedLogoScale,
        customText: updatedCustomText,
        customNumber: updatedCustomNumber,
        customizations: customizationDescriptions,
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
