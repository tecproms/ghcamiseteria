// Validação de Criação, Edição e Exclusão de Modelos e Zonas de Personalização
// GH Camiseteria & Uniformes Personalizados

import { UniformModelService } from "../services/uniform-model.service.js";

async function runValidation() {
  console.log("=== INICIANDO VALIDAÇÃO DE MODELOS E ZONAS ===");

  // 1. Criação de Modelo
  console.log("\n1. Testando Criação de Modelo...");
  const newModel = await UniformModelService.createModel({
    name: "Camiseta Polo Dry Fit Tech",
    description: "Polo esportiva corporativa com alta respirabilidade e costura reforçada.",
    product_id: null,
    base_asset_url: "/assets/templates/front.svg",
    is_active: true,
  });

  if (!newModel || !newModel.id) {
    throw new Error("Falha ao criar modelo!");
  }
  console.log("✓ Modelo criado com sucesso:", newModel.id, newModel.name);

  // 2. Verificar Vistas geradas (FRONT, BACK, LEFT_SLEEVE, RIGHT_SLEEVE)
  console.log("\n2. Verificando Vistas Técnicas...");
  const views = newModel.views || [];
  const sides = views.map((v) => v.view_side);
  console.log("  Vistas encontradas:", sides);
  if (!sides.includes("FRONT") || !sides.includes("BACK") || !sides.includes("LEFT_SLEEVE") || !sides.includes("RIGHT_SLEEVE")) {
    throw new Error("Vistas padrão não foram criadas corretamente!");
  }
  console.log("✓ Todas as 4 vistas técnicas (FRONT, BACK, LEFT_SLEEVE, RIGHT_SLEEVE) estão presentes.");

  // 3. Edição de Modelo
  console.log("\n3. Testando Edição de Modelo...");
  const updatedModel = await UniformModelService.updateModel(newModel.id, {
    name: "Camiseta Polo Dry Fit Tech Pro (Atualizado)",
    description: "Descrição atualizada para teste de homologação.",
  });
  if (!updatedModel || updatedModel.name !== "Camiseta Polo Dry Fit Tech Pro (Atualizado)") {
    throw new Error("Falha ao atualizar dados do modelo!");
  }
  console.log("✓ Modelo atualizado com sucesso:", updatedModel.name);

  // 4. Criação de Zona de Personalização
  console.log("\n4. Testando Criação de Zona de Personalização...");
  const frontView = views.find((v) => v.view_side === "FRONT");
  if (!frontView) throw new Error("Vista frontal não encontrada!");

  const newZone = await UniformModelService.createZone({
    shirt_view_id: frontView.id,
    zone_name: "Emblema Peito Esquerdo Superior",
    zone_type: "PEITO_ESQUERDO",
    x: 450,
    y: 200,
    width: 120,
    height: 120,
    rotation: 15,
    min_scale: 0.25,
    max_scale: 2.20,
    allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
    is_active: true,
  });

  if (!newZone || !newZone.id) {
    throw new Error("Falha ao criar zona de personalização!");
  }
  console.log("✓ Zona criada com sucesso:", newZone.id, newZone.zone_name, `[Posição: ${newZone.x}x${newZone.y}, Rotação: ${newZone.rotation}°, Escalas: ${newZone.min_scale} - ${newZone.max_scale}]`);

  // 5. Edição de Zona de Personalização
  console.log("\n5. Testando Edição de Zona de Personalização...");
  const updatedZone = await UniformModelService.updateZone(newZone.id, {
    zone_name: "Emblema Peito Esquerdo (Reposicionado)",
    x: 470,
    y: 210,
    rotation: 0,
    max_scale: 2.80,
  });

  if (!updatedZone || updatedZone.x !== 470 || updatedZone.rotation !== 0) {
    throw new Error("Falha ao atualizar zona de personalização!");
  }
  console.log("✓ Zona atualizada com sucesso:", updatedZone.zone_name, `[Nova Posição: ${updatedZone.x}x${updatedZone.y}, Rotação: ${updatedZone.rotation}°]`);

  // 6. Exclusão de Zona de Personalização
  console.log("\n6. Testando Exclusão de Zona...");
  const zoneDeleted = await UniformModelService.deleteZone(newZone.id);
  if (!zoneDeleted) throw new Error("Falha ao excluir zona!");
  console.log("✓ Zona excluída com sucesso.");

  // 7. Exclusão de Modelo
  console.log("\n7. Testando Exclusão de Modelo...");
  const modelDeleted = await UniformModelService.deleteModel(newModel.id);
  if (!modelDeleted) throw new Error("Falha ao excluir modelo!");
  console.log("✓ Modelo excluído com sucesso.");

  console.log("\n=== TODAS AS VALIDAÇÕES FORAM CONCLUÍDAS COM SUCESSO! ===");
}

runValidation().catch((err) => {
  console.error("ERRO NA VALIDAÇÃO:", err);
  process.exit(1);
});
