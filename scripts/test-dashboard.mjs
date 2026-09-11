// scripts/test-dashboard.mjs
// Suíte de Testes do Dashboard Administrativo com Métricas Reais do Banco
// GH Camiseteria & Uniformes Personalizados

import assert from "node:assert/strict";
import { QuotesService } from "../services/quotes.service.ts";
import { OrdersService } from "../services/orders.service.ts";
import { DashboardService } from "../services/dashboard.service.ts";

console.log("\n========================================================");
console.log("   TESTE DO DASHBOARD ADMINISTRATIVO COM DADOS REAIS");
console.log("========================================================\n");

const CLIENT_ID = "dashboard-client-tester";
const ADMIN_ID = "admin-sys-dashboard";

// 1. Setup de massa real no banco/memória
console.log("-> 1. Inserindo pedidos e cotações reais para teste analítico...");

const q1 = await QuotesService.createQuote(CLIENT_ID, {
  shirt_model_id: "mod-polo",
  model_name: "Camisa Polo Empresarial GH",
  color: { id: "navy", name: "Azul Marinho", hex: "#001f3f" },
  quantity: 25,
  customer_name: "Empresa Alfa Logística",
  customer_email: "alfa@logistica.com.br",
});
await QuotesService.adminReviewQuote(q1.id, ADMIN_ID, { unit_price: 60.0, status: "SENT" });
await QuotesService.clientRespondQuote(q1.id, CLIENT_ID, { action: "APPROVE", customer_notes: "Aprovado!" });

const order1 = await OrdersService.createOrderFromQuote(CLIENT_ID, {
  quote_id: q1.id,
  customer_name: "Empresa Alfa Logística",
});
// Pagamento confirmado da ordem 1
await OrdersService.recordPaymentTransition(order1.id, "APPROVED", {
  payment_id: "PAY-DASH-001",
  payment_method: "pix",
});

// Ordem 2: Pendente
const q2 = await QuotesService.createQuote(CLIENT_ID, {
  shirt_model_id: "mod-dry-fit",
  model_name: "Camisa Dry Fit Esportiva",
  color: { id: "red", name: "Vermelho", hex: "#cc0000" },
  quantity: 10,
  customer_name: "Clube Beta Futebol",
  customer_email: "beta@futebol.com.br",
});
await QuotesService.adminReviewQuote(q2.id, ADMIN_ID, { unit_price: 45.0, status: "SENT" });
await QuotesService.clientRespondQuote(q2.id, CLIENT_ID, { action: "APPROVE" });
const order2 = await OrdersService.createOrderFromQuote(CLIENT_ID, {
  quote_id: q2.id,
  customer_name: "Clube Beta Futebol",
});

console.log(`   [OK] Pedido 1 (Pago): ${order1.order_number}`);
console.log(`   [OK] Pedido 2 (Pendente): ${order2.order_number}`);

// 2. Consulta de Estatísticas Gerais (Sem filtros)
console.log("\n-> 2. Executando consolidação de indicadores reais (Geral)...");
const statsGeneral = await DashboardService.getStats({ period: "all" });

assert.ok(typeof statsGeneral.orders_today === "number", "orders_today deve ser número");
assert.ok(typeof statsGeneral.orders_pending === "number", "orders_pending deve ser número");
assert.ok(typeof statsGeneral.quotes_pending === "number", "quotes_pending deve ser número");
assert.ok(typeof statsGeneral.orders_in_production === "number", "orders_in_production deve ser número");
assert.ok(typeof statsGeneral.orders_ready === "number", "orders_ready deve ser número");
assert.ok(typeof statsGeneral.total_revenue === "number", "total_revenue deve ser número");
assert.ok(typeof statsGeneral.total_clients === "number", "total_clients deve ser número");
assert.ok(Array.isArray(statsGeneral.top_products), "top_products deve ser array");
assert.ok(Array.isArray(statsGeneral.recent_orders), "recent_orders deve ser array");

console.log(`   [OK] Pedidos Hoje: ${statsGeneral.orders_today}`);
console.log(`   [OK] Pedidos Pendentes: ${statsGeneral.orders_pending}`);
console.log(`   [OK] Orçamentos Pendentes: ${statsGeneral.quotes_pending}`);
console.log(`   [OK] Em Produção: ${statsGeneral.orders_in_production}`);
console.log(`   [OK] Pedidos Prontos: ${statsGeneral.orders_ready}`);
console.log(`   [OK] Faturamento Total Real: R$ ${statsGeneral.total_revenue.toFixed(2)}`);
console.log(`   [OK] Total de Clientes Cadastrados: ${statsGeneral.total_clients}`);
console.log(`   [OK] Top Produtos listados: ${statsGeneral.top_products.length}`);

// 3. Teste de Filtros: Status PENDING_PAYMENT
console.log("\n-> 3. Testando filtro de status (PENDING_PAYMENT)...");
const statsPending = await DashboardService.getStats({ status: "PENDING_PAYMENT" });
statsPending.recent_orders.forEach((o) => {
  assert.equal(o.status, "PENDING_PAYMENT", "Todos os pedidos filtrados devem ter status PENDING_PAYMENT");
});
console.log(`   [OK] Filtro de status validado: ${statsPending.recent_orders.length} pedidos pendentes.`);

// 4. Teste de Filtros: Busca por Cliente
console.log("\n-> 4. Testando filtro de busca por cliente ('Alfa')...");
const statsClient = await DashboardService.getStats({ client: "Alfa" });
statsClient.recent_orders.forEach((o) => {
  assert.match(o.customer_name, /Alfa/i, "Cliente deve conter o termo pesquisado");
});
console.log(`   [OK] Filtro de cliente validado: ${statsClient.recent_orders.length} pedidos encontrados.`);

// 5. Teste de Filtros: Busca por Produto
console.log("\n-> 5. Testando filtro de busca por produto ('Polo')...");
const statsProduct = await DashboardService.getStats({ product: "Polo" });
statsProduct.recent_orders.forEach((o) => {
  assert.match(o.model_name, /Polo/i, "Produto deve conter o termo pesquisado");
});
console.log(`   [OK] Filtro de produto validado: ${statsProduct.recent_orders.length} pedidos encontrados.`);

console.log("\n========================================================");
console.log("   TODOS OS TESTES DO DASHBOARD PASSARAM COM SUCESSO!   ");
console.log("========================================================\n");
