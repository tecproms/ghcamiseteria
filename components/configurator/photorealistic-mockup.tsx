"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MockupModelType = "TRADITIONAL" | "POLO" | "MANGA_LONGA";
export type LogoPositionType = "PEITO_ESQUERDO" | "CENTRO_FRONTAL" | "PEITO_DIREITO";
export type MockupViewSide = "FRONT" | "BACK" | "SLEEVE";

interface PhotorealisticMockupProps {
  modelType: MockupModelType;
  color: { name: string; hex: string };
  logoUrl?: string | null;
  logoPosition?: LogoPositionType | "COSTAS" | "MANGA";
  customText?: string;
  customTextPosition?: "FRONT" | "BACK";
  customNumber?: string;
  customNumberPosition?: "FRONT" | "BACK";
  className?: string;
  viewSide?: MockupViewSide;
  onViewSideChange?: (side: MockupViewSide) => void;
  logoScale?: number;
  onLogoScaleChange?: (scale: number) => void;
  onImageRendered?: (dataUrl: string) => void;
}

const MODEL_IMAGES: Record<MockupModelType, Record<MockupViewSide, string>> = {
  TRADITIONAL: {
    FRONT: "/mockups/studio-tshirt.png",
    BACK: "/mockups/studio-tshirt-back.png",
    SLEEVE: "/mockups/studio-tshirt-side.png",
  },
  POLO: {
    FRONT: "/mockups/studio-polo.png",
    BACK: "/mockups/studio-polo-back.png",
    SLEEVE: "/mockups/studio-polo-side.png",
  },
  MANGA_LONGA: {
    FRONT: "/mockups/studio-longsleeve.png",
    BACK: "/mockups/studio-longsleeve-back.png",
    SLEEVE: "/mockups/studio-longsleeve-side.png",
  },
};

// Posições percentuais de aplicação realista (x%, y% do canvas centralizado) por visão
const LOGO_COORDINATES: Record<MockupViewSide, Record<MockupModelType, Record<LogoPositionType, { xPct: number; yPct: number; maxWidthPct: number }>>> = {
  FRONT: {
    TRADITIONAL: {
      PEITO_ESQUERDO: { xPct: 0.58, yPct: 0.32, maxWidthPct: 0.16 },
      CENTRO_FRONTAL: { xPct: 0.50, yPct: 0.38, maxWidthPct: 0.28 },
      PEITO_DIREITO: { xPct: 0.42, yPct: 0.32, maxWidthPct: 0.16 },
    },
    POLO: {
      PEITO_ESQUERDO: { xPct: 0.60, yPct: 0.35, maxWidthPct: 0.15 },
      CENTRO_FRONTAL: { xPct: 0.50, yPct: 0.45, maxWidthPct: 0.24 },
      PEITO_DIREITO: { xPct: 0.40, yPct: 0.35, maxWidthPct: 0.15 },
    },
    MANGA_LONGA: {
      PEITO_ESQUERDO: { xPct: 0.58, yPct: 0.32, maxWidthPct: 0.16 },
      CENTRO_FRONTAL: { xPct: 0.50, yPct: 0.38, maxWidthPct: 0.28 },
      PEITO_DIREITO: { xPct: 0.42, yPct: 0.32, maxWidthPct: 0.16 },
    },
  },
  BACK: {
    TRADITIONAL: {
      PEITO_ESQUERDO: { xPct: 0.50, yPct: 0.26, maxWidthPct: 0.22 },
      CENTRO_FRONTAL: { xPct: 0.50, yPct: 0.40, maxWidthPct: 0.34 },
      PEITO_DIREITO: { xPct: 0.50, yPct: 0.40, maxWidthPct: 0.34 },
    },
    POLO: {
      PEITO_ESQUERDO: { xPct: 0.50, yPct: 0.28, maxWidthPct: 0.22 },
      CENTRO_FRONTAL: { xPct: 0.50, yPct: 0.42, maxWidthPct: 0.32 },
      PEITO_DIREITO: { xPct: 0.50, yPct: 0.42, maxWidthPct: 0.32 },
    },
    MANGA_LONGA: {
      PEITO_ESQUERDO: { xPct: 0.50, yPct: 0.26, maxWidthPct: 0.22 },
      CENTRO_FRONTAL: { xPct: 0.50, yPct: 0.40, maxWidthPct: 0.34 },
      PEITO_DIREITO: { xPct: 0.50, yPct: 0.40, maxWidthPct: 0.34 },
    },
  },
  SLEEVE: {
    TRADITIONAL: {
      PEITO_ESQUERDO: { xPct: 0.45, yPct: 0.35, maxWidthPct: 0.18 },
      CENTRO_FRONTAL: { xPct: 0.45, yPct: 0.35, maxWidthPct: 0.18 },
      PEITO_DIREITO: { xPct: 0.45, yPct: 0.35, maxWidthPct: 0.18 },
    },
    POLO: {
      PEITO_ESQUERDO: { xPct: 0.45, yPct: 0.35, maxWidthPct: 0.18 },
      CENTRO_FRONTAL: { xPct: 0.45, yPct: 0.35, maxWidthPct: 0.18 },
      PEITO_DIREITO: { xPct: 0.45, yPct: 0.35, maxWidthPct: 0.18 },
    },
    MANGA_LONGA: {
      PEITO_ESQUERDO: { xPct: 0.45, yPct: 0.42, maxWidthPct: 0.20 },
      CENTRO_FRONTAL: { xPct: 0.45, yPct: 0.42, maxWidthPct: 0.20 },
      PEITO_DIREITO: { xPct: 0.45, yPct: 0.42, maxWidthPct: 0.20 },
    },
  },
};

// Cache de imagem e máscara de fundo isolada
const maskCache: Record<string, { img: HTMLImageElement; alphaMask: ImageData }> = {};

export function PhotorealisticMockup({
  modelType,
  color,
  logoUrl,
  logoPosition = "PEITO_ESQUERDO",
  customText,
  customTextPosition = "BACK",
  customNumber,
  customNumberPosition = "BACK",
  className = "",
  viewSide,
  onViewSideChange,
  logoScale,
  onLogoScaleChange,
  onImageRendered,
}: PhotorealisticMockupProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  const [internalViewSide, setInternalViewSide] = useState<MockupViewSide>("FRONT");
  const [internalLogoScale, setInternalLogoScale] = useState<number>(1.0);

  const currentView = viewSide ?? internalViewSide;
  const currentScale = logoScale ?? internalLogoScale;

  const handleSetView = (side: MockupViewSide) => {
    setInternalViewSide(side);
    onViewSideChange?.(side);
  };

  const handleScaleChange = (scale: number) => {
    const clamped = Math.max(0.4, Math.min(2.5, Math.round(scale * 100) / 100));
    setInternalLogoScale(clamped);
    onLogoScaleChange?.(clamped);
  };

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const modelViews = MODEL_IMAGES[modelType] || MODEL_IMAGES.TRADITIONAL;
    const imgPath = modelViews[currentView] || modelViews.FRONT;

    const baseImg = new Image();
    baseImg.crossOrigin = "anonymous";
    baseImg.src = imgPath;

    baseImg.onload = () => {
      if (isCancelled) return;

      const size = 1000;
      canvas.width = size;
      canvas.height = size;

      // Se a cor for branco puro, desenhamos a foto original diretamente (já é estúdio branco impecável)
      const isPureWhite =
        color.hex.toUpperCase() === "#FFFFFF" ||
        color.hex.toUpperCase() === "#FFF" ||
        color.name.toLowerCase().includes("branco");

      if (isPureWhite) {
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(baseImg, 0, 0, size, size);
        applyOverlays();
        return;
      }

      // Processamento de tingimento com remoção de fundo (Flood Fill das bordas)
      let cached = maskCache[imgPath];
      if (!cached) {
        // Criar máscara de corte isolando o fundo branco
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) return;

        tempCtx.drawImage(baseImg, 0, 0, size, size);
        const imgData = tempCtx.getImageData(0, 0, size, size);
        const data = imgData.data;

        // Verificar se a imagem já possui transparência alfa nativa (PNG de estúdio)
        const hasNativeAlpha = data[3] === 0 || data[((size - 1) * size + (size - 1)) * 4 + 3] === 0;

        if (!hasNativeAlpha) {
          // BFS Flood Fill a partir das 4 bordas com limiar seguro (>= 250)
          // Isso garante que o fundo puro de estúdio seja isolado sem vazar para o tecido
          const visited = new Uint8Array(size * size);
          const queue: number[] = [];

          for (let x = 0; x < size; x++) {
            queue.push(x, (size - 1) * size + x);
            visited[x] = 1;
            visited[(size - 1) * size + x] = 1;
          }
          for (let y = 0; y < size; y++) {
            queue.push(y * size, y * size + (size - 1));
            visited[y * size] = 1;
            visited[y * size + (size - 1)] = 1;
          }

          let head = 0;
          while (head < queue.length) {
            const idx = queue[head++];
            const p = idx * 4;
            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];

            // Limiar seguro de estúdio puro (>= 250)
            if (r >= 250 && g >= 250 && b >= 250) {
              data[p + 3] = 0;

              const x = idx % size;
              const y = Math.floor(idx / size);

              if (x > 0 && !visited[idx - 1]) {
                visited[idx - 1] = 1;
                queue.push(idx - 1);
              }
              if (x < size - 1 && !visited[idx + 1]) {
                visited[idx + 1] = 1;
                queue.push(idx + 1);
              }
              if (y > 0 && !visited[idx - size]) {
                visited[idx - size] = 1;
                queue.push(idx - size);
              }
              if (y < size - 1 && !visited[idx + size]) {
                visited[idx + size] = 1;
                queue.push(idx + size);
              }
            }
          }
        }

        cached = { img: baseImg, alphaMask: imgData };
        maskCache[imgPath] = cached;
      }

      // 1. Limpar canvas
      ctx.clearRect(0, 0, size, size);

      // 2. Criar camada de silhueta colorida
      const colorCanvas = document.createElement("canvas");
      colorCanvas.width = size;
      colorCanvas.height = size;
      const colorCtx = colorCanvas.getContext("2d");
      if (!colorCtx) return;

      // Preenche com a cor escolhida
      colorCtx.fillStyle = color.hex;
      colorCtx.fillRect(0, 0, size, size);

      // Corta para manter apenas a forma da camiseta (usando o alpha da máscara)
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = size;
      maskCanvas.height = size;
      const maskCtx = maskCanvas.getContext("2d");
      if (!maskCtx) return;
      maskCtx.putImageData(cached.alphaMask, 0, 0);

      colorCtx.globalCompositeOperation = "destination-in";
      colorCtx.drawImage(maskCanvas, 0, 0);

      // Desenhar a base de cor no canvas principal
      ctx.drawImage(colorCanvas, 0, 0);

      // 3. Aplicar textura fotográfica e sombras com blend MULTIPLY
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(maskCanvas, 0, 0);

      // 4. Se a cor for muito escura (como Preto ou Azul Marinho), adicionar brilho de vincos com SCREEN
      const rgb = hexToRgb(color.hex);
      const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

      if (luminance < 0.35) {
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.35;
        ctx.drawImage(maskCanvas, 0, 0);
        ctx.globalAlpha = 1.0;
      }

      // Restaura para source-over normal
      ctx.globalCompositeOperation = "source-over";

      applyOverlays();
    };

    function applyOverlays() {
      if (!ctx) return;
      const size = 1000;
      const viewCoords = LOGO_COORDINATES[currentView] || LOGO_COORDINATES.FRONT;
      const modelCoords = viewCoords[modelType] || viewCoords.TRADITIONAL;
      const coords = modelCoords[logoPosition as LogoPositionType] || modelCoords.PEITO_ESQUERDO;

      const shouldShowLogo =
        !!logoUrl &&
        ((currentView === "BACK" && logoPosition === "COSTAS") ||
          (currentView === "SLEEVE" && logoPosition === "MANGA") ||
          (currentView === "FRONT" && logoPosition !== "COSTAS" && logoPosition !== "MANGA"));

      const drawTextAndNumber = () => {
        if (!ctx) return;
        const isDark = hexToRgb(color.hex).r < 120;
        const textColor = isDark ? "#FFFFFF" : "#1E293B";

        // Renderizar Texto se a posição coincidir com a visão atual
        if (customText && customText.trim() && customTextPosition === currentView) {
          ctx.save();
          ctx.font =
            currentView === "BACK"
              ? "900 42px 'Inter', sans-serif"
              : "bold 30px 'Inter', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = textColor;
          ctx.globalAlpha = 0.95;
          const textY = currentView === "BACK" ? size * 0.28 : size * 0.44;
          ctx.fillText(customText.toUpperCase(), size * 0.5, textY);
          ctx.restore();
        }

        // Renderizar Número se a posição coincidir com a visão atual
        if (customNumber && customNumber.trim() && customNumberPosition === currentView) {
          ctx.save();
          ctx.font = "900 120px 'Inter', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = textColor;
          ctx.globalAlpha = 0.95;
          const numY = customText && customTextPosition === currentView ? size * 0.54 : size * 0.48;
          ctx.fillText(customNumber, size * 0.5, numY);
          ctx.restore();
        }
      };

      if (shouldShowLogo && logoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = logoUrl;
        logoImg.onload = () => {
          if (isCancelled || !ctx) return;

          const maxW = size * coords.maxWidthPct * currentScale;
          const aspect = logoImg.naturalWidth / (logoImg.naturalHeight || 1);
          const w = maxW;
          const h = maxW / aspect;

          const centerX = size * coords.xPct;
          const centerY = size * coords.yPct;

          ctx.save();
          // Efeito de estamparia real (leve mesclagem com tecido)
          ctx.globalAlpha = 0.96;
          ctx.drawImage(logoImg, centerX - w / 2, centerY - h / 2, w, h);
          ctx.restore();

          drawTextAndNumber();
          finishRender();
        };
        logoImg.onerror = () => {
          drawTextAndNumber();
          finishRender();
        };
      } else {
        drawTextAndNumber();
        finishRender();
      }

      function finishRender() {
        try {
          const url = canvas?.toDataURL("image/png") || null;
          setRenderedUrl(url);
          if (url && onImageRendered) {
            onImageRendered(url);
          }
        } catch {
          // Cross-origin safety
        }
        setLoading(false);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [
    modelType,
    currentView,
    currentScale,
    color,
    logoUrl,
    logoPosition,
    customText,
    customTextPosition,
    customNumber,
    customNumberPosition,
    onImageRendered,
  ]);

  const handleDownload = () => {
    if (!renderedUrl) return;
    const a = document.createElement("a");
    a.href = renderedUrl;
    a.download = `GH_UNIFORME_${modelType}_${color.name.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div className="relative w-full aspect-square max-w-[560px] mx-auto rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex items-center justify-center p-2">
        {/* Abas de Alternância de Visão (Frente, Costas, Manga Lateral) */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-black/60 dark:bg-black/75 backdrop-blur-md p-1 rounded-lg border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => handleSetView("FRONT")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              currentView === "FRONT"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-white/80 hover:text-white"
            }`}
          >
            👕 Frente
          </button>
          <button
            type="button"
            onClick={() => handleSetView("BACK")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              currentView === "BACK"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-white/80 hover:text-white"
            }`}
          >
            🔄 Costas
          </button>
          <button
            type="button"
            onClick={() => handleSetView("SLEEVE")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              currentView === "SLEEVE"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-white/80 hover:text-white"
            }`}
          >
            📐 Manga (Lado)
          </button>
        </div>

        {/* Botão de Download em Alta Resolução */}
        {renderedUrl && !loading && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="absolute top-4 right-4 z-10 h-8 px-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-xs font-semibold gap-1.5 shadow-md hover:bg-white dark:hover:bg-zinc-800"
            title="Baixar imagem em alta definição"
          >
            <Download className="h-3.5 w-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">Baixar Foto</span>
          </Button>
        )}

        {/* Controle de Escala da Logo (Reduzir / Aumentar) */}
        {logoUrl && !loading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-700 shadow-xl text-xs">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Tamanho da Logo:</span>
            <button
              type="button"
              onClick={() => handleScaleChange(currentScale - 0.15)}
              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 font-bold flex items-center justify-center transition-colors text-slate-800 dark:text-zinc-200"
              title="Reduzir logo"
            >
              -
            </button>
            <span className="font-mono font-bold min-w-9 text-center text-slate-800 dark:text-zinc-200">
              {Math.round(currentScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => handleScaleChange(currentScale + 0.15)}
              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 font-bold flex items-center justify-center transition-colors text-slate-800 dark:text-zinc-200"
              title="Aumentar logo"
            >
              +
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Aplicando tingimento fotográfico...
            </span>
          </div>
        )}

        {/* Canvas de Renderização Fotográfica */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain filter drop-shadow-xl transition-all duration-300"
        />
      </div>

      {/* Legenda do Produto Fotográfico */}
      <div className="mt-3 flex items-center justify-between w-full max-w-[560px] px-1 text-xs text-slate-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-3 h-3 rounded-full border border-black/10"
            style={{ backgroundColor: color.hex }}
          />
          Cor: <strong className="text-slate-700 dark:text-zinc-200">{color.name}</strong>
        </span>
        <span>
          Modelo:{" "}
          <strong className="text-slate-700 dark:text-zinc-200">
            {modelType === "POLO"
              ? "Camisa Polo Piquet"
              : modelType === "MANGA_LONGA"
              ? "Manga Longa Ribana"
              : "Camiseta Tradicional Meia Malha"}
          </strong>
        </span>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}
