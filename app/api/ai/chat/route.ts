// app/api/ai/chat/route.ts
// Consultor Virtual e Triagem Especializada de Uniformes via Groq Cloud
// GH Camiseteria & Uniformes Personalizados

import { NextResponse } from "next/server";
import { SettingsService } from "@/services/settings.service";

export interface UniformDraftState {
  purpose?: string;
  modelType?: "TRADITIONAL" | "POLO" | "MANGA_LONGA" | "REGATA" | "MOLETOM";
  modelName?: string;
  fabric?: string;
  primaryColor?: { name: string; hex: string };
  hasPocket?: boolean;
  pocketColor?: string;
  collarType?: string;
  collarColor?: string;
  sleeveColor?: string;
  logoPlacement?: "PEITO_ESQUERDO" | "PEITO_DIREITO" | "CENTRO_FRONTAL" | "BOLSO" | "MANGA" | "COSTAS" | "NENHUM";
  logoUrl?: string | null;
  customBackText?: string;
  customBackNumber?: string;
  quantity?: number;
  sizeDistribution?: Record<string, number>;
  notes?: string;
  currentStep?: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  draft?: UniformDraftState;
}

const SYSTEM_PROMPT = `
Você é o Consultor Técnico Especialista em Uniformes da "GH Camiseteria & Uniformes Personalizados".
Seu papel é guiar o cliente de forma acolhedora, objetiva e profissional para definir 100% dos detalhes do seu uniforme ideal.

REGRAS FUNDAMENTAIS DE TRIAGEM E FLUXO:
1. Faça uma ou no máximo duas perguntas por vez, mantendo o diálogo ágil e agradável.
2. Acompanhe a triagem inteligente de acordo com as variações da peça:
   - ETAPA 1 (Finalidade & Tipo de Peça): Descubra se é para empresa/escritório, time esportivo, evento, indústria, etc., e qual o tipo base de peça (Camiseta Tradicional, Camisa Polo, Manga Longa, etc.).
   - ETAPA 2 (Tecido & Cor Principal): Sugira o melhor tecido para a finalidade (ex: Piquet para polo corporativa, Dry Fit para esportes/climas quentes, Algodão 30.1 para eventos e dia a dia) e pergunte a cor principal desejada.
   - ETAPA 3 (Modelagem & Bolso - OBRIGATÓRIO PERGUNTAR SE TEM BOLSO):
     * Pergunte explicitamente se o uniforme terá BOLSO frontal no peito ou SEM BOLSO.
     * Se o cliente escolher COM BOLSO: pergunte se o bolso será da mesma cor da camisa ou em cor de contraste (ex: bolso preto em camisa cinza).
     * Se for Camisa Polo: pergunte detalhes da gola e peitilho (cor sólida ou com friso/contraste).
     * Se for Camiseta: pergunte o tipo de gola (Gola Careca/Redonda tradicional ou Gola V).
   - ETAPA 4 (Logo & Personalizações):
     * Pergunte sobre a aplicação da Logo: onde prefere colocar? (Peito esquerdo tradicional, Peito direito, Centralizada, No Bolso - se tiver bolso, na Manga, ou nas Costas).
     * Pergunte se deseja personalização nas costas (Logo grande nas costas, Nome da empresa/pessoa, Número esportivo ou Lisa).
   - ETAPA 5 (Quantidade & Grade): Pergunte a quantidade aproximada de peças e os tamanhos (P, M, G, GG, XG).
   - ETAPA 6 (Finalização & Aprovação): Faça um resumo completo e pergunte se o cliente aprova o design para gerar os mockups fotorrealistas de estúdio.

FORMATO OBRIGATÓRIO DA SUA RESPOSTA:
Você DEVE SEMPRE responder APENAS com um objeto JSON válido, sem texto antes ou depois, seguindo esta estrutura:
{
  "reply": "Texto da sua mensagem para o cliente, acolhedor e com formatação markdown limpa (emoticons moderados)",
  "quickReplies": ["Opção 1", "Opção 2", "Opção 3"],
  "draft": {
    "purpose": "Finalidade identificada",
    "modelType": "TRADITIONAL" | "POLO" | "MANGA_LONGA" | "REGATA" | "MOLETOM",
    "modelName": "Nome do modelo (ex: Camisa Polo Corporativa)",
    "fabric": "Tecido escolhido",
    "primaryColor": { "name": "Nome da cor", "hex": "#HEX" },
    "hasPocket": true | false,
    "pocketColor": "Cor do bolso se houver",
    "collarType": "Gola Polo" | "Gola Careca" | "Gola V",
    "collarColor": "Cor da gola",
    "sleeveColor": "Cor da manga/friso",
    "logoPlacement": "PEITO_ESQUERDO" | "PEITO_DIREITO" | "CENTRO_FRONTAL" | "BOLSO" | "MANGA" | "COSTAS" | "NENHUM",
    "customBackText": "Texto das costas se houver",
    "customBackNumber": "Número se houver",
    "quantity": 25,
    "currentStep": "Etapa atual"
  },
  "isCompleted": false,
  "imagePrompts": null
}

QUANDO O CLIENTE APROVAR O RESUMO FINAL:
Defina "isCompleted": true e forneça "imagePrompts" com a seguinte estrutura em inglês fotorrealista para IA de imagem de catálogo comercial de vestuário:
"imagePrompts": {
  "frontPrompt": "Commercial studio apparel product photography, front view of a [cor] [modelo] made of [tecido], [detalhe de bolso se tiver: tailored chest pocket in [cor] with embroidered logo] [detalhe de gola], clean ghost mannequin presentation, professional softbox lighting, solid white background, sharp focus, 8k resolution, ultra detailed fabric texture",
  "backPrompt": "Commercial studio apparel product photography, back view of a [cor] [modelo] [detalhes de estampa nas costas se houver], clean ghost mannequin presentation, professional lighting, solid white background, 8k resolution",
  "sleevePrompt": "Commercial studio apparel product photography, side profile 45-degree angle closeup view of a [cor] [modelo], tailored sleeve cuff [detalhe de logo de manga se houver], ghost mannequin, clean studio white background, 8k resolution"
}
`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { messages = [], draft = {} } = body;

    // Buscar credenciais dinâmicas do banco via SettingsService
    const groqApiKey = (await SettingsService.get("GROQ_API_KEY")) || process.env.GROQ_API_KEY;
    let groqModel = (await SettingsService.get("GROQ_MODEL")) || process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    // Se o modelo configurado for o genérico antigo da OpenAI, substitui por um compatível com a Groq
    if (!groqModel || groqModel.includes("openai/") || groqModel.includes("gpt-")) {
      groqModel = "llama-3.3-70b-versatile";
    }

    if (!groqApiKey) {
      // Fallback gracioso se a chave da Groq ainda não estiver preenchida no admin
      return handleLocalFallback(messages, draft);
    }

    const conversationPayload = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "system",
        content: `ESTADO ATUAL DO PROJETO (DRAFT ACUMULADO ATÉ AGORA):\n${JSON.stringify(draft, null, 2)}`,
      },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: groqModel,
        messages: conversationPayload,
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 1024,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => "");
      console.warn("Falha na chamada da Groq, utilizando motor consultivo alternativo:", errText);
      return handleLocalFallback(messages, draft);
    }

    const groqData = await groqRes.json();
    const rawContent = groqData?.choices?.[0]?.message?.content || "";

    try {
      const parsed = JSON.parse(rawContent);
      return NextResponse.json({
        success: true,
        reply: parsed.reply || "Como posso ajudar na criação do seu uniforme?",
        quickReplies: Array.isArray(parsed.quickReplies) ? parsed.quickReplies : [],
        draft: { ...draft, ...(parsed.draft || {}) },
        isCompleted: Boolean(parsed.isCompleted),
        imagePrompts: parsed.imagePrompts || null,
      });
    } catch {
      console.warn("Resposta da Groq não foi um JSON perfeito:", rawContent);
      return NextResponse.json({
        success: true,
        reply: rawContent,
        quickReplies: ["Sim, continuar", "Alterar cor", "Adicionar bolso", "Finalizar"],
        draft,
        isCompleted: false,
        imagePrompts: null,
      });
    }
  } catch (error: unknown) {
    console.error("Erro na rota /api/ai/chat:", error);
    const msg = error instanceof Error ? error.message : "Erro interno de processamento";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * Fallback inteligente caso a chave da Groq não esteja disponível
 */
function handleLocalFallback(messages: ChatMessage[], draft: UniformDraftState) {
  const lastUserMsg = messages
    .slice()
    .reverse()
    .find((m) => m.role === "user")?.content?.toLowerCase() || "";

  const updatedDraft: UniformDraftState = { ...draft };

  let reply = "";
  let quickReplies: string[] = [];
  let isCompleted = false;
  let imagePrompts = null;

  // Triagem passo a passo por palavras-chave
  if (!updatedDraft.purpose && !updatedDraft.modelType) {
    if (lastUserMsg.includes("empresa") || lastUserMsg.includes("corporativo")) {
      updatedDraft.purpose = "Corporativo / Empresa";
      updatedDraft.modelType = "POLO";
      updatedDraft.modelName = "Camisa Polo Corporativa";
      reply = "Excelente! Para empresas e escritórios, a **Camisa Polo** em malha Piquet transmite seriedade e elegância.\n\nQual é a cor principal que você imagina para o uniforme da sua equipe?";
      quickReplies = ["Preto Elegante", "Azul Marinho", "Branco Clássico", "Cinza Chumbo"];
    } else if (lastUserMsg.includes("time") || lastUserMsg.includes("esport")) {
      updatedDraft.purpose = "Time Esportivo";
      updatedDraft.modelType = "TRADITIONAL";
      updatedDraft.modelName = "Camiseta Esportiva Dry Fit";
      updatedDraft.fabric = "Dry Fit 100% Poliéster";
      reply = "Ótima escolha! Para práticas esportivas e times, recomendamos o tecido **Dry Fit**, super leve e de rápida absorção.\n\nQual a cor predominante do seu uniforme?";
      quickReplies = ["Azul Royal", "Preto", "Vermelho", "Verde Bandeira"];
    } else {
      reply = "Olá! 👋 Sou o Consultor Virtual da **GH Camiseteria**.\n\nPara começarmos com precisão, qual é a finalidade principal do seu uniforme?";
      quickReplies = ["🏢 Empresa / Corporativo", "⚽ Time / Equipe Esportiva", "🎉 Evento / Promocional", "👕 Uso Geral / Outro"];
    }
  } else if (!updatedDraft.primaryColor) {
    let colorName = "Azul Marinho";
    let hex = "#1e3a8a";
    if (lastUserMsg.includes("preto")) { colorName = "Preto"; hex = "#111827"; }
    else if (lastUserMsg.includes("branco")) { colorName = "Branco"; hex = "#ffffff"; }
    else if (lastUserMsg.includes("cinza")) { colorName = "Cinza Chumbo"; hex = "#4b5563"; }
    else if (lastUserMsg.includes("vermelho")) { colorName = "Vermelho"; hex = "#b91c1c"; }
    else if (lastUserMsg.includes("verde")) { colorName = "Verde"; hex = "#15803d"; }
    else if (lastUserMsg.includes("azul")) { colorName = "Azul Royal"; hex = "#1d4ed8"; }

    updatedDraft.primaryColor = { name: colorName, hex };
    reply = `Perfeito, a cor **${colorName}** fica espetacular! ✨\n\nAgora sobre a modelagem: sua peça terá **BOLSO no peito** ou prefere **SEM BOLSO**?`;
    quickReplies = ["👜 Com Bolso no Peito", "🚫 Sem Bolso (Lisa)"];
  } else if (updatedDraft.hasPocket === undefined) {
    if (lastUserMsg.includes("com bolso") || lastUserMsg.includes("bolso no peito") || lastUserMsg.includes("sim")) {
      updatedDraft.hasPocket = true;
      reply = "Entendido, faremos com bolso no peito! O bolso será da **mesma cor da camisa** ou prefere em **cor contrastante**?";
      quickReplies = ["Mesma cor da peça", "Contraste em Preto", "Contraste em Branco"];
    } else {
      updatedDraft.hasPocket = false;
      reply = "Perfeito, corte limpo sem bolso frontal.\n\nE sobre a gola: qual modelo você prefere?";
      quickReplies = updatedDraft.modelType === "POLO"
        ? ["Gola Polo Tradicional", "Gola Polo com Friso Dourado", "Gola Polo com Friso Branco"]
        : ["Gola Careca (Redonda)", "Gola V"];
    }
  } else if (!updatedDraft.collarType) {
    updatedDraft.collarType = lastUserMsg.includes("v") ? "Gola V" : "Gola Careca";
    reply = `Gola definida com sucesso: **${updatedDraft.collarType}**.\n\nOnde você gostaria de aplicar a **Logomarca** da sua empresa ou equipe?`;
    quickReplies = updatedDraft.hasPocket
      ? ["No Bolso do Peito", "Peito Esquerdo", "Peito Direito", "Centralizada no Peito", "Costas"]
      : ["Peito Esquerdo", "Peito Direito", "Centralizada no Peito", "Costas"];
  } else if (!updatedDraft.logoPlacement) {
    let placement: UniformDraftState["logoPlacement"] = "PEITO_ESQUERDO";
    if (lastUserMsg.includes("bolso")) placement = "BOLSO";
    else if (lastUserMsg.includes("direito")) placement = "PEITO_DIREITO";
    else if (lastUserMsg.includes("central") || lastUserMsg.includes("centro")) placement = "CENTRO_FRONTAL";
    else if (lastUserMsg.includes("costas")) placement = "COSTAS";

    updatedDraft.logoPlacement = placement;
    reply = `Logo configurada para aplicação: **${placement}**.\n\nVocê deseja estampar algum texto, nome ou número nas costas?`;
    quickReplies = ["Sem estampa nas costas", "Nome da Empresa", "Nome Individual + Número"];
  } else if (!updatedDraft.quantity) {
    const foundNum = parseInt(lastUserMsg.replace(/\D/g, ""), 10);
    updatedDraft.quantity = isNaN(foundNum) || foundNum < 1 ? 20 : foundNum;
    reply = `Registramos a estimativa de **${updatedDraft.quantity} peças**.\n\nConfira o resumo do seu uniforme:\n` +
      `- **Modelo:** ${updatedDraft.modelName || "Camiseta"}\n` +
      `- **Cor:** ${updatedDraft.primaryColor?.name}\n` +
      `- **Bolso:** ${updatedDraft.hasPocket ? "Sim, bolso no peito" : "Não"}\n` +
      `- **Gola:** ${updatedDraft.collarType}\n` +
      `- **Logo:** ${updatedDraft.logoPlacement}\n\n` +
      `Tudo certo para gerarmos as fotos de estúdio do seu uniforme por IA?`;
    quickReplies = ["✅ Sim, gerar fotos de estúdio!", "Quero mudar a cor", "Quero mudar a gola"];
  } else {
    isCompleted = true;
    reply = "🎉 **Projeto de Uniforme Concluído com Sucesso!**\n\nNossa inteligência artificial de estúdio gerou as imagens do seu uniforme com base em todas as especificações escolhidas:";
    const color = updatedDraft.primaryColor?.name || "Navy Blue";
    const pocket = updatedDraft.hasPocket ? ", tailored chest pocket" : "";
    imagePrompts = {
      frontPrompt: `Commercial apparel studio photography, front view of a ${color} ${updatedDraft.modelName || "t-shirt"}${pocket}, ghost mannequin, clean white background, softbox lighting, 8k resolution, crisp textile texture`,
      backPrompt: `Commercial apparel studio photography, back view of a ${color} ${updatedDraft.modelName || "t-shirt"}, ghost mannequin, clean white background, softbox lighting, 8k resolution`,
      sleevePrompt: `Commercial apparel studio photography, closeup side angle of a ${color} ${updatedDraft.modelName || "t-shirt"} sleeve, ghost mannequin, clean white background, 8k resolution`,
    };
  }

  return NextResponse.json({
    success: true,
    reply,
    quickReplies,
    draft: updatedDraft,
    isCompleted,
    imagePrompts,
  });
}
