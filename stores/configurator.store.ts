import { create } from "zustand";
import type { FabricColor, CustomizerElement, ViewSide } from "@/types/configurator";
import type { UniformModel, CustomizationZone } from "@/types/uniform-model";
import type { SerializableProjectConfig } from "@/types/projects";
import type { TeamRoster, TeamMemberItem, TeamRosterSummary } from "@/types/team";

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

  // Gestão de Projeto Salvo (Meus Projetos)
  currentProjectId: string | null;
  projectName: string;
  quantity: number;
  setCurrentProjectId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  setQuantity: (quantity: number) => void;
  loadProjectState: (
    config: SerializableProjectConfig,
    projectId?: string,
    projectName?: string
  ) => void;
  getSerializableConfig: () => SerializableProjectConfig;
  resetProject: () => void;

  // Gestão de Equipe & Grade do Pedido
  teamRoster: TeamRoster;
  previewMemberId: string | null;
  addTeamMember: (member: Omit<TeamMemberItem, "id">) => TeamMemberItem;
  updateTeamMember: (id: string, updates: Partial<TeamMemberItem>) => void;
  removeTeamMember: (id: string) => void;
  duplicateTeamMember: (id: string) => TeamMemberItem | null;
  importTeamMembers: (rawText: string) => { added: number; errors: string[] };
  clearTeamRoster: () => void;
  setTeamRosterEnabled: (enabled: boolean) => void;
  getTeamRosterSummary: () => TeamRosterSummary;
  setPreviewMemberId: (id: string | null) => void;
  getActivePreviewMember: () => TeamMemberItem | null;

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

const defaultInitialModels: UniformModel[] = [
  {
    id: "model-camisa-tradicional-01",
    name: "Camiseta Tradicional Meia Malha / Dry Fit",
    description: "Modelo clássico de alta durabilidade com gola em ribana e caimento anatômico.",
    product_id: null,
    base_asset_url: "/assets/templates/front.svg",
    is_active: true,
    created_at: new Date().toISOString(),
    views: [
      {
        id: "view-trad-front",
        shirt_model_id: "model-camisa-tradicional-01",
        view_side: "FRONT",
        preview_image_url: "/assets/templates/front.svg",
        canvas_width: 800,
        canvas_height: 800,
        sort_order: 1,
        zones: [
          {
            id: "zone-peito-esq",
            shirt_view_id: "view-trad-front",
            zone_name: "Peito Esquerdo (Logo)",
            zone_type: "PEITO_ESQUERDO",
            x: 440,
            y: 200,
            width: 95,
            height: 95,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            id: "zone-peito-dir",
            shirt_view_id: "view-trad-front",
            zone_name: "Peito Direito",
            zone_type: "PEITO_DIREITO",
            x: 265,
            y: 200,
            width: 95,
            height: 95,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            id: "zone-centro-front",
            shirt_view_id: "view-trad-front",
            zone_name: "Centro Frontal (Estampa)",
            zone_type: "CENTRO_FRONTAL",
            x: 275,
            y: 230,
            width: 250,
            height: 340,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.5,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
            is_active: true,
          },
        ],
      },
      {
        id: "view-trad-back",
        shirt_model_id: "model-camisa-tradicional-01",
        view_side: "BACK",
        preview_image_url: "/assets/templates/back.svg",
        canvas_width: 800,
        canvas_height: 800,
        sort_order: 2,
        zones: [
          {
            id: "zone-costas",
            shirt_view_id: "view-trad-back",
            zone_name: "Costas - Estampa / Número",
            zone_type: "COSTAS",
            x: 270,
            y: 180,
            width: 260,
            height: 390,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.5,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
            is_active: true,
          },
        ],
      },
    ],
  },
  {
    id: "model-camisa-polo-02",
    name: "Camisa Polo Empresarial Piquet",
    description: "Acabamento nobre com gola polo estruturada, peitilho com 2 botões e mangas com punho canelado.",
    product_id: null,
    base_asset_url: "/assets/templates/front.svg",
    is_active: true,
    created_at: new Date().toISOString(),
    views: [
      {
        id: "view-polo-front",
        shirt_model_id: "model-camisa-polo-02",
        view_side: "FRONT",
        preview_image_url: "/assets/templates/front.svg",
        canvas_width: 800,
        canvas_height: 800,
        sort_order: 1,
        zones: [
          {
            id: "zone-polo-peito-esq",
            shirt_view_id: "view-polo-front",
            zone_name: "Peito Esquerdo (Bordado / Logo)",
            zone_type: "PEITO_ESQUERDO",
            x: 440,
            y: 200,
            width: 95,
            height: 95,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            id: "zone-polo-peito-dir",
            shirt_view_id: "view-polo-front",
            zone_name: "Peito Direito",
            zone_type: "PEITO_DIREITO",
            x: 265,
            y: 200,
            width: 95,
            height: 95,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            id: "zone-polo-centro",
            shirt_view_id: "view-polo-front",
            zone_name: "Centro Frontal",
            zone_type: "CENTRO_FRONTAL",
            x: 275,
            y: 310,
            width: 250,
            height: 280,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.2,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
        ],
      },
      {
        id: "view-polo-back",
        shirt_model_id: "model-camisa-polo-02",
        view_side: "BACK",
        preview_image_url: "/assets/templates/back.svg",
        canvas_width: 800,
        canvas_height: 800,
        sort_order: 2,
        zones: [
          {
            id: "zone-polo-costas",
            shirt_view_id: "view-polo-back",
            zone_name: "Costas - Estampa / Logo",
            zone_type: "COSTAS",
            x: 270,
            y: 200,
            width: 260,
            height: 380,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.5,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
            is_active: true,
          },
        ],
      },
    ],
  },
  {
    id: "model-camisa-manga-longa-03",
    name: "Camisa Manga Longa Operacional / Proteção UV",
    description: "Mangas longas até os punhos com acabamento em ribana.",
    product_id: null,
    base_asset_url: "/assets/templates/front.svg",
    is_active: true,
    created_at: new Date().toISOString(),
    views: [
      {
        id: "view-manga-longa-front",
        shirt_model_id: "model-camisa-manga-longa-03",
        view_side: "FRONT",
        preview_image_url: "/assets/templates/front.svg",
        canvas_width: 800,
        canvas_height: 800,
        sort_order: 1,
        zones: [
          {
            id: "zone-ml-peito-esq",
            shirt_view_id: "view-manga-longa-front",
            zone_name: "Peito Esquerdo",
            zone_type: "PEITO_ESQUERDO",
            x: 440,
            y: 200,
            width: 95,
            height: 95,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            id: "zone-ml-peito-dir",
            shirt_view_id: "view-manga-longa-front",
            zone_name: "Peito Direito",
            zone_type: "PEITO_DIREITO",
            x: 265,
            y: 200,
            width: 95,
            height: 95,
            rotation: 0,
            min_scale: 0.2,
            max_scale: 2.0,
            allowed_element_types: ["LOGO", "TEXT", "IMAGE"],
            is_active: true,
          },
          {
            id: "zone-ml-centro",
            shirt_view_id: "view-manga-longa-front",
            zone_name: "Centro Frontal",
            zone_type: "CENTRO_FRONTAL",
            x: 275,
            y: 230,
            width: 250,
            height: 340,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.5,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
            is_active: true,
          },
        ],
      },
      {
        id: "view-manga-longa-back",
        shirt_model_id: "model-camisa-manga-longa-03",
        view_side: "BACK",
        preview_image_url: "/assets/templates/back.svg",
        canvas_width: 800,
        canvas_height: 800,
        sort_order: 2,
        zones: [
          {
            id: "zone-ml-costas",
            shirt_view_id: "view-manga-longa-back",
            zone_name: "Costas Completa",
            zone_type: "COSTAS",
            x: 270,
            y: 180,
            width: 260,
            height: 390,
            rotation: 0,
            min_scale: 0.3,
            max_scale: 2.5,
            allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"],
            is_active: true,
          },
        ],
      },
    ],
  },
];

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  models: defaultInitialModels,
  selectedModel: defaultInitialModels[0],
  selectedColor: FABRIC_COLORS[0],
  selectedViewSide: "FRONT",
  elements: initialElements,
  selectedElementId: null,
  showZones: true,
  history: [initialElements],
  historyIndex: 0,
  currentProjectId: null,
  projectName: "Meu Uniforme Personalizado",
  quantity: 10,
  teamRoster: {
    enabled: false,
    members: [],
  },
  previewMemberId: null,

  setModels: (models) => {
    if (models && models.length > 0) {
      set({ models });
      const current = get().selectedModel;
      if (!current || !models.some((m) => m.id === current.id)) {
        get().selectModel(models[0]);
      }
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

  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  setProjectName: (name) => set({ projectName: name }),
  setQuantity: (quantity) => set({ quantity }),

  loadProjectState: (config, projectId, projectName) => {
    const { models } = get();
    const matchedModel = models.find((m) => m.id === config.modelId) || null;

    const restoredElements: Record<ViewSide, CustomizerElement[]> = {
      FRONT: config.views?.FRONT || [],
      BACK: config.views?.BACK || [],
      LEFT_SLEEVE: config.views?.LEFT_SLEEVE || [],
      RIGHT_SLEEVE: config.views?.RIGHT_SLEEVE || [],
      OTHER: config.views?.OTHER || [],
    };

    const restoredRoster = config.teamRoster || {
      enabled: false,
      members: [],
    };

    set({
      currentProjectId: projectId || null,
      projectName: projectName || config.modelName || "Meu Uniforme Personalizado",
      quantity:
        restoredRoster.enabled && restoredRoster.members.length > 0
          ? restoredRoster.members.length
          : config.quantity || 10,
      selectedModel: matchedModel || get().selectedModel,
      selectedColor: config.color || FABRIC_COLORS[0],
      selectedViewSide: "FRONT",
      elements: restoredElements,
      selectedElementId: null,
      teamRoster: restoredRoster,
      previewMemberId: null,
      history: [restoredElements],
      historyIndex: 0,
    });
  },

  getSerializableConfig: () => {
    const { selectedModel, selectedColor, quantity, elements, teamRoster } = get();
    return {
      version: 1,
      modelId: selectedModel?.id || "",
      modelName: selectedModel?.name || "Uniforme Personalizado",
      productId: selectedModel?.product_id || null,
      productName: selectedModel?.product_name || null,
      color: selectedColor,
      quantity,
      views: elements,
      teamRoster,
    };
  },

  resetProject: () => {
    set({
      currentProjectId: null,
      projectName: "Meu Uniforme Personalizado",
      quantity: 10,
      elements: initialElements,
      selectedElementId: null,
      teamRoster: { enabled: false, members: [] },
      previewMemberId: null,
      history: [initialElements],
      historyIndex: 0,
    });
  },

  addTeamMember: (memberData) => {
    const id = `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMember: TeamMemberItem = {
      ...memberData,
      id,
      name: memberData.name.trim(),
      size: (memberData.size || "M").trim().toUpperCase(),
    };
    const currentRoster = get().teamRoster;
    const newMembers = [...currentRoster.members, newMember];
    set({
      teamRoster: {
        enabled: true,
        members: newMembers,
      },
      quantity: newMembers.length,
    });
    return newMember;
  },

  updateTeamMember: (id, updates) => {
    const { teamRoster } = get();
    const idx = teamRoster.members.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const updated = [...teamRoster.members];
    updated[idx] = {
      ...updated[idx],
      ...updates,
      ...(updates.size ? { size: updates.size.trim().toUpperCase() } : {}),
      ...(updates.name ? { name: updates.name.trim() } : {}),
    };
    set({
      teamRoster: {
        ...teamRoster,
        members: updated,
      },
    });
  },

  removeTeamMember: (id) => {
    const { teamRoster, previewMemberId } = get();
    const newMembers = teamRoster.members.filter((m) => m.id !== id);
    set({
      teamRoster: {
        ...teamRoster,
        members: newMembers,
        enabled: newMembers.length > 0,
      },
      quantity: Math.max(1, newMembers.length),
      previewMemberId: previewMemberId === id ? null : previewMemberId,
    });
  },

  duplicateTeamMember: (id) => {
    const { teamRoster } = get();
    const member = teamRoster.members.find((m) => m.id === id);
    if (!member) return null;
    const newId = `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const duplicated: TeamMemberItem = {
      ...member,
      id: newId,
      name: `${member.name} (2)`,
    };
    const newMembers = [...teamRoster.members, duplicated];
    set({
      teamRoster: {
        ...teamRoster,
        members: newMembers,
      },
      quantity: newMembers.length,
    });
    return duplicated;
  },

  importTeamMembers: (rawText: string) => {
    const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const newMembers: TeamMemberItem[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      let parts: string[] = [];
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

      newMembers.push({
        id: `member-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 5)}`,
        name,
        size,
        number,
        sector,
        notes,
      });
    });

    if (newMembers.length > 0) {
      const current = get().teamRoster.members;
      const allMembers = [...current, ...newMembers];
      set({
        teamRoster: {
          enabled: true,
          members: allMembers,
        },
        quantity: allMembers.length,
      });
    }

    return { added: newMembers.length, errors };
  },

  clearTeamRoster: () => {
    set({
      teamRoster: {
        enabled: false,
        members: [],
      },
      previewMemberId: null,
    });
  },

  setTeamRosterEnabled: (enabled: boolean) => {
    set((state) => ({
      teamRoster: {
        ...state.teamRoster,
        enabled,
      },
    }));
  },

  getTeamRosterSummary: () => {
    const { teamRoster } = get();
    const sizeBreakdown: Record<string, number> = {};
    teamRoster.members.forEach((m) => {
      const s = (m.size || "M").toUpperCase();
      sizeBreakdown[s] = (sizeBreakdown[s] || 0) + 1;
    });
    return {
      sizeBreakdown,
      totalMembers: teamRoster.members.length,
    };
  },

  setPreviewMemberId: (id) => set({ previewMemberId: id }),

  getActivePreviewMember: () => {
    const { teamRoster, previewMemberId } = get();
    if (!previewMemberId) return null;
    return teamRoster.members.find((m) => m.id === previewMemberId) || null;
  },

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
