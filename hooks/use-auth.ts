"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isRoleAdminOrManager, isRoleCustomer, type UserProfile } from "@/types/auth";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    return data as UserProfile | null;
  };

  useEffect(() => {
    const supabase = createClient();

    async function getUserData() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setProfile(data.profile);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback para Supabase se configurado
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const profileData = await fetchProfile(user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch {
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    getUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const profileData = await fetchProfile(currentUser.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        return;
      }
    } catch {
      // Fallback
    }
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  };

  const isAdmin = isRoleAdminOrManager(profile?.role);
  const isCustomer = isRoleCustomer(profile?.role);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isCustomer,
    refreshProfile,
  };
}

