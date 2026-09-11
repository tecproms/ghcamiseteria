// Silhuetas e templates vetoriais SVG de alta definição para Vistas Técnicas
// Compatível com Konva, SVG padrão e Canvas Web
// GH Camiseteria & Uniformes Personalizados

export const SHIRT_SVG_TEMPLATES = {
  FRONT: {
    viewBox: "0 0 800 800",
    width: 800,
    height: 800,
    name: "Frente (FRONT)",
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
        zone_name: "Centro Frontal / Estampa Principal",
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
    path: `M 320 80
           C 350 110 450 110 480 80
           L 570 120
           L 690 230
           L 620 310
           L 550 250
           L 550 720
           L 250 720
           L 250 250
           L 180 310
           L 110 230
           L 230 120
           Z`,
    collarPath: `M 320 80 C 350 130 450 130 480 80 C 450 100 350 100 320 80 Z`,
  },
  BACK: {
    viewBox: "0 0 800 800",
    width: 800,
    height: 800,
    name: "Costas (BACK)",
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
    path: `M 320 90
           C 360 105 440 105 480 90
           L 570 120
           L 690 230
           L 620 310
           L 550 250
           L 550 720
           L 250 720
           L 250 250
           L 180 310
           L 110 230
           L 230 120
           Z`,
    collarPath: `M 320 90 C 360 98 440 98 480 90 C 440 92 360 92 320 90 Z`,
  },
  LEFT_SLEEVE: {
    viewBox: "0 0 800 800",
    width: 800,
    height: 800,
    name: "Manga Esquerda (LEFT_SLEEVE)",
    defaultZones: [
      {
        zone_name: "Manga Esquerda",
        zone_type: "MANGA_ESQUERDA",
        x: 320,
        y: 300,
        width: 160,
        height: 160,
        rotation: 0,
        min_scale: 0.2,
        max_scale: 2.0,
        allowed_element_types: ["LOGO", "TEXT", "NUMBER"],
        is_active: true,
      },
    ],
    path: `M 300 150
           C 380 120 420 120 500 150
           L 560 520
           L 240 520
           Z`,
    collarPath: `M 240 520 L 560 520`,
  },
  RIGHT_SLEEVE: {
    viewBox: "0 0 800 800",
    width: 800,
    height: 800,
    name: "Manga Direita (RIGHT_SLEEVE)",
    defaultZones: [
      {
        zone_name: "Manga Direita",
        zone_type: "MANGA_DIREITA",
        x: 320,
        y: 300,
        width: 160,
        height: 160,
        rotation: 0,
        min_scale: 0.2,
        max_scale: 2.0,
        allowed_element_types: ["LOGO", "TEXT", "NUMBER"],
        is_active: true,
      },
    ],
    path: `M 300 150
           C 380 120 420 120 500 150
           L 560 520
           L 240 520
           Z`,
    collarPath: `M 240 520 L 560 520`,
  },
};
