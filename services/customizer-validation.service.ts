import { UniformModelService } from "@/services/uniform-model.service";
import type { CustomizerElement, ValidationResult, ViewSide } from "@/types/configurator";

export class CustomizerValidationService {
  /**
   * Validação completa e estrita no backend:
   * 1. Verifica existência do modelo e vista
   * 2. Verifica se o elemento está dentro da zona técnica permitida
   * 3. Verifica se a escala respeita min_scale e max_scale configurados no banco
   * 4. Verifica se o tipo de elemento (LOGO, TEXT, NUMBER, IMAGE) é aceito na zona
   */
  static async validateDesign(params: {
    modelId: string;
    viewSide: ViewSide;
    elements: CustomizerElement[];
  }): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const model = await UniformModelService.getModelById(params.modelId);
    if (!model) {
      return {
        valid: false,
        errors: ["Modelo de uniforme não encontrado no sistema."],
      };
    }

    const view = model.views?.find(
      (v) => v.view_side.toUpperCase() === params.viewSide.toUpperCase()
    );

    if (!view) {
      return {
        valid: false,
        errors: [`A vista "${params.viewSide}" não está cadastrada para o modelo "${model.name}".`],
      };
    }

    const zones = view.zones || [];

    for (const elem of params.elements) {
      const zone = zones.find((z) => z.id === elem.zoneId);

      if (!zone) {
        errors.push(
          `Elemento ${elem.type} (${elem.id}) não está vinculado a uma zona de personalização válida desta vista.`
        );
        continue;
      }

      // 1. Validar Tipo de Elemento Permitido
      const allowedTypes = zone.allowed_element_types || ["LOGO", "TEXT", "NUMBER", "IMAGE"];
      if (!allowedTypes.includes(elem.type)) {
        errors.push(
          `O elemento "${elem.type}" não é permitido na zona "${zone.zone_name}". Tipos aceitos: ${allowedTypes.join(", ")}.`
        );
      }

      // 2. Validar Escala Mínima e Máxima
      const effectiveScaleX = elem.scaleX ?? 1;
      const effectiveScaleY = elem.scaleY ?? 1;
      const minScale = zone.min_scale ?? 0.2;
      const maxScale = zone.max_scale ?? 3.0;

      // Tolerância matemática para arredondamento
      if (effectiveScaleX < minScale - 0.02 || effectiveScaleY < minScale - 0.02) {
        errors.push(
          `A escala do elemento "${elem.type}" (${Math.min(effectiveScaleX, effectiveScaleY).toFixed(2)}) é menor que a escala mínima permitida (${minScale}) na zona "${zone.zone_name}".`
        );
      }

      if (effectiveScaleX > maxScale + 0.02 || effectiveScaleY > maxScale + 0.02) {
        errors.push(
          `A escala do elemento "${elem.type}" (${Math.max(effectiveScaleX, effectiveScaleY).toFixed(2)}) ultrapassa a escala máxima permitida (${maxScale}) na zona "${zone.zone_name}".`
        );
      }

      // 3. Validar Limites Físicos da Zona (Elemento não pode sair da zona)
      const elemWidth = (elem.width || 100) * effectiveScaleX;
      const elemHeight = (elem.height || 100) * effectiveScaleY;
      const elemLeft = elem.x;
      const elemTop = elem.y;
      const elemRight = elemLeft + elemWidth;
      const elemBottom = elemTop + elemHeight;

      const zoneLeft = zone.x;
      const zoneTop = zone.y;
      const zoneRight = zone.x + zone.width;
      const zoneBottom = zone.y + zone.height;

      const tolerance = 5; // 5px de tolerância para encaixe e suavidade

      if (
        elemLeft < zoneLeft - tolerance ||
        elemTop < zoneTop - tolerance ||
        elemRight > zoneRight + tolerance ||
        elemBottom > zoneBottom + tolerance
      ) {
        errors.push(
          `O elemento "${elem.type}" excede os limites físicos da zona "${zone.zone_name}". Posição atual: [${elemLeft.toFixed(0)}, ${elemTop.toFixed(0)} - ${elemRight.toFixed(0)}, ${elemBottom.toFixed(0)}], Limite da zona: [${zoneLeft}, ${zoneTop} - ${zoneRight}, ${zoneBottom}].`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
