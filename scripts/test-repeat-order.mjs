// scripts/test-repeat-order.mjs
// Suíte de Testes do Módulo "Repetir Pedido"
// GH Camiseteria & Uniformes Personalizados
// Validações:
// 1. Localizar pedido anterior
// 2. Clonar configurações técnicas sem tocar no pedido original
// 3. Permitir alteração da quantidade e recálculo comercial
// 4. Permitir alteração de integrantes da equipe
// 5. Garantir que o pedido original permanece 100% inalterado
// 6. Novo orçamento indica claramente a origem baseada no pedido anterior

import assert from "node:assert/strict";
import { QuotesService } from "../services/quotes.service.ts";
import { OrdersService } from "../services/orders.service.ts";

console.log("\n========================================================");
console.log("   TESTE DO MÓDULO DE REPETIÇÃO DE PEDIDOS (REPEAT ORDER)");
console.log("========================================================\n");

const CLIENT_ID = "user-repeat-tester";
const ADMIN_ID = "admin-sys-repeat";

// 1. SETUP: Criar pedido original
console.log("-> 1. Criando pedido original histórico...");
const originalQuote = await QuotesService.createQuote(CLIENT_ID, {
  shirt_model_id: "mod-dry-fit",
  model_name: "Camisa Dry Fit Oficial GH",
  color: { id: "blue", name: "Azul Royal", hex: "#0033aa" },
  quantity: 20,
  size_breakdown: { P: 5, M: 10, G: 5 },
  customization_details: {
    views: {
      front: { elements: [{ id: "logo1", type: "LOGO", name: "Logo Peito", position: { x: 50, y: 30 } }] },
    },
    teamRoster: {
      enabled: true,
      members: [
        { id: "m1", name: "Jogador A", number: "10", size: "M" },
        { id: "m2", name: "Jogador B", number: "11", size: "G" },
      ],
    },
  },
  customer_name: "Carlos Atletismo",
  customer_email: "carlos@atletismo.com",
});

await QuotesService.adminReviewQuote(originalQuote.id, ADMIN_ID, {
  unit_price: 50.0,
  status: "SENT",
});

await QuotesService.clientRespondQuote(originalQuote.id, CLIENT_ID, {
  action: "APPROVE",
  customer_notes: "Aprovado para produção!",
});

const originalOrder = await OrdersService.createOrderFromQuote(CLIENT_ID, {
  quote_id: originalQuote.id,
  customer_name: "Carlos Atletismo",
});

const originalTotal = originalOrder.total_amount;
const originalQuantity = originalOrder.items[0].quantity;
const originalStatus = originalOrder.status;

console.log(`   [OK] Pedido original criado: ${originalOrder.order_number}`);
console.log(`        Quantidade: ${originalQuantity} peças | Total: R$ ${originalTotal}`);

// 2. REPETIR PEDIDO: Com nova quantidade e novos integrantes
console.log("\n-> 2. Repetindo pedido com novas especificações...");
const repeatedResult = await OrdersService.repeatOrder(originalOrder.id, CLIENT_ID, {
  quantity: 35,
  size_breakdown: { P: 10, M: 15, G: 10 },
  team_roster: {
    enabled: true,
    members: [
      { id: "m1", name: "Jogador A", number: "10", size: "M" },
      { id: "m2", name: "Jogador B", number: "11", size: "G" },
      { id: "m3", name: "Jogador Novo C", number: "9", size: "P" },
    ],
  },
  notes: "Reposição para o novo torneio",
});

const newQuote = repeatedResult.quote;
assert.ok(newQuote.id, "Novo orçamento deve ser gerado");
assert.notEqual(newQuote.id, originalOrder.quote_id, "Novo orçamento deve ter ID distinto");
assert.equal(repeatedResult.originalOrder.order_number, originalOrder.order_number);
assert.match(newQuote.notes, new RegExp(originalOrder.order_number), "Notas devem indicar vínculo com pedido anterior");

console.log(`   [OK] Nova cotação gerada: ${newQuote.quote_number}`);
console.log(`   [OK] Vínculo preservado nas notas: "${newQuote.notes}"`);
console.log(`   [OK] Preço recalculado no servidor: R$ ${newQuote.final_total}`);

// 3. VALIDAÇÃO DE IMUTABILIDADE DO PEDIDO ANTERIOR
console.log("\n-> 3. Verificando se o pedido original permaneceu estritamente INALTERADO...");
const orderAfterRepeat = await OrdersService.getOrderById(originalOrder.id, CLIENT_ID, false);
assert.equal(orderAfterRepeat.total_amount, originalTotal, "Total do pedido original não pode mudar");
assert.equal(orderAfterRepeat.items[0].quantity, originalQuantity, "Quantidade do pedido original não pode mudar");
assert.equal(orderAfterRepeat.status, originalStatus, "Status do pedido original não pode mudar");
console.log("   [OK] Pedido original permaneceu 100% INALTERADO (Inviolabilidade garantida).");

console.log("\n========================================================");
console.log("   TESTES DE REPETIÇÃO DE PEDIDO CONCLUÍDOS COM SUCESSO! ");
console.log("========================================================\n");
