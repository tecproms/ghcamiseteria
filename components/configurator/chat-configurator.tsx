"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Upload,
  Bot,
  User,
  Sparkles,
  CheckCircle2,
  Share2,
  RefreshCw,
  Coins,
  Loader2,
  Plus,
  Minus,
  Shirt,
  Eye,
  MessageSquare,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PhotorealisticMockup,
  type MockupModelType,
  type LogoPositionType,
  type MockupViewSide,
} from "@/components/configurator/photorealistic-mockup";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  options?: Array<{ label: string; action: () => void }>;
  isSummary?: boolean;
  showSizeGrid?: boolean;
}

interface QuoteSummaryData {
  modelName: string;
  fabricDescription?: string;
  colorName: string;
  colorHex: string;
  collarType?: string;
  collarColorName?: string;
  sleeveColorName?: string;
  sizeBreakdown?: string;
  logoPosition: string;
  logoScale?: number;
  customText?: string;
  customNumber?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountPercent: number;
  leadTimeDays: number;
  whatsAppText: string;
}

const AVAILABLE_COLORS = [
  { name: "Branco Neve", hex: "#FFFFFF" },
  { name: "Preto Clássico", hex: "#111827" },
  { name: "Grafite Chumbo", hex: "#374151" },
  { name: "Cinza Mescla", hex: "#9CA3AF" },
  { name: "Azul Marinho", hex: "#1E3A8A" },
  { name: "Azul Royal", hex: "#1D4ED8" },
  { name: "Azul Turquesa", hex: "#06B6D4" },
  { name: "Azul Celeste", hex: "#38BDF8" },
  { name: "Vermelho Ferrari", hex: "#DC2626" },
  { name: "Vinho Bordô", hex: "#881337" },
  { name: "Coral Salmão", hex: "#F87171" },
  { name: "Laranja Industrial", hex: "#EA580C" },
  { name: "Amarelo Ouro", hex: "#D97706" },
  { name: "Amarelo Canário", hex: "#FDE047" },
  { name: "Verde Bandeira", hex: "#15803D" },
  { name: "Verde Militar", hex: "#3F6212" },
  { name: "Verde Petróleo", hex: "#0F766E" },
  { name: "Verde Limão", hex: "#84CC16" },
  { name: "Rosa Bebê", hex: "#F472B6" },
  { name: "Rosa Pink", hex: "#DB2777" },
  { name: "Roxo Imperial", hex: "#7C3AED" },
  { name: "Lilás / Lavanda", hex: "#A855F7" },
  { name: "Bege / Khaki", hex: "#D4B996" },
  { name: "Marrom Café", hex: "#78350F" },
];

export function ChatConfigurator() {
  // Estado do Projeto
  const [modelType, setModelType] = useState<MockupModelType>("TRADITIONAL");
  const [viewSide, setViewSide] = useState<MockupViewSide>("FRONT");
  const [logoScale, setLogoScale] = useState<number>(1.0);
  const [collarType, setCollarType] = useState<string>("Gola Redonda (Careca)");
  const [collarColor, setCollarColor] = useState<{ name: string; hex: string } | null>(null);
  const [sleeveColor, setSleeveColor] = useState<{ name: string; hex: string } | null>(null);

  const [color, setColor] = useState<{ name: string; hex: string }>({
    name: "Branco Neve",
    hex: "#FFFFFF",
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<LogoPositionType | "COSTAS" | "MANGA">("PEITO_ESQUERDO");
  const [quantity, setQuantity] = useState<number>(20);
  const [sizeDistribution, setSizeDistribution] = useState<Record<string, number>>({
    PP: 0,
    P: 4,
    M: 8,
    G: 6,
    GG: 2,
    XG: 0,
    XXG: 0,
  });
  const [customText, setCustomText] = useState<string>("");
  const [customTextPosition, setCustomTextPosition] = useState<"FRONT" | "BACK">("BACK");
  const [customNumber, setCustomNumber] = useState<string>("");
  const [customNumberPosition, setCustomNumberPosition] = useState<"FRONT" | "BACK">("BACK");

  const [purpose, setPurpose] = useState<string>("");
  const [fabric, setFabric] = useState<string>("");
  const [desiredDeadline, setDesiredDeadline] = useState<string>("");

  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState<boolean>(false);
  const [snapshotCode, setSnapshotCode] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const [quoteSummary, setQuoteSummary] = useState<QuoteSummaryData | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Histórico de Mensagens do Chat - Abertura Consultiva
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      text: "Olá! 👋 Vamos montar seu uniforme. É para empresa, time, evento ou outra finalidade?",
      options: [
        {
          label: "🏢 Empresa / Corporativo",
          action: () => handleSelectPurpose("EMPRESA", "Quero montar uniforme para minha empresa"),
        },
        {
          label: "⚽ Time / Equipe Esportiva",
          action: () => handleSelectPurpose("TIME", "Quero montar uniforme para meu time"),
        },
        {
          label: "🎉 Evento / Promocional",
          action: () => handleSelectPurpose("EVENTO", "Quero montar camisetas para um evento"),
        },
        {
          label: "👕 Outra finalidade",
          action: () => handleSelectPurpose("OUTRO", "Quero montar uniforme para outra finalidade"),
        },
      ],
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSelectPurpose = (selectedPurpose: string, promptText: string) => {
    setPurpose(selectedPurpose);
    handleSendMessage(promptText);
  };

  // Passo 1: Selecionar Modelo
  const handleSelectModel = (type: MockupModelType, label: string) => {
    setModelType(type);
    addMessage("user", `Gostaria do modelo ${label}.`);

    setTimeout(() => {
      addMessage(
        "assistant",
        `Excelente escolha! O modelo **${label}** tem caimento anatômico e alta durabilidade.\n\nQual **tipo de gola** você prefere para o acabamento?`,
        [
          {
            label: "⚪ Gola Redonda (Careca)",
            action: () => handleSelectCollarType("Gola Redonda (Careca)"),
          },
          {
            label: "📐 Gola V Esportiva",
            action: () => handleSelectCollarType("Gola V Esportiva"),
          },
          {
            label: "👔 Gola Polo com Botões",
            action: () => handleSelectCollarType("Gola Polo com Botões"),
          },
        ]
      );
    }, 400);
  };

  // Passo 1.5: Tipo de Gola
  const handleSelectCollarType = (selectedCollar: string) => {
    setCollarType(selectedCollar);
    addMessage("user", `Prefiro acabamento com ${selectedCollar}.`);

    setTimeout(() => {
      addMessage(
        "assistant",
        `Perfeito! Acabamento em **${selectedCollar}** registrado.\n\nAgora, **qual cor principal** você prefere para o tecido? Temos 24 cores clássicas ou você pode escolher qualquer tom livremente:`,
        [
          ...AVAILABLE_COLORS.map((c) => ({
            label: c.name,
            action: () => handleSelectColor(c),
          })),
          {
            label: "🎨 Escolher Cor Livre (Paleta Hex)",
            action: () => colorInputRef.current?.click(),
          },
        ]
      );
    }, 400);
  };

  // Passo 2: Selecionar Cor Principal
  const handleSelectColor = (selected: { name: string; hex: string }) => {
    setColor(selected);
    addMessage("user", `Prefiro a cor principal ${selected.name}.`);

    setTimeout(() => {
      addMessage(
        "assistant",
        `Perfeito! O tingimento fotográfico na cor **${selected.name}** já está visível no mockup ao lado.\n\nVocê gostaria de manter gola e mangas no mesmo tom ou configurar detalhes contrastantes?`,
        [
          {
            label: "✅ Manter Tudo Monocromático",
            action: () => handlePromptLogoStep(),
          },
          {
            label: "👔 Gola com Cor Contrastante",
            action: () => handleSelectContrastCollar(),
          },
          {
            label: "📐 Mangas com Cor Contrastante",
            action: () => handleSelectContrastSleeves(),
          },
        ]
      );
    }, 400);
  };

  const handleSelectContrastCollar = () => {
    addMessage("user", "Quero personalizar a cor da gola.");
    setTimeout(() => {
      addMessage(
        "assistant",
        "Escolha a cor de destaque para a **gola**:",
        AVAILABLE_COLORS.slice(0, 8).map((c) => ({
          label: c.name,
          action: () => {
            setCollarColor(c);
            addMessage("user", `Gola na cor ${c.name}.`);
            setTimeout(() => handlePromptLogoStep(), 300);
          },
        }))
      );
    }, 300);
  };

  const handleSelectContrastSleeves = () => {
    addMessage("user", "Quero personalizar a cor das mangas.");
    setTimeout(() => {
      addMessage(
        "assistant",
        "Escolha a cor de destaque para as **mangas**:",
        AVAILABLE_COLORS.slice(0, 8).map((c) => ({
          label: c.name,
          action: () => {
            setSleeveColor(c);
            addMessage("user", `Mangas na cor ${c.name}.`);
            setTimeout(() => handlePromptLogoStep(), 300);
          },
        }))
      );
    }, 300);
  };

  const handlePromptLogoStep = () => {
    addMessage(
      "assistant",
      `Tudo registrado! Agora vamos aplicar sua marca! Você pode **anexar sua logomarca** abaixo ou escolher onde gostaria de posicioná-la (inclusive nas costas ou manga):`,
      [
        {
          label: "📎 Enviar Logomarca",
          action: () => fileInputRef.current?.click(),
        },
        {
          label: "📍 Peito Esquerdo (Padrão)",
          action: () => handleSelectPosition("PEITO_ESQUERDO", "Peito Esquerdo", "FRONT"),
        },
        {
          label: "📍 Centro do Peito (Grande)",
          action: () => handleSelectPosition("CENTRO_FRONTAL", "Centro do Peito", "FRONT"),
        },
        {
          label: "🔄 Costas (Estampa Ampla)",
          action: () => handleSelectPosition("CENTRO_FRONTAL", "Costas (Centro)", "BACK"),
        },
        {
          label: "📐 Manga Lateral",
          action: () => handleSelectPosition("PEITO_ESQUERDO", "Manga Lateral", "SLEEVE"),
        },
      ]
    );
  };

  // Passo 3: Posição da Logo
  const handleSelectPosition = (
    pos: LogoPositionType,
    label: string,
    targetView: MockupViewSide = "FRONT"
  ) => {
    setLogoPosition(pos);
    setViewSide(targetView);
    addMessage("user", `Quero a aplicação no ${label}.`);

    setTimeout(() => {
      addMessage(
        "assistant",
        `Marcado no **${label}**! O manequim fotográfico virou para mostrar a posição exata. 🎯\n\nAgora defina as **quantidades e tamanhos** que sua equipe precisa. Você pode ajustar cada tamanho na grade abaixo ou escolher uma quantidade rápida:`,
        [
          { label: "10 peças", action: () => handleSelectQuantity(10) },
          { label: "20 peças (10% OFF)", action: () => handleSelectQuantity(20) },
          { label: "50 peças (15% OFF)", action: () => handleSelectQuantity(50) },
          { label: "100+ peças (Atacado 20% OFF)", action: () => handleSelectQuantity(100) },
        ],
        false,
        true // Exibir grade interativa de tamanhos
      );
    }, 400);
  };

  // Atualizar distribuição de tamanhos
  const handleUpdateSize = (sz: string, delta: number) => {
    setSizeDistribution((prev) => {
      const cur = prev[sz] || 0;
      const next = Math.max(0, cur + delta);
      const updated = { ...prev, [sz]: next };
      const newTotal = Object.values(updated).reduce((a, b) => a + b, 0);
      setQuantity(newTotal);
      return updated;
    });
  };

  // Confirmar grade de tamanhos
  const handleConfirmSizes = () => {
    const total = Object.values(sizeDistribution).reduce((a, b) => a + b, 0);
    if (total < 1) return;
    const parts = Object.entries(sizeDistribution)
      .filter(([, q]) => q > 0)
      .map(([sz, q]) => `${q}x ${sz}`);
    addMessage("user", `Grade definida: ${parts.join(", ")} (Total: ${total} unidades).`);
    triggerCompilation(total);
  };

  // Passo 4: Quantidade e Compilação Final
  const handleSelectQuantity = (qty: number) => {
    setQuantity(qty);
    const p = Math.round(qty * 0.2);
    const m = Math.round(qty * 0.4);
    const g = Math.round(qty * 0.3);
    const gg = Math.max(0, qty - (p + m + g));
    const dist = { PP: 0, P: p, M: m, G: g, GG: gg, XG: 0, XXG: 0 };
    setSizeDistribution(dist);

    addMessage("user", `Precisamos de ${qty} unidades (Grade sortida: ${p} P, ${m} M, ${g} G, ${gg} GG).`);
    triggerCompilation(qty);
  };

  // Upload de Imagem de Logo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoUrl(dataUrl);

      addMessage("user", `Enviei minha logomarca: "${file.name}"`);

      setTimeout(() => {
        addMessage(
          "assistant",
          `Logo aplicada com sucesso no mockup fotográfico em estúdio! 🎯\n\nEm qual posição você deseja exibi-la com destaque?`,
          [
            {
              label: "📍 Peito Esquerdo (Elegante)",
              action: () => handleSelectPosition("PEITO_ESQUERDO", "Peito Esquerdo"),
            },
            {
              label: "📍 Centro Frontal (Estampa)",
              action: () => handleSelectPosition("CENTRO_FRONTAL", "Centro Frontal"),
            },
            {
              label: "📍 Peito Direito",
              action: () => handleSelectPosition("PEITO_DIREITO", "Peito Direito"),
            },
          ]
        );
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  // Enviar Mensagem de Texto Livre ou Sugestão Rápida
  const handleSendMessage = async (customPrompt?: string) => {
    const userText = (customPrompt || inputText).trim();
    if (!userText) return;

    if (!customPrompt) setInputText("");
    addMessage("user", userText);

    setIsTyping(true);
    try {
      const res = await fetch("/api/ai/compile-uniform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages
            .concat({ id: Date.now().toString(), role: "user", text: userText })
            .map((m) => ({ role: m.role, content: m.text })),
          currentProject: {
            model: modelType,
            color,
            collarType,
            collarColor,
            sleeveColor,
            sizeDistribution,
            logoUrl,
            logoPosition,
            logoScale,
            quantity,
            customText,
            customTextPosition,
            customNumber,
            customNumberPosition,
            viewSide,
            purpose,
            fabric,
            desiredDeadline,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Aplicar mudanças retornadas pelo motor de comandos estruturados
        const changes = data.command?.changes || data.updatedProject || {};
        if (changes.purpose) setPurpose(changes.purpose);
        if (changes.fabric) setFabric(changes.fabric);
        if (changes.desiredDeadline) setDesiredDeadline(changes.desiredDeadline);
        if (changes.model) setModelType(changes.model);
        if (changes.color) setColor(changes.color);
        if (changes.collarType) setCollarType(changes.collarType);
        if (changes.collarColor !== undefined) setCollarColor(changes.collarColor);
        if (changes.sleeveColor !== undefined) setSleeveColor(changes.sleeveColor);
        if (changes.quantity) setQuantity(changes.quantity);
        if (changes.sizeDistribution) setSizeDistribution(changes.sizeDistribution);
        if (changes.logoPosition) setLogoPosition(changes.logoPosition);
        if (changes.logoScale !== undefined) setLogoScale(changes.logoScale);
        if (changes.customText !== undefined) setCustomText(changes.customText);
        if (changes.customTextPosition) setCustomTextPosition(changes.customTextPosition);
        if (changes.customNumber !== undefined) setCustomNumber(changes.customNumber);
        if (changes.customNumberPosition) setCustomNumberPosition(changes.customNumberPosition);
        if (changes.viewSide) setViewSide(changes.viewSide);

        if (data.quoteSummary) {
          setQuoteSummary(data.quoteSummary);
        }

        const isSummary = data.command?.action === "CALCULATE_QUOTE";
        const followUpOptions = [
          {
            label: "👁️ Ver Revisão e Aprovação Visual",
            action: () => setIsReviewOpen(true),
          },
          {
            label: "📋 Solicitar Orçamento",
            action: () => handleRequestSnapshotQuote(),
          },
        ];
        addMessage("assistant", data.reply, followUpOptions, isSummary);
      } else {
        addMessage(
          "assistant",
          "Compreendi o seu pedido! Você gostaria de ajustar mais algum detalhe ou já podemos compilar o orçamento final?",
          [
            {
              label: "👁️ Ver Revisão Visual Atual",
              action: () => setIsReviewOpen(true),
            },
          ]
        );
      }
    } catch {
      addMessage(
        "assistant",
        "Entendido! O manequim já está atualizado com as suas escolhas.",
        [
          {
            label: "👁️ Ver Revisão e Aprovação Visual",
            action: () => setIsReviewOpen(true),
          },
        ]
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Compilar Orçamento Oficial com IA
  const triggerCompilation = async (overrideQty?: number) => {
    setIsTyping(true);
    const activeQty = overrideQty || quantity;

    try {
      const res = await fetch("/api/ai/compile-uniform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Compilar orçamento final para ${activeQty} peças de ${modelType} na cor ${color.name} com acabamento em ${collarType} e logo no ${logoPosition}.`,
            },
          ],
          currentProject: {
            model: modelType,
            color,
            collarType,
            collarColor,
            sleeveColor,
            sizeDistribution,
            logoUrl,
            logoPosition,
            logoScale,
            quantity: activeQty,
            customText,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.quoteSummary) {
        setQuoteSummary(data.quoteSummary);
        addMessage(
          "assistant",
          `🎉 **Orçamento Compilado com Sucesso via Groq AI!**\n\nConfira os valores e a ficha técnica abaixo. Você pode abrir a tela de confirmação e aprovação visual completa:`,
          [
            {
              label: "👁️ Ver Revisão e Aprovação Visual",
              action: () => setIsReviewOpen(true),
            },
            {
              label: "📋 Solicitar Orçamento Oficial",
              action: () => handleRequestSnapshotQuote(),
            },
          ],
          true
        );
      }
    } catch (err) {
      console.error("Erro ao compilar:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const addMessage = (
    role: "assistant" | "user",
    text: string,
    options?: Array<{ label: string; action: () => void }>,
    isSummary?: boolean,
    showSizeGrid?: boolean
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role,
        text,
        options,
        isSummary,
        showSizeGrid,
      },
    ]);
  };

  const handleOpenWhatsApp = () => {
    if (!quoteSummary) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(quoteSummary.whatsAppText)}`;
    window.open(url, "_blank");
  };

  const handleRequestSnapshotQuote = async () => {
    setIsGeneratingSnapshot(true);
    try {
      const res = await fetch("/api/orcamentos/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: {
            model: modelType,
            modelName:
              modelType === "POLO"
                ? "Camisa Polo Empresarial em Piquet"
                : modelType === "MANGA_LONGA"
                ? "Camisa Manga Longa com Ribana"
                : "Camiseta Tradicional Meia Malha ou Dry Fit",
            fabric,
            purpose,
            color,
            collarType,
            collarColor,
            sleeveColor,
            quantity,
            sizeDistribution,
            logoUrl,
            logoPosition,
            logoScale,
            customText,
            customTextPosition,
            customNumber,
            customNumberPosition,
          },
          pricing: quoteSummary
            ? {
                unitPrice: quoteSummary.unitPrice,
                totalPrice: quoteSummary.totalPrice,
                discountPercent: quoteSummary.discountPercent,
                leadTimeDays: quoteSummary.leadTimeDays,
              }
            : null,
        }),
      });

      const data = await res.json();
      if (data.success && data.snapshotId) {
        setSnapshotCode(data.snapshotId);
        if (data.shareToken) setShareToken(data.shareToken);

        // Disparar WhatsApp com a referência do snapshot imutável
        const snapRef = `\n🔒 *Ref. Snapshot:* ${data.snapshotId} (Hash: ${data.hash})`;
        const text = (quoteSummary?.whatsAppText || "") + snapRef;
        const encoded = encodeURIComponent(text);
        window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
      }
    } catch (err) {
      console.error("Erro ao gerar snapshot:", err);
    } finally {
      setIsGeneratingSnapshot(false);
    }
  };

  const handleShareWhatsApp = async () => {
    setIsGeneratingSnapshot(true);
    try {
      let currentToken = shareToken;
      let currentSnapId = snapshotCode;

      // Se ainda não gerou snapshot ou token, solicitar agora
      if (!currentToken || !currentSnapId) {
        const res = await fetch("/api/orcamentos/snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project: {
              model: modelType,
              modelName:
                modelType === "POLO"
                  ? "Camisa Polo Empresarial em Piquet"
                  : modelType === "MANGA_LONGA"
                  ? "Camisa Manga Longa com Ribana"
                  : "Camiseta Tradicional Meia Malha ou Dry Fit",
              fabric,
              purpose,
              color,
              collarType,
              collarColor,
              sleeveColor,
              quantity,
              sizeDistribution,
              logoUrl,
              logoPosition,
              logoScale,
              customText,
              customTextPosition,
              customNumber,
              customNumberPosition,
            },
            pricing: quoteSummary
              ? {
                  unitPrice: quoteSummary.unitPrice,
                  totalPrice: quoteSummary.totalPrice,
                  discountPercent: quoteSummary.discountPercent,
                  leadTimeDays: quoteSummary.leadTimeDays,
                }
              : null,
          }),
        });

        const data = await res.json();
        if (data.success) {
          currentToken = data.shareToken;
          currentSnapId = data.snapshotId;
          setShareToken(data.shareToken);
          setSnapshotCode(data.snapshotId);
        }
      }

      // Link Seguro de Visualização Pública
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const secureViewUrl = currentToken ? `${origin}/projeto/visualizar/${currentToken}` : origin;

      // Personalizações formatadas
      const personalizacoes = [
        logoPosition === "PEITO_ESQUERDO"
          ? "Logo no Peito Esquerdo"
          : logoPosition === "CENTRO_FRONTAL"
          ? "Logo no Centro Frontal"
          : logoPosition === "COSTAS"
          ? "Logo nas Costas"
          : logoPosition === "MANGA"
          ? "Logo na Manga"
          : "Logo no Peito Direito",
        logoUrl ? "(Arte Anexada)" : "(Pendente de envio)",
        customText ? `Texto: "${customText}" (${customTextPosition === "BACK" ? "Costas" : "Frente"})` : null,
        customNumber ? `Número: ${customNumber}` : null,
        collarColor ? `Gola: ${collarColor.name}` : null,
        sleeveColor ? `Mangas: ${sleeveColor.name}` : null,
      ]
        .filter(Boolean)
        .join(" • ");

      // Grade resumida
      const gradeResumida =
        Object.entries(sizeDistribution)
          .filter(([, q]) => q > 0)
          .map(([sz, q]) => `${q}x ${sz}`)
          .join(", ") || "Grade padrão proporcional";

      // Modelo nome
      const nomeModelo =
        quoteSummary?.modelName ||
        (modelType === "POLO"
          ? "Camisa Polo Piquet"
          : modelType === "MANGA_LONGA"
          ? "Camisa Manga Longa"
          : "Camiseta Tradicional");

      // Mensagem profissional conforme especificado pelo usuário
      let text = `Olá, montei este projeto de uniforme na GH Camiseteria. Confira a proposta:\n\n` +
        `📋 *Projeto:* Uniforme Personalizado\n` +
        `🆔 *Identificação:* ${currentSnapId || "PROJ-GH"}\n` +
        `👕 *Modelo:* ${nomeModelo}\n` +
        `🎨 *Cor:* ${color.name}\n` +
        `📦 *Quantidade:* ${quantity} unidades\n` +
        `📏 *Grade Resumida:* ${gradeResumida}\n` +
        `✨ *Personalizações:* ${personalizacoes}\n`;

      if (quoteSummary) {
        text += `💰 *Valor Estimado:* R$ ${quoteSummary.unitPrice.toFixed(2)}/un. (Total: R$ ${quoteSummary.totalPrice.toFixed(2)})\n` +
          `⏱️ *Prazo de Produção:* ~${quoteSummary.leadTimeDays} dias úteis\n`;
      }

      text += `\n👁️ *Confira a proposta e o manequim em 360º aqui:*\n${secureViewUrl}\n\n` +
        `_GH Camiseteria & Uniformes Personalizados_`;

      const encoded = encodeURIComponent(text);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    } catch (err) {
      console.error("Erro ao compartilhar no WhatsApp:", err);
    } finally {
      setIsGeneratingSnapshot(false);
    }
  };

  const handleShare = async () => {
    let currentToken = shareToken;
    if (!currentToken) {
      try {
        const res = await fetch("/api/orcamentos/snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project: {
              model: modelType,
              modelName:
                modelType === "POLO"
                  ? "Camisa Polo Empresarial em Piquet"
                  : modelType === "MANGA_LONGA"
                  ? "Camisa Manga Longa com Ribana"
                  : "Camiseta Tradicional Meia Malha ou Dry Fit",
              fabric,
              purpose,
              color,
              collarType,
              collarColor,
              sleeveColor,
              quantity,
              sizeDistribution,
              logoUrl,
              logoPosition,
              logoScale,
              customText,
              customTextPosition,
              customNumber,
              customNumberPosition,
            },
            pricing: quoteSummary
              ? {
                  unitPrice: quoteSummary.unitPrice,
                  totalPrice: quoteSummary.totalPrice,
                  discountPercent: quoteSummary.discountPercent,
                  leadTimeDays: quoteSummary.leadTimeDays,
                }
              : null,
          }),
        });
        const data = await res.json();
        if (data.success && data.shareToken) {
          currentToken = data.shareToken;
          setShareToken(data.shareToken);
          setSnapshotCode(data.snapshotId);
        }
      } catch {
        // Fallback
      }
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = currentToken ? `${origin}/projeto/visualizar/${currentToken}` : (typeof window !== "undefined" ? window.location.href : "");
    const shareText = `Confira a configuração do meu uniforme na GH Camiseteria: ${modelType} (${color.name}), ${quantity} peças.`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Meu Uniforme - GH Camiseteria",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Ignore error
    }
  };

  const handleReset = () => {
    setModelType("TRADITIONAL");
    setViewSide("FRONT");
    setLogoScale(1.0);
    setCollarType("Gola Redonda (Careca)");
    setCollarColor(null);
    setSleeveColor(null);
    setColor({ name: "Branco Neve", hex: "#FFFFFF" });
    setLogoUrl(null);
    setLogoPosition("PEITO_ESQUERDO");
    setQuantity(20);
    setSizeDistribution({ PP: 0, P: 4, M: 8, G: 6, GG: 2, XG: 0, XXG: 0 });
    setCustomText("");
    setCustomTextPosition("BACK");
    setCustomNumber("");
    setCustomNumberPosition("BACK");
    setQuoteSummary(null);
    setMessages([
      {
        id: "1",
        role: "assistant",
        text: "Vamos começar um novo uniforme! Qual modelo você prefere para iniciar?",
        options: [
          {
            label: "👕 Camiseta Tradicional",
            action: () => handleSelectModel("TRADITIONAL", "Camiseta Tradicional"),
          },
          {
            label: "👔 Camisa Polo Piquet",
            action: () => handleSelectModel("POLO", "Camisa Polo Piquet"),
          },
          {
            label: "🧥 Manga Longa",
            action: () => handleSelectModel("MANGA_LONGA", "Manga Longa"),
          },
        ],
      },
    ]);
  };

  // TELA DE REVISÃO E APROVAÇÃO VISUAL DO UNIFORME
  if (isReviewOpen) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-300">
        {/* Topo / Header da Confirmação */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                <CheckCircle2 className="h-3.5 w-3.5" /> Etapa Final • Revisão & Aprovação Visual
              </span>
              {snapshotCode && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Ref: {snapshotCode}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Seu uniforme está pronto!
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Confira a modelagem em estúdio, todos os ângulos da peça, a ficha técnica de confecção e os valores oficiais calculados para sua demanda.
            </p>
          </div>

          {/* Botões de Ação no Topo */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <Button
              onClick={handleShareWhatsApp}
              disabled={isGeneratingSnapshot}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-4 gap-2 shadow-lg"
            >
              <Share2 className="h-4 w-4" />
              COMPARTILHAR NO WHATSAPP
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsReviewOpen(false)}
              className="bg-zinc-800/80 hover:bg-zinc-700 text-white border-zinc-700 text-xs font-bold h-10 px-4 gap-2"
            >
              <MessageSquare className="h-4 w-4 text-[#d4af37]" />
              EDITAR PELO CHAT
            </Button>
            <Button
              onClick={handleRequestSnapshotQuote}
              disabled={isGeneratingSnapshot}
              className="bg-[#d4af37] hover:bg-[#b8952b] text-slate-950 font-bold text-xs h-10 px-4 gap-2 shadow-md"
            >
              {isGeneratingSnapshot ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              SOLICITAR ORÇAMENTO
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="bg-zinc-800/80 hover:bg-zinc-700 text-white border-zinc-700 text-xs font-bold h-10 px-4 gap-2"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4 text-[#d4af37]" />
              )}
              {isCopied ? "COPIADO!" : "COMPARTILHAR"}
            </Button>
          </div>
        </div>

        {/* Notificação de Snapshot Registrado */}
        {snapshotCode && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Snapshot Registrado com Sucesso:</strong> Configuração congelada sob o código <code className="font-mono font-bold bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">{snapshotCode}</code> com hash SHA-256 e transmitida para a linha de corte da fábrica.
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleOpenWhatsApp}
              className="text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs h-7 self-start sm:self-auto"
            >
              Reabrir WhatsApp
            </Button>
          </div>
        )}

        {/* Grid de Conteúdo: Visualizações de Estúdio (Frente, Costas, Mangas) + Ficha Resumo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Lado Esquerdo: Visualizador de Mockup Fotográfico (Frente, Costas, Mangas) - 7 colunas */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[#d4af37]" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Inspeção Visual 360º de Estúdio
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Renderização têxtil fotográfica com sombras e drapeado real
                </span>
              </div>

              {/* Botões de Alternância das 4 Visualizações: Frente, Costas, Manga Esquerda, Manga Direita */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setViewSide("FRONT")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    viewSide === "FRONT"
                      ? "bg-[#d4af37] text-slate-950 border-[#d4af37] shadow-sm font-extrabold"
                      : "bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-400"
                  }`}
                >
                  👕 Frente
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide("BACK")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    viewSide === "BACK"
                      ? "bg-[#d4af37] text-slate-950 border-[#d4af37] shadow-sm font-extrabold"
                      : "bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-400"
                  }`}
                >
                  🔄 Costas
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide("SLEEVE_LEFT")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    viewSide === "SLEEVE_LEFT" || viewSide === "SLEEVE"
                      ? "bg-[#d4af37] text-slate-950 border-[#d4af37] shadow-sm font-extrabold"
                      : "bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-400"
                  }`}
                >
                  📐 Manga Esquerda
                  {sleeveColor && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Cor contrastante" />}
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide("SLEEVE_RIGHT")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    viewSide === "SLEEVE_RIGHT"
                      ? "bg-[#d4af37] text-slate-950 border-[#d4af37] shadow-sm font-extrabold"
                      : "bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-400"
                  }`}
                >
                  📐 Manga Direita
                  {sleeveColor && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Cor contrastante" />}
                </button>
              </div>

              {/* Mockup Canvas */}
              <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-950 p-2">
                <PhotorealisticMockup
                  modelType={modelType}
                  color={color}
                  logoUrl={logoUrl}
                  logoPosition={logoPosition}
                  customText={customText}
                  customTextPosition={customTextPosition}
                  customNumber={customNumber}
                  customNumberPosition={customNumberPosition}
                  viewSide={viewSide}
                  onViewSideChange={setViewSide}
                  logoScale={logoScale}
                  onLogoScaleChange={setLogoScale}
                />
              </div>

              {/* Galeria de Miniaturas / Resumo dos 4 Ângulos */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div
                  onClick={() => setViewSide("FRONT")}
                  className={`p-2 rounded-lg text-center cursor-pointer border transition-all ${
                    viewSide === "FRONT"
                      ? "border-[#d4af37] bg-[#d4af37]/10"
                      : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                  }`}
                >
                  <p className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">Frente</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Principal</p>
                </div>
                <div
                  onClick={() => setViewSide("BACK")}
                  className={`p-2 rounded-lg text-center cursor-pointer border transition-all ${
                    viewSide === "BACK"
                      ? "border-[#d4af37] bg-[#d4af37]/10"
                      : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                  }`}
                >
                  <p className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">Costas</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {customText || customNumber || logoPosition === "COSTAS" ? "Personalizado" : "Liso"}
                  </p>
                </div>
                <div
                  onClick={() => setViewSide("SLEEVE_LEFT")}
                  className={`p-2 rounded-lg text-center cursor-pointer border transition-all ${
                    viewSide === "SLEEVE_LEFT" || viewSide === "SLEEVE"
                      ? "border-[#d4af37] bg-[#d4af37]/10"
                      : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                  }`}
                >
                  <p className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">Manga Esq.</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {sleeveColor ? sleeveColor.name : "Padrão"}
                  </p>
                </div>
                <div
                  onClick={() => setViewSide("SLEEVE_RIGHT")}
                  className={`p-2 rounded-lg text-center cursor-pointer border transition-all ${
                    viewSide === "SLEEVE_RIGHT"
                      ? "border-[#d4af37] bg-[#d4af37]/10"
                      : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                  }`}
                >
                  <p className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">Manga Dir.</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {sleeveColor ? sleeveColor.name : "Padrão"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Resumo Estruturado Completo Solicitado - 5 colunas */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5">
              <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shirt className="h-5 w-5 text-[#d4af37]" />
                  Resumo de Especificações
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Ficha técnica industrial e parâmetros de confecção
                </p>
              </div>

              {/* Especificações Obrigatórias: MODELO, Cor, Quantidade, Logo, Textos, Nomes, Números, Grade */}
              <div className="space-y-3 text-xs">
                {/* 1. MODELO */}
                <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      MODELO
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {quoteSummary?.modelName ||
                        (modelType === "POLO"
                          ? "Camisa Polo Piquet"
                          : modelType === "MANGA_LONGA"
                          ? "Camisa Manga Longa"
                          : "Camiseta Tradicional")}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      {fabric ||
                        (modelType === "POLO"
                          ? "Piquet Nobre Duplo 220g/m²"
                          : modelType === "MANGA_LONGA"
                          ? "Algodão Penteado 30.1 com Ribana"
                          : "Meia Malha 100% Algodão Penteado 30.1")}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                    {collarType}
                  </span>
                </div>

                {/* 2. Cor */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Cor
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="font-bold text-slate-900 dark:text-white">
                      {color.name}
                    </span>
                    {collarColor && (
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                        (Gola: {collarColor.name})
                      </span>
                    )}
                    {sleeveColor && (
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                        (Mangas: {sleeveColor.name})
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Quantidade */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Quantidade
                  </span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {quantity} unidades
                  </span>
                </div>

                {/* 4. Logo */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Logo
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {logoPosition === "PEITO_ESQUERDO"
                        ? "Peito Esquerdo (Bordado/DTF)"
                        : logoPosition === "CENTRO_FRONTAL"
                        ? "Centro Frontal (Silk/DTF)"
                        : logoPosition === "COSTAS"
                        ? "Costas (Centro Amplo)"
                        : logoPosition === "MANGA"
                        ? "Manga Lateral"
                        : "Peito Direito"}
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      {logoUrl ? `Arquivo Anexado • Escala ${Math.round(logoScale * 100)}%` : "Nenhum arquivo enviado (Pendente)"}
                    </p>
                  </div>
                </div>

                {/* 5. Textos */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Textos
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {customText ? `"${customText}" (${customTextPosition === "BACK" ? "Costas" : "Frente"})` : "Nenhum"}
                  </span>
                </div>

                {/* 6. Nomes */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Nomes
                  </span>
                  <span className="font-medium text-slate-600 dark:text-zinc-300">
                    Não aplicável / Nenhum
                  </span>
                </div>

                {/* 7. Números */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Números
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {customNumber ? `${customNumber} (${customNumberPosition === "BACK" ? "Costas" : "Frente"})` : "Não aplicável / Nenhum"}
                  </span>
                </div>

                {/* 8. Grade */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Grade
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      Total: {Object.values(sizeDistribution).reduce((a, b) => a + b, 0)} un
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {Object.entries(sizeDistribution)
                      .filter(([, q]) => q > 0)
                      .map(([sz, q]) => (
                        <span
                          key={sz}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs shadow-2xs"
                        >
                          {sz}: {q}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Preço (Quando disponível) */}
                {quoteSummary ? (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/20 border-2 border-[#d4af37]/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <Coins className="h-4 w-4 text-[#d4af37]" />
                        Preço Oficial da Fábrica
                      </span>
                      {quoteSummary.discountPercent > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                          {quoteSummary.discountPercent}% OFF por Volume
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between pt-1 border-t border-amber-200 dark:border-amber-800/60">
                      <div>
                        <span className="text-[11px] text-slate-600 dark:text-zinc-400">Valor Unitário:</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          R$ {quoteSummary.unitPrice.toFixed(2)} / un
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-600 dark:text-zinc-400">Total ({quantity} un):</span>
                        <p className="text-2xl font-black text-amber-600 dark:text-[#d4af37]">
                          R$ {quoteSummary.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 text-right">
                      Prazo estimado de produção: ~{quoteSummary.leadTimeDays} dias úteis
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-center">
                    <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
                      Preço calculado instantaneamente ao clicar em &ldquo;SOLICITAR ORÇAMENTO&rdquo;
                    </span>
                  </div>
                )}
              </div>

              {/* Os Botões de Ação no Bloco de Resumo */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <Button
                  onClick={handleShareWhatsApp}
                  disabled={isGeneratingSnapshot}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm h-12 shadow-lg gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  COMPARTILHAR NO WHATSAPP
                </Button>

                <Button
                  onClick={handleRequestSnapshotQuote}
                  disabled={isGeneratingSnapshot}
                  className="w-full bg-[#d4af37] hover:bg-[#b8952b] text-slate-950 font-bold text-sm h-11 shadow-md gap-2"
                >
                  {isGeneratingSnapshot ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  SOLICITAR ORÇAMENTO
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsReviewOpen(false)}
                    className="flex-1 font-bold text-xs h-10 gap-1.5 border-slate-300 dark:border-zinc-700"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-[#d4af37]" />
                    EDITAR PELO CHAT
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex-1 font-bold text-xs h-10 gap-1.5 border-slate-300 dark:border-zinc-700"
                  >
                    {isCopied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-[#d4af37]" />
                    )}
                    {isCopied ? "COPIADO!" : "COMPARTILHAR"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input de arquivo oculto para upload de logo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
      />

      {/* Input de cor oculto para seleção livre na paleta hex */}
      <input
        type="color"
        ref={colorInputRef}
        value={color.hex}
        onChange={(e) => {
          const hex = e.target.value;
          handleSelectColor({ name: `Personalizada (${hex.toUpperCase()})`, hex });
        }}
        className="hidden"
      />

      {/* Grid Principal: Lado Esquerdo Mockup (Desktop) / Lado Direito Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      {/* Lado Esquerdo: Mockup Fotográfico de Estúdio em Tempo Real (5 colunas) */}
      <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              Pré-Visualização Fotográfica
            </span>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 transition-colors"
            title="Reiniciar configuração"
          >
            <RefreshCw className="h-3 w-3" />
            Reiniciar
          </button>
        </div>

        {/* Componente Fotográfico */}
        <PhotorealisticMockup
          modelType={modelType}
          color={color}
          logoUrl={logoUrl}
          logoPosition={logoPosition}
          customText={customText}
          customTextPosition={customTextPosition}
          customNumber={customNumber}
          customNumberPosition={customNumberPosition}
          viewSide={viewSide}
          onViewSideChange={setViewSide}
          logoScale={logoScale}
          onLogoScaleChange={setLogoScale}
        />

        {/* Resumo Rápido dos Detalhes Técnicos */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-zinc-400">Padrão Fabril:</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              {modelType === "POLO"
                ? "Piquet Duplo 220g/m²"
                : modelType === "MANGA_LONGA"
                ? "Algodão Penteado 30.1"
                : "Meia Malha 100% Algodão"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-zinc-400">Tipo de Gola:</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              {collarType}
            </span>
          </div>
          {collarColor && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Gola Contrastante:</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                {collarColor.name}
              </span>
            </div>
          )}
          {sleeveColor && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Mangas Contrastantes:</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                {sleeveColor.name}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-zinc-400">Visão em Exibição:</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              {viewSide === "FRONT"
                ? "👕 Frente"
                : viewSide === "BACK"
                ? "🔄 Costas"
                : "📐 Manga Lateral"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-zinc-400">Aplicação da Logo:</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              {logoPosition === "PEITO_ESQUERDO"
                ? "Peito Esquerdo (Bordado/DTF)"
                : logoPosition === "CENTRO_FRONTAL"
                ? (viewSide === "BACK" ? "Costas (Centro Amplo)" : "Centro Frontal (Silk/DTF)")
                : "Peito Direito (Bordado/DTF)"}
              {logoUrl ? ` • Escala ${Math.round(logoScale * 100)}%` : ""}
            </span>
          </div>
          {logoUrl ? (
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Logo Anexada:</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pronta no Mockup
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-slate-400">
              <span>Logo:</span>
              <span>Nenhum arquivo enviado</span>
            </div>
          )}
        </div>
      </div>

      {/* Lado Direito: Assistente Conversacional GH (7 colunas) */}
      <div className="lg:col-span-7 flex flex-col h-[740px] rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
        {/* Topo do Chat */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#d4af37] to-amber-500 flex items-center justify-center text-white shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Consultor Virtual GH
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Sparkles className="h-2.5 w-2.5" /> Groq AI
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Atendimento inteligente para orçamentos e uniformes
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs h-8 gap-1.5 border-slate-300 dark:border-zinc-700"
          >
            <Upload className="h-3.5 w-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">Anexar Logo</span>
          </Button>
        </div>

        {/* Sugestões Rápidas de Início */}
        <div className="px-4 py-2.5 bg-slate-100/60 dark:bg-zinc-950/40 border-b border-slate-200/80 dark:border-zinc-800/80">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[#d4af37]" />
            Sugestões rápidas para começar:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Quero 20 polos pretas com minha logo",
              "Quero uniforme para meu time",
              "Quero 50 camisetas personalizadas",
              "Quero uniforme para minha empresa",
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSendMessage(suggestion)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-[#d4af37] hover:text-[#d4af37] transition-all text-left shadow-2xs active:scale-95"
              >
                &ldquo;{suggestion}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Área de Mensagens com Rolagem */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#d4af37] text-slate-950 font-medium rounded-tr-xs"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-tl-xs"
                }`}
              >
                {/* Texto da Mensagem */}
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Opções em Botões / Chips Rápidos */}
                {msg.options && msg.options.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={opt.action}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-[#d4af37] hover:text-[#d4af37] dark:hover:border-[#d4af37] dark:hover:text-[#d4af37] shadow-2xs transition-all active:scale-95"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Grade Interativa de Tamanhos (se ativado na mensagem) */}
                {msg.showSizeGrid && (
                  <div className="mt-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        📏 Grade por Tamanho:
                      </span>
                      <span className="text-xs font-bold text-[#d4af37]">
                        Total: {Object.values(sizeDistribution).reduce((a, b) => a + b, 0)} peças
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["PP", "P", "M", "G", "GG", "XG", "XXG"].map((sz) => {
                        const count = sizeDistribution[sz] || 0;
                        return (
                          <div
                            key={sz}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60"
                          >
                            <span className="font-bold text-xs text-slate-700 dark:text-zinc-200 pl-1">
                              {sz}:
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateSize(sz, -1)}
                                className="w-5 h-5 rounded bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-zinc-200 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center font-mono font-bold text-xs text-slate-900 dark:text-white">
                                {count}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateSize(sz, 1)}
                                className="w-5 h-5 rounded bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-zinc-200 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      type="button"
                      onClick={handleConfirmSizes}
                      disabled={Object.values(sizeDistribution).reduce((a, b) => a + b, 0) < 1}
                      className="w-full bg-[#d4af37] hover:bg-[#b8952b] text-slate-950 font-bold text-xs h-8 shadow-xs gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Confirmar Esta Grade ({Object.values(sizeDistribution).reduce((a, b) => a + b, 0)} peças)
                    </Button>
                  </div>
                )}

                {/* Card de Orçamento Compilado */}
                {msg.isSummary && quoteSummary && (
                  <div className="mt-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border-2 border-[#d4af37]/50 shadow-lg text-slate-900 dark:text-white space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                      <span className="font-bold text-sm text-[#d4af37] flex items-center gap-1.5">
                        <Coins className="h-4 w-4" /> Resumo do Orçamento
                      </span>
                      {quoteSummary.discountPercent > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                          {quoteSummary.discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400">Modelo:</span>
                        <p className="font-semibold">{quoteSummary.modelName}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400">Cor:</span>
                        <p className="font-semibold">{quoteSummary.colorName}</p>
                      </div>
                      {quoteSummary.collarType && (
                        <div>
                          <span className="text-slate-500 dark:text-zinc-400">Tipo de Gola:</span>
                          <p className="font-semibold">{quoteSummary.collarType}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400">Quantidade:</span>
                        <p className="font-semibold">{quoteSummary.quantity} unidades</p>
                      </div>
                      {quoteSummary.sizeBreakdown && (
                        <div className="col-span-2">
                          <span className="text-slate-500 dark:text-zinc-400">Grade de Tamanhos:</span>
                          <p className="font-semibold text-slate-700 dark:text-zinc-300">{quoteSummary.sizeBreakdown}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400">Preço Unitário:</span>
                        <p className="font-semibold">R$ {quoteSummary.unitPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-amber-900 dark:text-amber-200">Investimento Total Estimado:</span>
                        <p className="text-lg font-extrabold text-amber-950 dark:text-amber-100">
                          R$ {quoteSummary.totalPrice.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400">Prazo: ~{quoteSummary.leadTimeDays} dias úteis</span>
                    </div>

                    {/* Botões de Ação Direta */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <Button
                        onClick={() => setIsReviewOpen(true)}
                        className="flex-1 bg-[#d4af37] hover:bg-[#b8952b] text-slate-950 font-bold text-xs gap-1.5 shadow-md"
                      >
                        <Eye className="h-4 w-4" />
                        Revisar Uniforme Completo
                      </Button>
                      <Button
                        onClick={handleShareWhatsApp}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md"
                      >
                        <Share2 className="h-4 w-4" />
                        Compartilhar no WhatsApp
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 text-slate-700 dark:text-zinc-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Efeito digitando */}
          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#d4af37]" />
                <span>Consultor GH está calculando as especificações com a IA...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Barra de Entrada de Mensagem */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Anexar Logomarca"
            className="h-10 w-10 shrink-0 text-slate-500 hover:text-[#d4af37]"
          >
            <Upload className="h-4 w-4" />
          </Button>

          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Digite aqui (ex: 'Quero 40 camisas polo pretas com bordado')..."
            className="flex-1 bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 h-10 text-sm focus-visible:ring-[#d4af37]"
          />

          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="h-10 px-4 bg-[#d4af37] hover:bg-[#b8952b] text-slate-950 font-bold shrink-0 shadow-md gap-1.5"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Enviar</span>
          </Button>
        </div>
      </div>
    </div>

    {/* PARTE INFERIOR: Resumo Completo da Configuração Atual (Desktop: abaixo de ambas as colunas; Celular: após o chat) */}
    <div className="mt-8 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shirt className="h-5 w-5 text-[#d4af37]" />
            Resumo da Configuração Atual
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Ficha técnica industrial e orçamento calculados em tempo real pelo servidor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsReviewOpen(true)}
            className="text-xs font-bold gap-1.5 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10"
          >
            <Eye className="h-3.5 w-3.5" />
            Revisar e Aprovar Visualmente
          </Button>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5" /> Ficha Técnica Ativa
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60">
          <span className="text-slate-500 dark:text-zinc-400 font-medium">Modelo & Padrão:</span>
          <p className="font-bold text-slate-900 dark:text-white mt-0.5">
            {modelType === "POLO"
              ? "Camisa Polo Piquet"
              : modelType === "MANGA_LONGA"
              ? "Manga Longa com Ribana"
              : "Camiseta Tradicional"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 truncate">
            {purpose ? `Uso: ${purpose} • ` : ""}
            {fabric ? fabric : `Gola: ${collarType}`}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60">
          <span className="text-slate-500 dark:text-zinc-400 font-medium">Cores do Uniforme:</span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0"
              style={{ backgroundColor: color.hex }}
            />
            <span className="font-bold text-slate-900 dark:text-white truncate">{color.name}</span>
          </div>
          {(collarColor || sleeveColor) && (
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              {collarColor ? `Gola: ${collarColor.name} ` : ""}
              {sleeveColor ? `| Manga: ${sleeveColor.name}` : ""}
            </p>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60">
          <span className="text-slate-500 dark:text-zinc-400 font-medium">Estamparia & Logo:</span>
          <p className="font-bold text-slate-900 dark:text-white mt-0.5">
            {logoPosition === "PEITO_ESQUERDO"
              ? "Peito Esquerdo"
              : logoPosition === "CENTRO_FRONTAL"
              ? "Centro Frontal"
              : logoPosition === "COSTAS"
              ? "Costas (Amplo)"
              : logoPosition === "MANGA"
              ? "Manga Lateral"
              : "Peito Direito"}
            {logoUrl ? ` (${Math.round(logoScale * 100)}%)` : " (Pendente)"}
          </p>
          {(customText || customNumber) && (
            <p className="text-[11px] text-[#d4af37] font-semibold mt-1 truncate">
              {customText ? `Texto: "${customText}" ` : ""}
              {customNumber ? `Nº: ${customNumber}` : ""}
            </p>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60">
          <span className="text-slate-500 dark:text-zinc-400 font-medium">Volume & Tamanhos:</span>
          <p className="font-bold text-slate-900 dark:text-white mt-0.5">
            {quantity} unidades
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 truncate">
            {Object.entries(sizeDistribution)
              .filter(([, q]) => q > 0)
              .map(([sz, q]) => `${q}x ${sz}`)
              .join(" | ") || "Grade padrão"}
          </p>
        </div>
      </div>

      {/* Investimento Oficial e Botão de WhatsApp */}
      {quoteSummary && (
        <div className="mt-2 pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">Preço Unitário Oficial:</span>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                R$ {quoteSummary.unitPrice.toFixed(2)}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800" />
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">Investimento Total ({quantity} un):</span>
              <p className="text-xl font-black text-amber-600 dark:text-[#d4af37]">
                R$ {quoteSummary.totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleShareWhatsApp}
              className="bg-[#d4af37] hover:bg-[#b8952b] text-slate-950 font-bold text-xs h-10 px-5 gap-2 shadow-md"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar no WhatsApp
            </Button>
            <Button
              onClick={handleOpenWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 gap-2 shadow-md"
            >
              <CheckCircle2 className="h-4 w-4" />
              Finalizar no WhatsApp da Fábrica
            </Button>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
