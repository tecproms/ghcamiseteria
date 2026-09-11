"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Trash2,
  Copy,
  Edit2,
  Eye,
  Check,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useConfiguratorStore } from "@/stores/configurator.store";
import { STANDARD_UNIFORM_SIZES, type TeamMemberItem, type UniformSize } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TeamRosterManager() {
  const {
    teamRoster,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    duplicateTeamMember,
    importTeamMembers,
    clearTeamRoster,
    setTeamRosterEnabled,
    getTeamRosterSummary,
    previewMemberId,
    setPreviewMemberId,
  } = useConfiguratorStore();

  // Estados locais para formulário de adição
  const [name, setName] = useState("");
  const [size, setSize] = useState<UniformSize>("M");
  const [number, setNumber] = useState("");
  const [sector, setSector] = useState("");
  const [notes, setNotes] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  // Estados para edição inline
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSize, setEditSize] = useState<UniformSize>("M");
  const [editNumber, setEditNumber] = useState("");
  const [editSector, setEditSector] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Modal de importação em massa
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRawText, setImportRawText] = useState("");
  const [importResult, setImportResult] = useState<{ added: number; errors: string[] } | null>(null);

  const summary = getTeamRosterSummary();

  // Submeter adição de integrante
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setAddError("Por favor, preencha o nome do integrante.");
      return;
    }

    addTeamMember({
      name: name.trim(),
      size,
      number: number.trim() || undefined,
      sector: sector.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setName("");
    setNumber("");
    setSector("");
    setNotes("");
    setAddError(null);
  };

  // Iniciar edição
  const handleStartEdit = (member: TeamMemberItem) => {
    setEditingMemberId(member.id);
    setEditName(member.name);
    setEditSize(member.size);
    setEditNumber(member.number || "");
    setEditSector(member.sector || "");
    setEditNotes(member.notes || "");
  };

  // Salvar edição
  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateTeamMember(id, {
      name: editName.trim(),
      size: editSize,
      number: editNumber.trim() || undefined,
      sector: editSector.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
    setEditingMemberId(null);
  };

  // Executar importação em lote
  const handleRunImport = () => {
    if (!importRawText.trim()) return;
    const res = importTeamMembers(importRawText);
    setImportResult(res);
    if (res.added > 0) {
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportRawText("");
        setImportResult(null);
      }, 1500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com Toggle e Botão Importar */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Grade da Equipe</span>
              {teamRoster.enabled && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold">
                  Ativa ({teamRoster.members.length} unid.)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Personalize para cada integrante com nome, número e tamanho.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="h-8 text-xs gap-1 border-slate-300 dark:border-zinc-700"
            title="Importar lista de integrantes colada do Excel ou texto"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Importar</span>
          </Button>

          <Button
            variant={teamRoster.enabled ? "default" : "outline"}
            size="sm"
            onClick={() => setTeamRosterEnabled(!teamRoster.enabled)}
            className={`h-8 text-xs font-semibold ${
              teamRoster.enabled
                ? "bg-[#d4af37] text-zinc-950 hover:bg-[#c59b27]"
                : "text-slate-700 dark:text-zinc-300"
            }`}
          >
            {teamRoster.enabled ? "Grade Ativa" : "Ativar Grade"}
          </Button>
        </div>
      </div>

      {/* Resumo da Grade por Tamanho */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300">
          <span>Resumo da Grade do Pedido</span>
          <span className="text-[#d4af37] font-bold">TOTAL: {summary.totalMembers} peças</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STANDARD_UNIFORM_SIZES.map((sz) => {
            const count = summary.sizeBreakdown[sz] || 0;
            return (
              <div
                key={sz}
                className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  count > 0
                    ? "bg-[#d4af37]/10 border-[#d4af37]/40 text-slate-900 dark:text-[#d4af37] font-bold"
                    : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600"
                }`}
              >
                <span>{sz}:</span>
                <span className={count > 0 ? "text-slate-900 dark:text-white" : ""}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formulário: Adicionar Integrante */}
      <form
        onSubmit={handleAddMember}
        className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-3"
      >
        <div className="flex items-center justify-between font-semibold text-xs text-slate-800 dark:text-zinc-200">
          <div className="flex items-center gap-1.5">
            <UserPlus className="h-4 w-4 text-[#d4af37]" />
            <span>Adicionar Integrante</span>
          </div>
          {teamRoster.members.length > 0 && (
            <button
              type="button"
              onClick={clearTeamRoster}
              className="text-[10px] text-red-500 hover:underline"
            >
              Limpar Lista
            </button>
          )}
        </div>

        {addError && (
          <div className="p-2 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{addError}</span>
          </div>
        )}

        <div className="grid grid-cols-12 gap-2">
          {/* Nome */}
          <div className="col-span-6">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Nome *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              className="h-8 text-xs"
            />
          </div>

          {/* Tamanho */}
          <div className="col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Tam. *
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full h-8 rounded-md border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 text-xs font-semibold"
            >
              {STANDARD_UNIFORM_SIZES.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>

          {/* Número */}
          <div className="col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Número
            </label>
            <Input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Ex: 10"
              maxLength={4}
              className="h-8 text-xs"
            />
          </div>

          {/* Setor */}
          <div className="col-span-6">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Setor / Cargo
            </label>
            <Input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ex: Comercial"
              className="h-8 text-xs"
            />
          </div>

          {/* Observação */}
          <div className="col-span-6">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Observação
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Manga curta"
              className="h-8 text-xs"
            />
          </div>
        </div>

        <Button
          type="submit"
          size="sm"
          className="w-full h-8 text-xs bg-slate-900 text-white hover:bg-slate-800 dark:bg-[#d4af37] dark:text-zinc-950 dark:font-semibold"
        >
          <UserPlus className="h-3.5 w-3.5 mr-1" />
          Inserir na Grade
        </Button>
      </form>

      {/* Tabela / Lista de Integrantes */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
          <span>Integrantes ({teamRoster.members.length})</span>
          {previewMemberId && (
            <span className="text-[11px] text-[#d4af37] font-medium flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Exibindo no uniforme
            </span>
          )}
        </div>

        {teamRoster.members.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950/20">
            <Users className="mx-auto h-7 w-7 text-slate-400 mb-1.5" />
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
              Nenhum integrante adicionado ainda.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
              Adicione integrantes individualmente ou use o botão <strong>Importar</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {teamRoster.members.map((member) => {
              const isEditing = editingMemberId === member.id;
              const isPreviewActive = previewMemberId === member.id;

              if (isEditing) {
                return (
                  <div
                    key={member.id}
                    className="p-2.5 rounded-lg border border-[#d4af37] bg-white dark:bg-zinc-900 shadow-sm space-y-2"
                  >
                    <div className="grid grid-cols-12 gap-1.5">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nome"
                        className="col-span-5 h-7 text-xs"
                      />
                      <select
                        value={editSize}
                        onChange={(e) => setEditSize(e.target.value)}
                        className="col-span-2 h-7 rounded border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-1 text-xs"
                      >
                        {STANDARD_UNIFORM_SIZES.map((sz) => (
                          <option key={sz} value={sz}>
                            {sz}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={editNumber}
                        onChange={(e) => setEditNumber(e.target.value)}
                        placeholder="Nº"
                        className="col-span-2 h-7 text-xs"
                      />
                      <Input
                        value={editSector}
                        onChange={(e) => setEditSector(e.target.value)}
                        placeholder="Setor"
                        className="col-span-3 h-7 text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingMemberId(null)}
                        className="h-6 px-2 text-[11px]"
                      >
                        <X className="h-3 w-3 mr-1" /> Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(member.id)}
                        className="h-6 px-2.5 text-[11px] bg-[#d4af37] text-zinc-950"
                      >
                        <Check className="h-3 w-3 mr-1" /> Salvar
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={member.id}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                    isPreviewActive
                      ? "border-[#d4af37] bg-[#d4af37]/10"
                      : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="h-6 px-1.5 rounded bg-slate-100 dark:bg-zinc-800 font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center justify-center shrink-0">
                      {member.size}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {member.name}
                      </span>
                      {member.number && (
                        <span className="ml-1.5 px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                          #{member.number}
                        </span>
                      )}
                      {member.sector && (
                        <span className="ml-1.5 text-[10px] text-slate-400 truncate">
                          • {member.sector}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setPreviewMemberId(isPreviewActive ? null : member.id)}
                      title={isPreviewActive ? "Ocultar prévia" : "Visualizar no uniforme"}
                      className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ${
                        isPreviewActive ? "text-[#d4af37]" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(member)}
                      title="Editar"
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => duplicateTeamMember(member.id)}
                      title="Duplicar integrante"
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeTeamMember(member.id)}
                      title="Remover integrante"
                      className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Importação em Massa */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Importar Lista de Integrantes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Cole uma lista copiada do Excel, Sheets ou bloco de notas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Instruções do Formato */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 text-xs text-slate-600 dark:text-zinc-400 space-y-1.5">
              <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-zinc-200">
                <HelpCircle className="h-3.5 w-3.5 text-[#d4af37]" />
                <span>Formato suportado (separado por barra |, ponto e vírgula, vírgula ou tab):</span>
              </div>
              <pre className="font-mono text-[11px] bg-white dark:bg-zinc-900 p-2 rounded border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-300">
{`João Silva | M | 10 | Comercial
Maria Souza | P | 07 | Financeiro
Carlos Lima | G | 22 | Operacional`}
              </pre>
              <p className="text-[11px] text-slate-500">
                Ordem dos campos: <strong>Nome | Tamanho | Número | Setor | Observação</strong>.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Cole sua lista abaixo:
              </label>
              <textarea
                rows={7}
                value={importRawText}
                onChange={(e) => setImportRawText(e.target.value)}
                placeholder="Exemplo:&#10;João | M | 10 | Comercial&#10;Maria | P | 07 | Financeiro&#10;Carlos | G | 22 | Operacional"
                className="w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2.5 font-mono text-xs focus-visible:ring-2 focus-visible:ring-[#d4af37]"
              />
            </div>

            {importResult && (
              <div
                className={`p-2.5 rounded-lg text-xs font-medium border ${
                  importResult.added > 0
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                    : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
                }`}
              >
                {importResult.added > 0
                  ? `Sucesso: ${importResult.added} integrantes importados com sucesso!`
                  : "Nenhum integrante importado. Verifique o formato."}
                {importResult.errors.length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-[11px]">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportResult(null);
                }}
                className="h-8 px-3 text-xs"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleRunImport}
                disabled={!importRawText.trim()}
                className="h-8 px-4 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-semibold gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Processar e Importar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
