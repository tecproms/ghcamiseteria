export type UserRole = "cliente" | "admin" | "producao" | "atendimento";

export type UserProfile = {
  id: string;
  email: string;
  nome_completo: string;
  telefone?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type AuthSession = {
  user: UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
};
