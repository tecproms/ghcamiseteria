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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PhotorealisticMockup,
  type MockupModelType,
  type LogoPositionType,
} from "@/components/configurator/photorealistic-mockup";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  options?: Array<{ label: string; action: () => void }>;
  isSummary?: boolean;
}

interface QuoteSummaryData {
  modelName: string;
  colorName: string;
  colorHex: string;
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
  { name: "Preto Clássico", hex: "#0F172A" },
  { name: "Azul Marinho", hex: "#1E3A8A" },
  { name: "Vermelho Rubi", hex: "#DC2626" },
  { name: "Verde Militar", hex: "#14532D" },
  { name: "Grafite Chumbo", hex: "#334155" },
  { name: "Amarelo Ouro", hex: "#D97706" },
  { name: "Vinho Bordô", hex: "#881337" },
];

export function ChatConfigurator() {
  // Estado do Projeto
  const [modelType, setModelType] = useState<MockupModelType>("TRADITIONAL");
  const [color, setColor] = useState<{ name: string; hex: string }>({
    name: "Branco Neve",
    hex: "#FFFFFF",
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<LogoPositionType>("PEITO_ESQUERDO");
  const [quantity, setQuantity] = useState<number>(20);
  const [customText, setCustomText] = useState<string>("");

  const [quoteSummary, setQuoteSummary] = useState<QuoteSummaryData | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        `Excelente escolha! O modelo **${label}** tem caimento anatômico e alta durabilidade.\n\nAgora, **qual cor principal** você prefere para o tecido?`,
        AVAILABLE_COLORS.map((c) => ({
          label: c.name,
          action: () => handleSelectColor(c),
        }))
      );
    }, 400);
  };

  // Passo 2: Selecionar Cor
  const handleSelectColor = (selected: { name: string; hex: string }) => {
    setColor(selected);
    addMessage("user", `Prefiro a cor ${selected.name}.`);

    setTimeout(() => {
      addMessage(
        "assistant",
        `Perfeito! O tingimento fotográfico na cor **${selected.name}** já está visível no mockup ao lado.\n\nAgora vamos aplicar sua marca! Você pode **anexar sua logomarca** abaixo ou escolher onde gostaria de posicioná-la:`,
        [
          {
            label: "📎 Enviar Logomarca",
            action: () => fileInputRef.current?.click(),
          },
          {
            label: "📍 Peito Esquerdo (Padrão)",
            action: () => handleSelectPosition("PEITO_ESQUERDO", "Peito Esquerdo"),
          },
          {
            label: "📍 Centro do Peito (Grande)",
            action: () => handleSelectPosition("CENTRO_FRONTAL", "Centro do Peito"),
          },
          {
            label: "📍 Peito Direito",
            action: () => handleSelectPosition("PEITO_DIREITO", "Peito Direito"),
          },
        ]
      );
    }, 400);
  };

  // Passo 3: Posição da Logo
  const handleSelectPosition = (pos: LogoPositionType, label: string) => {
    setLogoPosition(pos);
    addMessage("user", `Quero a aplicação no ${label}.`);

    setTimeout(() => {
      addMessage(
        "assistant",
        `Marcado no **${label}**! E **quantas peças** você planeja produzir? Lembrando que temos descontos progressivos por volume (a partir de 20 peças já tem 10% OFF!).`,
        [
          { label: "10 peças", action: () => handleSelectQuantity(10) },
          { label: "20 peças (10% OFF)", action: () => handleSelectQuantity(20) },
          { label: "50 peças (15% OFF)", action: () => handleSelectQuantity(50) },
          { label: "100+ peças (Atacado 20% OFF)", action: () => handleSelectQuantity(100) },
        ]
      );
    }, 400);
  };

  // Passo 4: Quantidade e Compilação Final
  const handleSelectQuantity = (qty: number) => {
    setQuantity(qty);
    addMessage("user", `Precisamos de ${qty} unidades.`);
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
            logoUrl,
            logoPosition,
            quantity,
            customText,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.updatedProject?.model) setModelType(data.updatedProject.model);
        if (data.updatedProject?.color) setColor(data.updatedProject.color);
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
              content: `Compilar orçamento final para ${activeQty} peças de ${modelType} na cor ${color.name} com logo no ${logoPosition}.`,
            },
          ],
          currentProject: {
            model: modelType,
            color,
            logoUrl,
            logoPosition,
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
    isSummary?: boolean
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role,
        text,
        options,
        isSummary,
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
    setColor({ name: "Branco Neve", hex: "#FFFFFF" });
    setLogoUrl(null);
    setLogoPosition("PEITO_ESQUERDO");
    setQuantity(20);
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
            <span className="text-slate-500 dark:text-zinc-400">Aplicação da Logo:</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              {logoPosition === "PEITO_ESQUERDO"
                ? "Peito Esquerdo (Bordado/DTF)"
                : logoPosition === "CENTRO_FRONTAL"
                ? "Centro Frontal (Silk/DTF)"
                : "Peito Direito (Bordado/DTF)"}
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
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400">Quantidade:</span>
                        <p className="font-semibold">{quoteSummary.quantity} unidades</p>
                      </div>
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
