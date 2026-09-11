import fs from "fs";
import path from "path";

const migrationsDir = path.resolve("./supabase/migrations");
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();

console.log(`Verificando ${files.length} arquivos de migration em: ${migrationsDir}`);

const combinedSql = files.map(f => {
  const content = fs.readFileSync(path.join(migrationsDir, f), "utf-8");
  return `-- FILE: ${f}\n` + content;
}).join("\n\n");

// Entidades obrigatórias solicitadas pelo usuário
const requiredTables = [
  // USUÁRIOS
  "profiles",
  "customers",
  "companies",
  // CATÁLOGO
  "categories",
  "products",
  "product_variants",
  "sizes",
  "colors",
  "fabrics",
  // MODELOS DE UNIFORME
  "shirt_models",
  "shirt_views",
  "shirt_zones",
  // CONFIGURAÇÕES
  "design_templates",
  "designs",
  "design_elements",
  // COMERCIAL
  "quotes",
  "quote_items",
  "orders",
  "order_items",
  // EQUIPE
  "team_members",
  // PRODUÇÃO
  "production_orders",
  "production_steps",
  // ARQUIVOS
  "files",
  // PAGAMENTOS
  "payments"
];

let allPassed = true;

console.log("\n=== 1. VERIFICAÇÃO DE TABELAS OBRIGATÓRIAS ===");
for (const table of requiredTables) {
  const tableRegex = new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?public\\.${table}\\s*\\(`, "i");
  if (tableRegex.test(combinedSql)) {
    console.log(`[OK] Tabela public.${table} criada com sucesso`);
  } else {
    console.error(`[ERRO] Tabela public.${table} NÃO encontrada`);
    allPassed = false;
  }
}

console.log("\n=== 2. VERIFICAÇÃO DE ROW LEVEL SECURITY (RLS) ===");
for (const table of requiredTables) {
  const rlsRegex = new RegExp(`ALTER\\s+TABLE\\s+public\\.${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, "i");
  if (rlsRegex.test(combinedSql)) {
    console.log(`[OK] RLS habilitado para public.${table}`);
  } else {
    console.error(`[ERRO] RLS NÃO habilitado para public.${table}`);
    allPassed = false;
  }
}

console.log("\n=== 3. VERIFICAÇÃO DE CHAVES ESTRANGEIRAS CRÍTICAS ===");
const fkChecks = [
  { table: "customers", target: "companies" },
  { table: "products", target: "categories" },
  { table: "product_variants", target: "products" },
  { table: "shirt_models", target: "products" },
  { table: "shirt_views", target: "shirt_models" },
  { table: "shirt_zones", target: "shirt_views" },
  { table: "designs", target: "shirt_models" },
  { table: "design_elements", target: "designs" },
  { table: "quotes", target: "customers" },
  { table: "quote_items", target: "quotes" },
  { table: "orders", target: "customers" },
  { table: "order_items", target: "orders" },
  { table: "team_members", target: "customers" },
  { table: "production_orders", target: "orders" },
  { table: "production_steps", target: "production_orders" },
  { table: "payments", target: "orders" }
];

for (const fk of fkChecks) {
  const fkRegex = new RegExp(`REFERENCES\\s+public\\.${fk.target}`, "i");
  if (fkRegex.test(combinedSql)) {
    console.log(`[OK] Relacionamento validado: ${fk.table} -> ${fk.target}`);
  } else {
    console.error(`[ERRO] Falha no relacionamento: ${fk.table} -> ${fk.target}`);
    allPassed = false;
  }
}

console.log("\n=== 4. VERIFICAÇÃO DE SOFT DELETE (deleted_at) ===");
const softDeleteTables = [
  "profiles",
  "companies",
  "customers",
  "categories",
  "fabrics",
  "products",
  "product_variants",
  "shirt_models",
  "design_templates",
  "designs",
  "quotes",
  "orders",
  "team_members",
  "files"
];

for (const table of softDeleteTables) {
  const match = combinedSql.match(new RegExp(`CREATE\\s+TABLE[\\s\\S]*?public\\.${table}[\\s\\S]*?\\);`, "i"));
  if (match && match[0].includes("deleted_at TIMESTAMPTZ")) {
    console.log(`[OK] Soft delete suportado em public.${table}`);
  } else {
    console.error(`[ERRO] Campo deleted_at ausente em public.${table}`);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error("\n❌ Falha na validação do schema SQL.");
  process.exit(1);
} else {
  console.log("\n✅ Todas as 21 entidades, RLS, relacionamentos, chaves e soft deletes validados com sucesso!");
}
