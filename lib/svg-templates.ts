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
        path: `M 315 95
               C 355 152 445 152 485 95
               C 525 105 565 118 600 135
               C 645 160 685 200 712 248
               C 690 275 660 298 634 322
               C 608 298 578 272 554 262
               C 552 300 560 450 554 580
               C 550 635 548 680 552 725
               C 450 738 350 738 248 725
               C 252 680 250 635 246 580
               C 240 450 248 300 246 262
               C 222 272 192 298 166 322
               C 140 298 110 275 88 248
               C 115 200 155 160 200 135
               C 235 118 275 105 315 95
               Z`,
        collarPath: `M 315 95 C 355 155 445 155 485 95 C 455 125 345 125 315 95 Z`,
        shadowPath: `M 248 268 C 285 305 305 345 288 385
                     M 552 268 C 515 305 495 345 512 385
                     M 252 705 C 350 720 450 720 548 705`,
        stitchesPath: `M 200 135 C 235 118 275 105 315 95
                       M 485 95 C 525 105 565 118 600 135
                       M 250 710 C 350 724 450 724 550 710
                       M 92 252 C 114 278 142 302 164 318
                       M 708 252 C 686 278 658 302 636 318`,
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
        path: `M 315 95
               C 360 110 440 110 485 95
               C 525 105 565 118 600 135
               C 645 160 685 200 712 248
               C 690 275 660 298 634 322
               C 608 298 578 272 554 262
               C 552 300 560 450 554 580
               C 550 635 548 680 552 725
               C 450 738 350 738 248 725
               C 252 680 250 635 246 580
               C 240 450 248 300 246 262
               C 222 272 192 298 166 322
               C 140 298 110 275 88 248
               C 115 200 155 160 200 135
               C 235 118 275 105 315 95
               Z`,
        collarPath: `M 315 95 C 360 110 440 110 485 95 C 455 98 345 98 315 95 Z`,
        stitchesPath: `M 200 135 C 235 118 275 105 315 95
                       M 485 95 C 525 105 565 118 600 135
                       M 250 710 C 350 724 450 724 550 710`,
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
        path: `M 320 90
               C 360 92 440 92 480 90
               C 525 105 565 118 600 135
               C 645 160 685 200 712 248
               C 690 275 660 298 634 322
               C 608 298 578 272 554 262
               C 552 300 560 450 554 580
               C 550 635 548 680 552 725
               C 450 738 350 738 248 725
               C 252 680 250 635 246 580
               C 240 450 248 300 246 262
               C 222 272 192 298 166 322
               C 140 298 110 275 88 248
               C 115 200 155 160 200 135
               C 235 118 275 105 320 90
               Z`,
        // Colarinho fechado traseiro
        collarPath: `M 320 90 C 360 102 440 102 480 90 C 485 108 430 125 315 108 Z`,
        // Abas da Gola Polo dobrada (Lapelas clássicas com caimento pontiagudo)
        collarFlapsPath: `M 320 90
                          C 310 120 298 155 305 188
                          C 325 182 365 170 382 160
                          L 382 92
                          Z
                          M 480 90
                          C 490 120 502 155 495 188
                          C 475 182 435 170 418 160
                          L 418 92
                          Z`,
        // Peitilho com costura reforçada (placket frontal)
        placketPath: `M 382 160 L 418 160 L 418 285 C 405 298 395 298 382 285 Z`,
        // Botões com costura
        buttons: [
          { x: 400, y: 195, r: 5.5 },
          { x: 400, y: 245, r: 5.5 },
        ],
        // Ribana nas mangas e fendas laterais
        cuffsPath: `M 92 250 C 114 276 142 300 164 316 L 156 325 C 134 309 106 285 84 259 Z
                    M 708 250 C 686 276 658 300 636 316 L 644 325 C 666 309 694 285 716 259 Z`,
        shadowPath: `M 248 268 C 285 305 305 345 288 385
                     M 552 268 C 515 305 495 345 512 385`,
        stitchesPath: `M 382 165 L 382 282
                       M 418 165 L 418 282
                       M 382 285 C 400 295 400 295 418 285
                       M 250 710 C 350 724 450 724 550 710`,
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
        path: `M 320 90
               C 360 92 440 92 480 90
               C 525 105 565 118 600 135
               C 645 160 685 200 712 248
               C 690 275 660 298 634 322
               C 608 298 578 272 554 262
               C 552 300 560 450 554 580
               C 550 635 548 680 552 725
               C 450 738 350 738 248 725
               C 252 680 250 635 246 580
               C 240 450 248 300 246 262
               C 222 272 192 298 166 322
               C 140 298 110 275 88 248
               C 115 200 155 160 200 135
               C 235 118 275 105 320 90
               Z`,
        // Traseira da gola polo dobrada
        collarPath: `M 305 85 C 360 100 440 100 495 85 L 505 115 C 440 130 360 130 295 115 Z`,
        stitchesPath: `M 200 135 C 235 118 275 105 320 90
                       M 480 90 C 525 105 565 118 600 135
                       M 270 190 C 400 195 530 190 530 190
                       M 250 710 C 350 724 450 724 550 710`,
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
        path: `M 315 95
               C 355 152 445 152 485 95
               C 525 105 565 118 600 135
               C 645 160 675 220 685 320
               C 690 400 660 550 635 660
               C 615 665 585 665 570 655
               C 585 550 600 420 580 340
               C 570 300 560 270 554 262
               C 552 300 560 450 554 580
               C 550 635 548 680 552 725
               C 450 738 350 738 248 725
               C 252 680 250 635 246 580
               C 240 450 248 300 246 262
               C 240 270 230 300 220 340
               C 200 420 215 550 230 655
               C 215 665 185 665 165 660
               C 140 550 110 400 115 320
               C 125 220 155 160 200 135
               C 235 118 275 105 315 95
               Z`,
        collarPath: `M 315 95 C 355 155 445 155 485 95 C 455 125 345 125 315 95 Z`,
        cuffsPath: `M 165 635 C 185 640 215 640 230 635 L 230 655 C 215 665 185 665 165 660 Z
                    M 635 635 C 615 640 585 640 570 635 L 570 655 C 585 665 615 665 635 660 Z`,
        shadowPath: `M 248 268 C 285 305 305 345 288 385
                     M 552 268 C 515 305 495 345 512 385
                     M 180 360 C 195 375 205 370 215 390
                     M 620 360 C 605 375 595 370 585 390
                     M 252 705 C 350 720 450 720 548 705`,
        stitchesPath: `M 200 135 C 235 118 275 105 315 95
                       M 485 95 C 525 105 565 118 600 135
                       M 165 635 C 185 640 215 640 230 635
                       M 635 635 C 615 640 585 640 570 635
                       M 250 710 C 350 724 450 724 550 710`,
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
        path: `M 315 95
               C 360 110 440 110 485 95
               C 525 105 565 118 600 135
               C 645 160 675 220 685 320
               C 690 400 660 550 635 660
               C 615 665 585 665 570 655
               C 585 550 600 420 580 340
               C 570 300 560 270 554 262
               C 552 300 560 450 554 580
               C 550 635 548 680 552 725
               C 450 738 350 738 248 725
               C 252 680 250 635 246 580
               C 240 450 248 300 246 262
               C 240 270 230 300 220 340
               C 200 420 215 550 230 655
               C 215 665 185 665 165 660
               C 140 550 110 400 115 320
               C 125 220 155 160 200 135
               C 235 118 275 105 315 95
               Z`,
        collarPath: `M 315 95 C 360 110 440 110 485 95 C 455 98 345 98 315 95 Z`,
        cuffsPath: `M 165 635 C 185 640 215 640 230 635 L 230 655 C 215 665 185 665 165 660 Z
                    M 635 635 C 615 640 585 640 570 635 L 570 655 C 585 665 615 665 635 660 Z`,
        shadowPath: `M 248 268 C 285 305 305 345 288 385
                     M 552 268 C 515 305 495 345 512 385
                     M 180 360 C 195 375 205 370 215 390
                     M 620 360 C 605 375 595 370 585 390
                     M 252 705 C 350 720 450 720 548 705`,
        stitchesPath: `M 200 135 C 235 118 275 105 315 95
                       M 485 95 C 525 105 565 118 600 135
                       M 165 635 C 185 640 215 640 230 635
                       M 635 635 C 615 640 585 640 570 635
                       M 250 710 C 350 724 450 724 550 710`,
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
