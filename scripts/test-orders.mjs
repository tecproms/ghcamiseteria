// scripts/test-orders.mjs
// Suíte de Testes do Módulo de Conversão de Orçamento para Pedido (Orders & Order Items)
// Validação do fluxo completo:
// ORÇAMENTO APROVADO -> PEDIDO -> PAGAMENTO -> PRODUÇÃO
// Verificação de Snapshot Imutável e Preservação de Dados de Configuração

import assert from "node:assert/strict";
import { QuotesService } from "../services/quotes.service.ts";
import { OrdersService, UnauthorizedOrderAccessError } from "../services/orders.service.ts";

console.log("\n========================================================");
console.log("   TESTE DO MÓDULO DE PEDIDOS (ORDERS LIFECYCLE)");
console.log("========================================================\n");

const CLIENT_ID = "user-client-123";
const OTHER_CLIENT_ID = "user-client-999";
const ADMIN_ID = "admin-sys-001";

// =========================================================================
// TESTE 1: Bloqueio de Conversão de Orçamento que NÃO está APPROVED
// =========================================================================
console.log("-> TESTE 1: Tentativa de converter orçamento PENDING (deve falhar)");

const quotePending = await QuotesService.createQuote(CLIENT_ID, {
  shirt_model_id: "mod-dry-fit",
  model_name: "Camisa Dry Fit Sport",
  color: { id: "blue", name: "Azul Royal", hex: "#0033aa" },
  quantity: 20,
  notes: "Orçamento de teste",
  customer_name: "Time de Futebol GH",
  customer_email: "time@gh.com",
  customer_phone: "(67) 99999-8888",
});

let errorCaught = false;
try {
  await OrdersService.createOrderFromQuote(CLIENT_ID, {
    quote_id: quotePending.id,
  });
} catch (err) {
  errorCaught = true;
  assert.match(err.message, /orçamentos com status APROVADO/i);
}
assert.equal(errorCaught, true, "Não deve permitir converter orçamento que não esteja aprovado");
console.log("   [OK] Bloqueio verificado com sucesso para orçamentos não aprovados.");

// =========================================================================
// TESTE 2: Ciclo de Aprovação do Orçamento e Conversão para Pedido Oficial
// =========================================================================
console.log("\n-> TESTE 2: Admin envia proposta comercial, Cliente Aprova e Converte em Pedido");

// 1. Admin analisa e envia valor comercial
await QuotesService.adminReviewQuote(quotePending.id, ADMIN_ID, {
  unit_price: 45.0,
  discount_amount: 50.0,
  admin_notes: "Desconto especial de R$ 50 para o time.",
  status: "SENT",
});

// 2. Cliente aprova o orçamento
const quoteApproved = await QuotesService.clientRespondQuote(
  quotePending.id,
  CLIENT_ID,
  {
    action: "APPROVE",
    customer_notes: "Aprovado! Vamos fechar.",
  }
);
assert.equal(quoteApproved.status, "APPROVED");

// 3. Conversão para Pedido
const order = await OrdersService.createOrderFromQuote(CLIENT_ID, {
  quote_id: quoteApproved.id,
  notes: "Entregar embalado individualmente",
  shipping_address: {
    street: "Av. Afonso Pena",
    number: "1500",
    city: "Campo Grande",
    state: "MS",
    postal_code: "79000-000",
  },
});

assert.ok(order.id, "ID do pedido gerado");
assert.match(order.order_number, /^PED-\d{4}-\d{4}$/, "Número do pedido formato PED-YYYY-XXXX");
assert.equal(order.quote_id, quoteApproved.id);
assert.equal(order.quote_number, quoteApproved.quote_number);
assert.equal(order.status, "PENDING_PAYMENT", "Status inicial do pedido deve ser PENDING_PAYMENT");
assert.equal(order.total_amount, quoteApproved.final_total, "Preço total deve bater exatamente com o orçamento aprovado");
assert.equal(order.items.length, 1);
assert.equal(order.items[0].quantity, 20);

console.log(`   [OK] Pedido ${order.order_number} gerado a partir do orçamento ${quoteApproved.quote_number} com total de R$ ${order.total_amount.toFixed(2)}.`);

// =========================================================================
// TESTE 3: Snapshot Imutável - Prova de Preservação e Proteção contra Mutações
// =========================================================================
console.log("\n-> TESTE 3: Verificação de Snapshot Imutável da Configuração Aprovada");

const snapshot = order.items[0].snapshot_data;
assert.ok(snapshot, "Item do pedido deve possuir snapshot congelado");
assert.equal(snapshot.model_name, "Camisa Dry Fit Sport", "Modelo preservado");
assert.equal(snapshot.color.hex, "#0033aa", "Cor preservada");
assert.equal(snapshot.quantity, 20, "Quantidade preservada");
assert.equal(snapshot.pricing_summary?.unit_price, 45.0, "Preço unitário aprovado preservado");

// Simulando alteração posterior no orçamento ou projeto do cliente:
quoteApproved.final_total = 999999;
if (quoteApproved.items?.[0]?.configuration_snapshot) {
  quoteApproved.items[0].configuration_snapshot.model_name = "ALTERADO MALICIOSAMENTE";
}

// Consultando o pedido novamente
const reloadedOrder = await OrdersService.getOrderById(order.id, CLIENT_ID, false);
assert.equal(reloadedOrder.total_amount, 850.0, "Total do pedido não pode sofrer alteração posterior");
assert.equal(reloadedOrder.items[0].snapshot_data.model_name, "Camisa Dry Fit Sport", "Snapshot não foi alterado");
assert.notEqual(reloadedOrder.total_amount, 999999);

console.log("   [OK] Snapshot imutável preservado integralmente contra edições futuras.");

// =========================================================================
// TESTE 4: Transições de Status Operacionais do Pedido
// =========================================================================
console.log("\n-> TESTE 4: Transições de Status (PENDING_PAYMENT -> PAID -> IN_PRODUCTION -> READY -> SHIPPED -> DELIVERED)");

// Admin confirma pagamento
const orderPaid = await OrdersService.updateOrderStatus(order.id, ADMIN_ID, {
  status: "PAID",
  internal_notes: "PIX recebido no Banco do Brasil",
});
assert.equal(orderPaid.status, "PAID");
assert.equal(orderPaid.payment_status, "PAID");

// Admin inicia produção
const orderProd = await OrdersService.updateOrderStatus(order.id, ADMIN_ID, {
  status: "IN_PRODUCTION",
  internal_notes: "Corte e costura iniciados",
});
assert.equal(orderProd.status, "IN_PRODUCTION");

// Admin marca como pronto
const orderReady = await OrdersService.updateOrderStatus(order.id, ADMIN_ID, {
  status: "READY",
  internal_notes: "Controle de qualidade aprovado",
});
assert.equal(orderReady.status, "READY");

// Admin envia com código de rastreio
const orderShipped = await OrdersService.updateOrderStatus(order.id, ADMIN_ID, {
  status: "SHIPPED",
  tracking_code: "BR987654321MS",
  internal_notes: "Despachado via Sedex",
});
assert.equal(orderShipped.status, "SHIPPED");
assert.equal(orderShipped.tracking_code, "BR987654321MS");

// Admin confirma entrega
const orderDelivered = await OrdersService.updateOrderStatus(order.id, ADMIN_ID, {
  status: "DELIVERED",
  internal_notes: "Entregue ao cliente no endereço cadastrado",
});
assert.equal(orderDelivered.status, "DELIVERED");
assert.ok(orderDelivered.history.length >= 5, "Histórico deve auditar todas as transições");

console.log(`   [OK] Todas as etapas do ciclo de vida completadas com sucesso (${orderDelivered.history.length} eventos auditados).`);

// =========================================================================
// TESTE 5: Isolamento de Acesso do Cliente (Segurança)
// =========================================================================
console.log("\n-> TESTE 5: Tentativa de Acesso por outro Cliente (Isolamento RLS)");

let tenantViolationCaught = false;
try {
  await OrdersService.getOrderById(order.id, OTHER_CLIENT_ID, false);
} catch (err) {
  tenantViolationCaught = true;
  assert.ok(err instanceof UnauthorizedOrderAccessError);
}
assert.equal(tenantViolationCaught, true, "Cliente não-proprietário não pode acessar o pedido");
console.log("   [OK] Acesso não-autorizado bloqueado com UnauthorizedOrderAccessError.");

console.log("\n========================================================");
console.log("   TODOS OS TESTES DE PEDIDOS PASSARAM COM SUCESSO! [OK]");
console.log("========================================================\n");
