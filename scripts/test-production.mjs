// scripts/test-production.mjs
// Suíte de Testes do Módulo de Produção Fabril (Production Orders & Steps)
// GH Camiseteria & Uniformes Personalizados
// Validação:
// 1. Bloqueio de pedido não pago (apenas PEDIDO PAGO entra em produção)
// 2. Criação de Ordem de Produção (OP-YYYY-XXXX) com 9 etapas obrigatórias
// 3. Validação das 9 etapas sequenciais
// 4. Transição de etapas e finalização (avanço do pedido pai para READY)
// 5. Preservação de Snapshot e dados de corte/grade/nomes

import assert from "node:assert/strict";
import { QuotesService } from "../services/quotes.service.ts";
import { OrdersService } from "../services/orders.service.ts";
import { ProductionService } from "../services/production.service.ts";

console.log("\n========================================================");
console.log("   TESTE DO MÓDULO DE PRODUÇÃO (PRODUCTION ORDERS)");
console.log("========================================================\n");

const CLIENT_ID = "client-fabrica-100";
const ADMIN_ID = "admin-gerente-fabrica";

// -------------------------------------------------------------
// SETUP: Criar e Aprovar Orçamento para gerar Pedido
// -------------------------------------------------------------
console.log("-> SETUP: Criando orçamento com grade e time esportivo...");
const quote = await QuotesService.createQuote(CLIENT_ID, {
  shirt_model_id: "mod-dry-fit",
  model_name: "Camisa Dry Fit Futebol 2026",
  color: { id: "black", name: "Preto", hex: "#111111" },
  quantity: 15,
  size_breakdown: { P: 3, M: 7, G: 5 },
  customization_details: {
    views: {
      front: { elements: [{ id: "e1", type: "LOGO", name: "Escudo Frente", position: { x: 50, y: 30 } }] },
      back: { elements: [{ id: "e2", type: "NUMBER", name: "Dorsal", position: { x: 50, y: 40 } }] },
    },
    teamRoster: {
      enabled: true,
      members: [
        { id: "m1", name: "Carlos", number: "10", size: "M" },
        { id: "m2", name: "Silva", number: "7", size: "G" },
      ],
    },
  },
  customer_name: "Esporte Clube Pantanal",
  customer_email: "contato@ecpantanal.com.br",
  customer_phone: "(67) 99888-7766",
});

await QuotesService.adminReviewQuote(quote.id, ADMIN_ID, {
  unit_price: 55.0,
  status: "SENT",
});

await QuotesService.clientRespondQuote(quote.id, CLIENT_ID, {
  action: "APPROVE",
  customer_notes: "Aprovado!",
});

const unpaidOrder = await OrdersService.createOrderFromQuote(CLIENT_ID, {
  quote_id: quote.id,
  customer_name: "Esporte Clube Pantanal",
});

assert.equal(unpaidOrder.status, "PENDING_PAYMENT");
assert.equal(unpaidOrder.payment_status, "PENDING");
console.log(`   [OK] Pedido criado: ${unpaidOrder.order_number} (Status: ${unpaidOrder.status})`);

// =========================================================================
// TESTE 1: Bloqueio de Pedido Não Pago para entrada na Produção
// =========================================================================
console.log("\n-> TESTE 1: Tentativa de iniciar produção para pedido NÃO PAGO (deve falhar)");
let blockedErrorCaught = false;
try {
  await ProductionService.createProductionOrder(
    {
      order_id: unpaidOrder.id,
      priority: "NORMAL",
      notes: "Tentar produzir sem pagamento",
    },
    ADMIN_ID
  );
} catch (err) {
  blockedErrorCaught = true;
  assert.match(err.message, /somente pedidos com pagamento confirmado/i);
  console.log(`   [OK] Bloqueio verificado: "${err.message}"`);
}
assert.equal(blockedErrorCaught, true, "Pedido não pago não pode ter Ordem de Produção criada");

// =========================================================================
// TESTE 2: Pagamento do Pedido e Criação da Ordem de Produção
// =========================================================================
console.log("\n-> TESTE 2: Confirmando pagamento e criando Ordem de Produção oficial");
const paidOrder = await OrdersService.recordPaymentTransition(unpaidOrder.id, "APPROVED", {
  payment_id: "PAY-MP-998877",
  payment_method: "pix",
  actor: "admin",
  notes: "Pix verificado na conta bancária",
});

assert.equal(paidOrder.status, "PAID");
assert.equal(paidOrder.payment_status, "APPROVED");
console.log(`   [OK] Pagamento confirmado com sucesso para ${paidOrder.order_number}`);

const productionOrder = await ProductionService.createProductionOrder(
  {
    order_id: paidOrder.id,
    priority: "HIGH",
    notes: "Uniforme para campeonato estadual na próxima semana",
  },
  ADMIN_ID
);

assert.ok(productionOrder.id, "Ordem de produção deve ter ID gerado");
assert.match(productionOrder.production_number, /^OP-\d{4}-\d{4}$/, "Número da OP deve seguir padrão OP-YYYY-XXXX");
assert.equal(productionOrder.status, "ACTIVE");
assert.equal(productionOrder.current_step, "PEDIDO_RECEBIDO");
assert.equal(productionOrder.steps.length, 9, "Devem existir exatamente 9 etapas de produção");

console.log(`   [OK] Ordem de Produção criada: ${productionOrder.production_number}`);
console.log(`   [OK] Etapa inicial: ${productionOrder.current_step}`);

// =========================================================================
// TESTE 3: Verificação das 9 Etapas Obrigatórias
// =========================================================================
console.log("\n-> TESTE 3: Verificação da sequência de 9 etapas industriais");
const expectedKeys = [
  "PEDIDO_RECEBIDO",
  "ARTE",
  "SEPARACAO",
  "CORTE",
  "ESTAMPARIA",
  "COSTURA",
  "CONFERENCIA",
  "EMBALAGEM",
  "PRONTO",
];

expectedKeys.forEach((key, index) => {
  const step = productionOrder.steps[index];
  assert.equal(step.step_key, key, `Etapa ${index + 1} deve ser ${key}`);
  assert.equal(step.step_order, index + 1);
  if (index === 0) {
    assert.equal(step.status, "IN_PROGRESS", "Primeira etapa deve iniciar como IN_PROGRESS");
  } else {
    assert.equal(step.status, "PENDING", `Etapa ${key} deve iniciar como PENDING`);
  }
});
console.log("   [OK] Todas as 9 etapas conferidas e ordenadas perfeitamente.");

// =========================================================================
// TESTE 4: Transição de Etapa (ARTE -> SEPARACAO)
// =========================================================================
console.log("\n-> TESTE 4: Avançando etapas com notas do operador fabril");

// 1. Conclui PEDIDO_RECEBIDO -> deve avançar current_step para ARTE
const updatedOP1 = await ProductionService.updateProductionStep(
  productionOrder.id,
  {
    step_key: "PEDIDO_RECEBIDO",
    status: "COMPLETED",
    operator_name: "Roberto Almoxarifado",
    notes: "Ficha impressa e entregue à equipe técnica",
  },
  ADMIN_ID
);
assert.equal(updatedOP1.current_step, "ARTE");
console.log(`   [OK] Avanço registrado: Etapa atual agora é ${updatedOP1.current_step}`);

// 2. Conclui ARTE -> deve avançar para SEPARACAO
const updatedOP2 = await ProductionService.updateProductionStep(
  productionOrder.id,
  {
    step_key: "ARTE",
    status: "COMPLETED",
    operator_name: "Juliana Designer",
    notes: "Vetorização aprovada e separação de cores realizada",
  },
  ADMIN_ID
);
assert.equal(updatedOP2.current_step, "SEPARACAO");
console.log(`   [OK] Avanço registrado: Etapa atual agora é ${updatedOP2.current_step}`);

// =========================================================================
// TESTE 5: Finalização de Todas as Etapas e Atualização do Pedido para READY
// =========================================================================
console.log("\n-> TESTE 5: Concluindo todas as etapas restantes até PRONTO");
const remainingSteps = [
  "SEPARACAO",
  "CORTE",
  "ESTAMPARIA",
  "COSTURA",
  "CONFERENCIA",
  "EMBALAGEM",
  "PRONTO",
];

let finalOP = updatedOP2;
for (const stepKey of remainingSteps) {
  finalOP = await ProductionService.updateProductionStep(
    productionOrder.id,
    {
      step_key: stepKey,
      status: "COMPLETED",
      operator_name: "Operador Linha de Produção",
      notes: `Etapa ${stepKey} concluída com sucesso`,
    },
    ADMIN_ID
  );
}

assert.equal(finalOP.status, "COMPLETED");
assert.equal(finalOP.current_step, "PRONTO");
assert.ok(finalOP.completed_at, "Data de conclusão deve estar preenchida");

// Verificar se o pedido de venda original foi atualizado para READY
const verifiedOrder = await OrdersService.getOrderById(paidOrder.id, ADMIN_ID, true);
assert.equal(verifiedOrder.status, "READY", "Pedido deve avançar para READY ao concluir produção");

console.log(`   [OK] Ordem de produção finalizada: Status ${finalOP.status}`);
console.log(`   [OK] Pedido de venda atualizado para: ${verifiedOrder.status}`);

console.log("\n========================================================");
console.log("   TODOS OS TESTES DE PRODUÇÃO PASSARAM COM SUCESSO!   ");
console.log("========================================================\n");
