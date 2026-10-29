import fs from "fs/promises";
import path from "path";
import { Product, PRODUCTS as DEFAULT_PRODUCTS } from "@/data/catalog";
import { query } from "@/lib/db";

const CATALOG_FILE = path.join(process.cwd(), "data", "catalog.json");

/**
 * Lê o catálogo offline de emergência do arquivo JSON local
 */
async function getOfflineCatalog(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(CATALOG_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.warn("Aviso ao ler data/catalog.json offline:", error);
  }
  return DEFAULT_PRODUCTS;
}

/**
 * Grava espelho no arquivo JSON local para redundância e segurança contra perda de dados
 */
async function saveOfflineCatalog(products: Product[]): Promise<void> {
  try {
    const dir = path.dirname(CATALOG_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(CATALOG_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar espelho em data/catalog.json:", err);
  }
}

/**
 * Mapeia uma linha do PostgreSQL para a interface Product da aplicação
 */
function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryLabel: row.category_label || row.category,
    badge: row.badge || undefined,
    image: row.image,
    summary: row.summary || "",
    description: row.description || "",
    fabrics: Array.isArray(row.fabrics) ? row.fabrics : [],
    techniques: Array.isArray(row.techniques) ? row.techniques : [],
    sizes: row.sizes || "P ao EXG",
    colors: Array.isArray(row.colors) ? row.colors : [],
    segments: Array.isArray(row.segments) ? row.segments : [],
    minOrder: typeof row.min_order === "number" ? row.min_order : 10,
  };
}

/**
 * Lê o catálogo completo a partir do banco PostgreSQL (com fallback e espelho offline)
 */
export async function getCatalog(): Promise<Product[]> {
  try {
    const res = await query(
      `SELECT id, name, category, category_label, badge, image, summary, description,
              fabrics, techniques, sizes, colors, segments, min_order, display_order, created_at
       FROM catalog_products
       WHERE is_active = TRUE
       ORDER BY display_order ASC, created_at ASC;`
    );

    if (res.rows && res.rows.length > 0) {
      const products = res.rows.map(mapRowToProduct);
      // Salva espelho local assincronamente para redundância
      saveOfflineCatalog(products).catch(() => {});
      return products;
    }

    // Se o banco estiver vazio, semeia com os produtos padrão
    console.log("Banco de dados catalog_products vazio. Populando dados iniciais...");
    const initialList = await getOfflineCatalog();
    for (const item of initialList) {
      await addProduct(item);
    }
    return initialList;
  } catch (error) {
    console.warn("PostgreSQL indisponível, utilizando catálogo offline:", error);
    return getOfflineCatalog();
  }
}

/**
 * Adiciona um novo produto no PostgreSQL (e no espelho JSON)
 */
export async function addProduct(product: Product): Promise<Product> {
  try {
    const sql = `
      INSERT INTO catalog_products (
        id, name, category, category_label, badge, image, summary, description,
        fabrics, techniques, sizes, colors, segments, min_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        category_label = EXCLUDED.category_label,
        badge = EXCLUDED.badge,
        image = EXCLUDED.image,
        summary = EXCLUDED.summary,
        description = EXCLUDED.description,
        fabrics = EXCLUDED.fabrics,
        techniques = EXCLUDED.techniques,
        sizes = EXCLUDED.sizes,
        colors = EXCLUDED.colors,
        segments = EXCLUDED.segments,
        min_order = EXCLUDED.min_order,
        is_active = TRUE,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      product.id,
      product.name,
      product.category,
      product.categoryLabel || product.category,
      product.badge || null,
      product.image,
      product.summary || "",
      product.description || "",
      JSON.stringify(product.fabrics || []),
      JSON.stringify(product.techniques || []),
      product.sizes || "P ao EXG",
      JSON.stringify(product.colors || []),
      JSON.stringify(product.segments || []),
      Number(product.minOrder) || 10,
    ];

    const res = await query(sql, values);
    const created = mapRowToProduct(res.rows[0]);

    // Atualiza espelho offline
    const list = await getOfflineCatalog();
    const idx = list.findIndex((p) => p.id === created.id);
    if (idx >= 0) list[idx] = created;
    else list.unshift(created);
    await saveOfflineCatalog(list);

    return created;
  } catch (error) {
    console.error("Erro ao inserir produto no PostgreSQL, gravando em arquivo:", error);
    const list = await getOfflineCatalog();
    const existing = list.findIndex((p) => p.id === product.id);
    if (existing >= 0) {
      product.id = `${product.id}-${Date.now()}`;
    }
    list.unshift(product);
    await saveOfflineCatalog(list);
    return product;
  }
}

/**
 * Atualiza um produto existente no PostgreSQL
 */
export async function updateProduct(
  id: string,
  updated: Partial<Product>
): Promise<Product | null> {
  try {
    // Busca registro atual
    const currentRes = await query("SELECT * FROM catalog_products WHERE id = $1", [id]);
    if (!currentRes.rows || currentRes.rows.length === 0) {
      return null;
    }

    const current = mapRowToProduct(currentRes.rows[0]);
    const merged: Product = { ...current, ...updated, id };

    const sql = `
      UPDATE catalog_products
      SET name = $2,
          category = $3,
          category_label = $4,
          badge = $5,
          image = $6,
          summary = $7,
          description = $8,
          fabrics = $9,
          techniques = $10,
          sizes = $11,
          colors = $12,
          segments = $13,
          min_order = $14,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const values = [
      id,
      merged.name,
      merged.category,
      merged.categoryLabel || merged.category,
      merged.badge || null,
      merged.image,
      merged.summary || "",
      merged.description || "",
      JSON.stringify(merged.fabrics || []),
      JSON.stringify(merged.techniques || []),
      merged.sizes || "P ao EXG",
      JSON.stringify(merged.colors || []),
      JSON.stringify(merged.segments || []),
      Number(merged.minOrder) || 10,
    ];

    const res = await query(sql, values);
    const updatedProd = mapRowToProduct(res.rows[0]);

    // Atualiza espelho
    const list = await getOfflineCatalog();
    const idx = list.findIndex((p) => p.id === id);
    if (idx !== -1) {
      list[idx] = updatedProd;
      await saveOfflineCatalog(list);
    }

    return updatedProd;
  } catch (error) {
    console.error("Erro ao atualizar no PostgreSQL, atualizando espelho:", error);
    const list = await getOfflineCatalog();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const merged = { ...list[index], ...updated, id };
    list[index] = merged;
    await saveOfflineCatalog(list);
    return merged;
  }
}

/**
 * Exclui um produto do PostgreSQL
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const res = await query("DELETE FROM catalog_products WHERE id = $1 RETURNING id", [id]);
    const deleted = (res.rowCount ?? 0) > 0;

    // Atualiza espelho offline
    const list = await getOfflineCatalog();
    const filtered = list.filter((p) => p.id !== id);
    await saveOfflineCatalog(filtered);

    return deleted;
  } catch (error) {
    console.error("Erro ao excluir do PostgreSQL, atualizando espelho:", error);
    const list = await getOfflineCatalog();
    const filtered = list.filter((p) => p.id !== id);
    if (filtered.length === list.length) return false;
    await saveOfflineCatalog(filtered);
    return true;
  }
}
