import { pool } from "@/lib/db";
import { SHIRT_SVG_TEMPLATES } from "@/lib/svg-templates";
import type {
  UniformModel,
  UniformView,
  CustomizationZone,
  CreateUniformModelDTO,
  UpdateUniformModelDTO,
  CreateCustomizationZoneDTO,
  UpdateCustomizationZoneDTO,
  ViewSide,
  ElementType,
} from "@/types/uniform-model";

// Memória local de fallback para garantir funcionamento contínuo e builds estáveis
let memoryModels: UniformModel[] = [
  {
    id: "model-camisa-tradicional-01",
    name: "Camiseta Tradicional Meia Malha",
    description: "Modelo clássico de alta durabilidade, gola careca em ribana e mangas curtas. Ideal para uniformes operacionais e eventos corporativos.",
    product_id: null,
    product_name: "Camiseta Algodão 30.1",
    base_asset_url: "/assets/templates/front.svg",
    is_active: true,
    created_at: new Date().toISOString(),
    views: [
      {
        id: "view-front-01",
        shirt_model_id: "model-camisa-tradicional-01",
        view_side: "FRONT",
        preview_image_url: "/assets/templates/front.svg",
        svg_content: SHIRT_SVG_TEMPLATES.FRONT.path,
        canvas_width: 800,
        canvas_height: 800,
        sort_order: 1,
        zones: [
          {
            id: "zone-peito-esq-01",
            shirt_view_id: "view-front-01",
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
            id: "zone-centro-front-01",
            shirt_view_id: "view-front-01",
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
      {
        id: "view-back-01",
        shirt_model_id: "model-camisa-tradicional-01",
        view_side: "BACK",
        preview_image_url: "/assets/templates/back.svg",
        svg_content: SHIRT_SVG_TEMPLATES.BACK.path,
        canvas_width: 800,
        canvas_height: 800,
        sort_order: 2,
        zones: [
          {
            id: "zone-costas-01",
            shirt_view_id: "view-back-01",
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
      {
        id: "view-lsleeve-01",
        shirt_model_id: "model-camisa-tradicional-01",
        view_side: "LEFT_SLEEVE",
        preview_image_url: "/assets/templates/left_sleeve.svg",
        svg_content: SHIRT_SVG_TEMPLATES.LEFT_SLEEVE.path,
        canvas_width: 800,
        canvas_height: 800,
        sort_order: 3,
        zones: [
          {
            id: "zone-manga-esq-01",
            shirt_view_id: "view-lsleeve-01",
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
      },
      {
        id: "view-rsleeve-01",
        shirt_model_id: "model-camisa-tradicional-01",
        view_side: "RIGHT_SLEEVE",
        preview_image_url: "/assets/templates/right_sleeve.svg",
        svg_content: SHIRT_SVG_TEMPLATES.RIGHT_SLEEVE.path,
        canvas_width: 800,
        canvas_height: 800,
        sort_order: 4,
        zones: [
          {
            id: "zone-manga-dir-01",
            shirt_view_id: "view-rsleeve-01",
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
      },
    ],
  },
];

export class UniformModelService {
  /**
   * Listar todos os modelos com vistas e zonas
   */
  static async listModels(): Promise<UniformModel[]> {
    try {
      const res = await pool.query(`
        SELECT 
          m.id, m.name, m.description, m.product_id, m.base_asset_url, m.is_active, m.created_at, m.updated_at,
          p.name as product_name
        FROM public.shirt_models m
        LEFT JOIN public.products p ON p.id = m.product_id
        WHERE m.deleted_at IS NULL
        ORDER BY m.created_at DESC
      `);

      if (res.rows.length === 0 && memoryModels.length > 0) {
        return memoryModels;
      }

      const models: UniformModel[] = [];
      for (const row of res.rows) {
        const viewsRes = await pool.query(
          `SELECT * FROM public.shirt_views WHERE shirt_model_id = $1 ORDER BY sort_order ASC`,
          [row.id]
        );

        const views: UniformView[] = [];
        for (const v of viewsRes.rows) {
          const zonesRes = await pool.query(
            `SELECT * FROM public.shirt_zones WHERE shirt_view_id = $1 ORDER BY zone_name ASC`,
            [v.id]
          );

          views.push({
            id: v.id,
            shirt_model_id: v.shirt_model_id,
            view_side: (v.view_side?.toUpperCase() || "FRONT") as ViewSide,
            preview_image_url: v.preview_image_url,
            svg_overlay_url: v.svg_overlay_url,
            svg_content: v.svg_content,
            canvas_width: v.canvas_width || 800,
            canvas_height: v.canvas_height || 800,
            sort_order: v.sort_order || 0,
            zones: zonesRes.rows.map((z) => ({
              id: z.id,
              shirt_view_id: z.shirt_view_id,
              zone_name: z.zone_name,
              zone_type: z.zone_type,
              x: Number(z.x),
              y: Number(z.y),
              width: Number(z.width),
              height: Number(z.height),
              rotation: Number(z.rotation || 0),
              min_scale: Number(z.min_scale || 0.2),
              max_scale: Number(z.max_scale || 3.0),
              allowed_element_types: (z.allowed_element_types || ["LOGO", "TEXT", "NUMBER", "IMAGE"]) as ElementType[],
              is_active: z.is_active,
              svg_path: z.svg_path,
              svg_bounds: z.svg_bounds,
            })),
          });
        }

        models.push({
          id: row.id,
          product_id: row.product_id,
          product_name: row.product_name,
          name: row.name,
          description: row.description,
          base_asset_url: row.base_asset_url,
          is_active: row.is_active,
          created_at: row.created_at,
          updated_at: row.updated_at,
          views,
        });
      }

      return models;
    } catch {
      // Fallback em ambiente local sem PostgreSQL ativo
      return memoryModels;
    }
  }

  /**
   * Buscar modelo por ID com suas vistas e zonas completas
   */
  static async getModelById(id: string): Promise<UniformModel | null> {
    const all = await this.listModels();
    return all.find((m) => m.id === id) || null;
  }

  /**
   * Criar novo modelo de uniforme configurando automaticamente as 4 vistas padrão
   */
  static async createModel(dto: CreateUniformModelDTO): Promise<UniformModel> {
    const id = `model-${Date.now()}`;
    const newModel: UniformModel = {
      id,
      name: dto.name,
      description: dto.description || "",
      product_id: dto.product_id || null,
      base_asset_url: dto.base_asset_url || "/assets/templates/front.svg",
      is_active: dto.is_active ?? true,
      created_at: new Date().toISOString(),
      views: [
        {
          id: `view-front-${Date.now()}`,
          shirt_model_id: id,
          view_side: "FRONT",
          preview_image_url: "/assets/templates/front.svg",
          svg_content: SHIRT_SVG_TEMPLATES.FRONT.path,
          canvas_width: 800,
          canvas_height: 800,
          sort_order: 1,
          zones: [
            {
              id: `zone-peito-esq-${Date.now()}`,
              shirt_view_id: `view-front-${Date.now()}`,
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
              id: `zone-peito-dir-${Date.now()}`,
              shirt_view_id: `view-front-${Date.now()}`,
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
              id: `zone-centro-front-${Date.now()}`,
              shirt_view_id: `view-front-${Date.now()}`,
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
          ],
        },
        {
          id: `view-back-${Date.now()}`,
          shirt_model_id: id,
          view_side: "BACK",
          preview_image_url: "/assets/templates/back.svg",
          svg_content: SHIRT_SVG_TEMPLATES.BACK.path,
          canvas_width: 800,
          canvas_height: 800,
          sort_order: 2,
          zones: [
            {
              id: `zone-costas-${Date.now()}`,
              shirt_view_id: `view-back-${Date.now()}`,
              zone_name: "Costas",
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
        {
          id: `view-lsleeve-${Date.now()}`,
          shirt_model_id: id,
          view_side: "LEFT_SLEEVE",
          preview_image_url: "/assets/templates/left_sleeve.svg",
          svg_content: SHIRT_SVG_TEMPLATES.LEFT_SLEEVE.path,
          canvas_width: 800,
          canvas_height: 800,
          sort_order: 3,
          zones: [
            {
              id: `zone-manga-esq-${Date.now()}`,
              shirt_view_id: `view-lsleeve-${Date.now()}`,
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
        },
        {
          id: `view-rsleeve-${Date.now()}`,
          shirt_model_id: id,
          view_side: "RIGHT_SLEEVE",
          preview_image_url: "/assets/templates/right_sleeve.svg",
          svg_content: SHIRT_SVG_TEMPLATES.RIGHT_SLEEVE.path,
          canvas_width: 800,
          canvas_height: 800,
          sort_order: 4,
          zones: [
            {
              id: `zone-manga-dir-${Date.now()}`,
              shirt_view_id: `view-rsleeve-${Date.now()}`,
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
        },
      ],
    };

    try {
      const res = await pool.query(
        `INSERT INTO public.shirt_models (name, description, product_id, base_asset_url, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [dto.name, dto.description || null, dto.product_id || null, dto.base_asset_url || null, dto.is_active ?? true]
      );

      const createdRow = res.rows[0];
      const modelId = createdRow.id;

      // Inserir vistas e zonas
      for (const view of newModel.views || []) {
        const vRes = await pool.query(
          `INSERT INTO public.shirt_views (shirt_model_id, view_side, preview_image_url, svg_content, canvas_width, canvas_height, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            modelId,
            view.view_side.toLowerCase(),
            view.preview_image_url,
            view.svg_content || null,
            view.canvas_width,
            view.canvas_height,
            view.sort_order,
          ]
        );

        const vId = vRes.rows[0].id;
        for (const zone of view.zones || []) {
          await pool.query(
            `INSERT INTO public.shirt_zones 
             (shirt_view_id, zone_name, zone_type, x, y, width, height, rotation, min_scale, max_scale, allowed_element_types, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              vId,
              zone.zone_name,
              zone.zone_type,
              zone.x,
              zone.y,
              zone.width,
              zone.height,
              zone.rotation,
              zone.min_scale,
              zone.max_scale,
              zone.allowed_element_types,
              zone.is_active,
            ]
          );
        }
      }

      return (await this.getModelById(modelId)) || newModel;
    } catch {
      memoryModels.unshift(newModel);
      return newModel;
    }
  }

  /**
   * Atualizar dados do modelo
   */
  static async updateModel(id: string, dto: UpdateUniformModelDTO): Promise<UniformModel | null> {
    try {
      await pool.query(
        `UPDATE public.shirt_models 
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             product_id = COALESCE($3, product_id),
             base_asset_url = COALESCE($4, base_asset_url),
             is_active = COALESCE($5, is_active),
             updated_at = timezone('utc'::text, now())
         WHERE id = $6`,
        [dto.name, dto.description, dto.product_id, dto.base_asset_url, dto.is_active, id]
      );
      return await this.getModelById(id);
    } catch {
      const idx = memoryModels.findIndex((m) => m.id === id);
      if (idx !== -1) {
        memoryModels[idx] = { ...memoryModels[idx], ...dto };
        return memoryModels[idx];
      }
      return null;
    }
  }

  /**
   * Excluir modelo (cascade)
   */
  static async deleteModel(id: string): Promise<boolean> {
    try {
      await pool.query(`DELETE FROM public.shirt_models WHERE id = $1`, [id]);
      memoryModels = memoryModels.filter((m) => m.id !== id);
      return true;
    } catch {
      memoryModels = memoryModels.filter((m) => m.id !== id);
      return true;
    }
  }

  /**
   * Criar zona de personalização em uma vista
   */
  static async createZone(dto: CreateCustomizationZoneDTO): Promise<CustomizationZone> {
    const id = `zone-${Date.now()}`;
    const newZone: CustomizationZone = {
      id,
      shirt_view_id: dto.shirt_view_id,
      zone_name: dto.zone_name,
      zone_type: dto.zone_type,
      x: dto.x,
      y: dto.y,
      width: dto.width,
      height: dto.height,
      rotation: dto.rotation ?? 0,
      min_scale: dto.min_scale ?? 0.2,
      max_scale: dto.max_scale ?? 3.0,
      allowed_element_types: dto.allowed_element_types ?? ["LOGO", "TEXT", "NUMBER", "IMAGE"],
      is_active: dto.is_active ?? true,
      svg_path: dto.svg_path || null,
    };

    try {
      const res = await pool.query(
        `INSERT INTO public.shirt_zones 
         (shirt_view_id, zone_name, zone_type, x, y, width, height, rotation, min_scale, max_scale, allowed_element_types, is_active, svg_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          dto.shirt_view_id,
          dto.zone_name,
          dto.zone_type,
          dto.x,
          dto.y,
          dto.width,
          dto.height,
          dto.rotation ?? 0,
          dto.min_scale ?? 0.2,
          dto.max_scale ?? 3.0,
          dto.allowed_element_types ?? ["LOGO", "TEXT", "NUMBER", "IMAGE"],
          dto.is_active ?? true,
          dto.svg_path || null,
        ]
      );
      const row = res.rows[0];
      return {
        id: row.id,
        shirt_view_id: row.shirt_view_id,
        zone_name: row.zone_name,
        zone_type: row.zone_type,
        x: Number(row.x),
        y: Number(row.y),
        width: Number(row.width),
        height: Number(row.height),
        rotation: Number(row.rotation || 0),
        min_scale: Number(row.min_scale || 0.2),
        max_scale: Number(row.max_scale || 3.0),
        allowed_element_types: row.allowed_element_types as ElementType[],
        is_active: row.is_active,
        svg_path: row.svg_path,
      };
    } catch {
      for (const model of memoryModels) {
        for (const view of model.views || []) {
          if (view.id === dto.shirt_view_id) {
            if (!view.zones) view.zones = [];
            view.zones.push(newZone);
            return newZone;
          }
        }
      }
      return newZone;
    }
  }

  /**
   * Atualizar zona de personalização (coordenadas, dimensões, rotação, escalas, elementos)
   */
  static async updateZone(id: string, dto: UpdateCustomizationZoneDTO): Promise<CustomizationZone | null> {
    try {
      const res = await pool.query(
        `UPDATE public.shirt_zones
         SET zone_name = COALESCE($1, zone_name),
             zone_type = COALESCE($2, zone_type),
             x = COALESCE($3, x),
             y = COALESCE($4, y),
             width = COALESCE($5, width),
             height = COALESCE($6, height),
             rotation = COALESCE($7, rotation),
             min_scale = COALESCE($8, min_scale),
             max_scale = COALESCE($9, max_scale),
             allowed_element_types = COALESCE($10, allowed_element_types),
             is_active = COALESCE($11, is_active),
             svg_path = COALESCE($12, svg_path),
             updated_at = timezone('utc'::text, now())
         WHERE id = $13
         RETURNING *`,
        [
          dto.zone_name,
          dto.zone_type,
          dto.x,
          dto.y,
          dto.width,
          dto.height,
          dto.rotation,
          dto.min_scale,
          dto.max_scale,
          dto.allowed_element_types,
          dto.is_active,
          dto.svg_path,
          id,
        ]
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        shirt_view_id: row.shirt_view_id,
        zone_name: row.zone_name,
        zone_type: row.zone_type,
        x: Number(row.x),
        y: Number(row.y),
        width: Number(row.width),
        height: Number(row.height),
        rotation: Number(row.rotation || 0),
        min_scale: Number(row.min_scale || 0.2),
        max_scale: Number(row.max_scale || 3.0),
        allowed_element_types: row.allowed_element_types as ElementType[],
        is_active: row.is_active,
        svg_path: row.svg_path,
      };
    } catch {
      for (const model of memoryModels) {
        for (const view of model.views || []) {
          const zone = view.zones?.find((z) => z.id === id);
          if (zone) {
            Object.assign(zone, dto);
            return zone;
          }
        }
      }
      return null;
    }
  }

  /**
   * Excluir zona de personalização
   */
  static async deleteZone(id: string): Promise<boolean> {
    try {
      await pool.query(`DELETE FROM public.shirt_zones WHERE id = $1`, [id]);
      for (const model of memoryModels) {
        for (const view of model.views || []) {
          if (view.zones) {
            view.zones = view.zones.filter((z) => z.id !== id);
          }
        }
      }
      return true;
    } catch {
      for (const model of memoryModels) {
        for (const view of model.views || []) {
          if (view.zones) {
            view.zones = view.zones.filter((z) => z.id !== id);
          }
        }
      }
      return true;
    }
  }
}
