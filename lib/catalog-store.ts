import fs from "fs/promises";
import path from "path";
import { Product, PRODUCTS as DEFAULT_PRODUCTS } from "@/data/catalog";

const CATALOG_FILE = path.join(process.cwd(), "data", "catalog.json");

/**
 * Lê o catálogo atualizado do arquivo JSON local (sem banco de dados)
 */
export async function getCatalog(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(CATALOG_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.warn("Aviso ao ler data/catalog.json, usando padrão:", error);
  }
  return DEFAULT_PRODUCTS;
}

/**
 * Grava o catálogo de produtos no arquivo JSON local
 */
export async function saveCatalog(products: Product[]): Promise<void> {
  const dir = path.dirname(CATALOG_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CATALOG_FILE, JSON.stringify(products, null, 2), "utf-8");
}

/**
 * Adiciona um novo produto
 */
export async function addProduct(product: Product): Promise<Product> {
  const list = await getCatalog();
  const existing = list.findIndex((p) => p.id === product.id);
  if (existing >= 0) {
    product.id = `${product.id}-${Date.now()}`;
  }
  list.unshift(product);
  await saveCatalog(list);
  return product;
}

/**
 * Atualiza um produto existente
 */
export async function updateProduct(id: string, updated: Partial<Product>): Promise<Product | null> {
  const list = await getCatalog();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const merged = { ...list[index], ...updated, id };
  list[index] = merged;
  await saveCatalog(list);
  return merged;
}

/**
 * Exclui um produto
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const list = await getCatalog();
  const filtered = list.filter((p) => p.id !== id);
  if (filtered.length === list.length) return false;

  await saveCatalog(filtered);
  return true;
}
