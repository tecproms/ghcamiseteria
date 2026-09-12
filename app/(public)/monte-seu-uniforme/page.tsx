"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatConfigurator } from "@/components/configurator/chat-configurator";

export default function MonteSeuUniformePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-6 mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 px-3 py-0.5 text-xs font-medium mb-2.5">
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
            Personalização de Alta Fidelidade com IA
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Monte seu Uniforme Personalizado
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-zinc-400 max-w-2xl">
            Converse com o consultor virtual da GH Camiseteria, escolha o modelo, veja em fotos reais de estúdio com acabamento fabril e solicite seu orçamento com facilidade.
          </p>
        </div>

        <Link href="/uniformes">
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-9">
            <ArrowLeft className="h-4 w-4" />
            Catálogo de Uniformes
          </Button>
        </Link>
      </div>

      {/* Experiência Fotográfica com Chat Inteligente */}
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              Carregando estúdio fotográfico...
            </p>
          </div>
        }
      >
        <ChatConfigurator />
      </Suspense>
    </div>
  );
}
