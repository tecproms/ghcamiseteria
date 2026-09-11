// lib/svg-templates.ts
// Silhuetas e templates vetoriais de alta fidelidade para Confecção Fabril
// Suporte a 3 famílias de produtos: Tradicional/Dry-Fit, Camisa Polo e Manga Longa
// GH Camiseteria & Uniformes Personalizados

import type { ViewSide } from "@/types/uniform-model";

export type GarmentType = "TRADITIONAL" | "POLO" | "MANGA_LONGA";

export interface ZoneDefinition {
  zone_name: string;
  zone_type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  min_scale: number;
  max_scale: number;
  allowed_element_types: ("LOGO" | "TEXT" | "NUMBER" | "IMAGE")[];
  is_active: boolean;
}

export interface GarmentTemplateView {
  viewBox: string;
  width: number;
  height: number;
  name: string;
  defaultZones: ZoneDefinition[];
  path: string;
  collarPath: string;
  shadowPath?: string;
  creasesPath?: string;
  stitchesPath?: string;
  cuffsPath?: string;
  placketPath?: string;
  buttons?: { x: number; y: number; r: number }[];
  collarFlapsPath?: string;
}

export interface GarmentTemplate {
  type: GarmentType;
  label: string;
  description: string;
  views: Record<ViewSide, GarmentTemplateView>;
}

export const GARMENT_TEMPLATES: Record<GarmentType, GarmentTemplate> = {
  // ---------------------------------------------------------------------------
  // 1. CAMISETA TRADICIONAL / DRY-FIT (Gola Careca Redonda, Manga Curta)
  // ---------------------------------------------------------------------------
  TRADITIONAL: {
    type: "TRADITIONAL",
    label: "Camiseta Tradicional / Dry-Fit",
    description: "Modelo clássico de alta durabilidade com gola em ribana e caimento anatômico.",
    views: {
      FRONT: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Frente (Tradicional)",
        path: `M 320 85
               C 360 125 440 125 480 85
               L 580 125
               L 700 240
               L 630 315
               L 555 255
               L 550 715
               C 450 722 350 722 250 715
               L 245 255
               L 170 315
               L 100 240
               L 220 125
               Z`,
        collarPath: `M 320 85 C 360 145 440 145 480 85 C 440 115 360 115 320 85 Z`,
        shadowPath: `M 255 265 C 280 290 295 330 285 365
                     M 545 265 C 520 290 505 330 515 365
                     M 252 700 C 350 712 450 712 548 700`,
        stitchesPath: `M 220 125 L 320 85
                       M 480 85 L 580 125
                       M 250 705 C 350 714 450 714 550 705
                       M 103 243 L 168 312
                       M 697 243 L 632 312`,
        defaultZones: [
          {
            zone_name: "Peito Esquerdo (Logo)",
            zone_type: "PEITO_ESQUERDO",
            x: 460,
            y: 220,
            width: 110,
            height: 110,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            zone_name: "Peito Direito",
            zone_type: "PEITO_DIREITO",
            x: 230,
            y: 220,
            width: 110,
            height: 110,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            zone_name: "Centro Frontal (Estampa)",
            zone_type: "CENTRO_FRONTAL",
            x: 270,
            y: 260,
            width: 260,
            height: 320,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.5,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
            is_active: true,
          },
        ],
      },
      BACK: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Costas (Tradicional)",
        path: `M 320 90
               C 360 106 440 106 480 90
               L 580 125
               L 700 240
               L 630 315
               L 555 255
               L 550 715
               C 450 722 350 722 250 715
               L 245 255
               L 170 315
               L 100 240
               L 220 125
               Z`,
        collarPath: `M 320 90 C 360 102 440 102 480 90 C 440 94 360 94 320 90 Z`,
        stitchesPath: `M 220 125 L 320 90
                       M 480 90 L 580 125
                       M 250 705 C 350 714 450 714 550 705`,
        defaultZones: [
          {
            zone_name: "Costas - Estampa / Número",
            zone_type: "COSTAS",
            x: 260,
            y: 190,
            width: 280,
            height: 380,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.5,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
            is_active: true,
          },
        ],
      },
      LEFT_SLEEVE: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Manga Esquerda (Tradicional)",
        path: `M 290 140
               C 370 105 430 105 510 140
               L 570 520
               L 230 520
               Z`,
        collarPath: `M 230 510 L 570 510`,
        stitchesPath: `M 230 510 L 570 510`,
        defaultZones: [
          {
            zone_name: "Manga Esquerda",
            zone_type: "MANGA_ESQUERDA",
            x: 320,
            y: 280,
            width: 160,
            height: 160,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER"],
            is_active: true,
          },
        ],
      },
      RIGHT_SLEEVE: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Manga Direita (Tradicional)",
        path: `M 290 140
               C 370 105 430 105 510 140
               L 570 520
               L 230 520
               Z`,
        collarPath: `M 230 510 L 570 510`,
        stitchesPath: `M 230 510 L 570 510`,
        defaultZones: [
          {
            zone_name: "Manga Direita",
            zone_type: "MANGA_DIREITA",
            x: 320,
            y: 280,
            width: 160,
            height: 160,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER"],
            is_active: true,
          },
        ],
      },
      OTHER: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Outro Ângulo",
        path: "",
        collarPath: "",
        defaultZones: [],
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 2. CAMISA POLO EMPRESARIAL (Gola Polo Estruturada, Peitilho e Botões)
  // ---------------------------------------------------------------------------
  POLO: {
    type: "POLO",
    label: "Camisa Polo Empresarial Piquet",
    description: "Elegância executiva com gola estruturada, peitilho com 2 botões e punhos em ribana.",
    views: {
      FRONT: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Frente (Camisa Polo)",
        path: `M 320 85
               L 480 85
               L 585 125
               L 700 245
               L 630 315
               L 555 255
               L 550 715
               C 450 720 350 720 250 715
               L 245 255
               L 170 315
               L 100 245
               L 215 125
               Z`,
        // Colarinho fechado traseiro
        collarPath: `M 320 85 C 370 100 430 100 480 85 L 485 105 C 430 120 370 120 315 105 Z`,
        // Abas da Gola Polo dobrada (Lapelas clássicas com caimento pontiagudo)
        collarFlapsPath: `M 325 85
                          L 295 185
                          L 380 160
                          L 380 95
                          Z
                          M 475 85
                          L 505 185
                          L 420 160
                          L 420 95
                          Z`,
        // Peitilho com costura reforçada (placket frontal)
        placketPath: `M 380 160 L 420 160 L 420 280 L 400 295 L 380 280 Z`,
        // Botões com costura
        buttons: [
          { x: 400, y: 190, r: 5.5 },
          { x: 400, y: 240, r: 5.5 },
        ],
        // Ribana nas mangas e fendas laterais
        cuffsPath: `M 103 245 L 168 313 L 158 322 L 93 254 Z
                    M 697 245 L 632 313 L 642 322 L 707 254 Z`,
        shadowPath: `M 255 265 C 280 290 295 330 285 365
                     M 545 265 C 520 290 505 330 515 365`,
        stitchesPath: `M 382 165 L 382 278
                       M 418 165 L 418 278
                       M 380 280 L 420 280
                       M 250 705 C 350 714 450 714 550 705`,
        defaultZones: [
          {
            zone_name: "Peito Esquerdo (Bordado / Logo)",
            zone_type: "PEITO_ESQUERDO",
            x: 460,
            y: 220,
            width: 105,
            height: 105,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            zone_name: "Peito Direito",
            zone_type: "PEITO_DIREITO",
            x: 235,
            y: 220,
            width: 105,
            height: 105,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            zone_name: "Centro Frontal",
            zone_type: "CENTRO_FRONTAL",
            x: 275,
            y: 310,
            width: 250,
            height: 280,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.2,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
        ],
      },
      BACK: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Costas (Camisa Polo)",
        path: `M 320 85
               L 480 85
               L 585 125
               L 700 245
               L 630 315
               L 555 255
               L 550 715
               C 450 720 350 720 250 715
               L 245 255
               L 170 315
               L 100 245
               L 215 125
               Z`,
        // Traseira da gola polo dobrada
        collarPath: `M 305 85 C 360 100 440 100 495 85 L 505 115 C 440 130 360 130 295 115 Z`,
        stitchesPath: `M 215 125 L 320 85
                       M 480 85 L 585 125
                       M 270 190 C 400 195 530 190 530 190
                       M 250 705 C 350 714 450 714 550 705`,
        defaultZones: [
          {
            zone_name: "Costas - Estampa / Logo",
            zone_type: "COSTAS",
            x: 260,
            y: 210,
            width: 280,
            height: 360,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.5,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
            is_active: true,
          },
        ],
      },
      LEFT_SLEEVE: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Manga Esquerda (Polo)",
        path: `M 290 140
               C 370 105 430 105 510 140
               L 570 520
               L 230 520
               Z`,
        collarPath: `M 230 500 L 570 500`,
        cuffsPath: `M 230 500 L 570 500 L 570 520 L 230 520 Z`,
        defaultZones: [
          {
            zone_name: "Manga Esquerda (Polo)",
            zone_type: "MANGA_ESQUERDA",
            x: 320,
            y: 280,
            width: 155,
            height: 155,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT"],
            is_active: true,
          },
        ],
      },
      RIGHT_SLEEVE: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Manga Direita (Polo)",
        path: `M 290 140
               C 370 105 430 105 510 140
               L 570 520
               L 230 520
               Z`,
        collarPath: `M 230 500 L 570 500`,
        cuffsPath: `M 230 500 L 570 500 L 570 520 L 230 520 Z`,
        defaultZones: [
          {
            zone_name: "Manga Direita (Polo)",
            zone_type: "MANGA_DIREITA",
            x: 320,
            y: 280,
            width: 155,
            height: 155,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT"],
            is_active: true,
          },
        ],
      },
      OTHER: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Outro Ângulo",
        path: "",
        collarPath: "",
        defaultZones: [],
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 3. CAMISA MANGA LONGA (Mangas Estendidas até o Punho, Proteção / Inverno)
  // ---------------------------------------------------------------------------
  MANGA_LONGA: {
    type: "MANGA_LONGA",
    label: "Camisa Manga Longa / Proteção UV",
    description: "Cobertura integral dos braços com punhos canelados reforçados. Ideal para indústria e esportes.",
    views: {
      FRONT: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Frente (Manga Longa)",
        path: `M 320 85
               C 360 130 440 130 480 85
               L 580 125
               L 660 380
               L 625 670
               L 565 675
               L 575 420
               L 550 260
               L 550 715
               C 450 722 350 722 250 715
               L 250 260
               L 225 420
               L 235 675
               L 175 670
               L 140 380
               L 220 125
               Z`,
        collarPath: `M 320 85 C 360 145 440 145 480 85 C 440 115 360 115 320 85 Z`,
        // Punhos canelados em ribana nas duas extremidades
        cuffsPath: `M 175 640 L 235 645 L 235 675 L 175 670 Z
                    M 625 640 L 565 645 L 565 675 L 625 670 Z`,
        shadowPath: `M 250 265 C 275 290 290 330 280 365
                     M 550 265 C 525 290 510 330 520 365
                     M 180 380 C 195 390 215 385 225 410
                     M 620 380 C 605 390 585 385 575 410`,
        stitchesPath: `M 220 125 L 320 85
                       M 480 85 L 580 125
                       M 175 640 L 235 645
                       M 625 640 L 565 645
                       M 250 705 C 350 714 450 714 550 705`,
        defaultZones: [
          {
            zone_name: "Peito Esquerdo",
            zone_type: "PEITO_ESQUERDO",
            x: 460,
            y: 220,
            width: 110,
            height: 110,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            zone_name: "Peito Direito",
            zone_type: "PEITO_DIREITO",
            x: 230,
            y: 220,
            width: 110,
            height: 110,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            zone_name: "Centro Frontal",
            zone_type: "CENTRO_FRONTAL",
            x: 270,
            y: 260,
            width: 260,
            height: 320,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.5,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
            is_active: true,
          },
          {
            zone_name: "Antebraço Esquerdo",
            zone_type: "MANGA_ESQUERDA",
            x: 580,
            y: 430,
            width: 60,
            height: 180,
            rotation: 10,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT"],
            is_active: true,
          },
          {
            zone_name: "Antebraço Direito",
            zone_type: "MANGA_DIREITA",
            x: 160,
            y: 430,
            width: 60,
            height: 180,
            rotation: -10,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT"],
            is_active: true,
          },
        ],
      },
      BACK: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Costas (Manga Longa)",
        path: `M 320 90
               C 360 106 440 106 480 90
               L 580 125
               L 660 380
               L 625 670
               L 565 675
               L 575 420
               L 550 260
               L 550 715
               C 450 722 350 722 250 715
               L 250 260
               L 225 420
               L 235 675
               L 175 670
               L 140 380
               L 220 125
               Z`,
        collarPath: `M 320 90 C 360 102 440 102 480 90 C 440 94 360 94 320 90 Z`,
        cuffsPath: `M 175 640 L 235 645 L 235 675 L 175 670 Z
                    M 625 640 L 565 645 L 565 675 L 625 670 Z`,
        stitchesPath: `M 220 125 L 320 90
                       M 480 90 L 580 125
                       M 250 705 C 350 714 450 714 550 705`,
        defaultZones: [
          {
            zone_name: "Costas Completa",
            zone_type: "COSTAS",
            x: 260,
            y: 190,
            width: 280,
            height: 380,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.5,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
            is_active: true,
          },
        ],
      },
      LEFT_SLEEVE: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Manga Longa Esquerda",
        path: `M 290 90
               C 370 60 430 60 510 90
               L 500 700
               L 300 700
               Z`,
        collarPath: `M 300 660 L 500 660`,
        cuffsPath: `M 300 660 L 500 660 L 500 700 L 300 700 Z`,
        defaultZones: [
          {
            zone_name: "Ombro / Bíceps",
            zone_type: "MANGA_ESQUERDA",
            x: 330,
            y: 200,
            width: 140,
            height: 140,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT"],
            is_active: true,
          },
          {
            zone_name: "Antebraço / Punho",
            zone_type: "MANGA_ESQUERDA",
            x: 340,
            y: 420,
            width: 120,
            height: 200,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT"],
            is_active: true,
          },
        ],
      },
      RIGHT_SLEEVE: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Manga Longa Direita",
        path: `M 290 90
               C 370 60 430 60 510 90
               L 500 700
               L 300 700
               Z`,
        collarPath: `M 300 660 L 500 660`,
        cuffsPath: `M 300 660 L 500 660 L 500 700 L 300 700 Z`,
        defaultZones: [
          {
            zone_name: "Ombro / Bíceps",
            zone_type: "MANGA_DIREITA",
            x: 330,
            y: 200,
            width: 140,
            height: 140,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT"],
            is_active: true,
          },
          {
            zone_name: "Antebraço / Punho",
            zone_type: "MANGA_DIREITA",
            x: 340,
            y: 420,
            width: 120,
            height: 200,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT"],
            is_active: true,
          },
        ],
      },
      OTHER: {
        viewBox: "0 0 800 800",
        width: 800,
        height: 800,
        name: "Outro Ângulo",
        path: "",
        collarPath: "",
        defaultZones: [],
      },
    },
  },
};

/**
 * Identifica o tipo de peça (TRADITIONAL, POLO, MANGA_LONGA) a partir de uma string de modelo ou nome
 */
export function getGarmentType(modelNameOrId?: string): GarmentType {
  if (!modelNameOrId) return "TRADITIONAL";
  const str = modelNameOrId.toLowerCase();
  if (str.includes("polo")) return "POLO";
  if (str.includes("longa") || str.includes("comprida") || str.includes("inverno") || str.includes("uv")) {
    return "MANGA_LONGA";
  }
  return "TRADITIONAL";
}

/**
 * Retorna o template visual exato da peça e da vista solicitada
 */
export function getGarmentTemplate(
  garmentType: GarmentType,
  viewSide: ViewSide
): GarmentTemplateView {
  const g = GARMENT_TEMPLATES[garmentType] || GARMENT_TEMPLATES.TRADITIONAL;
  return g.views[viewSide] || g.views.FRONT;
}

/**
 * Alias retrocompatível com a constante SHIRT_SVG_TEMPLATES existente no projeto
 */
export const SHIRT_SVG_TEMPLATES = {
  FRONT: GARMENT_TEMPLATES.TRADITIONAL.views.FRONT,
  BACK: GARMENT_TEMPLATES.TRADITIONAL.views.BACK,
  LEFT_SLEEVE: GARMENT_TEMPLATES.TRADITIONAL.views.LEFT_SLEEVE,
  RIGHT_SLEEVE: GARMENT_TEMPLATES.TRADITIONAL.views.RIGHT_SLEEVE,
};
