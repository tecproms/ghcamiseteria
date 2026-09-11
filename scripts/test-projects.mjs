// Suíte de Testes Automatizados: Meus Projetos & Persistência de Uniformes
// Valida: Salvar, Atualizar, Duplicar, Excluir, Abrir, Recuperar Configuração Exata e Segurança/RLS

import { ProjectsService, UnauthorizedProjectAccessError } from "../services/projects.service.ts";
import { useConfiguratorStore, FABRIC_COLORS } from "../stores/configurator.store.ts";

async function runProjectsTests() {
  console.log("================================================================================");
  console.log("🧪 INICIANDO TESTES DO MÓDULO MEUS PROJETOS (GH CAMISETERIA)");
  console.log("================================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`❌ FALHA: ${message}`);
      throw new Error(`Falha no teste: ${message}`);
    }
    passedTests++;
    console.log(`  ✓ ${message}`);
  }

  // Limpar memória de testes
  ProjectsService._resetMemoryProjects();

  const userAId = "user-cliente-alpha-001";
  const userBId = "user-cliente-beta-002";
  const adminId = "user-admin-master-999";

  const initialElements = {
    FRONT: [
      {
        id: "elem-front-logo",
        type: "LOGO",
        zoneId: "zone-peito-esq-01",
        viewSide: "FRONT",
        x: 460,
        y: 220,
        width: 100,
        height: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      },
      {
        id: "elem-front-text",
        type: "TEXT",
        zoneId: "zone-centro-front-01",
        viewSide: "FRONT",
        x: 300,
        y: 280,
        width: 200,
        height: 40,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        text: "TECHPRO MS",
        fontFamily: "Roboto",
        fontSize: 28,
        fill: "#D4AF37",
      },
    ],
    BACK: [
      {
        id: "elem-back-number",
        type: "NUMBER",
        zoneId: "zone-costas-01",
        viewSide: "BACK",
        x: 320,
        y: 240,
        width: 160,
        height: 180,
        rotation: 0,
        scaleX: 1.2,
        scaleY: 1.2,
        text: "10",
        fontFamily: "Impact",
        fontSize: 72,
        fill: "#FFFFFF",
      },
    ],
    LEFT_SLEEVE: [],
    RIGHT_SLEEVE: [],
    OTHER: [],
  };

  // ============================================================================
  // TESTE 1: Salvar Novo Projeto (User A)
  // ============================================================================
  console.log("1. Testando Salvamento de Projeto com Configuração Serializável...");
  const projectA = await ProjectsService.createProject(userAId, {
    name: "Uniforme Corporativo TechPro 2026",
    shirt_model_id: "model-camisa-tradicional-01",
    model_name: "Camiseta Tradicional Meia Malha",
    color: FABRIC_COLORS[1], // Preto Nobre (#18181B)
    quantity: 25,
    views: initialElements,
  });

  assert(projectA.id !== undefined && projectA.id.length > 0, "Projeto A gerou um ID válido.");
  assert(projectA.user_id === userAId, "Projeto A vinculado corretamente ao Usuário A.");
  assert(projectA.name === "Uniforme Corporativo TechPro 2026", "Nome do projeto persistido corretamente.");
  assert(projectA.metadata.quantity === 25, "Quantidade de 25 peças persistida.");
  assert(projectA.metadata.color.hex === "#18181B", "Cor Preto Nobre persistida.");
  assert(projectA.metadata.configuration.views.FRONT.length === 2, "2 elementos na vista FRONT persistidos.");
  assert(projectA.metadata.configuration.views.BACK.length === 1, "1 elemento na vista BACK persistido.");

  // ============================================================================
  // TESTE 2: Listagem de Projetos por Usuário
  // ============================================================================
  console.log("\n2. Testando Listagem de Projetos (Isolamento por Usuário)...");
  const userAProjects = await ProjectsService.getProjectsByUser(userAId);
  assert(userAProjects.length === 1, "Usuário A lista exatamente seu 1 projeto salvo.");

  const userBProjects = await ProjectsService.getProjectsByUser(userBId);
  assert(userBProjects.length === 0, "Usuário B não vê os projetos do Usuário A.");

  // ============================================================================
  // TESTE 3: SEGURANÇA E RLS - Tentativa de Acesso Cruzado por URL ID
  // ============================================================================
  console.log("\n3. Testando Segurança: Bloqueio de Acesso Cruzado ao Alterar ID na URL...");
  
  // 3.1 Usuário B tenta abrir o projeto do Usuário A
  let userBAccessBlocked = false;
  try {
    await ProjectsService.getProjectById(projectA.id, userBId, false);
  } catch (err) {
    if (err instanceof UnauthorizedProjectAccessError) {
      userBAccessBlocked = true;
    }
  }
  assert(userBAccessBlocked, "Usuário B é BLOQUEADO (403/Unauthorized) ao tentar abrir projeto do Usuário A.");

  // 3.2 Usuário B tenta atualizar o projeto do Usuário A
  let userBUpdateBlocked = false;
  try {
    await ProjectsService.updateProject(projectA.id, userBId, { name: "Tentativa de Invasao" }, false);
  } catch (err) {
    if (err instanceof UnauthorizedProjectAccessError) {
      userBUpdateBlocked = true;
    }
  }
  assert(userBUpdateBlocked, "Usuário B é BLOQUEADO ao tentar atualizar projeto do Usuário A.");

  // 3.3 Usuário B tenta excluir o projeto do Usuário A
  let userBDeleteBlocked = false;
  try {
    await ProjectsService.deleteProject(projectA.id, userBId, false);
  } catch (err) {
    if (err instanceof UnauthorizedProjectAccessError) {
      userBDeleteBlocked = true;
    }
  }
  assert(userBDeleteBlocked, "Usuário B é BLOQUEADO ao tentar excluir projeto do Usuário A.");

  // 3.4 Administrador tem acesso legítimo
  const adminAccess = await ProjectsService.getProjectById(projectA.id, adminId, true);
  assert(adminAccess !== null && adminAccess.id === projectA.id, "Administrador tem permissão legítima de suporte.");

  // ============================================================================
  // TESTE 4: Atualização de Projeto (User A)
  // ============================================================================
  console.log("\n4. Testando Atualização de Projeto...");
  const updatedProjectA = await ProjectsService.updateProject(
    projectA.id,
    userAId,
    {
      name: "Uniforme Corporativo TechPro 2026 - Edição Ouro",
      color: FABRIC_COLORS[3], // Azul Royal (#2563EB)
      quantity: 50,
      views: {
        ...initialElements,
        FRONT: [
          ...initialElements.FRONT,
          {
            id: "elem-front-badge",
            type: "TEXT",
            zoneId: "zone-peito-dir-01",
            viewSide: "FRONT",
            x: 230,
            y: 220,
            width: 80,
            height: 30,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            text: "VIP",
            fontFamily: "Impact",
            fontSize: 20,
            fill: "#FFFFFF",
          },
        ],
      },
    }
  );

  assert(
    updatedProjectA.name === "Uniforme Corporativo TechPro 2026 - Edição Ouro",
    "Nome atualizado com sucesso."
  );
  assert(updatedProjectA.metadata.quantity === 50, "Quantidade atualizada para 50 peças.");
  assert(updatedProjectA.metadata.color.hex === "#2563EB", "Cor atualizada para Azul Royal.");
  assert(
    updatedProjectA.metadata.configuration.views.FRONT.length === 3,
    "Novo elemento adicionado à vista FRONT persistido com sucesso."
  );

  // ============================================================================
  // TESTE 5: Duplicação de Projeto
  // ============================================================================
  console.log("\n5. Testando Duplicação de Projeto...");
  const duplicatedProject = await ProjectsService.duplicateProject(projectA.id, userAId);

  assert(duplicatedProject.id !== projectA.id, "Projeto duplicado recebeu novo ID exclusivo.");
  assert(
    duplicatedProject.name.includes("(Cópia)"),
    `Nome do projeto duplicado possui sufixo '(Cópia)': "${duplicatedProject.name}".`
  );
  assert(
    duplicatedProject.metadata.configuration.views.FRONT.length === 3,
    "Configuração de elementos copiada integralmente."
  );
  assert(duplicatedProject.metadata.quantity === 50, "Quantidade preservada no clone.");

  const userAProjectsAfterDup = await ProjectsService.getProjectsByUser(userAId);
  assert(userAProjectsAfterDup.length === 2, "Usuário A agora possui 2 projetos salvos.");

  // ============================================================================
  // TESTE 6: Abrir e Recuperar Exatamente a Configuração Anterior no Store
  // ============================================================================
  console.log("\n6. Testando Recuperação e Restauração Exata no Configurador...");
  const store = useConfiguratorStore.getState();

  // Carregar projeto no estado do configurador
  useConfiguratorStore.getState().loadProjectState(
    updatedProjectA.metadata.configuration,
    updatedProjectA.id,
    updatedProjectA.name
  );

  const restoredState = useConfiguratorStore.getState();
  assert(restoredState.currentProjectId === projectA.id, "ID do projeto ativo configurado no store.");
  assert(restoredState.projectName === updatedProjectA.name, "Nome do projeto recuperado exatamente.");
  assert(restoredState.quantity === 50, "Quantidade de 50 recuperada exatamente.");
  assert(restoredState.selectedColor.hex === "#2563EB", "Cor do tecido Azul Royal restaurada exatamente.");
  assert(restoredState.elements.FRONT.length === 3, "3 elementos recuperados na vista FRONT.");
  assert(restoredState.elements.BACK.length === 1, "1 elemento recuperado na vista BACK.");

  const frontTextElem = restoredState.elements.FRONT.find((e) => e.text === "TECHPRO MS");
  assert(frontTextElem !== undefined, "Elemento 'TECHPRO MS' restaurado.");
  assert(frontTextElem.x === 300 && frontTextElem.y === 280, "Coordenadas X/Y recuperadas com precisão.");
  assert(frontTextElem.fontFamily === "Roboto", "Fonte Roboto preservada.");
  assert(frontTextElem.fill === "#D4AF37", "Cor dourada preservada.");

  const backNumberElem = restoredState.elements.BACK.find((e) => e.text === "10");
  assert(backNumberElem !== undefined, "Número '10' nas costas restaurado.");
  assert(backNumberElem.scaleX === 1.2 && backNumberElem.scaleY === 1.2, "Escala 1.2 preservada.");
  assert(backNumberElem.fontFamily === "Impact", "Fonte esportiva Impact preservada.");

  // ============================================================================
  // TESTE 7: Exclusão de Projeto
  // ============================================================================
  console.log("\n7. Testando Exclusão de Projeto...");
  const deleteResult = await ProjectsService.deleteProject(duplicatedProject.id, userAId);
  assert(deleteResult === true, "Projeto excluído com sucesso.");

  const userAProjectsAfterDel = await ProjectsService.getProjectsByUser(userAId);
  assert(userAProjectsAfterDel.length === 1, "Apenas 1 projeto ativo restante para o Usuário A.");
  assert(
    !userAProjectsAfterDel.some((p) => p.id === duplicatedProject.id),
    "Projeto excluído não aparece mais na lista de projetos ativos."
  );

  console.log("\n================================================================================");
  console.log(`🎉 TODOS OS ${passedTests}/${totalTests} TESTES FORAM CONCLUÍDOS COM SUCESSO!`);
  console.log("================================================================================");
}

runProjectsTests().catch((err) => {
  console.error("\n❌ ERRO CRÍTICO DURANTE EXECUÇÃO DOS TESTES:", err);
  process.exit(1);
});
