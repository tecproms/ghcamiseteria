// components/uniform-ai-chat/uniform-ai-chat.tsx
// Interface conversacional guiada por Groq com triagem inteligente e geração de imagens por IA
// GH Camiseteria & Uniformes Personalizados

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Paperclip,
  RotateCcw,
  CheckCircle2,
  Share2,
  Shirt,
  ChevronRight,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotorealisticMockup } from "@/components/configurator/photorealistic-mockup";
import type { UniformDraftState } from "@/app/api/ai/chat/route";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  quickReplies?: string[];
  logoAttachment?: string | null;
  isLogoPrompt?: boolean;
}

export function UniformAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [draft, setDraft] = useState<UniformDraftState>({});
  const [isTyping, setIsTyping] = useState(false);
  const [attachedLogo, setAttachedLogo] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);

  // Estados de Conclusão e Visualização do Estúdio Fotorrealista
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeImageView, setActiveImageView] = useState<"front" | "back" | "sleeve">("front");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Mensagem inicial de boas-vindas da IA
  useEffect(() => {
    const initialGreeting: ChatMessage = {
      id: "msg-init",
      role: "assistant",
      content:
        "Olá! 👋 Sou o **Consultor Virtual da GH Camiseteria**.\n\nVou te guiar passo a passo para criar o uniforme perfeito para o seu projeto, definindo modelo, tecido, cores, bolso, gola, logomarca e estampas.\n\nPara começarmos, **qual é a finalidade principal do seu uniforme?**",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      quickReplies: [
        "🏢 Empresa / Escritório",
        "⚽ Time Esportivo",
        "🎉 Evento / Promocional",
        "🏭 Indústria / Operacional",
      ],
    };
    setMessages([initialGreeting]);
  }, []);

  // Enviar mensagem do usuário
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    const currentLogo = attachedLogo || draft.logoUrl || null;

    if (!text && !currentLogo) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text || "Logomarca anexada para o uniforme.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      logoAttachment: attachedLogo || undefined,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue("");
    setAttachedLogo(null);
    setLogoFileName(null);
    setIsTyping(true);

    const draftToSend: UniformDraftState = {
      ...draft,
      logoUrl: currentLogo,
    };

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          draft: draftToSend,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha ao consultar o especialista de IA.");
      }

      const updatedDraft: UniformDraftState = {
        ...draftToSend,
        ...(data.draft || {}),
        logoUrl: currentLogo || data.draft?.logoUrl || null,
      };
      setDraft(updatedDraft);

      const isLogoRequest = Boolean(
        data.reply?.toLowerCase().includes("anexe a sua logomarca") ||
        data.reply?.toLowerCase().includes("botão de clipe")
      );

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        quickReplies: data.quickReplies || [],
        isLogoPrompt: isLogoRequest,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Se a triagem foi concluída, ativa o estúdio de fotos fotorrealistas
      if (data.isCompleted) {
        setIsCompleted(true);
      }
    } catch (err: unknown) {
      console.error("Erro no chat:", err);
      const errMsg = err instanceof Error ? err.message : "Erro de conexão";
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: "assistant",
          content: `Tive uma breve oscilação na conexão (${errMsg}). Poderia tentar responder novamente?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          quickReplies: ["Tentar novamente", "Preto Elegante", "Azul Marinho", "Com bolso", "Sem bolso"],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };


  // Upload da Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAttachedLogo(base64);
      setDraft((prev) => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // Clique em respostas rápidas
  const handleQuickReplyClick = (reply: string) => {
    if (reply.includes("Anexar Logo") || reply.includes("selecionei")) {
      fileInputRef.current?.click();
      return;
    }
    handleSendMessage(reply);
  };

  // Reiniciar conversa
  const handleRestart = () => {
    setMessages([
      {
        id: "msg-init-restart",
        role: "assistant",
        content:
          "Reiniciei nosso atendimento! 👋\n\nVamos montar um novo uniforme. Para começar, **qual é a finalidade principal do seu projeto?**",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        quickReplies: [
          "🏢 Empresa / Escritório",
          "⚽ Time Esportivo",
          "🎉 Evento / Promocional",
          "🏭 Indústria / Operacional",
        ],
      },
    ]);
    setDraft({});
    setIsCompleted(false);
    setAttachedLogo(null);
    setLogoFileName(null);
  };

  // Compartilhar e Finalizar no WhatsApp Oficial
  const handleWhatsAppOrder = () => {
    const qty = draft.quantity || 20;
    const unitPrice = draft.modelType === "POLO" ? 48 : 35;
    const totalPrice = qty * unitPrice;

    const pocketInfo = draft.hasPocket
      ? `Sim (Cor: ${draft.pocketColor || "Mesma da peça"})`
      : "Não (Sem bolso frontal)";

    const logoInfo = draft.logoPlacement
      ? `${draft.logoPlacement === "BOLSO" ? "No Bolso do Peito" : draft.logoPlacement} ${draft.logoUrl ? "(Arquivo anexado)" : ""}`
      : "A combinar";

    const backInfo = draft.customBackText
      ? `"${draft.customBackText}"`
      : draft.customBackNumber
      ? `Número: ${draft.customBackNumber}`
      : "Lisa sem estampa";

    const message =
      `Olá, equipe da *GH Camiseteria*! 👋\n\n` +
      `Montei meu uniforme com o *Consultor Virtual do site* e gostaria de aprovar e solicitar a produção:\n\n` +
      `🎯 *Finalidade:* ${draft.purpose || "Corporativo / Geral"}\n` +
      `👕 *Modelo:* ${draft.modelName || (draft.modelType === "POLO" ? "Camisa Polo" : "Camiseta Tradicional")}\n` +
      `🧵 *Tecido:* ${draft.fabric || (draft.modelType === "POLO" ? "Malha Piquet" : "Dry Fit / Algodão")}\n` +
      `🎨 *Cor Principal:* ${draft.primaryColor?.name || "Preto"}\n` +
      `👜 *Bolso no Peito:* ${pocketInfo}\n` +
      `👔 *Tipo de Gola:* ${draft.collarType || "Polo Tradicional"}\n` +
      `📍 *Aplicação de Logo:* ${logoInfo}\n` +
      `🔙 *Estampa nas Costas:* ${backInfo}\n` +
      `📦 *Quantidade Estimada:* ${qty} unidades\n` +
      `💰 *Estimativa de Investimento:* R$ ${unitPrice.toFixed(2)}/un. (Total: R$ ${totalPrice.toFixed(2)})\n\n` +
      `Gostaria de formalizar o pedido e enviar o arquivo vetorizado da arte. Como procedemos?`;

    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto items-start">
      {/* Coluna Principal: Chat Conversacional com Groq */}
      <div className="flex-1 w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[750px]">
        {/* Cabeçalho do Chat */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
              <Sparkles className="h-5 w-5" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Consultor Virtual Especialista
                </h3>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900">
                  Groq IA
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Montando seu uniforme sob medida em tempo real
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white gap-1.5"
            title="Reiniciar Atendimento"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </Button>
        </div>

        {/* Trilha de Progresso da Triagem */}
        <div className="px-5 py-2.5 bg-slate-100/60 dark:bg-zinc-900/80 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-[11px] font-medium text-slate-600 dark:text-zinc-400">
          <span className={`flex items-center gap-1 ${draft.modelType ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-900 dark:text-white font-semibold"}`}>
            1. Modelo {draft.modelType && <CheckCircle2 className="h-3 w-3" />}
          </span>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <span className={`flex items-center gap-1 ${draft.primaryColor ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}`}>
            2. Cor {draft.primaryColor && <CheckCircle2 className="h-3 w-3" />}
          </span>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <span className={`flex items-center gap-1 ${draft.hasPocket !== undefined ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}`}>
            3. Bolso & Gola {draft.hasPocket !== undefined && <CheckCircle2 className="h-3 w-3" />}
          </span>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <span className={`flex items-center gap-1 ${draft.logoPlacement ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}`}>
            4. Logo {draft.logoPlacement && <CheckCircle2 className="h-3 w-3" />}
          </span>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <span className={`flex items-center gap-1 ${draft.customBackText || draft.backCustomizationType === "NONE" ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}`}>
            5. Costas {(draft.customBackText || draft.backCustomizationType === "NONE") && <CheckCircle2 className="h-3 w-3" />}
          </span>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <span className={`flex items-center gap-1 ${isCompleted ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}`}>
            6. Fotos IA {isCompleted && <CheckCircle2 className="h-3 w-3" />}
          </span>
        </div>

        {/* Lista de Mensagens do Chat */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isBot = m.role === "assistant";
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[88%] sm:max-w-[80%] ${
                  isBot ? "self-start" : "self-end ml-auto flex-row-reverse"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    isBot
                      ? "bg-slate-900 dark:bg-[#d4af37] text-white dark:text-zinc-950 shadow-sm"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {isBot ? "GH" : "VC"}
                </div>

                {/* Conteúdo da Mensagem */}
                <div className="space-y-2">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      isBot
                        ? "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-tl-sm border border-slate-200/70 dark:border-zinc-700/60"
                        : "bg-blue-600 text-white rounded-tr-sm shadow-sm"
                    }`}
                  >
                    {m.content}

                    {/* Botão de Upload Embutido se for pedido de Logo */}
                    {isBot && m.isLogoPrompt && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-zinc-700">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-[#d4af37] hover:bg-[#c49f27] text-zinc-950 font-bold text-xs gap-2 shadow-sm"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {draft.logoUrl ? "Trocar Imagem da Logomarca" : "Anexar Imagem da Logomarca Agora"}
                        </Button>
                      </div>
                    )}

                    {/* Exibição de imagem anexada na mensagem do usuário */}
                    {m.logoAttachment && (
                      <div className="mt-2.5 pt-2.5 border-t border-blue-500/40">
                        <p className="text-[11px] font-medium opacity-90 mb-1.5 flex items-center gap-1">
                          <Paperclip className="h-3 w-3" /> Logo Anexada:
                        </p>
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-white/30 bg-white/10 p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.logoAttachment}
                            alt="Logo Anexada"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <span className={`block text-[10px] text-slate-400 ${isBot ? "" : "text-right"}`}>
                    {m.timestamp}
                  </span>

                  {/* Respostas Rápidas (Chips de Clique) */}
                  {isBot && m.quickReplies && m.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isTyping}
                          onClick={() => handleQuickReplyClick(reply)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:border-[#d4af37] dark:hover:border-[#d4af37] hover:text-[#d4af37] dark:hover:text-[#d4af37] shadow-xs transition-all active:scale-95 text-left cursor-pointer"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Indicador de Digitação do Bot */}
          {isTyping && (
            <div className="flex items-center gap-3 self-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 dark:bg-[#d4af37] text-white dark:text-zinc-950 text-xs font-bold">
                GH
              </div>
              <div className="bg-slate-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 border border-slate-200/70 dark:border-zinc-700/60">
                <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-zinc-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-zinc-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-zinc-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-xs text-slate-500 dark:text-zinc-400 ml-1.5 font-medium">
                  Consultor GH analisando...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Barra de Entrada / Digitação */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-2">
          {/* Chip de Anexo Ativo ou Logo Persistida */}
          {(attachedLogo || draft.logoUrl) && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300">
              <div className="flex items-center gap-2 truncate">
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                <span className="truncate">Logomarca ativa: {logoFileName || "arquivo anexado"}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAttachedLogo(null);
                  setLogoFileName(null);
                  setDraft((prev) => ({ ...prev, logoUrl: null }));
                }}
                className="text-xs text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
              >
                Remover
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Input oculto para upload de logo */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isTyping}
              onClick={() => fileInputRef.current?.click()}
              className="h-11 w-11 shrink-0 rounded-xl border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800"
              title="Anexar Logomarca"
            >
              <Paperclip className="h-4 w-4 text-slate-600 dark:text-zinc-300" />
            </Button>

            <input
              type="text"
              value={inputValue}
              disabled={isTyping}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua resposta ou escolha uma opção acima..."
              className="flex-1 h-11 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent transition-all"
            />

            <Button
              type="submit"
              disabled={isTyping || (!inputValue.trim() && !attachedLogo)}
              className="h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-bold shadow-sm gap-2 shrink-0 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Coluna Lateral: Estúdio Fotográfico por IA & Ficha Técnica */}
      <div className="w-full lg:w-[440px] flex flex-col gap-4">
        {/* Card do Estúdio de Imagens por IA */}
        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shirt className="h-4 w-4 text-[#d4af37]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Estúdio Fotográfico por IA
              </h4>
            </div>
            {isCompleted && (
              <Badge className="bg-emerald-600 text-white text-[10px]">
                Pronto
              </Badge>
            )}
          </div>

          <CardContent className="p-2 sm:p-4">
            {isCompleted ? (
              <div className="w-full">
                <PhotorealisticMockup
                  modelType={
                    draft.modelType === "POLO"
                      ? "POLO"
                      : draft.modelType === "MANGA_LONGA"
                      ? "MANGA_LONGA"
                      : "TRADITIONAL"
                  }
                  color={draft.primaryColor || { name: "Preto", hex: "#111827" }}
                  logoUrl={draft.logoUrl || null}
                  logoPosition={
                    draft.logoPlacement && draft.logoPlacement !== "NENHUM"
                      ? draft.logoPlacement
                      : "BOLSO"
                  }
                  customText={draft.customBackText}
                  customTextPosition="BACK"
                  customNumber={draft.customBackNumber}
                  customNumberPosition="BACK"
                  hasPocket={Boolean(draft.hasPocket)}
                  pocketColor={
                    draft.pocketColor?.toLowerCase().includes("branco")
                      ? "#FFFFFF"
                      : draft.pocketColor?.toLowerCase().includes("preto")
                      ? "#111827"
                      : draft.pocketColor?.startsWith("#")
                      ? draft.pocketColor
                      : null
                  }
                  viewSide={activeImageView === "front" ? "FRONT" : activeImageView === "back" ? "BACK" : "SLEEVE"}
                  onViewSideChange={(side) =>
                    setActiveImageView(side === "FRONT" ? "front" : side === "BACK" ? "back" : "sleeve")
                  }
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center gap-3 text-slate-400 dark:text-zinc-500 aspect-square rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <Shirt className="h-12 w-12 stroke-[1.2] opacity-40 text-[#d4af37]" />
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Estúdio Fotográfico por IA
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-xs">
                  As fotos de estúdio fotorrealistas (frente, costas e manga) com sua logomarca e cor exata aparecerão aqui assim que concluirmos o chat.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Ficha Técnica & Ação Comercial */}
        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Ficha Técnica Acumulada
            </h4>
            <Badge variant="outline" className="text-[10px]">
              {draft.quantity ? `${draft.quantity} un.` : "Em definição"}
            </Badge>
          </div>

          <CardContent className="p-4 space-y-3.5 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/80">
                <span className="text-slate-500 dark:text-zinc-400">Modelo:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {draft.modelName || draft.modelType || "Não definido"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/80">
                <span className="text-slate-500 dark:text-zinc-400">Cor Principal:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {draft.primaryColor?.hex && (
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-slate-300 dark:border-zinc-600"
                      style={{ backgroundColor: draft.primaryColor.hex }}
                    />
                  )}
                  {draft.primaryColor?.name || "Não definida"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/80">
                <span className="text-slate-500 dark:text-zinc-400">Bolso no Peito:</span>
                <span className={`font-bold ${draft.hasPocket ? "text-amber-600 dark:text-[#d4af37]" : "text-slate-900 dark:text-white"}`}>
                  {draft.hasPocket === undefined
                    ? "Em triagem"
                    : draft.hasPocket
                    ? `Sim (${draft.pocketColor || "Mesma cor"})`
                    : "Sem bolso"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/80">
                <span className="text-slate-500 dark:text-zinc-400">Gola:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {draft.collarType || "Padrão"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/80">
                <span className="text-slate-500 dark:text-zinc-400">Posição da Logo:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {draft.logoPlacement === "BOLSO" ? "No Bolso do Peito" : (draft.logoPlacement || "Não definida")}
                </span>
              </div>

              {draft.logoUrl && (
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/80">
                  <span className="text-slate-500 dark:text-zinc-400">Logomarca:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Anexada</span>
                    <div className="h-6 w-6 rounded border border-slate-300 dark:border-zinc-700 bg-white/10 p-0.5 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={draft.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                  </div>
                </div>
              )}

              {draft.customBackText && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/80">
                  <span className="text-slate-500 dark:text-zinc-400">Estampa Costas:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {draft.customBackText}
                  </span>
                </div>
              )}
            </div>

            {/* Botão Comercial Oficial */}
            <div className="pt-2">
              <Button
                onClick={handleWhatsAppOrder}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md gap-2 rounded-xl transition-all cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                Fechar Projeto no WhatsApp da Fábrica
              </Button>
              <p className="text-[10px] text-center text-slate-400 dark:text-zinc-500 mt-2">
                Envio direto das especificações para a equipe de corte e confecção GH.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
