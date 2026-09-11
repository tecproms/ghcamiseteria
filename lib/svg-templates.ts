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
  innerCollarPath?: string;
  armholeSeamsPath?: string;
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
        path: `M 330 96
               C 365 145 435 145 470 96
               C 510 108 550 122 590 138
               C 625 185 635 250 622 345
               C 595 338 565 328 545 320
               C 538 305 536 290 535 275
               C 532 330 528 460 532 580
               C 530 635 528 680 540 715
               C 450 728 350 728 260 715
               C 272 680 270 635 268 580
               C 272 460 268 330 265 275
               C 264 290 262 305 255 320
               C 235 328 205 338 178 345
               C 165 250 175 185 210 138
               C 250 122 290 108 330 96
               Z`,
        collarPath: `M 330 96 C 365 152 435 152 470 96 C 442 136 358 136 330 96 Z`,
        innerCollarPath: `M 330 96 C 365 78 435 78 470 96 C 445 110 355 110 330 96 Z`,
        armholeSeamsPath: `M 210 138 C 242 175 258 225 265 275
                           M 590 138 C 558 175 542 225 535 275`,
        shadowPath: `M 265 275 C 292 315 308 350 298 400
                     M 535 275 C 508 315 492 350 502 400
                     M 180 300 C 205 310 230 305 250 315
                     M 620 300 C 595 310 570 305 550 315
                     M 264 695 C 350 710 450 710 536 695`,
        stitchesPath: `M 210 138 C 250 122 290 108 330 96
                       M 470 96 C 510 108 550 122 590 138
                       M 180 338 C 205 330 235 322 253 316
                       M 620 338 C 595 330 565 322 547 316
                       M 262 705 C 350 718 450 718 538 705`,
        defaultZones: [
          {
            zone_name: "Peito Esquerdo (Logo)",
            zone_type: "PEITO_ESQUERDO",
            x: 440,
            y: 200,
            width: 95,
            height: 95,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            zone_name: "Peito Direito",
            zone_type: "PEITO_DIREITO",
            x: 265,
            y: 200,
            width: 95,
            height: 95,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            zone_name: "Centro Frontal (Estampa)",
            zone_type: "CENTRO_FRONTAL",
            x: 275,
            y: 230,
            width: 250,
            height: 340,
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
        path: `M 330 96
               C 365 145 435 145 470 96
               C 510 108 550 122 590 138
               C 625 185 635 250 622 345
               C 595 338 565 328 545 320
               C 538 305 536 290 535 275
               C 532 330 528 460 532 580
               C 530 635 528 680 540 715
               C 450 728 350 728 260 715
               C 272 680 270 635 268 580
               C 272 460 268 330 265 275
               C 264 290 262 305 255 320
               C 235 328 205 338 178 345
               C 165 250 175 185 210 138
               C 250 122 290 108 330 96
               Z`,
        collarPath: `M 330 96 C 365 112 435 112 470 96 C 445 102 355 102 330 96 Z`,
        armholeSeamsPath: `M 210 138 C 242 175 258 225 265 275
                           M 590 138 C 558 175 542 225 535 275`,
        shadowPath: `M 265 275 C 290 310 300 350 295 400
                     M 535 275 C 510 310 500 350 505 400
                     M 264 695 C 350 710 450 710 536 695`,
        stitchesPath: `M 210 138 C 250 122 290 108 330 96
                       M 470 96 C 510 108 550 122 590 138
                       M 180 338 C 205 330 235 322 253 316
                       M 620 338 C 595 330 565 322 547 316
                       M 262 705 C 350 718 450 718 538 705`,
        defaultZones: [
          {
            zone_name: "Costas - Estampa / Número",
            zone_type: "COSTAS",
            x: 270,
            y: 180,
            width: 260,
            height: 390,
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
        path: `M 330 96
               C 365 110 435 110 470 96
               C 510 108 550 122 590 138
               C 625 185 635 250 622 345
               C 595 338 565 328 545 320
               C 538 305 536 290 535 275
               C 532 330 528 460 532 580
               C 530 635 528 680 540 715
               C 450 728 350 728 260 715
               C 272 680 270 635 268 580
               C 272 460 268 330 265 275
               C 264 290 262 305 255 320
               C 235 328 205 338 178 345
               C 165 250 175 185 210 138
               C 250 122 290 108 330 96
               Z`,
        // Colarinho fechado traseiro
        collarPath: `M 325 96 C 365 112 435 112 475 96 C 455 106 345 106 325 96 Z`,
        innerCollarPath: `M 325 96 C 365 80 435 80 475 96 C 450 104 350 104 325 96 Z`,
        // Costuras de cava dos ombros
        armholeSeamsPath: `M 210 138 C 242 175 258 225 265 275
                           M 590 138 C 558 175 542 225 535 275`,
        // Abas da Gola Polo dobrada (Lapelas estruturadas com caimento pontiagudo)
        collarFlapsPath: `M 325 96
                          C 315 130 300 168 312 205
                          C 335 195 372 178 395 162
                          L 395 100
                          Z
                          M 475 96
                          C 485 130 500 168 488 205
                          C 465 195 428 178 405 162
                          L 405 100
                          Z`,
        // Peitilho com costura reforçada (placket frontal)
        placketPath: `M 380 160 L 420 160 L 420 285 C 405 296 395 296 380 285 Z`,
        // Botões com costura
        buttons: [
          { x: 400, y: 195, r: 5.5 },
          { x: 400, y: 245, r: 5.5 },
        ],
        // Ribana nas mangas polo
        cuffsPath: `M 178 325 C 205 320 235 312 255 306 L 255 320 C 235 328 205 338 178 345 Z
                    M 622 325 C 595 320 565 312 545 306 L 545 320 C 565 328 595 338 622 345 Z`,
        shadowPath: `M 265 275 C 292 315 308 350 298 400
                     M 535 275 C 508 315 492 350 502 400
                     M 264 695 C 350 710 450 710 536 695`,
        stitchesPath: `M 380 162 L 380 282
                       M 420 162 L 420 282
                       M 380 285 L 420 285
                       M 210 138 C 250 122 290 108 330 96
                       M 470 96 C 510 108 550 122 590 138
                       M 262 705 C 350 718 450 718 538 705`,
        defaultZones: [
          {
            zone_name: "Peito Esquerdo (Bordado / Logo)",
            zone_type: "PEITO_ESQUERDO",
            x: 440,
            y: 200,
            width: 95,
            height: 95,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            zone_name: "Peito Direito",
            zone_type: "PEITO_DIREITO",
            x: 265,
            y: 200,
            width: 95,
            height: 95,
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
        path: `M 330 96
               C 365 110 435 110 470 96
               C 510 108 550 122 590 138
               C 625 185 635 250 622 345
               C 595 338 565 328 545 320
               C 538 305 536 290 535 275
               C 532 330 528 460 532 580
               C 530 635 528 680 540 715
               C 450 728 350 728 260 715
               C 272 680 270 635 268 580
               C 272 460 268 330 265 275
               C 264 290 262 305 255 320
               C 235 328 205 338 178 345
               C 165 250 175 185 210 138
               C 250 122 290 108 330 96
               Z`,
        // Traseira da gola polo dobrada
        collarPath: `M 305 85 C 360 102 440 102 495 85 L 505 118 C 440 132 360 132 295 118 Z`,
        armholeSeamsPath: `M 210 138 C 242 175 258 225 265 275
                           M 590 138 C 558 175 542 225 535 275`,
        shadowPath: `M 265 275 C 290 310 300 350 295 400
                     M 535 275 C 510 310 500 350 505 400
                     M 264 695 C 350 710 450 710 536 695`,
        stitchesPath: `M 210 138 C 250 122 290 108 330 96
                       M 470 96 C 510 108 550 122 590 138
                       M 265 190 C 400 195 535 190 535 190
                       M 262 705 C 350 718 450 718 538 705`,
        defaultZones: [
          {
            zone_name: "Costas - Estampa / Logo",
            zone_type: "COSTAS",
            x: 270,
            y: 200,
            width: 260,
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
        path: `M 330 96
               C 365 145 435 145 470 96
               C 510 108 550 122 590 138
               C 630 205 640 330 635 440
               C 630 520 610 600 595 675
               C 572 678 550 678 535 668
               C 545 590 558 500 552 420
               C 548 370 540 320 535 275
               C 532 330 528 460 532 580
               C 530 635 528 680 540 715
               C 450 728 350 728 260 715
               C 272 680 270 635 268 580
               C 272 460 268 330 265 275
               C 260 320 252 370 248 420
               C 242 500 255 590 265 668
               C 250 678 228 678 205 675
               C 190 600 170 520 165 440
               C 160 330 170 205 210 138
               C 250 122 290 108 330 96
               Z`,
        collarPath: `M 330 96 C 365 152 435 152 470 96 C 442 136 358 136 330 96 Z`,
        innerCollarPath: `M 330 96 C 365 78 435 78 470 96 C 445 110 355 110 330 96 Z`,
        armholeSeamsPath: `M 210 138 C 242 175 258 225 265 275
                           M 590 138 C 558 175 542 225 535 275`,
        cuffsPath: `M 205 650 C 225 654 245 654 265 648 L 265 668 C 245 678 225 678 205 675 Z
                    M 595 650 C 575 654 555 654 535 648 L 535 668 C 555 678 575 678 595 675 Z`,
        shadowPath: `M 265 275 C 292 315 308 350 298 400
                     M 535 275 C 508 315 492 350 502 400
                     M 180 430 C 200 445 220 435 245 440
                     M 620 430 C 600 445 580 435 555 440
                     M 264 695 C 350 710 450 710 536 695`,
        stitchesPath: `M 210 138 C 250 122 290 108 330 96
                       M 470 96 C 510 108 550 122 590 138
                       M 205 650 C 225 654 245 654 265 648
                       M 595 650 C 575 654 555 654 535 648
                       M 262 705 C 350 718 450 718 538 705`,
        defaultZones: [
          {
            zone_name: "Peito Esquerdo",
            zone_type: "PEITO_ESQUERDO",
            x: 440,
            y: 200,
            width: 95,
            height: 95,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            zone_name: "Peito Direito",
            zone_type: "PEITO_DIREITO",
            x: 265,
            y: 200,
            width: 95,
            height: 95,
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
            y: 230,
            width: 250,
            height: 340,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.5,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
            is_active: true,
          },
          {
            zone_name: "Antebraço Esquerdo",
            zone_type: "MANGA_ESQUERDA",
            x: 560,
            y: 440,
            width: 60,
            height: 180,
            rotation: 8,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT"],
            is_active: true,
          },
          {
            zone_name: "Antebraço Direito",
            zone_type: "MANGA_DIREITA",
            x: 180,
            y: 440,
            width: 60,
            height: 180,
            rotation: -8,
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
        path: `M 330 96
               C 365 145 435 145 470 96
               C 510 108 550 122 590 138
               C 630 205 640 330 635 440
               C 630 520 610 600 595 675
               C 572 678 550 678 535 668
               C 545 590 558 500 552 420
               C 548 370 540 320 535 275
               C 532 330 528 460 532 580
               C 530 635 528 680 540 715
               C 450 728 350 728 260 715
               C 272 680 270 635 268 580
               C 272 460 268 330 265 275
               C 260 320 252 370 248 420
               C 242 500 255 590 265 668
               C 250 678 228 678 205 675
               C 190 600 170 520 165 440
               C 160 330 170 205 210 138
               C 250 122 290 108 330 96
               Z`,
        collarPath: `M 330 96 C 365 112 435 112 470 96 C 445 102 355 102 330 96 Z`,
        armholeSeamsPath: `M 210 138 C 242 175 258 225 265 275
                           M 590 138 C 558 175 542 225 535 275`,
        cuffsPath: `M 205 650 C 225 654 245 654 265 648 L 265 668 C 245 678 225 678 205 675 Z
                    M 595 650 C 575 654 555 654 535 648 L 535 668 C 555 678 575 678 595 675 Z`,
        shadowPath: `M 265 275 C 290 310 300 350 295 400
                     M 535 275 C 510 310 500 350 505 400
                     M 264 695 C 350 710 450 710 536 695`,
        stitchesPath: `M 210 138 C 250 122 290 108 330 96
                       M 470 96 C 510 108 550 122 590 138
                       M 205 650 C 225 654 245 654 265 648
                       M 595 650 C 575 654 555 654 535 648
                       M 262 705 C 350 718 450 718 538 705`,
        defaultZones: [
          {
            zone_name: "Costas Completa",
            zone_type: "COSTAS",
            x: 270,
            y: 180,
            width: 260,
            height: 390,
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
