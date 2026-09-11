import { createClient } from "@/lib/supabase/client";
import type { UserProfile, UserRole } from "@/types/auth";

export class AuthService {
  private static getClient() {
    return createClient();
  }

  static async signIn(email: string, password: string) {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "E-mail ou senha incorretos.");
      }
      return {
        user: data.user,
        session: data.session,
      };
    } catch (err) {
      if (err instanceof Error && !err.message.includes("fetch")) {
        throw err;
      }
      const supabase = this.getClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      return data;
    }
  }

  static async signUp(params: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: UserRole;
  }) {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha ao criar conta.");
      }
      return {
        user: data.user,
        session: data.session,
      };
    } catch (err) {
      if (err instanceof Error && !err.message.includes("fetch")) {
        throw err;
      }
      const supabase = this.getClient();
      const { data, error } = await supabase.auth.signUp({
        email: params.email.trim().toLowerCase(),
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            phone: params.phone || null,
            role: params.role || "cliente",
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email: params.email.trim().toLowerCase(),
            full_name: params.fullName,
            phone: params.phone || null,
            role: (params.role || "cliente") as UserRole,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
        if (profileError) {
          console.warn("Aviso ao sincronizar profiles:", profileError.message);
        }
      }

      return data;
    }
  }

  static async signOut() {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // Ignora erro de rede local
    }
    try {
      const supabase = this.getClient();
      await supabase.auth.signOut();
    } catch {
      // Ignora erro se supabase for placeholder
    }
  }

  static async resetPasswordForEmail(email: string, redirectTo?: string) {
    const supabase = this.getClient();
    const targetRedirect =
      redirectTo ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=/redefinir-senha`
        : "/auth/callback?next=/redefinir-senha");

    const { data, error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: targetRedirect,
      }
    );
    if (error) throw error;
    return data;
  }

  static async updatePassword(newPassword: string) {
    const supabase = this.getClient();
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  }

  static async getCurrentUser() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        return data.user;
      }
    } catch {
      // Fallback para cliente Supabase
    }

    const supabase = this.getClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  }

  static async getProfile(userId?: string): Promise<UserProfile | null> {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.profile) {
        if (!userId || data.profile.id === userId) {
          return data.profile as UserProfile;
        }
      }
    } catch {
      // Fallback
    }

    if (!userId) return null;

    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data as UserProfile | null;
  }

  static async updateProfile(
    userId: string,
    updates: { full_name?: string; phone?: string | null; avatar_url?: string | null }
  ): Promise<UserProfile | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return data as UserProfile;
  }
}

