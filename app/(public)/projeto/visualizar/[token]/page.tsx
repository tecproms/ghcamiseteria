"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Shirt,
  Coins,
  CheckCircle2,
  Share2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Copy,
  Check,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PhotorealisticMockup,
  type MockupModelType,
  type LogoPositionType,
  type MockupViewSide,
} from "@/components/configurator/photorealistic-mockup";

interface SharedProjectData {
  id: string;
  shareToken: string;
  createdAt: string;
  hash: string;
  project: {
    model: string;
    modelName: string;
    fabric?: string | null;
    purpose?: string | null;
    color: { name: string; hex: string };
    collarType?: string;
    collarColor?: { name: string; hex: string } | null;
    sleeveColor?: { name: string; hex: string } | null;
    quantity: number;
    sizeDistribution: Record<string, number>;
    logoUrl?: string | null;
    logoPosition?: string;
    logoScale?: number;
    customText?: string | null;
    customTextPosition?: "FRONT" | "BACK";
    customNumber?: string | null;
    customNumberPosition?: "FRONT" | "BACK";
    notes?: string | null;
  };
  pricing?: {
    unitPrice: number;
    totalPrice: number;
    discountPercent: number;
    leadTimeDays: number;
  } | null;
}

export default function VisualizarProjetoPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SharedProjectData | null>(null);

  const [activeView, setActiveView] = useState<MockupViewSide>("FRONT");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    async function fetchProject() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/orcamentos/snapshot?token=${encodeURIComponent(token)}`);
        const json = await res.json();

        if (!isMounted) return;

        if (json.success && json.project) {
          setData(json);
        } else {
          setError(json.error || "Projeto não encontrado ou link expirado.");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Erro ao carregar projeto:", err);
          setError("Ocorreu uma falha ao carregar a proposta de uniforme.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProject();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleOpenWhatsAppFactory = () => {
    if (!data) return;
    const { project, pricing, id, shareToken } = data;
    const message = `Olá, equipe da *GH Camiseteria*! 👋\n\nEstou visualizando o projeto compartilhado de uniformes e gostaria de falar com um especialista sobre a proposta:\n\n` +
      `🆔 *Ref. Projeto:* ${id} (Token: ${shareToken.substring(0, 8)}...)\n` +
      `👕 *Modelo:* ${project.modelName}\n` +
      `🎨 *Cor:* ${project.color.name}\n` +
      `📦 *Quantidade:* ${project.quantity} peças\n` +
      (pricing ? `💰 *Valor Estimado:* R$ ${pricing.unitPrice.toFixed(2)}/un. (Total: R$ ${pricing.totalPrice.toFixed(2)})\n` : "") +
      `\nPoderiam me passar mais informações e prazos de produção?`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#d4af37]" />
        <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">
          Carregando proposta do uniforme em alta resolução...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center max-w-lg space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shadow-md">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Proposta Não Encontrada
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {error || "Este link de visualização pode ter expirado ou o código do token informado é inválido."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
          <Link
            href="/uniformes"
            className="flex-1 inline-flex items-center justify-center rounded-lg text-sm font-bold h-10 px-4 bg-[#d4af37] hover:bg-[#b8952b] text-slate-950 shadow-sm transition-colors"
          >
            Ver Catálogo de Uniformes
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 transition-colors"
          >
            Ir para a Página Inicial
          </Link>
        </div>
      </div>
    );
  }

  const { project, pricing, id, createdAt } = data;
  const formattedDate = new Date(createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-8 max-w-6xl">
      {/* Header da Proposta Pública */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 text-white border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
              <CheckCircle2 className="h-3.5 w-3.5" /> Proposta Oficial de Uniforme
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
              Ref: {id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            {project.modelName}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Esta proposta foi personalizada na GH Camiseteria em {formattedDate}. Visualize o uniforme em 360º com acabamento fotográfico e a ficha técnica completa.
          </p>
        </div>

        {/* Botões de Ação no Topo */}
        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="bg-zinc-800/90 hover:bg-zinc-700 text-white border-zinc-700 text-xs font-bold h-11 px-4 gap-2"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-[#d4af37]" />
            )}
            {isCopied ? "LINK COPIADO!" : "COPIAR LINK"}
          </Button>

          <Button
            onClick={handleOpenWhatsAppFactory}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-11 px-5 gap-2 shadow-lg"
          >
            <Share2 className="h-4 w-4" />
            Falar com a Fábrica
          </Button>
        </div>
      </div>

      {/* Grid Principal: Lado Esquerdo Mockup em 4 Ângulos / Lado Direito Ficha Técnica */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado Esquerdo: Estúdio Fotográfico 360º (7 colunas) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 md:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#d4af37]" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Inspeção em Estúdio Fotográfico
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Padrão industrial com iluminação e caimento real
              </span>
            </div>

            {/* Alternador das 4 Visualizações: Frente, Costas, Manga Esquerda, Manga Direita */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveView("FRONT")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  activeView === "FRONT"
                    ? "bg-[#d4af37] text-slate-950 border-[#d4af37] shadow-sm font-extrabold"
                    : "bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-400"
                }`}
              >
                👕 Frente
              </button>
              <button
                type="button"
                onClick={() => setActiveView("BACK")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  activeView === "BACK"
                    ? "bg-[#d4af37] text-slate-950 border-[#d4af37] shadow-sm font-extrabold"
                    : "bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-400"
                }`}
              >
                🔄 Costas
              </button>
              <button
                type="button"
                onClick={() => setActiveView("SLEEVE_LEFT")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  activeView === "SLEEVE_LEFT" || activeView === "SLEEVE"
                    ? "bg-[#d4af37] text-slate-950 border-[#d4af37] shadow-sm font-extrabold"
                    : "bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-400"
                }`}
              >
                📐 Manga Esq.
              </button>
              <button
                type="button"
                onClick={() => setActiveView("SLEEVE_RIGHT")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  activeView === "SLEEVE_RIGHT"
                    ? "bg-[#d4af37] text-slate-950 border-[#d4af37] shadow-sm font-extrabold"
                    : "bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-400"
                }`}
              >
                📐 Manga Dir.
              </button>
            </div>

            {/* Componente Fotográfico */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-950 p-2">
              <PhotorealisticMockup
                modelType={(project.model as MockupModelType) || "TRADITIONAL"}
                color={project.color}
                logoUrl={project.logoUrl}
                logoPosition={project.logoPosition as LogoPositionType}
                customText={project.customText || undefined}
                customTextPosition={project.customTextPosition || "BACK"}
                customNumber={project.customNumber || undefined}
                customNumberPosition={project.customNumberPosition || "BACK"}
                viewSide={activeView}
                onViewSideChange={setActiveView}
                logoScale={project.logoScale || 1.0}
              />
            </div>

            {/* Galeria de Miniaturas dos 4 Ângulos */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div
                onClick={() => setActiveView("FRONT")}
                className={`p-2 rounded-lg text-center cursor-pointer border transition-all ${
                  activeView === "FRONT"
                    ? "border-[#d4af37] bg-[#d4af37]/10 font-bold"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                }`}
              >
                <p className="text-[11px] text-slate-800 dark:text-zinc-200">Frente</p>
                <p className="text-[10px] text-slate-400">Principal</p>
              </div>
              <div
                onClick={() => setActiveView("BACK")}
                className={`p-2 rounded-lg text-center cursor-pointer border transition-all ${
                  activeView === "BACK"
                    ? "border-[#d4af37] bg-[#d4af37]/10 font-bold"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                }`}
              >
                <p className="text-[11px] text-slate-800 dark:text-zinc-200">Costas</p>
                <p className="text-[10px] text-slate-400">
                  {project.customText || project.customNumber || project.logoPosition === "COSTAS" ? "Com arte" : "Lisa"}
                </p>
              </div>
              <div
                onClick={() => setActiveView("SLEEVE_LEFT")}
                className={`p-2 rounded-lg text-center cursor-pointer border transition-all ${
                  activeView === "SLEEVE_LEFT" || activeView === "SLEEVE"
                    ? "border-[#d4af37] bg-[#d4af37]/10 font-bold"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                }`}
              >
                <p className="text-[11px] text-slate-800 dark:text-zinc-200">Manga Esq.</p>
                <p className="text-[10px] text-slate-400">
                  {project.sleeveColor ? project.sleeveColor.name : "Padrão"}
                </p>
              </div>
              <div
                onClick={() => setActiveView("SLEEVE_RIGHT")}
                className={`p-2 rounded-lg text-center cursor-pointer border transition-all ${
                  activeView === "SLEEVE_RIGHT"
                    ? "border-[#d4af37] bg-[#d4af37]/10 font-bold"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                }`}
              >
                <p className="text-[11px] text-slate-800 dark:text-zinc-200">Manga Dir.</p>
                <p className="text-[10px] text-slate-400">
                  {project.sleeveColor ? project.sleeveColor.name : "Padrão"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Ficha Técnica & Proposta Comercial (5 colunas) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5">
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shirt className="h-5 w-5 text-[#d4af37]" />
                Ficha Técnica do Uniforme
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Parâmetros industriais de confecção e acabamento
              </p>
            </div>

            {/* Especificações Obrigatórias: MODELO, Cor, Quantidade, Logo, Textos, Nomes, Números, Grade */}
            <div className="space-y-3 text-xs">
              {/* 1. MODELO */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    MODELO
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {project.modelName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {project.fabric ||
                      (project.model === "POLO"
                        ? "Piquet Nobre Duplo 220g/m²"
                        : project.model === "MANGA_LONGA"
                        ? "Algodão Penteado 30.1 com Ribana"
                        : "Meia Malha 100% Algodão Penteado 30.1")}
                  </p>
                </div>
                {project.collarType && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                    {project.collarType}
                  </span>
                )}
              </div>

              {/* 2. Cor */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Cor
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: project.color.hex }}
                  />
                  <span className="font-bold text-slate-900 dark:text-white">
                    {project.color.name}
                  </span>
                  {project.collarColor && (
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      (Gola: {project.collarColor.name})
                    </span>
                  )}
                  {project.sleeveColor && (
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      (Mangas: {project.sleeveColor.name})
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Quantidade */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Quantidade
                </span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {project.quantity} peças
                </span>
              </div>

              {/* 4. Logo */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Logo
                </span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {project.logoPosition === "PEITO_ESQUERDO"
                      ? "Peito Esquerdo (Bordado/DTF)"
                      : project.logoPosition === "CENTRO_FRONTAL"
                      ? "Centro Frontal (Silk/DTF)"
                      : project.logoPosition === "COSTAS"
                      ? "Costas (Centro Amplo)"
                      : project.logoPosition === "MANGA"
                      ? "Manga Lateral"
                      : "Peito Direito"}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {project.logoUrl ? "Logomarca Aplicada no Mockup" : "Arte a ser enviada pelo cliente"}
                  </p>
                </div>
              </div>

              {/* 5. Textos */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Textos
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {project.customText ? `"${project.customText}" (${project.customTextPosition === "BACK" ? "Costas" : "Frente"})` : "Nenhum"}
                </span>
              </div>

              {/* 6. Nomes */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Nomes
                </span>
                <span className="font-medium text-slate-600 dark:text-zinc-300">
                  Não aplicável / Nenhum
                </span>
              </div>

              {/* 7. Números */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Números
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {project.customNumber ? `${project.customNumber} (${project.customNumberPosition === "BACK" ? "Costas" : "Frente"})` : "Não aplicável / Nenhum"}
                </span>
              </div>

              {/* 8. Grade */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Grade
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                    Total: {Object.values(project.sizeDistribution || {}).reduce((a, b) => a + b, 0)} peças
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {Object.entries(project.sizeDistribution || {})
                    .filter(([, q]) => q > 0)
                    .map(([sz, q]) => (
                      <span
                        key={sz}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs shadow-2xs"
                      >
                        {sz}: {q}
                      </span>
                    ))}
                </div>
              </div>

              {/* Preço Oficial da Fábrica (Quando disponível) */}
              {pricing && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/20 border-2 border-[#d4af37]/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-[#d4af37]" />
                      Investimento Oficial
                    </span>
                    {pricing.discountPercent > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                        {pricing.discountPercent}% OFF por Volume
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-amber-200 dark:border-amber-800/60">
                    <div>
                      <span className="text-[11px] text-slate-600 dark:text-zinc-400">Valor Unitário:</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        R$ {pricing.unitPrice.toFixed(2)} / un
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-600 dark:text-zinc-400">Total ({project.quantity} un):</span>
                      <p className="text-2xl font-black text-amber-600 dark:text-[#d4af37]">
                        R$ {pricing.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 text-right">
                    Prazo estimado de confecção: ~{pricing.leadTimeDays} dias úteis
                  </p>
                </div>
              )}
            </div>

            {/* Ações da Página Pública (Somente Leitura e Conversão) */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <Button
                onClick={handleOpenWhatsAppFactory}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm h-12 shadow-xl gap-2 rounded-xl"
              >
                <Share2 className="h-4 w-4" />
                Falar com a Fábrica sobre este Projeto
              </Button>

              <Link
                href="/uniformes"
                className="w-full inline-flex items-center justify-center font-bold text-xs h-11 gap-2 border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-xl transition-colors"
              >
                Ver Catálogo de Uniformes
                <ArrowRight className="h-3.5 w-3.5 text-[#d4af37]" />
              </Link>
            </div>
          </div>

          {/* Banner de Garantia Fabril */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400">
            <Building2 className="h-5 w-5 text-[#d4af37] shrink-0" />
            <span>
              <strong>GH Camiseteria & Uniformes Personalizados:</strong> Confeccionado com tecidos selecionados, costura reforçada e estamparia industrial de alta durabilidade.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
