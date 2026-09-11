"use client";

import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthService } from "@/services/auth.service";
import { formatRoleLabel } from "@/types/auth";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  title: string;
  description?: string;
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  const router = useRouter();
  const { user, profile } = useAuth();

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      window.location.href = "/login";
    }
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Administrador";
  const userEmail = user?.email || "admin@ghcamiseteria.com.br";
  const roleLabel = formatRoleLabel(profile?.role);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 leading-tight">{title}</h1>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors relative"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-xs uppercase">
            {displayName[0]}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800">{displayName}</div>
            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{userEmail} ({roleLabel})</div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sair da conta"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

