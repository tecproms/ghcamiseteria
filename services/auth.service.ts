import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/auth";

export class AuthService {
  private static getClient() {
    return createClient();
  }

  static async signIn(email: string, password: string) {
    const supabase = this.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  static async signUp(email: string, password: string, nomeCompleto: string) {
    const supabase = this.getClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome_completo: nomeCompleto,
        },
      },
    });
    if (error) throw error;
    return data;
  }

  static async signOut() {
    const supabase = this.getClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const supabase = this.getClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
