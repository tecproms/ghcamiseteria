"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Loader2,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Shield,
  UserCheck,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatRoleLabel, type UserRole } from "@/types/auth";

interface ClientRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  orders_count: number;
  total_spent: number;
}

export default function AdminClientesPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Modal Novo Cliente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [newClient, setNewClient] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "cliente" as UserRole,
  });

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const url = searchTerm
        ? `/api/admin/clientes?search=${encodeURIComponent(searchTerm)}`
        : "/api/admin/clientes";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.clients) {
        setClients(data.clients);
      }
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(fetchClients, 300);
    return () => clearTimeout(timer);
  }, [fetchClients]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha ao cadastrar cliente.");
      }

      setFormSuccess("Cliente cadastrado com sucesso!");
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
        setNewClient({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          role: "cliente",
        });
        fetchClients();
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao cadastrar cliente";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const totalClients = clients.length;
  const clientsWithOrders = clients.filter((c) => c.orders_count > 0).length;
  const totalRevenue = clients.reduce((acc, c) => acc + (c.total_spent || 0), 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminHeader
          title="Gestão de Clientes"
          description="Controle de empresas (PJ), clientes individuais (PF) e histórico de compras"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              fetchClients();
            }}
            disabled={loading || refreshing}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Atualizar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Cliente</span>
          </Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-zinc-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Total de Clientes</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {loading ? "-" : totalClients}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-zinc-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Clientes Ativos (com Pedidos)</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {loading ? "-" : clientsWithOrders}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-zinc-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Faturamento da Base</p>
              <h3 className="text-2xl font-bold text-[#d4af37] mt-1">
                {loading ? "-" : `R$ ${totalRevenue.toFixed(2)}`}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-[#d4af37]">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Clientes com Busca */}
      <Card className="border-slate-200 dark:border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold">Base de Clientes Cadastrados</CardTitle>
              <CardDescription className="text-xs">
                Usuários reais registrados no banco de dados PostgreSQL.
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#d4af37]" />
              <p className="text-xs text-slate-500">Consultando base de clientes...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Users className="h-10 w-10 mx-auto text-slate-300 dark:text-zinc-600" />
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                Nenhum cliente encontrado
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                {searchTerm
                  ? "Nenhum resultado corresponde aos termos da pesquisa."
                  : "Ainda não há clientes cadastrados. Utilize o botão 'Novo Cliente' para registrar o primeiro cliente."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                    <th className="text-left font-semibold pb-3 pl-2">Cliente</th>
                    <th className="text-left font-semibold pb-3">Contato</th>
                    <th className="text-left font-semibold pb-3">Nível</th>
                    <th className="text-center font-semibold pb-3">Pedidos</th>
                    <th className="text-right font-semibold pb-3">Faturamento</th>
                    <th className="text-right font-semibold pb-3 pr-2">Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300 text-xs shrink-0">
                            {c.full_name?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {c.full_name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{c.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-slate-600 dark:text-zinc-400">
                        {c.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-emerald-600" />
                            <span>{c.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Não informado</span>
                        )}
                      </td>

                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            c.role === "admin"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          }`}
                        >
                          <Shield className="h-2.5 w-2.5" />
                          {formatRoleLabel(c.role)}
                        </span>
                      </td>

                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold ${
                            c.orders_count > 0
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "text-slate-400"
                          }`}
                        >
                          {c.orders_count}
                        </span>
                      </td>

                      <td className="py-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                        {c.total_spent > 0 ? `R$ ${c.total_spent.toFixed(2)}` : "-"}
                      </td>

                      <td className="py-3 text-right pr-2 text-slate-500 dark:text-zinc-400 text-[11px]">
                        <div className="flex items-center justify-end gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Cadastro de Novo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Novo Cliente
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Cadastre uma nova empresa ou cliente individual.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Nome Completo / Razão Social *
                </label>
                <Input
                  required
                  value={newClient.fullName}
                  onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
                  placeholder="Ex: Leandro Santos ou Techpro MS"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  E-mail Corporativo ou Pessoal *
                </label>
                <Input
                  required
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="cliente@empresa.com"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  WhatsApp / Telefone (opcional)
                </label>
                <Input
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Senha Provisória de Acesso * (mínimo 6 caracteres)
                </label>
                <Input
                  required
                  type="password"
                  value={newClient.password}
                  onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                  placeholder="••••••••"
                  className="h-9 text-xs"
                />
              </div>

              {formError && (
                <div className="p-2.5 rounded-lg text-xs font-medium border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-2.5 rounded-lg text-xs font-medium border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 text-xs"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="h-8 px-4 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-semibold gap-1.5"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  <span>{submitting ? "Cadastrando..." : "Cadastrar Cliente"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
