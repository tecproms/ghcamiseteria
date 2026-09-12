"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Loader2, MessageSquare, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisualConfigurator } from "@/components/configurator/visual-configurator";
import { ChatConfigurator } from "@/components/configurator/chat-configurator";

export default function MonteSeuUniformePage() {
  // Modo de interação: "chat" (Fotos reais de estúdio + diálogo guiado) ou "canvas" (Editor 2D técnico)
  const [configuratorMode, setConfiguratorMode] = useState<"chat" | "canvas">("chat");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-6 mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 px-3 py-0.5 text-xs font-medium mb-2.5">
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
            Personalização de Alta Fidelidade
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Monte seu Uniforme Personalizado
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-zinc-400 max-w-2xl">
            Escolha o modelo, selecione a cor, envie a sua logomarca e visualize em fotos reais de estúdio com acabamento fabril.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Seletor de Modo (Chat Fotográfico vs Editor Manual) */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setConfiguratorMode("chat")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                configuratorMode === "chat"
                  ? "bg-[#d4af37] text-slate-950 shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Chat Fotográfico
            </button>
            <button
              onClick={() => setConfiguratorMode("canvas")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                configuratorMode === "canvas"
                  ? "bg-[#d4af37] text-slate-950 shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              Editor Manual
            </button>
          </div>

          <Link href="/uniformes">
            <Button variant="outline" size="sm" className="gap-2 shrink-0 h-9">
              <ArrowLeft className="h-4 w-4" />
              Catálogo
            </Button>
          </Link>
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              Iniciando configurador...
            </p>
          </div>
        }
      >
        {configuratorMode === "chat" ? (
          <ChatConfigurator />
        ) : (
          <VisualConfigurator />
        )}
      </Suspense>
    </div>
  );
}
