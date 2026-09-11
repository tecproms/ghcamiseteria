// Tipos para o Módulo de Equipe & Grade do Pedido
// GH Camiseteria & Uniformes Personalizados

export type UniformSize = "PP" | "P" | "M" | "G" | "GG" | "XG" | "XXG" | string;

export const STANDARD_UNIFORM_SIZES: UniformSize[] = [
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "XG",
  "XXG",
];

export interface TeamMemberItem {
  id: string;
  name: string;             // Ex: "João"
  size: UniformSize;        // Ex: "M"
  number?: string;          // Ex: "10"
  sector?: string;          // Ex: "Comercial"
  notes?: string;           // Ex: "Manga com punho reforçado"
  // Preparação arquitetural para futuras diferenças individuais quando necessário
  customOverrides?: {
    individualElements?: Record<string, unknown>;
  };
}

export interface TeamRosterSummary {
  sizeBreakdown: Record<string, number>; // Ex: { PP: 2, P: 5, M: 12, G: 10, GG: 3 }
  totalMembers: number;                  // Ex: 32
}

export interface TeamRoster {
  enabled: boolean;
  members: TeamMemberItem[];
}
