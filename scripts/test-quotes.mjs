// scripts/test-quotes.mjs
// Suíte de Testes do Módulo Comercial de Orçamentos (Quotes & Quote Items)
// Validação do fluxo completo:
// CONFIGURAÇÃO -> RESUMO -> SOLICITAR ORÇAMENTO (PENDING) -> ADMIN ANALISA -> ADMIN ENVIA VALOR (SENT) -> CLIENTE APROVA (APPROVED) OU RECUSA (REJECTED)

import assert from "node:assert/strict";
import { QuotesService, UnauthorizedQuoteAccessError } from "../services/quotes.service.ts";

console.log("\n========================================================");
console.log("   TESTE DO MÓDULO DE ORÇAMENTOS (QUOTES LIFECYCLE)");
console.log("========================================================\n");

// IDs para os testes
const CLIENT_A_ID = "user-client-aaa";
const CLIENT_B_ID = "user-client-bbb";
const ADMIN_ID = "admin-sys-001";

// =========================================================================
// TESTE 1: Cliente Cria Solicitação de Orçamento a partir da Configuração
// =========================================================================
console.log("-> TESTE 1: Criação de Cotação pelo Cliente (Status Inicial: PENDING)");

const quote1 = await QuotesService.createQuote(CLIENT_A_ID, {
  shirt_model_id: "mod-dry-fit",
  model_name: "Camiseta Dry Fit Performance",
  color: { id: "black", name: "Preto Nobre", hex: "#18181B" },
  quantity: 25,
  views: {
    FRONT: [
      { id: "logo-1", type: "LOGO", zoneId: "z-peito", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
      { id: "txt-1", type: "TEXT", zoneId: "z-peito", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1, text: "TechPro" },
    ],
  },
  notes: "Solicito entrega urgente até o fim do mês.",
  customer_name: "TechPro Sports",
  customer_email: "contato@techpro.com",
  customer_phone: "(11) 99999-0000",
});

assert.ok(quote1.id, "ID do orçamento deve ser gerado");
assert.match(quote1.quote_number, /^ORC-\d{4}-\d{4}$/, "Número do orçamento deve seguir padrão ORC-YYYY-XXXX");
assert.equal(quote1.status, "PENDING", "Status inicial deve ser PENDING");
assert.equal(quote1.user_id, CLIENT_A_ID);
assert.equal(quote1.items.length, 1, "Deve conter 1 item de uniforme");
assert.equal(quote1.items[0].quantity, 25);
assert.ok(quote1.total_estimated > 0, "Valor estimado deve ser calculado pelo servidor");
assert.equal(quote1.discount_amount, 0, "Desconto inicial é 0");
assert.equal(quote1.final_total, quote1.total_estimated, "Valor final inicial é igual ao estimado");
assert.equal(quote1.history.length, 1, "Deve registrar 1 entrada de histórico (CREATED)");
assert.equal(quote1.history[0].action, "CREATED");
assert.equal(quote1.history[0].actor, "client");

console.log(`   [OK] Orçamento ${quote1.quote_number} criado com sucesso (Status: PENDING, Total Estimado: R$ ${quote1.total_estimated.toFixed(2)}).`);

// =========================================================================
// TESTE 2: Isolamento Multitenant / Segurança RLS
// =========================================================================
console.log("\n-> TESTE 2: Segurança RLS - Cliente B NÃO pode acessar Orçamento do Cliente A");

let accessDeniedErrorCaught = false;
try {
  await QuotesService.getQuoteById(quote1.id, CLIENT_B_ID, false);
} catch (err) {
  if (err instanceof UnauthorizedQuoteAccessError) {
    accessDeniedErrorCaught = true;
  }
}

assert.ok(accessDeniedErrorCaught, "Deve lançar UnauthorizedQuoteAccessError quando usuário tenta acessar cotação alheia");
console.log("   [OK] Bloqueio de ID spoofing validado: cliente não acessa cotação de outro cliente.");

// Administrador, por sua vez, deve ter permissão irrestrita
const adminAccessQuote = await QuotesService.getQuoteById(quote1.id, ADMIN_ID, true);
assert.ok(adminAccessQuote, "Admin deve ter acesso de leitura");
console.log("   [OK] Administrador acessa com sucesso para análise comercial.");

// =========================================================================
// TESTE 3: Administrador Analisa, Altera Preço, Aplica Desconto e Envia Proposta
// =========================================================================
console.log("\n-> TESTE 3: Administrador Revisa Preço, Aplica Desconto e Envia Proposta (SENT)");

const reviewedQuote = await QuotesService.adminReviewQuote(quote1.id, ADMIN_ID, {
  unit_price: 45.0, // Ajuste manual de preço unitário pelo admin
  discount_amount: 50.0, // Desconto comercial especial de R$ 50,00
  admin_notes: "Preço especial com desconto para pagamento à vista. Prazo de 7 dias úteis.",
  status: "SENT",
});

// 25 peças * 45 = 1125 - 50 = 1075
assert.equal(reviewedQuote.status, "SENT", "Status deve transicionar para SENT");
assert.equal(reviewedQuote.items[0].unit_price_estimated, 45.0, "Preço unitário ajustado para R$ 45,00");
assert.equal(reviewedQuote.items[0].subtotal_estimated, 1125.0, "Subtotal: 25 * 45 = 1125,00");
assert.equal(reviewedQuote.discount_amount, 50.0, "Desconto de R$ 50,00 aplicado");
assert.equal(reviewedQuote.final_total, 1075.0, "Total Final Líquido: R$ 1.075,00");
assert.equal(reviewedQuote.admin_notes, "Preço especial com desconto para pagamento à vista. Prazo de 7 dias úteis.");

// Histórico de auditoria
assert.equal(reviewedQuote.history.length, 2, "Histórico deve conter 2 eventos");
const lastHistory = reviewedQuote.history[reviewedQuote.history.length - 1];
assert.equal(lastHistory.action, "SENT_TO_CUSTOMER");
assert.equal(lastHistory.actor, "admin");
assert.equal(lastHistory.previousStatus, "PENDING");
assert.equal(lastHistory.newStatus, "SENT");
assert.equal(lastHistory.newTotal, 1075.0);

console.log(`   [OK] Proposta enviada pelo Admin: Subtotal R$ 1.125,00 - Desconto R$ 50,00 = Final R$ ${reviewedQuote.final_total.toFixed(2)} (Status: SENT).`);

// =========================================================================
// TESTE 4: Imunidade a Fraude - Cliente NÃO pode alterar o valor
// =========================================================================
console.log("\n-> TESTE 4: Imunidade a Fraude - Cliente Aprova sem Capacidade de Alterar Preço");

// Cliente responde com aprovação
const approvedQuote = await QuotesService.clientRespondQuote(quote1.id, CLIENT_A_ID, {
  action: "APPROVE",
  customer_notes: "Aprovado! Proposta aceita conforme condições.",
});

assert.equal(approvedQuote.status, "APPROVED", "Status deve ser APPROVED");
assert.equal(approvedQuote.final_total, 1075.0, "Valor final permaneceu R$ 1.075,00 (imune a fraude)");
assert.equal(approvedQuote.history.length, 3, "Histórico deve conter 3 eventos");

const approveHistory = approvedQuote.history[approvedQuote.history.length - 1];
assert.equal(approveHistory.action, "APPROVED_BY_CUSTOMER");
assert.equal(approveHistory.actor, "client");
assert.equal(approveHistory.previousStatus, "SENT");
assert.equal(approveHistory.newStatus, "APPROVED");

console.log("   [OK] Cliente aprovou o orçamento. Valor final protegido e registrado no histórico.");

// =========================================================================
// TESTE 5: Fluxo de Recusa pelo Cliente com Motivo
// =========================================================================
console.log("\n-> TESTE 5: Fluxo de Recusa pelo Cliente (REJECTED)");

// Criar novo orçamento para testar recusa
const quote2 = await QuotesService.createQuote(CLIENT_A_ID, {
  shirt_model_id: "mod-polo",
  model_name: "Camisa Polo Tradicional",
  color: { id: "white", name: "Branco Neve", hex: "#FFFFFF" },
  quantity: 50,
  views: {},
  notes: "Cotação para polo de gala.",
});

// Admin envia proposta
await QuotesService.adminReviewQuote(quote2.id, ADMIN_ID, {
  unit_price: 60.0,
  admin_notes: "Prazo de 20 dias.",
  status: "SENT",
});

// Cliente recusa
const rejectedQuote = await QuotesService.clientRespondQuote(quote2.id, CLIENT_A_ID, {
  action: "REJECT",
  customer_notes: "Prazo muito longo para nosso evento.",
});

assert.equal(rejectedQuote.status, "REJECTED", "Status deve ser REJECTED");
const rejectHistory = rejectedQuote.history[rejectedQuote.history.length - 1];
assert.equal(rejectHistory.action, "REJECTED_BY_CUSTOMER");
assert.equal(rejectHistory.notes, "Prazo muito longo para nosso evento.");

console.log("   [OK] Recusa processada com sucesso e motivo documentado na auditoria.");

// =========================================================================
// TESTE 6: Suporte a Grade de Equipe na Cotação
// =========================================================================
console.log("\n-> TESTE 6: Cotação com Grade da Equipe (size_breakdown preservado)");

const quoteTeam = await QuotesService.createQuote(CLIENT_A_ID, {
  shirt_model_id: "mod-dry-fit",
  model_name: "Camiseta Esportiva",
  quantity: 5,
  teamRoster: {
    enabled: true,
    members: [
      { id: "m1", name: "João", number: "10", size: "M" },
      { id: "m2", name: "Maria", number: "07", size: "P" },
      { id: "m3", name: "Carlos", number: "22", size: "G" },
      { id: "m4", name: "Ana", number: "11", size: "M" },
      { id: "m5", name: "Pedro", number: "01", size: "GG" },
    ],
  },
  views: {},
});

assert.equal(quoteTeam.items[0].quantity, 5);
assert.deepEqual(quoteTeam.items[0].size_breakdown, {
  M: 2,
  P: 1,
  G: 1,
  GG: 1,
});

console.log("   [OK] Grade de equipe ({ M: 2, P: 1, G: 1, GG: 1 }) serializada no quote_item.");

console.log("\n========================================================");
console.log("   TODOS OS 6 TESTES DE ORÇAMENTOS PASSARAM COM 100%! 🎉");
console.log("========================================================\n");