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
  primaryColor?: { name: string; hex: string; nameEn?: string };
  hasPocket?: boolean;
  pocketColor?: string;
  collarType?: string;
  collarColor?: string;
  sleeveColor?: string;
  logoPlacement?: "PEITO_ESQUERDO" | "PEITO_DIREITO" | "CENTRO_FRONTAL" | "BOLSO" | "MANGA" | "COSTAS" | "NENHUM";
  logoUrl?: string | null;
  hasAskedLogo?: boolean;
  logoScale?: number;
  backCustomizationType?: "NONE" | "COMPANY_NAME" | "INDIVIDUAL_NUMBER" | "LOGO_BACK";
  backLogoUrl?: string | null;
  hasAskedBackText?: boolean;
  customBackOffsetY?: number;
  customBackText?: string;
  customBackNumber?: string;
  sleeveCustomization?: string;
  hasAskedSleeve?: boolean;
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

export function translateColorToEnglish(ptName?: string): { nameEn: string; hex: string } {
  if (!ptName) return { nameEn: "solid pitch jet black", hex: "#111827" };
  const lower = ptName.toLowerCase();
  if (lower.includes("preto")) return { nameEn: "solid pitch jet black", hex: "#111827" };
  if (lower.includes("marinho")) return { nameEn: "deep dark navy blue", hex: "#0f172a" };
  if (lower.includes("azul")) return { nameEn: "vibrant royal blue", hex: "#1d4ed8" };
  if (lower.includes("branco")) return { nameEn: "pure crisp white", hex: "#ffffff" };
  if (lower.includes("cinza chumbo") || lower.includes("chumbo")) return { nameEn: "dark charcoal grey", hex: "#374151" };
  if (lower.includes("cinza")) return { nameEn: "heather grey", hex: "#6b7280" };
  if (lower.includes("vermelho")) return { nameEn: "deep crimson red", hex: "#dc2626" };
  if (lower.includes("verde bandeira")) return { nameEn: "vibrant emerald green", hex: "#16a34a" };
  if (lower.includes("verde")) return { nameEn: "dark bottle green", hex: "#15803d" };
  if (lower.includes("amarelo")) return { nameEn: "warm bright yellow", hex: "#eab308" };
  if (lower.includes("laranja")) return { nameEn: "bright vibrant orange", hex: "#ea580c" };
  if (lower.includes("vinho") || lower.includes("bordo") || lower.includes("bordô")) return { nameEn: "deep wine burgundy", hex: "#831843" };
  return { nameEn: "solid pitch jet black", hex: "#111827" };
}

const SYSTEM_PROMPT = `
Você é o Consultor Técnico Especialista em Uniformes da "GH Camiseteria & Uniformes Personalizados".
Seu papel é guiar o cliente de forma acolhedora, objetiva e profissional para definir 100% dos detalhes do seu uniforme ideal.

REGRAS FUNDAMENTAIS DE TRIAGEM E FLUXO OBRIGATÓRIAS:
1. Faça uma pergunta por vez, mantendo o diálogo ágil e agradável.
2. ETAPAS RIGOROSAS:
   - ETAPA 1 (Finalidade & Modelo): Descubra a finalidade (Empresa, Time, Evento, Indústria) e defina o modelo (Camisa Polo Corporativa, Camiseta Dry Fit, etc.).
   - ETAPA 2 (Cor Principal): Pergunte a cor principal. Sempre converta a cor para inglês ("solid pitch jet black", "deep dark navy blue", "pure crisp white", etc.).
   - ETAPA 3 (Modelagem & Bolso):
     * Pergunte OBRIGATORIAMENTE se terá BOLSO no peito ou SEM BOLSO.
     * Se COM BOLSO: pergunte se a cor do bolso será a mesma da camisa ou em contraste.
     * Pergunte o tipo de gola (Polo, Careca, V).
   - ETAPA 4 (Logomarca e Anexo):
     * Pergunte onde aplicar a logo (No Bolso do Peito, Peito Esquerdo, Peito Direito, Costas, etc.).
     * OBRIGATÓRIO: Peça explicitamente para o usuário anexar o arquivo da sua logo usando o botão de clipe (📎).
   - ETAPA 5 (Costas: Logomarca e Texto):
     * Pergunte o que deseja estampar nas costas (Sem estampa, Logomarca / Imagem, Nome da Empresa, Nome Individual + Número).
     * Se o cliente escolher Logomarca nas costas: PERGUNTE EXPLICITAMENTE se deseja também adicionar algum texto junto com a logo (nome da empresa, site, slogan ou telefone).
     * Se o cliente escolher Nome da Empresa: PERGUNTE EXPLICITAMENTE QUAL É O NOME DA EMPRESA e aguarde a resposta dele.
   - ETAPA 6 (Mangas):
     * OBRIGATÓRIO: Pergunte se deseja estampar algum detalhe nas MANGAS (Sem estampa, Bandeira do Brasil na manga, Logo na manga esquerda, Logo na manga direita).
   - ETAPA 7 (Quantidade): Pergunte a quantidade aproximada de peças.
   - ETAPA 8 (Aprovação Final): Faça o resumo completo (incluindo mangas e costas completas) e pergunte se aprova para gerar os mockups fotorrealistas de estúdio.

REQUISITOS CRÍTICOS DO PROMPT DE IMAGEM AO FINALIZAR ("isCompleted": true):
- O prompt DEVE ser 100% em inglês.
- A cor DEVE ser explícita (ex: "solid pitch jet black #111827 fabric, pitch black collar, pitch black sleeves").
- OBRIGATÓRIO INCLUIR: "commercial apparel product photography, clean solid white background, high-end clothing catalog, invisible ghost mannequin, softbox studio lighting, strictly NO human, NO woman, NO man, NO model, NO face, NO body, clothing product only".
`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { messages = [], draft = {} } = body;

    // Buscar credenciais dinâmicas do banco via SettingsService
    const groqApiKey = (await SettingsService.get("GROQ_API_KEY")) || process.env.GROQ_API_KEY;
    let groqModel = (await SettingsService.get("GROQ_MODEL")) || process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    if (!groqModel || groqModel.includes("openai/") || groqModel.includes("gpt-")) {
      groqModel = "llama-3.3-70b-versatile";
    }

    if (!groqApiKey) {
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
        temperature: 0.3,
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
      console.warn("Resposta da Groq não foi um JSON perfeito, acionando fallback estruturado:", rawContent);
      return handleLocalFallback(messages, draft);
    }
  } catch (error: unknown) {
    console.error("Erro na rota /api/ai/chat:", error);
    const msg = error instanceof Error ? error.message : "Erro interno de processamento";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * Fallback inteligente e estritamente estruturado
 */
function handleLocalFallback(messages: ChatMessage[], draft: UniformDraftState) {
  const lastUserMsg = messages
    .slice()
    .reverse()
    .find((m) => m.role === "user")?.content?.trim() || "";
  const lowerMsg = lastUserMsg.toLowerCase();

  const updatedDraft: UniformDraftState = { ...draft };

  let reply = "";
  let quickReplies: string[] = [];
  let isCompleted = false;
  let imagePrompts = null;

  // AJUSTE DE POSIÇÃO DAS COSTAS (Subir ou Descer)
  if (
    (updatedDraft.customBackText || updatedDraft.backLogoUrl || updatedDraft.backCustomizationType) &&
    (lowerMsg.includes("desce") || lowerMsg.includes("baixo") || lowerMsg.includes("abaixa") || lowerMsg.includes("sobe") || lowerMsg.includes("subir") || lowerMsg.includes("cima"))
  ) {
    const isDown = lowerMsg.includes("desce") || lowerMsg.includes("baixo") || lowerMsg.includes("abaixa");
    const delta = isDown ? 0.05 : -0.05;
    updatedDraft.customBackOffsetY = Math.max(-0.20, Math.min(0.35, (updatedDraft.customBackOffsetY || 0) + delta));

    reply = isDown
      ? "Posicionei a estampa das costas mais para baixo! ⬇️ Você pode conferir no modelo ao lado ou usar os botões de seta."
      : "Posicionei a estampa das costas mais para cima! ⬆️ Você pode conferir no modelo ao lado ou usar os botões de seta.";
    quickReplies = ["▼ Descer mais um pouco", "▲ Subir um pouco", "Está perfeito assim!"];
    return NextResponse.json({ success: true, reply, quickReplies, draft: updatedDraft, isCompleted: false });
  }

  // AJUSTE DE TAMANHO DA LOGO (Diminuir ou Aumentar)
  if (
    (updatedDraft.logoUrl || updatedDraft.backLogoUrl || updatedDraft.logoPlacement) &&
    (lowerMsg.includes("diminui") ||
      lowerMsg.includes("menor") ||
      lowerMsg.includes("reduz") ||
      lowerMsg.includes("aumenta") ||
      lowerMsg.includes("maior") ||
      lowerMsg.includes("tamanho da logo"))
  ) {
    const isSmaller = lowerMsg.includes("diminui") || lowerMsg.includes("menor") || lowerMsg.includes("reduz");
    const delta = isSmaller ? -0.15 : 0.15;
    const currentScale = updatedDraft.logoScale ?? 1.0;
    updatedDraft.logoScale = Math.max(0.4, Math.min(2.5, Math.round((currentScale + delta) * 100) / 100));

    reply = isSmaller
      ? `Reduzi o tamanho da logo para ${Math.round(updatedDraft.logoScale * 100)}%! 🔍 Você também pode ajustar pelos botões (+ / -) no visualizador.`
      : `Aumentei o tamanho da logo para ${Math.round(updatedDraft.logoScale * 100)}%! 🔍 Você também pode ajustar pelos botões (+ / -) no visualizador.`;
    quickReplies = ["- Diminuir mais", "+ Aumentar mais", "Está perfeito assim!"];
    return NextResponse.json({ success: true, reply, quickReplies, draft: updatedDraft, isCompleted: false });
  }

  // ETAPA 1: Finalidade & Tipo de Peça
  if (!updatedDraft.purpose || !updatedDraft.modelType) {
    if (lowerMsg.includes("empresa") || lowerMsg.includes("escritório") || lowerMsg.includes("corporativo")) {
      updatedDraft.purpose = "Corporativo / Empresa";
      updatedDraft.modelType = "POLO";
      updatedDraft.modelName = "Camisa Polo Corporativa";
      updatedDraft.fabric = "Piquet 50% Algodão 50% Poliéster Premium";
      reply = "Excelente escolha! Para ambientes corporativos e escritórios, a **Camisa Polo em malha Piquet** é a melhor opção, combinando alinhamento, conforto e alta durabilidade.\n\nQual é a **cor principal** que você deseja para o uniforme?";
      quickReplies = ["Preto Elegante", "Azul Marinho", "Branco Clássico", "Cinza Chumbo"];
    } else if (lowerMsg.includes("time") || lowerMsg.includes("esport")) {
      updatedDraft.purpose = "Time Esportivo";
      updatedDraft.modelType = "TRADITIONAL";
      updatedDraft.modelName = "Camiseta Esportiva Dry Fit";
      updatedDraft.fabric = "Dry Fit 100% Poliéster Tecnológico";
      reply = "Perfeito! Para times e equipes esportivas, recomendamos o tecido **Dry Fit**, super leve, respirável e com proteção UV.\n\nQual a **cor predominante** do seu uniforme?";
      quickReplies = ["Azul Royal", "Preto", "Vermelho", "Verde Bandeira"];
    } else if (lowerMsg.includes("evento") || lowerMsg.includes("promocional")) {
      updatedDraft.purpose = "Evento / Promocional";
      updatedDraft.modelType = "TRADITIONAL";
      updatedDraft.modelName = "Camiseta Promocional";
      updatedDraft.fabric = "Algodão 30.1 Penteado";
      reply = "Ótimo! Para eventos e feiras, a **Camiseta em Algodão 30.1** oferece toque macio e excelente fidelidade nas estampas.\n\nQual a **cor principal** desejada?";
      quickReplies = ["Preto Elegante", "Branco Clássico", "Azul Marinho", "Cinza"];
    } else {
      reply = "Olá! 👋 Sou o Consultor Virtual da **GH Camiseteria**.\n\nVou guiar a montagem completa do seu uniforme. Para iniciarmos, **qual é a finalidade principal do seu projeto?**";
      quickReplies = ["🏢 Empresa / Escritório", "⚽ Time Esportivo", "🎉 Evento / Promocional", "🏭 Indústria / Operacional"];
    }
  }
  // ETAPA 2: Cor Principal
  else if (!updatedDraft.primaryColor) {
    const { nameEn, hex } = translateColorToEnglish(lastUserMsg);
    let colorName = "Preto";
    if (lowerMsg.includes("azul marinho") || lowerMsg.includes("marinho")) colorName = "Azul Marinho";
    else if (lowerMsg.includes("azul")) colorName = "Azul Royal";
    else if (lowerMsg.includes("branco")) colorName = "Branco";
    else if (lowerMsg.includes("cinza chumbo") || lowerMsg.includes("chumbo")) colorName = "Cinza Chumbo";
    else if (lowerMsg.includes("cinza")) colorName = "Cinza";
    else if (lowerMsg.includes("vermelho")) colorName = "Vermelho";
    else if (lowerMsg.includes("verde")) colorName = "Verde";
    else if (lowerMsg.includes("amarelo")) colorName = "Amarelo";
    else if (lowerMsg.includes("laranja")) colorName = "Laranja";

    updatedDraft.primaryColor = { name: colorName, hex, nameEn };
    reply = `Perfeito, a cor **${colorName}** transmite muita personalidade! ✨\n\nAgora sobre a modelagem: a sua peça terá **BOLSO frontal no peito** ou prefere **SEM BOLSO**?`;
    quickReplies = ["👜 Com Bolso no Peito", "🚫 Sem Bolso (Lisa)"];
  }
  // ETAPA 3: Bolso no Peito
  else if (updatedDraft.hasPocket === undefined) {
    if (lowerMsg.includes("com bolso") || lowerMsg.includes("sim") || lowerMsg.includes("bolso")) {
      updatedDraft.hasPocket = true;
      reply = "Excelente, faremos com bolso no peito! O bolso será da **mesma cor da camisa** ou prefere em **cor de contraste**?";
      quickReplies = ["Mesma cor da peça", "Contraste em Preto", "Contraste em Branco"];
    } else {
      updatedDraft.hasPocket = false;
      reply = "Perfeito, corte limpo e moderno sem bolso frontal.\n\nE sobre a gola: qual modelo você prefere?";
      quickReplies = updatedDraft.modelType === "POLO"
        ? ["Gola Polo Tradicional", "Gola Polo com Friso Branco", "Gola Polo com Friso Dourado"]
        : ["Gola Careca (Redonda)", "Gola V"];
    }
  }
  // ETAPA 3B: Cor do bolso (se houver)
  else if (updatedDraft.hasPocket && !updatedDraft.pocketColor) {
    updatedDraft.pocketColor = lowerMsg.includes("contraste") ? lastUserMsg : "Mesma cor da peça";
    reply = `Bolso configurado com sucesso (${updatedDraft.pocketColor})! 👍\n\nE sobre a gola da sua peça, qual modelo você prefere?`;
    quickReplies = updatedDraft.modelType === "POLO"
      ? ["Gola Polo Tradicional", "Gola Polo com Friso Branco", "Gola Polo com Friso Dourado"]
      : ["Gola Careca (Redonda)", "Gola V"];
  }
  // ETAPA 3C: Tipo de Gola
  else if (!updatedDraft.collarType) {
    if (lowerMsg.includes("polo")) updatedDraft.collarType = "Gola Polo Tradicional";
    else if (lowerMsg.includes("v")) updatedDraft.collarType = "Gola V";
    else updatedDraft.collarType = "Gola Careca (Redonda)";

    reply = `Gola definida: **${updatedDraft.collarType}**.\n\nOnde você gostaria de aplicar a **Logomarca** da sua empresa ou equipe?`;
    quickReplies = updatedDraft.hasPocket
      ? ["No Bolso do Peito", "Peito Esquerdo", "Peito Direito", "Centralizada no Peito", "Na Manga", "Costas"]
      : ["Peito Esquerdo", "Peito Direito", "Centralizada no Peito", "Na Manga", "Costas"];
  }
  // ETAPA 4: Posição da Logo
  else if (!updatedDraft.logoPlacement) {
    let placement: UniformDraftState["logoPlacement"] = "PEITO_ESQUERDO";
    if (lowerMsg.includes("bolso")) placement = "BOLSO";
    else if (lowerMsg.includes("direito")) placement = "PEITO_DIREITO";
    else if (lowerMsg.includes("central") || lowerMsg.includes("centro")) placement = "CENTRO_FRONTAL";
    else if (lowerMsg.includes("manga")) placement = "MANGA";
    else if (lowerMsg.includes("costas")) placement = "COSTAS";

    updatedDraft.logoPlacement = placement;
    updatedDraft.hasAskedLogo = true;

    reply = `Aplicação de logo configurada para: **${placement === "BOLSO" ? "No Bolso do Peito" : placement}**.\n\n📎 **Por favor, anexe a sua Logomarca agora.**\nClique no botão de **clipe de papel (📎)** abaixo para selecionar a imagem da sua logo (PNG ou JPG). Se não tiver o arquivo agora, clique em 'Continuar sem logo'.`;
    quickReplies = ["📎 Já selecionei / Anexar Logo", "Continuar sem logo agora"];
  }
  // ETAPA 4B: Pergunta sobre anexo da logo e personalização das costas
  else if (updatedDraft.hasAskedLogo && !updatedDraft.backCustomizationType) {
    if (lowerMsg.includes("logomarca") || lowerMsg.includes("imagem") || lowerMsg.includes("logo nas costas") || lowerMsg.includes("foto")) {
      updatedDraft.backCustomizationType = "LOGO_BACK";
      if (updatedDraft.logoUrl) {
        reply = "Excelente! Você deseja estampar a **mesma logomarca da frente** nas costas ou prefere **anexar uma imagem diferente**?";
        quickReplies = ["Usar a mesma Logomarca", "📎 Anexar outra imagem para as Costas", "Sem estampa nas costas"];
      } else {
        reply = "Perfeito! 📎 **Por favor, anexe a imagem ou logomarca para estampar nas costas.**\nClique no botão de clipe (📎) abaixo para selecionar o arquivo:";
        quickReplies = ["📎 Já selecionei / Anexar Imagem", "Sem estampa nas costas"];
      }
    } else if (lowerMsg.includes("nome da empresa") || lowerMsg.includes("empresa")) {
      updatedDraft.backCustomizationType = "COMPANY_NAME";
      reply = "Perfeito! **Qual é o nome da sua empresa** que você deseja estampar nas costas?\n\n✍️ *Por favor, digite o nome no campo de texto abaixo e clique em Enviar:*";
      quickReplies = ["GH Camiseteria", "Prefiro sem estampa nas costas"];
    } else if (lowerMsg.includes("número") || lowerMsg.includes("numero") || lowerMsg.includes("individual")) {
      updatedDraft.backCustomizationType = "INDIVIDUAL_NUMBER";
      reply = "Show! Para personalização individual, qual **nome e número de exemplo** você quer testar nas costas? (Ex: SILVA 10)";
      quickReplies = ["SILVA 10", "CAMISA 10", "Sem estampa nas costas"];
    } else if (lowerMsg.includes("sem estampa") || lowerMsg.includes("lisa") || lowerMsg.includes("não")) {
      updatedDraft.backCustomizationType = "NONE";
      reply = "Entendido, costas lisas e sem estampas adicionais.\n\nE sobre as **mangas do seu uniforme**, você deseja estampar algum detalhe (como a bandeira do Brasil, logo ou texto)?";
      quickReplies = ["🚫 Sem estampa nas mangas", "🇧🇷 Bandeira do Brasil na manga", "👕 Logo na manga esquerda", "👕 Logo na manga direita"];
    } else {
      // Pergunta de costas inicial
      const logoStatus = updatedDraft.logoUrl ? "Logomarca registrada com sucesso! 📎✨" : "Configuração frontal registrada! 👍";
      reply = `${logoStatus}\n\nAgora sobre as **costas do uniforme**: o que você deseja estampar nas costas?`;
      quickReplies = [
        "Sem estampa nas costas",
        "Estampar Logomarca / Imagem nas Costas",
        "Nome da Empresa",
        "Nome Individual + Número",
      ];
    }
  }
  // ETAPA 4C: Tratamento de Logomarca nas Costas
  else if (updatedDraft.backCustomizationType === "LOGO_BACK" && !updatedDraft.backLogoUrl) {
    if (lowerMsg.includes("mesma") || lowerMsg.includes("usar a mesma") || lowerMsg.includes("mesma logomarca")) {
      updatedDraft.backLogoUrl = updatedDraft.logoUrl || null;
      reply = "Perfeito! A mesma logomarca será estampada em destaque nas costas. 🖼️✨\n\nVocê deseja **adicionar algum texto junto com a logo nas costas** (ex: nome da sua empresa, site ou telefone)?";
      quickReplies = ["Não, apenas a logo nas costas", "Adicionar nome da empresa", "Adicionar site / telefone"];
    } else if (lowerMsg.includes("sem estampa") || lowerMsg.includes("prefiro sem")) {
      updatedDraft.backCustomizationType = "NONE";
      reply = "Entendido, sem estampa nas costas.\n\nE sobre as **mangas do seu uniforme**, deseja estampar algum detalhe (como a bandeira do Brasil, logo ou texto)?";
      quickReplies = ["🚫 Sem estampa nas mangas", "🇧🇷 Bandeira do Brasil na manga", "👕 Logo na manga esquerda", "👕 Logo na manga direita"];
    } else {
      if (updatedDraft.backLogoUrl || updatedDraft.logoUrl) {
        if (!updatedDraft.backLogoUrl) updatedDraft.backLogoUrl = updatedDraft.logoUrl;
        reply = "Imagem das costas registrada com sucesso! 🖼️✨\n\nVocê deseja **adicionar algum texto junto com a logo nas costas** (ex: nome da sua empresa, site ou telefone)?";
        quickReplies = ["Não, apenas a logo nas costas", "Adicionar nome da empresa", "Adicionar site / telefone"];
      } else {
        reply = "📎 Por favor, clique no botão de clipe (📎) abaixo para selecionar a imagem das costas:";
        quickReplies = ["Usar a mesma da frente", "Prefiro sem estampa nas costas"];
      }
    }
  }
  // ETAPA 4D: Pergunta se quer texto complementar junto com a logo das costas
  else if (updatedDraft.backCustomizationType === "LOGO_BACK" && updatedDraft.backLogoUrl && !updatedDraft.hasAskedBackText) {
    if (
      lowerMsg.includes("não") ||
      lowerMsg.includes("apenas a logo") ||
      lowerMsg.includes("somente a logo") ||
      lowerMsg.includes("só a logo") ||
      lowerMsg.includes("sem texto")
    ) {
      updatedDraft.hasAskedBackText = true;
      reply = "Combinado, deixaremos somente a logomarca nas costas! 👍\n\nE sobre as **mangas do seu uniforme**, você deseja estampar algum detalhe?";
      quickReplies = ["🚫 Sem estampa nas mangas", "🇧🇷 Bandeira do Brasil na manga", "👕 Logo na manga esquerda", "👕 Logo na manga direita"];
    } else if (
      lowerMsg.includes("adicionar") ||
      lowerMsg.includes("nome da empresa") ||
      lowerMsg.includes("site") ||
      lowerMsg.includes("telefone") ||
      lowerMsg.includes("slogan")
    ) {
      reply = "Perfeito! ✍️ **Por favor, digite no campo de texto abaixo o texto exato** que deseja estampar junto com a logo nas costas e clique em Enviar:";
      quickReplies = ["GH Camiseteria", "Não, somente a logo"];
    } else {
      updatedDraft.customBackText = lastUserMsg.replace(/^["']|["']$/g, "");
      updatedDraft.hasAskedBackText = true;
      reply = `Texto adicional das costas registrado: **"${updatedDraft.customBackText}"**! ✍️✨\n\nE sobre as **mangas do seu uniforme**, você deseja estampar algum detalhe?`;
      quickReplies = ["🚫 Sem estampa nas mangas", "🇧🇷 Bandeira do Brasil na manga", "👕 Logo na manga esquerda", "👕 Logo na manga direita"];
    }
  }
  // ETAPA 5: Captura do Nome da Empresa nas Costas (SEM cair na armadilha de 'digitar outro nome')
  else if (updatedDraft.backCustomizationType === "COMPANY_NAME" && !updatedDraft.customBackText) {
    if (lowerMsg.includes("sem estampa") || lowerMsg.includes("prefiro sem")) {
      updatedDraft.backCustomizationType = "NONE";
      reply = "Costas lisas e sem estampas adicionais.\n\nE sobre as **mangas do seu uniforme**, você deseja estampar algum detalhe?";
      quickReplies = ["🚫 Sem estampa nas mangas", "🇧🇷 Bandeira do Brasil na manga", "👕 Logo na manga esquerda", "👕 Logo na manga direita"];
    } else if (
      lowerMsg.includes("digitar outro") ||
      lowerMsg.includes("digitar nome") ||
      lowerMsg === "digitar" ||
      lowerMsg === "outro nome"
    ) {
      reply = "✍️ Por favor, **digite no campo de texto abaixo** o nome exato da sua empresa e clique em Enviar:";
      quickReplies = ["GH Camiseteria", "Prefiro sem estampa nas costas"];
      return NextResponse.json({
        success: true,
        reply,
        quickReplies,
        draft: updatedDraft,
        isCompleted: false,
      });
    } else {
      updatedDraft.customBackText = lastUserMsg.replace(/^["']|["']$/g, "");
      reply = `Texto das costas registrado com sucesso: **"${updatedDraft.customBackText}"**! ✍️\n\nE sobre as **mangas do seu uniforme**, você deseja estampar algum detalhe?`;
      quickReplies = ["🚫 Sem estampa nas mangas", "🇧🇷 Bandeira do Brasil na manga", "👕 Logo na manga esquerda", "👕 Logo na manga direita"];
    }
  }
  // ETAPA 5B: Captura do Número nas Costas
  else if (updatedDraft.backCustomizationType === "INDIVIDUAL_NUMBER" && !updatedDraft.customBackText && !updatedDraft.customBackNumber) {
    updatedDraft.customBackText = lastUserMsg;
    reply = `Personalização dorsal registrada: **"${lastUserMsg}"**! 🔢\n\nE sobre as **mangas do seu uniforme**, você deseja estampar algum detalhe?`;
    quickReplies = ["🚫 Sem estampa nas mangas", "🇧🇷 Bandeira do Brasil na manga", "👕 Logo na manga esquerda", "👕 Logo na manga direita"];
  }
  // ETAPA 6: Personalização das Mangas
  else if (!updatedDraft.hasAskedSleeve) {
    if (
      lowerMsg.includes("sem estampa") ||
      lowerMsg.includes("não") ||
      lowerMsg.includes("nenhum") ||
      lowerMsg.includes("lisa")
    ) {
      updatedDraft.sleeveCustomization = "Sem estampa nas mangas";
    } else if (lowerMsg.includes("brasil") || lowerMsg.includes("bandeira")) {
      updatedDraft.sleeveCustomization = "Bandeira do Brasil na manga";
    } else if (lowerMsg.includes("esquerda")) {
      updatedDraft.sleeveCustomization = "Logo na manga esquerda";
    } else if (lowerMsg.includes("direita")) {
      updatedDraft.sleeveCustomization = "Logo na manga direita";
    } else {
      updatedDraft.sleeveCustomization = lastUserMsg;
    }
    updatedDraft.hasAskedSleeve = true;

    reply = `Personalização das mangas registrada: **${updatedDraft.sleeveCustomization}**! 📐✨\n\nQual é a **quantidade aproximada** de peças que você pretende confeccionar? (Ex: 20, 50, 100)`;
    quickReplies = ["20 peças", "30 peças", "50 peças", "100 peças"];
  }
  // ETAPA 7: Quantidade
  else if (!updatedDraft.quantity) {
    const foundNum = parseInt(lastUserMsg.replace(/\D/g, ""), 10);
    updatedDraft.quantity = isNaN(foundNum) || foundNum < 1 ? 20 : foundNum;

    const pocketDesc = updatedDraft.hasPocket ? `Sim (Bolso ${updatedDraft.pocketColor || "na cor da peça"})` : "Não (Sem bolso)";
    const logoDesc = updatedDraft.logoPlacement === "BOLSO" ? "No Bolso do Peito" : (updatedDraft.logoPlacement || "Peito Esquerdo");

    const backParts: string[] = [];
    if (updatedDraft.backLogoUrl || updatedDraft.backCustomizationType === "LOGO_BACK") {
      backParts.push("Logomarca");
    }
    if (updatedDraft.customBackText) {
      backParts.push(`Texto: "${updatedDraft.customBackText}"`);
    }
    if (updatedDraft.customBackNumber) {
      backParts.push(`Número: ${updatedDraft.customBackNumber}`);
    }
    const backDesc = backParts.length > 0 ? backParts.join(" + ") : "Lisa sem estampas";
    const sleeveDesc = updatedDraft.sleeveCustomization || "Sem estampa nas mangas";

    reply =
      `Registramos a estimativa de **${updatedDraft.quantity} peças**.\n\n` +
      `📋 **Confira o resumo completo do seu uniforme:**\n` +
      `- **Modelo:** ${updatedDraft.modelName || "Camisa Polo Corporativa"}\n` +
      `- **Tecido:** ${updatedDraft.fabric || "Piquet Premium"}\n` +
      `- **Cor Principal:** ${updatedDraft.primaryColor?.name || "Preto"}\n` +
      `- **Bolso no Peito:** ${pocketDesc}\n` +
      `- **Gola:** ${updatedDraft.collarType || "Polo Tradicional"}\n` +
      `- **Aplicação da Logo:** ${logoDesc}\n` +
      `- **Costas:** ${backDesc}\n` +
      `- **Mangas:** ${sleeveDesc}\n` +
      `- **Quantidade:** ${updatedDraft.quantity} unidades\n\n` +
      `Tudo certo para gerarmos as fotos fotorrealistas de estúdio do seu uniforme por IA?`;
    quickReplies = ["✅ Sim, gerar fotos de estúdio!", "Quero mudar a cor", "Quero mudar o bolso"];
  }
  // ETAPA 7: Conclusão e Geração do Prompt Fotorrealista
  else {
    isCompleted = true;
    reply = "🎉 **Projeto de Uniforme Concluído com Sucesso!**\n\nNossa inteligência artificial de estúdio gerou as imagens do seu uniforme com base em todas as especificações escolhidas:";

    const colorInfo = translateColorToEnglish(updatedDraft.primaryColor?.name);
    const modelEnglish = updatedDraft.modelType === "POLO" ? "classic polo shirt with collar and buttons" : "crewneck short-sleeve t-shirt";
    const pocketEnglish = updatedDraft.hasPocket ? ", tailored chest pocket on front left chest" : "";

    const studioStyle =
      "commercial apparel product photography, clean solid white background, high-end clothing catalog, invisible ghost mannequin presentation, professional softbox studio lighting, crisp textile fabric texture, 8k resolution, centered composition, strictly NO human, NO woman, NO man, NO model, NO face, NO body, clothing product only";

    imagePrompts = {
      frontPrompt: `Front view of a completely ${colorInfo.nameEn} (${colorInfo.hex}) ${modelEnglish}${pocketEnglish}, ${colorInfo.nameEn} fabric, ${colorInfo.nameEn} collar, ${colorInfo.nameEn} sleeves, ${studioStyle}`,
      backPrompt: `Back view of a completely ${colorInfo.nameEn} (${colorInfo.hex}) ${modelEnglish}, ${colorInfo.nameEn} fabric, clean back presentation, ${studioStyle}`,
      sleevePrompt: `Side profile 45-degree angle closeup view of the sleeve of a ${colorInfo.nameEn} (${colorInfo.hex}) ${modelEnglish}, tailored cuff, ${studioStyle}`,
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
