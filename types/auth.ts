export type UserRole =
  | "cliente"
  | "customer"
  | "admin"
  | "gerente"
  | "manager"
  | "producao"
  | "atendimento";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type AuthSession = {
  user: UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
};

export function isRoleAdminOrManager(role?: string | null): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return r === "admin" || r === "manager" || r === "gerente";
}

export function isRoleCustomer(role?: string | null): boolean {
  if (!role) return true;
  const r = role.toLowerCase();
  return r === "cliente" || r === "customer";
}

export function formatRoleLabel(role?: string | null): string {
  if (!role) return "Cliente";
  const r = role.toLowerCase();
  if (r === "admin") return "Administrador";
  if (r === "manager" || r === "gerente") return "Gerente";
  if (r === "producao") return "Produção";
  if (r === "atendimento") return "Atendimento";
  return "Cliente";
}

