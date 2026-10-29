const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function seed() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://ghcamiseteria:WTMJtrnTsXecyzWK@127.0.0.1:5432/ghcamiseteria";

  const client = new Client({ connectionString });
  await client.connect();
  console.log("Conectado ao PostgreSQL com sucesso!");

  // 1. Criar tabelas se não existirem
  await client.query(`
    CREATE TABLE IF NOT EXISTS catalog_products (
      id VARCHAR(120) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      category_label VARCHAR(100) NOT NULL,
      badge VARCHAR(100),
      image TEXT NOT NULL,
      summary TEXT,
      description TEXT,
      fabrics JSONB NOT NULL DEFAULT '[]'::jsonb,
      techniques JSONB NOT NULL DEFAULT '[]'::jsonb,
      sizes VARCHAR(255) DEFAULT 'P ao EXG',
      colors JSONB NOT NULL DEFAULT '[]'::jsonb,
      segments JSONB NOT NULL DEFAULT '[]'::jsonb,
      min_order INTEGER NOT NULL DEFAULT 10,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_catalog_products_category ON catalog_products(category);
    CREATE INDEX IF NOT EXISTS idx_catalog_products_active ON catalog_products(is_active);
    CREATE INDEX IF NOT EXISTS idx_catalog_products_order ON catalog_products(display_order ASC, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_catalog_products_fabrics_gin ON catalog_products USING GIN (fabrics);

    CREATE TABLE IF NOT EXISTS catalog_config (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log("Tabelas e índices verificados.");

  // 2. Carregar produtos do catalog.json
  const catalogPath = path.join(process.cwd(), "data", "catalog.json");
  const rawData = fs.readFileSync(catalogPath, "utf-8");
  const products = JSON.parse(rawData);

  console.log(`Transferindo ${products.length} produtos para o PostgreSQL...`);

  let insertedCount = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    await client.query(
      `
      INSERT INTO catalog_products (
        id, name, category, category_label, badge, image, summary, description,
        fabrics, techniques, sizes, colors, segments, min_order, display_order, is_active, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, TRUE, NOW())
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
        display_order = EXCLUDED.display_order,
        is_active = TRUE,
        updated_at = NOW();
    `,
      [
        p.id,
        p.name,
        p.category,
        p.categoryLabel || p.category,
        p.badge || null,
        p.image,
        p.summary || "",
        p.description || "",
        JSON.stringify(p.fabrics || []),
        JSON.stringify(p.techniques || []),
        p.sizes || "P ao EXG",
        JSON.stringify(p.colors || []),
        JSON.stringify(p.segments || []),
        Number(p.minOrder) || 10,
        i,
      ]
    );
    insertedCount++;
  }

  // 3. Salvar configurações gerais em catalog_config
  const companyInfo = {
    name: "GH Camiseteria",
    phone: "(67) 99601-4295",
    whatsapp: "5567996014295",
    instagram: "@ghcamiseteria",
    city: "Campo Grande - MS",
    tagline: "Sua ideia, do seu jeito.",
  };

  await client.query(
    `
    INSERT INTO catalog_config (key, value, updated_at)
    VALUES ('company_info', $1, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
  `,
    [JSON.stringify(companyInfo)]
  );

  console.log(`Sucesso: ${insertedCount} produtos e configurações inseridos no PostgreSQL!`);
  await client.end();
}

seed().catch((err) => {
  console.error("Erro durante a migração para o PostgreSQL:", err);
  process.exit(1);
});
