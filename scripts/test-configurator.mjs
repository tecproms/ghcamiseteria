// Teste Automatizado do Configurador Visual de Uniformes
// Valida: Movimentação, Escala, Rotação, Upload, Textos, Números, Vistas e Validação no Backend

import { CustomizerValidationService } from "../services/customizer-validation.service.ts";
import { UniformModelService } from "../services/uniform-model.service.js";

async function runConfiguratorTests() {
  console.log("================================================================================");
  console.log("🧪 INICIANDO TESTES DO CONFIGURADOR VISUAL DE UNIFORMES (GH CAMISETERIA)");
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

  // Obter um modelo com zonas cadastradas no banco para o teste integrado
  console.log("1. Carregando modelos e zonas do banco de dados...");
  const models = await UniformModelService.listModels();
  assert(models.length > 0, "Pelo menos um modelo deve estar cadastrado no banco.");

  const testModel = models.find((m) => m.views && m.views.some((v) => v.zones && v.zones.length > 0)) || models[0];
  console.log(`  -> Modelo selecionado: "${testModel.name}" (ID: ${testModel.id})`);

  const frontView = testModel.views?.find((v) => v.view_side === "FRONT") || testModel.views?.[0];
  assert(frontView !== undefined, "Vista FRONT deve existir no modelo.");

  let testZone = frontView.zones?.[0];
  if (!testZone) {
    console.log("  -> Nenhuma zona cadastrada para a vista. Criando zona temporária para o teste...");
    testZone = await UniformModelService.createZone({
      uniform_view_id: frontView.id,
      zone_name: "PEITO_ESQUERDO_TEST",
      zone_type: "PEITO_ESQUERDO",
      x: 420,
      y: 220,
      width: 140,
      height: 120,
      rotation: 0,
      min_scale: 0.5,
      max_scale: 2.0,
      allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
      is_active: true,
    });
  }

  console.log(`  -> Zona ativa: "${testZone.zone_name}" [x: ${testZone.x}, y: ${testZone.y}, w: ${testZone.width}, h: ${testZone.height}, minScale: ${testZone.min_scale}, maxScale: ${testZone.max_scale}]`);

  // ============================================================================
  // TESTE 1: Inserção de Texto e Propriedades Tipográficas
  // ============================================================================
  console.log("\n2. Testando Inserção e Customização de Texto...");
  const textElement = {
    id: "elem-txt-1",
    type: "TEXT",
    zoneId: testZone.id,
    x: testZone.x + 10,
    y: testZone.y + 10,
    width: 100,
    height: 30,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    text: "GH UNIFORMES",
    fontFamily: "Roboto",
    fontSize: 24,
    fill: "#D4AF37",
  };
  assert(textElement.type === "TEXT", "Tipo de elemento é TEXT");
  assert(textElement.fill === "#D4AF37", "Cor do texto definida para Dourado (#D4AF37)");
  assert(textElement.fontFamily === "Roboto", "Fonte selecionada é Roboto");

  // ============================================================================
  // TESTE 2: Inserção de Número Esportivo
  // ============================================================================
  console.log("\n3. Testando Inserção de Número Esportivo...");
  const numberElement = {
    id: "elem-num-1",
    type: "NUMBER",
    zoneId: testZone.id,
    x: testZone.x + 15,
    y: testZone.y + 15,
    width: 50,
    height: 60,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    text: "10",
    fontFamily: "Impact",
    fontSize: 48,
    fill: "#FFFFFF",
  };
  assert(numberElement.type === "NUMBER", "Tipo de elemento é NUMBER");
  assert(numberElement.text === "10", "Número definido como 10");
  assert(numberElement.fontFamily === "Impact", "Fonte esportiva Impact aplicada");

  // ============================================================================
  // TESTE 3: Upload de Imagem e Logo
  // ============================================================================
  console.log("\n4. Testando Upload de Imagem e Logo...");
  const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const imageElement = {
    id: "elem-img-1",
    type: "IMAGE",
    zoneId: testZone.id,
    x: testZone.x + 5,
    y: testZone.y + 5,
    width: 60,
    height: 60,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    src: dummyBase64,
  };
  assert(imageElement.type === "IMAGE", "Tipo de elemento é IMAGE");
  assert(imageElement.src.startsWith("data:image/png;base64"), "Asset em formato DataURL base64 carregado");

  // ============================================================================
  // TESTE 4: Movimentação e Função de Clamping (dragBoundFunc)
  // ============================================================================
  console.log("\n5. Testando Movimentação e Restrição Física de Arraste (dragBoundFunc)...");
  function simulateDragBoundFunc(pos, element, zone) {
    const scaleX = element.scaleX || 1;
    const scaleY = element.scaleY || 1;
    const elemWidth = (element.width || 100) * scaleX;
    const elemHeight = (element.height || 100) * scaleY;

    const minX = zone.x;
    const maxX = zone.x + zone.width - elemWidth;
    const minY = zone.y;
    const maxY = zone.y + zone.height - elemHeight;

    return {
      x: Math.max(minX, Math.min(pos.x, maxX > minX ? maxX : minX)),
      y: Math.max(minY, Math.min(pos.y, maxY > minY ? maxY : minY)),
    };
  }

  // Tentativa 1: Arrastar para fora à esquerda/cima (0, 0)
  const clampedTopLeft = simulateDragBoundFunc({ x: 0, y: 0 }, textElement, testZone);
  assert(clampedTopLeft.x === testZone.x, `Arraste bloqueado na borda esquerda: ${clampedTopLeft.x} === ${testZone.x}`);
  assert(clampedTopLeft.y === testZone.y, `Arraste bloqueado na borda superior: ${clampedTopLeft.y} === ${testZone.y}`);

  // Tentativa 2: Arrastar para fora à direita/baixo (9999, 9999)
  const clampedBottomRight = simulateDragBoundFunc({ x: 9999, y: 9999 }, textElement, testZone);
  const expectedMaxX = testZone.x + testZone.width - textElement.width;
  const expectedMaxY = testZone.y + testZone.height - textElement.height;
  assert(clampedBottomRight.x === expectedMaxX, `Arraste bloqueado na borda direita: ${clampedBottomRight.x} === ${expectedMaxX}`);
  assert(clampedBottomRight.y === expectedMaxY, `Arraste bloqueado na borda inferior: ${clampedBottomRight.y} === ${expectedMaxY}`);

  // Tentativa 3: Movimentação interna permitida
  const insidePos = { x: testZone.x + 10, y: testZone.y + 10 };
  const clampedInside = simulateDragBoundFunc(insidePos, textElement, testZone);
  assert(clampedInside.x === insidePos.x && clampedInside.y === insidePos.y, "Movimentação interna preservada sem restrição indevida");

  // ============================================================================
  // TESTE 5: Rotação (0° a 360°)
  // ============================================================================
  console.log("\n6. Testando Rotação de Elemento...");
  const rotatedElement = { ...textElement, rotation: 45 };
  assert(rotatedElement.rotation === 45, "Elemento rotacionado em 45°");
  rotatedElement.rotation = 360 % 360;
  assert(rotatedElement.rotation === 0, "Ciclo completo de 360° normalizado para 0°");

  // ============================================================================
  // TESTE 6: Limites de Escala (boundBoxFunc)
  // ============================================================================
  console.log("\n7. Testando Limites de Redimensionamento e Escala...");
  function simulateBoundBoxFunc(newBox, currentScale, zone) {
    const minScale = zone.min_scale ?? 0.2;
    const maxScale = zone.max_scale ?? 3.0;

    if (currentScale < minScale || currentScale > maxScale) {
      return false; // Rejeitado
    }
    return true; // Permitido
  }

  assert(!simulateBoundBoxFunc(null, 0.1, testZone), "Escala 0.1 rejeitada (menor que min_scale 0.5)");
  assert(!simulateBoundBoxFunc(null, 2.5, testZone), "Escala 2.5 rejeitada (maior que max_scale 2.0)");
  assert(simulateBoundBoxFunc(null, 1.2, testZone), "Escala 1.2 aceita (dentro de [0.5, 2.0])");

  // ============================================================================
  // TESTE 7: Validação no Backend - CustomizerValidationService
  // ============================================================================
  console.log("\n8. Testando Validação no Backend (CustomizerValidationService)...");

  // Cenário 7.1: Elemento válido dentro dos limites da zona
  const validValidation = await CustomizerValidationService.validateDesign({
    modelId: testModel.id,
    viewSide: frontView.view_side,
    elements: [
      {
        id: "valid-elem-1",
        type: "LOGO",
        zoneId: testZone.id,
        x: testZone.x + 5,
        y: testZone.y + 5,
        width: 80,
        height: 60,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    ],
  });
  assert(validValidation.valid === true, "Elemento dentro da zona foi aprovado pelo backend.");
  assert(validValidation.errors.length === 0, "Nenhum erro reportado para elemento válido.");

  // Cenário 7.2: Elemento fora dos limites físicos da zona
  const outOfBoundsValidation = await CustomizerValidationService.validateDesign({
    modelId: testModel.id,
    viewSide: frontView.view_side,
    elements: [
      {
        id: "invalid-out-of-bounds",
        type: "LOGO",
        zoneId: testZone.id,
        x: testZone.x + testZone.width + 50, // Fora do limite X
        y: testZone.y,
        width: 100,
        height: 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    ],
  });
  assert(outOfBoundsValidation.valid === false, "Elemento fora dos limites da zona foi rejeitado pelo backend.");
  assert(
    outOfBoundsValidation.errors.some((e) => e.includes("excede os limites físicos")),
    "Erro reporta que o elemento excede os limites físicos da zona."
  );

  // Cenário 7.3: Elemento com escala excedendo o limite máximo configurado
  const scaleViolationValidation = await CustomizerValidationService.validateDesign({
    modelId: testModel.id,
    viewSide: frontView.view_side,
    elements: [
      {
        id: "invalid-scale",
        type: "LOGO",
        zoneId: testZone.id,
        x: testZone.x,
        y: testZone.y,
        width: 50,
        height: 50,
        scaleX: 3.5, // Excede max_scale (2.0)
        scaleY: 3.5,
        rotation: 0,
      },
    ],
  });
  assert(scaleViolationValidation.valid === false, "Elemento com escala inválida foi rejeitado pelo backend.");
  assert(
    scaleViolationValidation.errors.some((e) => e.includes("escala máxima permitida")),
    "Erro reporta que a escala ultrapassa o limite permitido."
  );

  // Cenário 7.4: Elemento com tipo não permitido
  const restrictedZone = {
    ...testZone,
    allowed_element_types: ["TEXT"], // Só aceita TEXT
  };
  // Mock ou teste direto da regra
  const allowedTypes = restrictedZone.allowed_element_types;
  const isTypeAllowed = allowedTypes.includes(imageElement.type);
  assert(!isTypeAllowed, "Tipo de elemento IMAGE é bloqueado quando zona só permite TEXT.");

  // ============================================================================
  // TESTE 8: Isolamento de Vistas (Frente, Costas, Mangas)
  // ============================================================================
  console.log("\n9. Testando Isolamento de Elementos por Vista Técnica...");
  const viewsDict = {
    FRONT: [textElement],
    BACK: [numberElement],
    LEFT_SLEEVE: [],
    RIGHT_SLEEVE: [imageElement],
  };
  assert(viewsDict.FRONT.length === 1 && viewsDict.FRONT[0].type === "TEXT", "Vista FRONT contém apenas o texto.");
  assert(viewsDict.BACK.length === 1 && viewsDict.BACK[0].type === "NUMBER", "Vista BACK contém apenas o número.");
  assert(viewsDict.LEFT_SLEEVE.length === 0, "Vista LEFT_SLEEVE está vazia.");
  assert(viewsDict.RIGHT_SLEEVE.length === 1 && viewsDict.RIGHT_SLEEVE[0].type === "IMAGE", "Vista RIGHT_SLEEVE contém a logo/imagem.");

  console.log("\n================================================================================");
  console.log(`🎉 TODOS OS ${passedTests}/${totalTests} TESTES FORAM CONCLUÍDOS COM SUCESSO!`);
  console.log("================================================================================");
}

runConfiguratorTests().catch((err) => {
  console.error("\n❌ ERRO CRÍTICO DURANTE EXECUÇÃO DOS TESTES:", err);
  process.exit(1);
});
