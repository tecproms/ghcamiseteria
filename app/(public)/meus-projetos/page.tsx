"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderHeart,
  Plus,
  Calendar,
  Layers,
  Edit3,
  Copy,
  Trash2,
  Loader2,
  AlertCircle,
  LogIn,
  Shirt,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UniformProject } from "@/types/projects";
import { SHIRT_SVG_TEMPLATES } from "@/lib/svg-templates";

export default function MeusProjetosPage() {
  const [projects, setProjects] = useState<UniformProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    setIsUnauthorized(false);
    try {
      const res = await fetch("/api/meus-projetos");
      const data = await res.json();

      if (res.status === 401) {
        setIsUnauthorized(true);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha ao carregar seus projetos.");
      }

      setProjects(data.projects || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar projetos";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Duplicar projeto
  const handleDuplicate = async (id: string) => {
    setActionInProgressId(id);
    try {
      const res = await fetch(`/api/meus-projetos/${id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Erro ao duplicar projeto.");
        return;
      }
      await fetchProjects();
    } catch {
      alert("Erro de comunicação ao duplicar projeto.");
    } finally {
      setActionInProgressId(null);
    }
  };

  // Excluir projeto
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o projeto "${name}"?`)) {
      return;
    }
    setActionInProgressId(id);
    try {
      const res = await fetch(`/api/meus-projetos/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Erro ao excluir projeto.");
        return;
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Erro de comunicação ao excluir projeto.");
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 px-3 py-0.5 text-xs font-medium mb-2">
            <FolderHeart className="h-3.5 w-3.5 text-[#d4af37]" />
            Suas Criações Salvas
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Meus Projetos
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            Acesse, edite e acompanhe os uniformes personalizados que você montou.
          </p>
        </div>

        <Link href="/monte-seu-uniforme">
          <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-semibold shadow-sm">
            <Plus className="h-4 w-4" />
            Novo Uniforme
          </Button>
        </Link>
      </div>

      {/* Estado: Carregando */}
      {loading && (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Carregando seus projetos salvos...
          </p>
        </div>
      )}

      {/* Estado: Não Autenticado */}
      {!loading && isUnauthorized && (
        <Card className="border-dashed border-2 dark:border-zinc-800">
          <CardContent className="py-16 text-center max-w-md mx-auto space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#d4af37]">
              <LogIn className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Acesse sua conta para ver seus projetos
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Você precisa estar autenticado para acessar o histórico de uniformes salvos, continuar edições e solicitar orçamentos.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link href="/login?redirectTo=/meus-projetos">
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950">
                  <LogIn className="h-4 w-4" />
                  Fazer Login
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button variant="outline">Criar Conta</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado: Erro */}
      {!loading && error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-center justify-between text-xs text-red-800 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={fetchProjects} className="h-7 text-xs">
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Estado: Vazio */}
      {!loading && !isUnauthorized && !error && projects.length === 0 && (
        <Card className="border-dashed border-2 dark:border-zinc-800">
          <CardContent className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600">
              <Shirt className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Nenhum uniforme salvo ainda
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Utilize o nosso configurador visual para escolher o modelo, aplicar logos, textos, números e salvar suas criações.
            </p>
            <div className="pt-2">
              <Link href="/monte-seu-uniforme">
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-semibold">
                  <Sparkles className="h-4 w-4" />
                  Montar Meu Primeiro Uniforme
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade de Projetos Salvos */}
      {!loading && !isUnauthorized && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const colorHex = project.metadata?.color?.hex || "#FFFFFF";
            const colorName = project.metadata?.color?.name || "Branco";
            const modelName = project.metadata?.modelName || "Uniforme";
            const quantity = project.metadata?.quantity || 10;
            const updatedDate = new Date(project.updated_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            const totalElements = Object.values(
              project.metadata?.configuration?.views || {}
            ).reduce((acc, curr) => acc + (curr?.length || 0), 0);
            const teamRoster = project.metadata?.teamRoster || project.metadata?.configuration?.teamRoster;

            const isOperating = actionInProgressId === project.id;

            return (
              <div
                key={project.id}
                className="group flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Preview Visual da Peça */}
                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-zinc-950 flex items-center justify-center p-4 border-b border-slate-100 dark:border-zinc-800/80 overflow-hidden">
                  {/* Silhueta SVG com a cor real do projeto */}
                  <svg
                    viewBox="0 0 800 800"
                    className="w-full h-full max-w-[240px] drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  >
                    <path
                      d={SHIRT_SVG_TEMPLATES.FRONT.path}
                      fill={colorHex}
                      stroke="#334155"
                      strokeWidth="2"
                    />
                    <path
                      d={SHIRT_SVG_TEMPLATES.FRONT.collarPath}
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="3"
                    />
                  </svg>

                  {/* Badge de Cor */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300 shadow-xs">
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: colorHex }}
                    />
                    <span>{colorName}</span>
                  </div>

                  {/* Badge de Grade da Equipe */}
                  {teamRoster?.enabled && (teamRoster.members?.length || 0) > 0 && (
                    <div className="absolute top-10 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#d4af37] text-zinc-950 font-bold text-[10px] shadow-xs">
                      <Users className="h-3 w-3" />
                      <span>{teamRoster.members.length} integrantes</span>
                    </div>
                  )}

                  {/* Badge de Status */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                      {project.status === "draft" ? "Rascunho" : "Salvo"}
                    </span>
                  </div>

                  {/* Contador de Elementos */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/80 px-2 py-0.5 rounded-md backdrop-blur">
                    <Layers className="h-3 w-3" />
                    <span>{totalElements} {totalElements === 1 ? "elemento" : "elementos"}</span>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#d4af37] transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Shirt className="h-3.5 w-3.5 text-slate-400" />
                      <span>{modelName}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{updatedDate}</span>
                    </div>
                    <div>
                      <span>
                        Qtd: <strong>{quantity} un.</strong>
                        {teamRoster?.enabled && (teamRoster.members?.length || 0) > 0 && (
                          <span className="ml-1 text-[10px] text-[#d4af37] font-semibold">
                            (Grade)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Ações: Editar, Duplicar e Excluir */}
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/monte-seu-uniforme?projetoId=${project.id}`}
                      className="flex-1"
                    >
                      <Button
                        size="sm"
                        className="w-full gap-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-semibold text-xs h-9"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(project.id)}
                      disabled={isOperating}
                      className="h-9 px-2.5 text-slate-700 dark:text-zinc-300"
                      title="Duplicar projeto"
                    >
                      {isOperating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(project.id, project.name)}
                      disabled={isOperating}
                      className="h-9 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/40"
                      title="Excluir projeto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
