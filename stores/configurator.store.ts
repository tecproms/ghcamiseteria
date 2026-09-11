import { create } from "zustand";
import type {
  FabricColor,
  CustomizerElement,
  ViewSide,
} from "@/types/configurator";
import type { UniformModel, CustomizationZone } from "@/types/uniform-model";

export const FABRIC_COLORS: FabricColor[] = [
  { id: "white", name: "Branco Neve", hex: "#FFFFFF", textColor: "#000000" },
  { id: "black", name: "Preto Nobre", hex: "#18181B", textColor: "#FFFFFF" },
  { id: "navy", name: "Azul Marinho", hex: "#1E293B", textColor: "#FFFFFF" },
  { id: "royal", name: "Azul Royal", hex: "#2563EB", textColor: "#FFFFFF" },
  { id: "gray", name: "Cinza Mescla", hex: "#94A3B8", textColor: "#000000" },
  { id: "red", name: "Vermelho Cardinal", hex: "#DC2626", textColor: "#FFFFFF" },
  { id: "bordeaux", name: "Bordô / Vinho", hex: "#881337", textColor: "#FFFFFF" },
  { id: "green", name: "Verde Floresta", hex: "#166534", textColor: "#FFFFFF" },
  { id: "yellow", name: "Amarelo Ouro", hex: "#F59E0B", textColor: "#000000" },
  { id: "orange", name: "Laranja Vibrante", hex: "#EA580C", textColor: "#FFFFFF" },
];

export const AVAILABLE_FONTS = [
  { id: "Arial", label: "Arial (Moderna)" },
  { id: "Impact", label: "Impact (Esportiva / Bold)" },
  { id: "Montserrat", label: "Montserrat (Geométrica)" },
  { id: "Roboto", label: "Roboto (Corporativa)" },
  { id: "Bebas Neue", label: "Bebas Neue (Condensada)" },
  { id: "Times New Roman", label: "Times New Roman (Clássica)" },
];

interface ConfiguratorStore {
  models: UniformModel[];
  selectedModel: UniformModel | null;
  selectedColor: FabricColor;
  selectedViewSide: ViewSide;
  elements: Record<ViewSide, CustomizerElement[]>;
  selectedElementId: string | null;
  showZones: boolean;
  history: Record<ViewSide, CustomizerElement[]>[];
  historyIndex: number;

  // Ações
  setModels: (models: UniformModel[]) => void;
  selectModel: (model: UniformModel) => void;
  selectColor: (color: FabricColor) => void;
  selectViewSide: (side: ViewSide) => void;
  selectElement: (id: string | null) => void;
  toggleShowZones: () => void;

  // Gestão de Elementos
  addElement: (element: Omit<CustomizerElement, "id">, zone: CustomizationZone) => { success: boolean; error?: string };
  updateElement: (id: string, updates: Partial<CustomizerElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;

  // Histórico
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Helpers
  getActiveViewZones: () => CustomizationZone[];
  getSelectedElement: () => CustomizerElement | null;
}

const initialElements: Record<ViewSide, CustomizerElement[]> = {
  FRONT: [],
  BACK: [],
  LEFT_SLEEVE: [],
  RIGHT_SLEEVE: [],
  OTHER: [],
};

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  models: [],
  selectedModel: null,
  selectedColor: FABRIC_COLORS[0],
  selectedViewSide: "FRONT",
  elements: initialElements,
  selectedElementId: null,
  showZones: true,
  history: [initialElements],
  historyIndex: 0,

  setModels: (models) => {
    set({ models });
    if (models.length > 0 && !get().selectedModel) {
      get().selectModel(models[0]);
    }
  },

  selectModel: (model) => {
    set({
      selectedModel: model,
      selectedViewSide: "FRONT",
      selectedElementId: null,
    });
  },

  selectColor: (color) => {
    set({ selectedColor: color });
  },

  selectViewSide: (side) => {
    set({
      selectedViewSide: side,
      selectedElementId: null,
    });
  },

  selectElement: (id) => {
    set({ selectedElementId: id });
  },

  toggleShowZones: () => {
    set((state) => ({ showZones: !state.showZones }));
  },

  addElement: (elementData, zone) => {
    // Validação estrita: elemento compatível com o tipo permitido da zona
    const allowed = zone.allowed_element_types || ["LOGO", "TEXT", "NUMBER", "IMAGE"];
    if (!allowed.includes(elementData.type)) {
      return {
        success: false,
        error: `A zona "${zone.zone_name}" não aceita elementos do tipo ${elementData.type}. Tipos permitidos: ${allowed.join(", ")}.`,
      };
    }

    const { selectedViewSide, elements, history, historyIndex } = get();
    const newId = `elem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newElement: CustomizerElement = {
      ...elementData,
      id: newId,
      zoneId: zone.id,
      viewSide: selectedViewSide,
    };

    const nextElements = {
      ...elements,
      [selectedViewSide]: [...(elements[selectedViewSide] || []), newElement],
    };

    // Atualizar histórico imutável
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextElements);

    set({
      elements: nextElements,
      selectedElementId: newId,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });

    return { success: true };
  },

  updateElement: (id, updates) => {
    const { selectedViewSide, elements, history, historyIndex } = get();
    const currentList = elements[selectedViewSide] || [];
    const idx = currentList.findIndex((el) => el.id === id);
    if (idx === -1) return;

    const updatedElement = { ...currentList[idx], ...updates };
    const updatedList = [...currentList];
    updatedList[idx] = updatedElement;

    const nextElements = {
      ...elements,
      [selectedViewSide]: updatedList,
    };

    // Atualizar estado sem poluir histórico se for apenas micro-passo de drag contínuo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextElements);

    set({
      elements: nextElements,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  deleteElement: (id) => {
    const { selectedViewSide, elements, history, historyIndex } = get();
    const currentList = elements[selectedViewSide] || [];
    const nextList = currentList.filter((el) => el.id !== id);

    const nextElements = {
      ...elements,
      [selectedViewSide]: nextList,
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextElements);

    set({
      elements: nextElements,
      selectedElementId: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  duplicateElement: (id) => {
    const { selectedViewSide, elements, history, historyIndex } = get();
    const currentList = elements[selectedViewSide] || [];
    const target = currentList.find((el) => el.id === id);
    if (!target) return;

    const newId = `elem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const duplicated: CustomizerElement = {
      ...target,
      id: newId,
      x: target.x + 15,
      y: target.y + 15,
    };

    const nextElements = {
      ...elements,
      [selectedViewSide]: [...currentList, duplicated],
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextElements);

    set({
      elements: nextElements,
      selectedElementId: newId,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      set({
        elements: history[prevIndex],
        historyIndex: prevIndex,
        selectedElementId: null,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({
        elements: history[nextIndex],
        historyIndex: nextIndex,
        selectedElementId: null,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  getActiveViewZones: () => {
    const { selectedModel, selectedViewSide } = get();
    if (!selectedModel || !selectedModel.views) return [];
    const view = selectedModel.views.find(
      (v) => v.view_side.toUpperCase() === selectedViewSide.toUpperCase()
    );
    return view?.zones || [];
  },

  getSelectedElement: () => {
    const { selectedViewSide, elements, selectedElementId } = get();
    if (!selectedElementId) return null;
    const list = elements[selectedViewSide] || [];
    return list.find((el) => el.id === selectedElementId) || null;
  },
}));
