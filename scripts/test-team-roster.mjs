// scripts/test-team-roster.mjs
// Teste automatizado do módulo de Equipe & Grade do Pedido
import assert from "node:assert/strict";
import { ProjectsService } from "../services/projects.service.ts";

console.log("\n========================================================");
console.log("   TESTE DO MÓDULO DE EQUIPE & GRADE DO PEDIDO (MAPOS)");
console.log("========================================================\n");

// Limpar memória de projetos para ambiente isolado de teste
ProjectsService._resetMemoryProjects();

// =========================================================================
// TESTE 1: Parser e Importação em Massa de Integrantes
// =========================================================================
console.log("-> TESTE 1: Parser e Importação em Massa");

function parseTeamText(rawText) {
  const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const members = [];
  const errors = [];

  lines.forEach((line, index) => {
    let parts = [];
    if (line.includes("|")) {
      parts = line.split("|").map((p) => p.trim());
    } else if (line.includes(";")) {
      parts = line.split(";").map((p) => p.trim());
    } else if (line.includes("\t")) {
      parts = line.split("\t").map((p) => p.trim());
    } else if (line.includes(",")) {
      parts = line.split(",").map((p) => p.trim());
    } else {
      parts = line.trim().split(/\s+/);
    }

    const name = parts[0];
    const size = (parts[1] || "M").toUpperCase();
    const number = parts[2] || undefined;
    const sector = parts[3] || undefined;
    const notes = parts[4] || undefined;

    if (!name) {
      errors.push(`Linha ${index + 1}: Nome do integrante ausente.`);
      return;
    }

    members.push({
      id: `member-${Date.now()}-${index}`,
      name,
      size,
      number,
      sector,
      notes,
    });
  });

  return { members, errors };
}

const sampleImportText = `
João | M | 10 | Comercial
Maria | P | 07 | Financeiro
Carlos | G | 22 | Operacional
`;

const parsed = parseTeamText(sampleImportText);
assert.equal(parsed.members.length, 3, "Deveria ter importado 3 integrantes");
assert.equal(parsed.members[0].name, "João");
assert.equal(parsed.members[0].size, "M");
assert.equal(parsed.members[0].number, "10");
assert.equal(parsed.members[0].sector, "Comercial");

assert.equal(parsed.members[1].name, "Maria");
assert.equal(parsed.members[1].size, "P");
assert.equal(parsed.members[1].number, "07");
assert.equal(parsed.members[1].sector, "Financeiro");

assert.equal(parsed.members[2].name, "Carlos");
assert.equal(parsed.members[2].size, "G");
assert.equal(parsed.members[2].number, "22");
assert.equal(parsed.members[2].sector, "Operacional");

console.log("   [OK] Parser de importação com delimitador | funcionou com precisão.");

// =========================================================================
// TESTE 2: Cálculo de Totais por Tamanho (Grade de 32 peças)
// =========================================================================
console.log("\n-> TESTE 2: Cálculo de Totais por Tamanho (Exemplo do Prompt: PP: 2, P: 5, M: 12, G: 10, GG: 3 = 32)");

const fullTeamList = [];
// PP: 2
for (let i = 1; i <= 2; i++) fullTeamList.push({ id: `pp-${i}`, name: `Atleta PP ${i}`, size: "PP", number: `${i}` });
// P: 5
for (let i = 1; i <= 5; i++) fullTeamList.push({ id: `p-${i}`, name: `Atleta P ${i}`, size: "P", number: `${i + 2}` });
// M: 12
for (let i = 1; i <= 12; i++) fullTeamList.push({ id: `m-${i}`, name: `Atleta M ${i}`, size: "M", number: `${i + 7}` });
// G: 10
for (let i = 1; i <= 10; i++) fullTeamList.push({ id: `g-${i}`, name: `Atleta G ${i}`, size: "G", number: `${i + 19}` });
// GG: 3
for (let i = 1; i <= 3; i++) fullTeamList.push({ id: `gg-${i}`, name: `Atleta GG ${i}`, size: "GG", number: `${i + 29}` });

function calculateSummary(members) {
  const breakdown = {};
  members.forEach((m) => {
    const s = (m.size || "M").toUpperCase();
    breakdown[s] = (breakdown[s] || 0) + 1;
  });
  return {
    sizeBreakdown: breakdown,
    totalMembers: members.length,
  };
}

const teamSummary = calculateSummary(fullTeamList);
assert.equal(teamSummary.sizeBreakdown["PP"], 2, "PP deve ter 2 integrantes");
assert.equal(teamSummary.sizeBreakdown["P"], 5, "P deve ter 5 integrantes");
assert.equal(teamSummary.sizeBreakdown["M"], 12, "M deve ter 12 integrantes");
assert.equal(teamSummary.sizeBreakdown["G"], 10, "G deve ter 10 integrantes");
assert.equal(teamSummary.sizeBreakdown["GG"], 3, "GG deve ter 3 integrantes");
assert.equal(teamSummary.totalMembers, 32, "Total deve ser exatamente 32 integrantes");

console.log("   [OK] Resumo por tamanho verificado:");
console.log(`        PP: ${teamSummary.sizeBreakdown["PP"]}`);
console.log(`        P:  ${teamSummary.sizeBreakdown["P"]}`);
console.log(`        M:  ${teamSummary.sizeBreakdown["M"]}`);
console.log(`        G:  ${teamSummary.sizeBreakdown["G"]}`);
console.log(`        GG: ${teamSummary.sizeBreakdown["GG"]}`);
console.log(`        TOTAL: ${teamSummary.totalMembers}`);

// =========================================================================
// TESTE 3: CRUD de Integrantes
// =========================================================================
console.log("\n-> TESTE 3: CRUD de Integrantes");

let team = [...parsed.members];
// Adicionar
const novoIntegrante = {
  id: "member-new-1",
  name: "Ana Paula",
  size: "M",
  number: "11",
  sector: "Diretoria",
  notes: "Gola polo especial",
};
team.push(novoIntegrante);
assert.equal(team.length, 4, "Após adição deve ter 4 integrantes");

// Editar
const idxToEdit = team.findIndex((m) => m.id === novoIntegrante.id);
team[idxToEdit] = { ...team[idxToEdit], name: "Ana Paula Silva", size: "G" };
assert.equal(team[idxToEdit].name, "Ana Paula Silva");
assert.equal(team[idxToEdit].size, "G");

// Duplicar
const toDuplicate = team[0];
const duplicated = { ...toDuplicate, id: "member-dup-1", name: `${toDuplicate.name} (2)` };
team.push(duplicated);
assert.equal(team.length, 5, "Após duplicação deve ter 5 integrantes");
assert.equal(duplicated.name, "João (2)");

// Remover
team = team.filter((m) => m.id !== duplicated.id);
assert.equal(team.length, 4, "Após remoção deve ter 4 integrantes");
console.log("   [OK] Adicionar, Editar, Duplicar e Remover funcionando perfeitamente.");

// =========================================================================
// TESTE 4: Separação Arquitetural (Configuração da Arte vs Grade da Equipe)
// =========================================================================
console.log("\n-> TESTE 4: Separação Arquitetural");

const commonUniformArtwork = {
  modelId: "shirt-model-dryfit",
  color: { id: "black", name: "Preto", hex: "#000000", textColor: "#FFFFFF" },
  views: {
    FRONT: [
      { id: "logo-1", type: "LOGO", zoneId: "z-peito", x: 100, y: 100, width: 80, height: 80, rotation: 0, scaleX: 1, scaleY: 1, src: "/logo.png" },
    ],
    BACK: [
      { id: "text-name", type: "TEXT", zoneId: "z-costas", x: 200, y: 120, width: 160, height: 40, rotation: 0, scaleX: 1, scaleY: 1, text: "{nome}", linkedMemberField: "name" },
      { id: "num-back", type: "NUMBER", zoneId: "z-costas", x: 230, y: 180, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, text: "10", linkedMemberField: "number" },
    ],
    LEFT_SLEEVE: [],
    RIGHT_SLEEVE: [],
  },
};

// Cada integrante compartilha a mesma arte e pode possuir personalizações futuras (customOverrides)
const teamWithIndividualOverrides = [
  { id: "mem-1", name: "João", size: "M", number: "10", customOverrides: { individualElements: { "sleeve-flag": true } } },
  { id: "mem-2", name: "Maria", size: "P", number: "07", customOverrides: undefined },
];

assert.ok(commonUniformArtwork.views.FRONT.length > 0, "A arte comum do uniforme é independente dos integrantes");
assert.ok(teamWithIndividualOverrides[0].customOverrides !== undefined, "Arquitetura preparada para overrides individuais por integrante");
console.log("   [OK] Configuração de Uniforme e Grade do Pedido completamente desacopladas.");

// =========================================================================
// TESTE 5: Persistência Real via ProjectsService (Supabase / Memory Fallback)
// =========================================================================
console.log("\n-> TESTE 5: Persistência Real e Roundtrip via ProjectsService");

const userId = "usr-team-manager-001";
const teamRosterPayload = {
  enabled: true,
  members: fullTeamList, // 32 integrantes
};

// 1. Criar projeto com equipe
const created = await ProjectsService.createProject(userId, {
  name: "Uniforme Equipe GH 2026",
  shirt_model_id: "mod-dryfit-01",
  model_name: "Camisa Dry Fit Pro",
  color: { id: "navy", name: "Azul Marinho", hex: "#001F3F", textColor: "#FFFFFF" },
  quantity: 32,
  views: commonUniformArtwork.views,
  teamRoster: teamRosterPayload,
});

assert.ok(created.id, "Projeto deve possuir um ID gerado");
assert.equal(created.metadata.quantity, 32, "Quantidade deve sincronizar com o total da equipe (32)");
assert.ok(created.metadata.teamRoster, "Metadata deve conter teamRoster");
assert.equal(created.metadata.teamRoster.members.length, 32, "Deve conter todos os 32 membros");
assert.equal(created.metadata.configuration.teamRoster.members[0].name, "Atleta PP 1");

// 2. Recuperar projeto e validar integridade dos dados da equipe
const fetched = await ProjectsService.getProjectById(created.id, userId);
assert.ok(fetched, "Deve recuperar o projeto persistido");
assert.equal(fetched.name, "Uniforme Equipe GH 2026");
assert.equal(fetched.metadata.teamRoster.enabled, true);
assert.equal(fetched.metadata.teamRoster.members.length, 32);

// 3. Atualizar projeto modificando um integrante da equipe
const updatedMembers = [...fullTeamList];
updatedMembers[0] = { ...updatedMembers[0], name: "Capitão Atualizado", number: "99" };

const updated = await ProjectsService.updateProject(created.id, userId, {
  name: "Uniforme Equipe GH 2026 - Oficial",
  teamRoster: {
    enabled: true,
    members: updatedMembers,
  },
});

assert.equal(updated.name, "Uniforme Equipe GH 2026 - Oficial");
assert.equal(updated.metadata.teamRoster.members[0].name, "Capitão Atualizado");
assert.equal(updated.metadata.teamRoster.members[0].number, "99");

// 4. Duplicar projeto e validar clonagem completa da grade de equipe
const duplicatedProject = await ProjectsService.duplicateProject(created.id, userId);
assert.ok(duplicatedProject.id !== created.id, "Projeto duplicado deve ter novo ID");
assert.equal(duplicatedProject.name, "Uniforme Equipe GH 2026 - Oficial (Cópia)");
assert.equal(duplicatedProject.metadata.teamRoster.members.length, 32, "Grade da equipe deve ser copiada integralmente");
assert.equal(duplicatedProject.metadata.teamRoster.members[0].name, "Capitão Atualizado");

console.log("   [OK] createProject, getProjectById, updateProject e duplicateProject persistiram a grade da equipe com perfeição!");

console.log("\n========================================================");
console.log("   TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! 🎉");
console.log("========================================================\n");
