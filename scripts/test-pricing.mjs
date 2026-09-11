// scripts/test-pricing.mjs
// Testes unitários do Motor de Preços Dinâmico (Pricing Engine)
import assert from "node:assert/strict";
import { PricingService } from "../services/pricing/pricing.service.ts";

console.log("\n========================================================");
console.log("   TESTE DO MOTOR DE PREÇOS (PRICING ENGINE) - MAPOS");
console.log("========================================================\n");

// Resetar para as regras padrão da fábrica
PricingService._resetDefaults();

// =========================================================================
// TESTE 1: Preço Base Sem Personalizações
// =========================================================================
console.log("-> TESTE 1: Camiseta Lisa (Sem Personalizações)");

const calcPlain = await PricingService.calculate({
  quantity: 1,
  views: {},
});

assert.equal(calcPlain.unitBasePrice, 35.0, "Preço base deve ser R$ 35,00");
assert.equal(calcPlain.unitCustomizations, 0.0, "Sem personalizações");
assert.equal(calcPlain.unitPriceBeforeDiscount, 35.0);
assert.equal(calcPlain.discountPercent, 0, "Sem desconto para 1 peça");
assert.equal(calcPlain.unitPrice, 35.0);
assert.equal(calcPlain.total, 35.0);
assert.equal(calcPlain.quantity, 1);

console.log("   [OK] Preço base de 1 peça lisa: R$ 35,00 calculado corretamente.");

// =========================================================================
// TESTE 2: Exemplo Conceitual do Prompt: Produto (35) + Logo (5) + Nome (4) + Número (4)
// =========================================================================
console.log("\n-> TESTE 2: Exemplo do Prompt: Produto (35) + Logo (5) + Nome (4) + Número (4)");

const calcWithElements = await PricingService.calculate({
  quantity: 10,
  views: {
    FRONT: [
      { id: "logo-1", type: "LOGO", zoneId: "z-peito", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
      { id: "nome-1", type: "TEXT", zoneId: "z-peito", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1, text: "TechPro" },
      { id: "num-1", type: "NUMBER", zoneId: "z-peito", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1, text: "10" },
    ],
  },
});

assert.equal(calcWithElements.unitBasePrice, 35.0, "Base: R$ 35,00");
// Logo (5) + Texto (4) + Número (4) = 13
assert.equal(calcWithElements.unitCustomizations, 13.0, "Adicionais unitários: R$ 13,00");
// Bruto = 35 + 13 = 48
assert.equal(calcWithElements.unitPriceBeforeDiscount, 48.0, "Preço unitário bruto: R$ 48,00");
// 10 peças está na faixa 1-19 (0% desconto)
assert.equal(calcWithElements.discountPercent, 0, "Faixa 1-19: 0% desconto");
assert.equal(calcWithElements.unitPrice, 48.0, "Preço unitário líquido: R$ 48,00");
assert.equal(calcWithElements.subtotal, 480.0, "Subtotal: 10 * 48 = R$ 480,00");
assert.equal(calcWithElements.total, 480.0, "Total: R$ 480,00");

console.log("   [OK] Logo (+R$ 5), Nome (+R$ 4) e Número (+R$ 4) = R$ 48,00 / un. (Total: R$ 480,00 para 10 un.)");

// =========================================================================
// TESTE 3: Adicional de Posição (Costas: +R$ 3,00)
// =========================================================================
console.log("\n-> TESTE 3: Adicional por Posição/Vista (Costas: +R$ 3,00)");

const calcWithBackPosition = await PricingService.calculate({
  quantity: 10,
  views: {
    FRONT: [
      { id: "logo-1", type: "LOGO", zoneId: "z-frente", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
    ],
    BACK: [
      { id: "num-1", type: "NUMBER", zoneId: "z-costas", viewSide: "BACK", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1, text: "10" },
    ],
  },
});

// Base: 35.00
// Logo: 5.00
// Número: 4.00
// Posição Costas: 3.00
// Total Customizações: 5 + 4 + 3 = 12.00
// Preço Bruto = 35 + 12 = 47.00
assert.equal(calcWithBackPosition.unitCustomizations, 12.0, "Logo (5) + Num (4) + Posição Costas (3) = 12.00");
assert.equal(calcWithBackPosition.unitPriceBeforeDiscount, 47.0);
assert.equal(calcWithBackPosition.breakdown.positions.length, 1);
assert.equal(calcWithBackPosition.breakdown.positions[0].price, 3.0);

console.log("   [OK] Custo adicional de impressão na posição Costas somado com sucesso (+R$ 3,00).");

// =========================================================================
// TESTE 4: Descontos por Volume (Faixas de 20 peças e 50 peças)
// =========================================================================
console.log("\n-> TESTE 4: Descontos por Volume (20 peças: 10% OFF | 50 peças: 15% OFF)");

// Cenário A: 20 peças com Logo + Nome + Número (Preço bruto unitário = R$ 48,00)
const calc20 = await PricingService.calculate({
  quantity: 20,
  views: {
    FRONT: [
      { id: "logo-1", type: "LOGO", zoneId: "z-frente", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
      { id: "nome-1", type: "TEXT", zoneId: "z-frente", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1, text: "TechPro" },
      { id: "num-1", type: "NUMBER", zoneId: "z-frente", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1, text: "10" },
    ],
  },
});

// Desconto de 10% sobre R$ 48,00 = R$ 4,80
// Preço unitário líquido = 48.00 - 4.80 = R$ 43,20
// Subtotal bruto = 20 * 48.00 = R$ 960,00
// Desconto total = 20 * 4.80 = R$ 96,00
// Total final = 20 * 43.20 = R$ 864,00
assert.equal(calc20.discountPercent, 10, "20 peças deve aplicar 10% de desconto");
assert.equal(calc20.unitDiscountAmount, 4.8, "Desconto por unidade: R$ 4,80");
assert.equal(calc20.unitPrice, 43.2, "Preço unitário final: R$ 43,20");
assert.equal(calc20.subtotal, 960.0, "Subtotal: R$ 960,00");
assert.equal(calc20.totalDiscount, 96.0, "Desconto total: R$ 96,00");
assert.equal(calc20.total, 864.0, "Total final: R$ 864,00");

console.log("   [OK] 20 peças: R$ 48,00 -> R$ 43,20 (-10%), Total: R$ 864,00 (Economia de R$ 96,00).");

// Cenário B: 50 peças (15% desconto)
const calc50 = await PricingService.calculate({
  quantity: 50,
  views: {
    FRONT: [
      { id: "logo-1", type: "LOGO", zoneId: "z-frente", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
      { id: "nome-1", type: "TEXT", zoneId: "z-frente", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1, text: "TechPro" },
      { id: "num-1", type: "NUMBER", zoneId: "z-frente", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1, text: "10" },
    ],
  },
});

// Desconto de 15% sobre R$ 48,00 = R$ 7,20
// Preço unitário líquido = 48.00 - 7.20 = R$ 40,80
// Subtotal bruto = 50 * 48.00 = R$ 2400,00
// Desconto total = 50 * 7.20 = R$ 360,00
// Total final = 50 * 40.80 = R$ 2040,00
assert.equal(calc50.discountPercent, 15, "50 peças deve aplicar 15% de desconto");
assert.equal(calc50.unitDiscountAmount, 7.2, "Desconto por unidade: R$ 7,20");
assert.equal(calc50.unitPrice, 40.8, "Preço unitário líquido: R$ 40,80");
assert.equal(calc50.subtotal, 2400.0, "Subtotal: R$ 2400,00");
assert.equal(calc50.totalDiscount, 360.0, "Desconto total: R$ 360,00");
assert.equal(calc50.total, 2040.0, "Total final: R$ 2040,00");

console.log("   [OK] 50 peças: R$ 48,00 -> R$ 40,80 (-15%), Total: R$ 2.040,00 (Economia de R$ 360,00).");

// =========================================================================
// TESTE 5: Imunidade a Adulteração de Valores pelo Cliente (Server Recalculation)
// =========================================================================
console.log("\n-> TESTE 5: Segurança e Imunidade a Fraude do Cliente");

// Cliente malicioso envia valores financeiros adulterados no payload
const maliciousClientPayload = {
  quantity: 20,
  unitPrice: 1.0, // Tentativa de burlar preço unitário para R$ 1,00
  total: 20.0,    // Tentativa de burlar total para R$ 20,00
  views: {
    FRONT: [
      { id: "logo-1", type: "LOGO", zoneId: "z-peito", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
    ],
  },
};

const serverCalculation = await PricingService.calculate(maliciousClientPayload);
// O servidor deve ignorar solenemente os valores falsos e aplicar as regras oficiais:
// Base: 35.00 + Logo: 5.00 = 40.00 bruto. Com 10% (faixa 20 un.) = 36.00 / un. Total = 720.00
assert.equal(serverCalculation.unitPrice, 36.0, "Servidor deve ignorar unitPrice adulterado de R$ 1,00");
assert.equal(serverCalculation.total, 720.0, "Servidor deve ignorar total adulterado de R$ 20,00");

console.log("   [OK] Valores fraudulentos enviados pelo cliente foram completamente ignorados.");
console.log("        Recálculo 100% server-side garantiu integridade financeira inviolável.");

// =========================================================================
// TESTE 6: Administrador Atualiza Regras Comerciais
// =========================================================================
console.log("\n-> TESTE 6: Atualização Dinâmica de Regras pelo Administrador");

await PricingService.updatePricingRules({
  baseProductPrice: 40.0, // Aumento do preço base
  elementTypes: {
    LOGO: 7.0,   // Logo agora custa R$ 7,00
    TEXT: 4.0,
    NUMBER: 4.0,
    IMAGE: 8.0,
  },
});

const calcUpdatedRules = await PricingService.calculate({
  quantity: 1,
  views: {
    FRONT: [
      { id: "logo-1", type: "LOGO", zoneId: "z-peito", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
    ],
  },
});

// Novo preço base: 40.00 + Novo Logo: 7.00 = 47.00
assert.equal(calcUpdatedRules.unitBasePrice, 40.0, "Novo preço base: R$ 40,00");
assert.equal(calcUpdatedRules.unitCustomizations, 7.0, "Novo preço logo: R$ 7,00");
assert.equal(calcUpdatedRules.total, 47.0, "Novo total: R$ 47,00");

console.log("   [OK] Regras comerciais atualizadas dinamicamente e refletidas de imediato no motor.");

// =========================================================================
// TESTE 7: Integração com Grade da Equipe (32 membros)
// =========================================================================
console.log("\n-> TESTE 7: Integração com Grade da Equipe (32 Peças na Faixa 20-49)");

const teamMembers = [];
for (let i = 1; i <= 32; i++) {
  teamMembers.push({ id: `m-${i}`, name: `Atleta ${i}`, size: "M", number: `${i}` });
}

const calcTeamRoster = await PricingService.calculate({
  quantity: 1, // quantidade no input é 1, mas a grade de equipe possui 32 membros
  teamRoster: {
    enabled: true,
    members: teamMembers,
  },
  views: {
    FRONT: [
      { id: "logo-1", type: "LOGO", zoneId: "z-frente", viewSide: "FRONT", x: 0, y: 0, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
    ],
  },
});

// Quantidade real sincronizada com os 32 membros da equipe
assert.equal(calcTeamRoster.quantity, 32, "Quantidade deve ser 32 da grade");
// 32 peças está na faixa 20-49 (10% de desconto)
assert.equal(calcTeamRoster.discountPercent, 10, "Deve aplicar 10% de desconto de volume");
// Base: 40.00 + Logo: 7.00 = 47.00 bruto. Desconto 10% (4.70) = 42.30 líquido
assert.equal(calcTeamRoster.unitPrice, 42.3, "Preço unitário líquido: R$ 42,30");
assert.equal(calcTeamRoster.total, 1353.6, "Total: 32 * 42.30 = R$ 1353,60");

console.log("   [OK] Grade de 32 integrantes vinculada com precisão à faixa de 10% de desconto.");

console.log("\n========================================================");
console.log("   TODOS OS 7 TESTES DE PRECIFICAÇÃO PASSARAM COM 100%! 🎉");
console.log("========================================================\n");
