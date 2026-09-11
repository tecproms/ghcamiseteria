// scripts/test-payments.mjs
// Suíte de Testes do Módulo de Pagamentos (Mercado Pago, Pix, Cartão e Webhooks)
// Validação do fluxo completo:
// ORÇAMENTO APROVADO -> PEDIDO -> GERAÇÃO PIX/CARTÃO -> WEBHOOK -> VALIDAÇÃO NO SERVIDOR -> PEDIDO PAGO (PAID)

import assert from "node:assert/strict";
import { QuotesService } from "../services/quotes.service.ts";
import { OrdersService } from "../services/orders.service.ts";
import { PaymentsService } from "../services/payments.service.ts";

console.log("\n========================================================");
console.log("   TESTE DO MÓDULO DE PAGAMENTOS (MERCADO PAGO)");
console.log("========================================================\n");

const CLIENT_ID = "user-pay-client-1";
const ADMIN_ID = "admin-sys-001";

// =========================================================================
// SETUP: Criar e Aprovar Orçamento e Converter em Pedido
// =========================================================================
console.log("-> SETUP: Criando orçamento aprovado e convertendo em pedido oficial");

const quote = await QuotesService.createQuote(CLIENT_ID, {
  shirt_model_id: "mod-dry-fit",
  model_name: "Camisa Dry Fit Oficial",
  color: { id: "black", name: "Preto Nobre", hex: "#18181B" },
  quantity: 30,
  customer_name: "Atlética Engenharia",
  customer_email: "atletica@engenharia.com",
  customer_phone: "(67) 99999-1111",
});

await QuotesService.adminReviewQuote(quote.id, ADMIN_ID, {
  unit_price: 50.0,
  discount_amount: 100.0,
  admin_notes: "Desconto por volume de 30 peças.",
  status: "SENT",
});

const quoteApproved = await QuotesService.clientRespondQuote(quote.id, CLIENT_ID, {
  action: "APPROVE",
  customer_notes: "Aprovado!",
});
assert.equal(quoteApproved.status, "APPROVED");

const order = await OrdersService.createOrderFromQuote(CLIENT_ID, {
  quote_id: quoteApproved.id,
  customer_name: "Atlética Engenharia",
  customer_email: "atletica@engenharia.com",
});

assert.ok(order.id, "ID do pedido gerado");
assert.equal(order.status, "PENDING_PAYMENT");
assert.equal(order.payment_status, "PENDING");
assert.equal(order.total_amount, 1400.0); // 30 * 50 = 1500 - 100 = 1400

console.log(`   [OK] Pedido ${order.order_number} pronto para pagamento (Total: R$ ${order.total_amount.toFixed(2)}).`);

// =========================================================================
// TESTE 1: Criação de Cobrança Pix via Mercado Pago
// =========================================================================
console.log("\n-> TESTE 1: Geração de Cobrança Pix (QR Code & Copia e Cola)");

const pixResponse = await PaymentsService.createPixPayment(CLIENT_ID, {
  order_id: order.id,
  payer_cpf: "123.456.789-00",
  payer_name: "Atlética Engenharia",
  payer_email: "atletica@engenharia.com",
});

assert.ok(pixResponse.payment_id, "ID de pagamento gerado");
assert.equal(pixResponse.status, "PENDING");
assert.ok(pixResponse.qr_code, "Código Copia e Cola Pix gerado");
assert.ok(pixResponse.qr_code.startsWith("000201"), "Código Pix deve seguir padrão EMVCo BR Code");
assert.ok(pixResponse.qr_code_base64, "Imagem Base64 do QR Code gerada");

// Verificar se detalhes foram anexados ao pedido
const orderWithPix = await OrdersService.getOrderById(order.id, CLIENT_ID, false);
assert.equal(orderWithPix.payment_id, String(pixResponse.payment_id));
assert.equal(orderWithPix.payment_method, "pix");
assert.ok(orderWithPix.payment_details?.qr_code);

console.log(`   [OK] Cobrança Pix gerada com sucesso (ID: ${pixResponse.payment_id}, Código Pix: ${pixResponse.qr_code.slice(0, 30)}...).`);

// =========================================================================
// TESTE 2: Criação de Preferência de Cartão de Crédito (Checkout Seguro)
// =========================================================================
console.log("\n-> TESTE 2: Geração de Checkout Preference para Cartão de Crédito");

const cardPref = await PaymentsService.createCardPreference(CLIENT_ID, {
  order_id: order.id,
  payer_name: "Atlética Engenharia",
  payer_email: "atletica@engenharia.com",
});

assert.ok(cardPref.preference_id, "ID da preferência gerado");
assert.ok(cardPref.init_point, "URL segura do Mercado Pago gerada");

// Verificar se dados foram anexados ao pedido
const orderWithCard = await OrdersService.getOrderById(order.id, CLIENT_ID, false);
assert.equal(orderWithCard.payment_method, "credit_card");
assert.ok(orderWithCard.payment_details?.init_point);

console.log(`   [OK] Preferência de pagamento com cartão gerada (Pref ID: ${cardPref.preference_id}).`);

// =========================================================================
// TESTE 3: Bloqueio de Fraude - Notificações Inválidas Não Alteram o Pedido
// =========================================================================
console.log("\n-> TESTE 3: Bloqueio de Fraude - Notificações malformadas ou sem ID são ignoradas");

const fakeResult = await PaymentsService.handleWebhookNotification({}, {});
assert.equal(fakeResult.processed, false, "Notificação sem dados não deve alterar nada");

const checkOrderUnchanged = await OrdersService.getOrderById(order.id, CLIENT_ID, false);
assert.equal(checkOrderUnchanged.status, "PENDING_PAYMENT", "Pedido permanece PENDING_PAYMENT");

console.log("   [OK] Notificações inválidas rejeitadas pelo backend sem efeito colateral.");

// =========================================================================
// TESTE 4: Webhook do Mercado Pago - Confirmação Segura de Pagamento
// =========================================================================
console.log("\n-> TESTE 4: Processamento do Webhook Oficial do Mercado Pago (Status: APPROVED)");

// Simula recepção do evento de pagamento aprovado
const webhookResult = await PaymentsService.handleWebhookNotification(
  {
    action: "payment.updated",
    type: "payment",
    external_reference: order.id,
    status: "APPROVED",
  },
  {
    id: String(pixResponse.payment_id),
    topic: "payment",
    external_reference: order.id,
  }
);

assert.equal(webhookResult.processed, true, "Webhook deve ser processado com sucesso");
assert.equal(webhookResult.orderId, order.id);
assert.equal(webhookResult.status, "APPROVED");

// Verificar se o pedido agora está oficialmente pago e pronto para produção
const paidOrder = await OrdersService.getOrderById(order.id, CLIENT_ID, false);
assert.equal(paidOrder.status, "PAID", "Status do pedido deve avançar para PAID");
assert.equal(paidOrder.payment_status, "APPROVED", "Status do pagamento deve ser APPROVED");
assert.ok(paidOrder.paid_at, "Data/hora de pagamento registrada");

// Verificar histórico de auditoria
const lastEvent = paidOrder.history[paidOrder.history.length - 1];
assert.equal(lastEvent.action, "PAYMENT_CONFIRMED");
assert.equal(lastEvent.newStatus, "APPROVED");

console.log(`   [OK] Webhook processado! Pedido ${paidOrder.order_number} atualizado para status PAID e pagamento APPROVED.`);

// =========================================================================
// TESTE 5: Consulta de Status do Pagamento pelo Frontend (Polling)
// =========================================================================
console.log("\n-> TESTE 5: Consulta de Status de Pagamento (Endpoint de Polling)");

const statusCheck = await PaymentsService.getPaymentStatus(order.id, CLIENT_ID);
assert.equal(statusCheck.status, "APPROVED");
assert.equal(statusCheck.order_status, "PAID");
assert.ok(statusCheck.paid_at);

console.log("   [OK] Endpoint de verificação de status retorna status APPROVED com data do pagamento.");

// =========================================================================
// TESTE 6: Bloqueio de Pagamento Duplo em Pedido já Pago
// =========================================================================
console.log("\n-> TESTE 6: Bloqueio contra pagamento duplicado");

let duplicateBlocked = false;
try {
  await PaymentsService.createPixPayment(CLIENT_ID, { order_id: order.id });
} catch (err) {
  duplicateBlocked = true;
  assert.match(err.message, /já se encontra pago/i);
}
assert.equal(duplicateBlocked, true, "Não deve permitir gerar novo pagamento para pedido já pago");

console.log("   [OK] Tentativa de pagamento duplicado bloqueada com sucesso.");

console.log("\n========================================================");
console.log("   TODOS OS TESTES DE PAGAMENTO PASSARAM COM SUCESSO! [OK]");
console.log("========================================================\n");
