// lib/production-export.ts
// Utilitários de exportação de arte, vistas, vetores e configuração para produção fabril
// GH Camiseteria & Uniformes Personalizados

import type { OrderSnapshot } from "@/types/orders";
import type { CustomizerElement } from "@/types/configurator";

/**
 * Normaliza o nome do arquivo conforme convenção exigida:
 * Ex: PEDIDO_00152_FRENTE.png, PEDIDO_00152_FICHA.pdf
 */
export function formatProductionFilename(
  orderNumber: string,
  suffix: string,
  extension: "png" | "svg" | "json" | "pdf"
): string {
  const cleanNumber = orderNumber.replace(/\D/g, "") || orderNumber.replace(/[^a-zA-Z0-9]/g, "_");
  const padded = cleanNumber.length < 5 ? cleanNumber.padStart(5, "0") : cleanNumber;
  return `PEDIDO_${padded}_${suffix}.${extension}`;
}

/**
 * Gera o SVG estruturado de uma vista da camiseta (Frente, Costas, Mangas)
 * Preserva cores, tipografia, rotações, escalas e elementos gráficos.
 */
export function generateViewSVG(
  viewSide: "FRONT" | "BACK" | "LEFT" | "RIGHT" | "LEFT_SLEEVE" | "RIGHT_SLEEVE",
  snapshot: OrderSnapshot,
  width = 800,
  height = 800
): string {
  const baseColor = snapshot.color?.hex || "#18181B";
  const elements: CustomizerElement[] =
    snapshot.views?.[viewSide] ||
    snapshot.views?.[viewSide.replace("_SLEEVE", "")] ||
    [];

  // Silhueta estilizada da camiseta
  let silhouettePath = "";
  if (viewSide === "FRONT" || viewSide === "BACK") {
    silhouettePath = `
      M 280 80
      Q 400 130 520 80
      L 700 180
      L 630 300
      L 540 250
      L 550 720
      Q 400 740 250 720
      L 260 250
      L 170 300
      L 100 180
      Z
    `;
  } else {
    // Manga
    silhouettePath = `
      M 200 120
      L 600 120
      L 520 680
      L 280 680
      Z
    `;
  }

  // Gera elementos SVG de textos, logos e números
  const renderedElements = elements
    .map((el) => {
      const x = el.x || 300;
      const y = el.y || 300;
      const w = el.width || 120;
      const h = el.height || 120;
      const rot = el.rotation || 0;
      const fill = el.fill || "#FFFFFF";
      const fontSize = el.fontSize || 32;
      const fontFamily = el.fontFamily || "Arial, sans-serif";

      if (el.type === "TEXT" || el.type === "NUMBER") {
        const textContent = el.text || (el.type === "NUMBER" ? "10" : "TEXTO");
        return `
          <g transform="translate(${x}, ${y}) rotate(${rot})">
            <text
              x="0"
              y="0"
              fill="${fill}"
              font-size="${fontSize}"
              font-family="${fontFamily}"
              font-weight="bold"
              text-anchor="middle"
              dominant-baseline="central"
            >${escapeXml(textContent)}</text>
          </g>
        `;
      }

      if (el.src) {
        return `
          <g transform="translate(${x}, ${y}) rotate(${rot})">
            <image
              href="${el.src}"
              x="${-w / 2}"
              y="${-h / 2}"
              width="${w}"
              height="${h}"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        `;
      }

      // Placeholder de logo/arte caso src não esteja disponível
      return `
        <g transform="translate(${x}, ${y}) rotate(${rot})">
          <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="rgba(212,175,55,0.25)" stroke="#D4AF37" stroke-width="2" stroke-dasharray="4" />
          <text x="0" y="0" fill="#D4AF37" font-size="14" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">LOGO / ARTE</text>
        </g>
      `;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.25"/>
    </filter>
  </defs>
  
  <!-- Fundo da Camiseta na Cor Aprovada -->
  <path d="${silhouettePath}" fill="${baseColor}" stroke="#333333" stroke-width="3" filter="url(#shadow)" />
  
  <!-- Gola e Detalhes da Modelagem -->
  ${
    viewSide === "FRONT"
      ? `<path d="M 330 85 Q 400 170 470 85" fill="none" stroke="#222222" stroke-width="5" />`
      : viewSide === "BACK"
      ? `<path d="M 340 85 Q 400 115 460 85" fill="none" stroke="#222222" stroke-width="4" />`
      : ""
  }

  <!-- Elementos de Personalização -->
  <g id="customization-layer">
    ${renderedElements}
  </g>
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

/**
 * Renderiza um SVG em uma imagem PNG de alta resolução via Canvas no navegador
 */
export async function convertSvgToPngDataUrl(
  svgString: string,
  width = 1600,
  height = 1600
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(blob);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(blobURL);
          reject(new Error("Canvas context não disponível"));
          return;
        }

        // Fundo transparente ou suave para exportação
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(blobURL);
        resolve(canvas.toDataURL("image/png", 1.0));
      };

      image.onerror = (err) => {
        URL.revokeObjectURL(blobURL);
        reject(err);
      };

      image.src = blobURL;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Disparar download direto no navegador de um arquivo (PNG, SVG ou JSON)
 */
export function triggerFileDownload(dataUrlOrBlobUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrlOrBlobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Baixar arquivo de configuração em JSON
 */
export function downloadOrderConfigJson(orderNumber: string, snapshot: OrderSnapshot) {
  const jsonStr = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const filename = formatProductionFilename(orderNumber, "CONFIG", "json");
  triggerFileDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
