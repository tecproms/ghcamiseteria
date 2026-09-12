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
  colorName: string;
  colorHex: string;
  collarType?: string;
  collarColorName?: string;
  sleeveColorName?: string;
  sizeBreakdown?: string;
  logoPosition: string;
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
  const [logoPosition, setLogoPosition] = useState<LogoPositionType>("PEITO_ESQUERDO");
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

  const [quoteSummary, setQuoteSummary] = useState<QuoteSummaryData | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Histórico de Mensagens do Chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      text: "Olá! 👋 Sou o consultor virtual da **GH Camiseteria**. Vou te ajudar a montar o uniforme perfeito para a sua empresa ou equipe com **fotos reais de estúdio**!\n\nPara começar, **qual modelo de uniforme** você procura hoje?",
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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

  // Enviar Mensagem de Texto Livre
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText("");
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
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.updatedProject?.model) setModelType(data.updatedProject.model);
        if (data.updatedProject?.color) setColor(data.updatedProject.color);
        if (data.updatedProject?.collarType) setCollarType(data.updatedProject.collarType);
        if (data.updatedProject?.logoPosition) setLogoPosition(data.updatedProject.logoPosition);
        if (data.updatedProject?.quantity) setQuantity(data.updatedProject.quantity);

        if (data.quoteSummary) {
          setQuoteSummary(data.quoteSummary);
        }

        addMessage("assistant", data.reply);
      } else {
        addMessage("assistant", "Compreendi o seu pedido! Você gostaria de ajustar mais algum detalhe ou já podemos compilar o orçamento final?");
      }
    } catch {
      addMessage("assistant", "Entendido! O mockup fotográfico já está atualizado com as suas escolhas.");
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
          `🎉 **Orçamento Compilado com Sucesso via Groq AI!**\n\nConfira os valores e a ficha técnica abaixo. Você pode baixar a foto de alta resolução ou enviar diretamente para o WhatsApp da nossa fábrica:`,
          undefined,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                        onClick={handleOpenWhatsApp}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 shadow-md"
                      >
                        <Share2 className="h-4 w-4" />
                        Finalizar no WhatsApp
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
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="h-10 px-4 bg-[#d4af37] hover:bg-[#b8952b] text-slate-950 font-bold shrink-0 shadow-md gap-1.5"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Enviar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
