"use client";

import React, { useEffect, useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calculator,
  Percent,
  Layers,
  Sparkles,
  Shirt,
  TrendingDown,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { PricingRuleConfig, VolumeDiscountTier, PricingCalculationResult } from "@/types/pricing";

export default function AdminPrecosPage() {
  const [rules, setRules] = useState<PricingRuleConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Estados para o Simulador Interativo
  const [simQuantity, setSimQuantity] = useState(20);
  const [simLogos, setSimLogos] = useState(1);
  const [simTexts, setSimTexts] = useState(1);
  const [simNumbers, setSimNumbers] = useState(1);
  const [simHasBack, setSimHasBack] = useState(true);
  const [simHasSleeves, setSimHasSleeves] = useState(false);
  const [simCalculation, setSimCalculation] = useState<PricingCalculationResult | null>(null);
  const [simCalculating, setSimCalculating] = useState(false);

  // Carregar regras vigentes
  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing");
      const data = await res.json();
      if (data.success && data.rules) {
        setRules(data.rules);
      } else {
        throw new Error(data.error || "Erro ao carregar regras");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro de conexão";
      setFeedback({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Salvar alterações
  const handleSave = async () => {
    if (!rules) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao salvar regras comerciais");
      }
      setRules(data.rules);
      setFeedback({ type: "success", message: "Tabela de preços e regras comerciais salvas com sucesso!" });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha ao salvar";
      setFeedback({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  // Manipulação de Faixas de Desconto por Volume
  const handleAddTier = () => {
    if (!rules) return;
    const current = rules.volumeDiscounts || [];
    const lastMin = current.length > 0 ? current[current.length - 1].minQuantity : 1;
    const newMin = lastMin + 20;
    const newTier: VolumeDiscountTier = {
      minQuantity: newMin,
      maxQuantity: undefined,
      discountPercent: 10,
      label: `${newMin}+ peças (${10}% OFF)`,
    };
    setRules({ ...rules, volumeDiscounts: [...current, newTier] });
  };

  const handleRemoveTier = (index: number) => {
    if (!rules) return;
    const updated = rules.volumeDiscounts.filter((_, i) => i !== index);
    setRules({ ...rules, volumeDiscounts: updated });
  };

  const handleUpdateTier = (index: number, updates: Partial<VolumeDiscountTier>) => {
    if (!rules) return;
    const updated = [...rules.volumeDiscounts];
    updated[index] = { ...updated[index], ...updates };
    setRules({ ...rules, volumeDiscounts: updated });
  };

  // Executar Simulação via Backend
  useEffect(() => {
    if (!rules) return;

    const runSimulation = async () => {
      setSimCalculating(true);
      try {
        const views: Record<string, Array<{ id: string; type: string }>> = {
          FRONT: [],
          BACK: [],
          LEFT_SLEEVE: [],
          RIGHT_SLEEVE: [],
        };

        for (let i = 0; i < simLogos; i++) {
          views.FRONT.push({ id: `sim-logo-${i}`, type: "LOGO" });
        }
        for (let i = 0; i < simTexts; i++) {
          if (simHasBack) {
            views.BACK.push({ id: `sim-text-${i}`, type: "TEXT" });
          } else {
            views.FRONT.push({ id: `sim-text-${i}`, type: "TEXT" });
          }
        }
        for (let i = 0; i < simNumbers; i++) {
          if (simHasBack) {
            views.BACK.push({ id: `sim-num-${i}`, type: "NUMBER" });
          } else {
            views.FRONT.push({ id: `sim-num-${i}`, type: "NUMBER" });
          }
        }
        if (simHasSleeves) {
          views.LEFT_SLEEVE.push({ id: "sim-sleeve-1", type: "IMAGE" });
        }

        const res = await fetch("/api/pricing/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity: simQuantity,
            views,
          }),
        });
        const data = await res.json();
        if (data.success && data.pricing) {
          setSimCalculation(data.pricing);
        }
      } catch {
        // Silêncio em erro transitório do simulador
      } finally {
        setSimCalculating(false);
      }
    };

    const timer = setTimeout(runSimulation, 250);
    return () => clearTimeout(timer);
  }, [simQuantity, simLogos, simTexts, simNumbers, simHasBack, simHasSleeves, rules]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Motor de Preços & Regras Comerciais"
        description="Defina preços base de produtos, adicionais por posições/elementos e descontos por volume calculados 100% no servidor."
      />

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading && (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
          <p className="text-xs text-slate-500 font-medium">Carregando regras comerciais...</p>
        </div>
      )}

      {!loading && rules && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Formulários de Regras Comerciais */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Preço Base do Produto */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shirt className="h-5 w-5 text-[#d4af37]" />
                  <CardTitle className="text-sm font-bold">Preço Base do Produto & Taxas Globais</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Valores base aplicados antes de quaisquer personalizações ou impressões.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Preço Base da Camiseta (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        min="0"
                        value={rules.baseProductPrice}
                        onChange={(e) =>
                          setRules({ ...rules, baseProductPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="pl-9 text-xs h-9 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Taxa por Membro na Grade (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        min="0"
                        value={rules.teamMemberIndividualFee}
                        onChange={(e) =>
                          setRules({ ...rules, teamMemberIndividualFee: parseFloat(e.target.value) || 0 })
                        }
                        className="pl-9 text-xs h-9 font-semibold"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Custo unitário por nome individualizado.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Taxa de Matriz / Setup Fixo (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                      <Input
                        type="number"
                        step="1.00"
                        min="0"
                        value={rules.additionalSetupFee}
                        onChange={(e) =>
                          setRules({ ...rules, additionalSetupFee: parseFloat(e.target.value) || 0 })
                        }
                        className="pl-9 text-xs h-9 font-semibold"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Taxa fixa cobrada por pedido (se houver).</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Preço por Tipo de Elemento */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#d4af37]" />
                  <CardTitle className="text-sm font-bold">Preço por Tipo de Elemento</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Adicional unitário somado a cada elemento inserido na arte do uniforme.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Logo (Vetor / Marca)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        min="0"
                        value={rules.elementTypes.LOGO}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            elementTypes: { ...rules.elementTypes, LOGO: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="pl-8 text-xs h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Texto / Frase / Nome
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        min="0"
                        value={rules.elementTypes.TEXT}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            elementTypes: { ...rules.elementTypes, TEXT: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="pl-8 text-xs h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Número Esportivo
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        min="0"
                        value={rules.elementTypes.NUMBER}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            elementTypes: { ...rules.elementTypes, NUMBER: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="pl-8 text-xs h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Imagem / Estampa
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        min="0"
                        value={rules.elementTypes.IMAGE}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            elementTypes: { ...rules.elementTypes, IMAGE: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="pl-8 text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Preço por Posição / Vista */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#d4af37]" />
                  <CardTitle className="text-sm font-bold">Preço por Posição / Vista Decorada</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Custo adicional cobrado quando uma determinada posição (vista) do uniforme possui impressões.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Frente (Frontal)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        min="0"
                        value={rules.positions.FRONT}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            positions: { ...rules.positions, FRONT: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="pl-8 text-xs h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Costas (Dorsal)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        min="0"
                        value={rules.positions.BACK}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            positions: { ...rules.positions, BACK: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="pl-8 text-xs h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Manga Esquerda
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        min="0"
                        value={rules.positions.LEFT_SLEEVE}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            positions: { ...rules.positions, LEFT_SLEEVE: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="pl-8 text-xs h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Manga Direita
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        min="0"
                        value={rules.positions.RIGHT_SLEEVE}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            positions: { ...rules.positions, RIGHT_SLEEVE: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="pl-8 text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Tabela de Descontos por Volume */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-emerald-600" />
                    <CardTitle className="text-sm font-bold">Descontos por Volume (Atacado & Escala)</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Faixas de desconto progressivo aplicadas automaticamente conforme a quantidade de peças.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddTier}
                  className="h-8 text-xs gap-1 border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nova Faixa
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-500 pb-1 border-b">
                  <div className="col-span-3">Qtd Mínima</div>
                  <div className="col-span-3">Qtd Máxima</div>
                  <div className="col-span-2">Desconto (%)</div>
                  <div className="col-span-3">Rótulo / Descrição</div>
                  <div className="col-span-1 text-center">Ações</div>
                </div>

                {rules.volumeDiscounts.map((tier, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="1"
                        value={tier.minQuantity}
                        onChange={(e) =>
                          handleUpdateTier(idx, { minQuantity: parseInt(e.target.value) || 1 })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Ilimitado"
                        value={tier.maxQuantity ?? ""}
                        onChange={(e) =>
                          handleUpdateTier(idx, {
                            maxQuantity: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={tier.discountPercent}
                          onChange={(e) =>
                            handleUpdateTier(idx, {
                              discountPercent: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="h-8 text-xs pr-6 font-bold text-emerald-600"
                        />
                        <Percent className="h-3 w-3 absolute right-2 top-2.5 text-slate-400" />
                      </div>
                    </div>
                    <div className="col-span-3">
                      <Input
                        value={tier.label}
                        onChange={(e) => handleUpdateTier(idx, { label: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Remover faixa"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Botão de Salvar Alterações */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-semibold text-xs h-10 px-6 shadow-md"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{saving ? "Salvando..." : "Salvar Regras Comerciais"}</span>
              </Button>
            </div>
          </div>

          {/* Coluna Direita: Simulador de Precificação Server-Side em Tempo Real */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-amber-500/30 dark:border-amber-500/20 shadow-md sticky top-20">
              <CardHeader className="pb-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-t-xl border-b border-amber-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[#d4af37]" />
                    <CardTitle className="text-sm font-bold">Simulador em Tempo Real</CardTitle>
                  </div>
                  {simCalculating && <Loader2 className="h-4 w-4 animate-spin text-[#d4af37]" />}
                </div>
                <CardDescription className="text-xs">
                  Recalculado pelo servidor (`POST /api/pricing/calculate`).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Controles de Simulação */}
                <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-zinc-800 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Quantidade de Peças:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{simQuantity} un.</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="150"
                      value={simQuantity}
                      onChange={(e) => setSimQuantity(parseInt(e.target.value) || 1)}
                      className="w-full accent-[#d4af37]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="block text-[11px] text-slate-500">Logos</span>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        value={simLogos}
                        onChange={(e) => setSimLogos(parseInt(e.target.value) || 0)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] text-slate-500">Nomes</span>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        value={simTexts}
                        onChange={(e) => setSimTexts(parseInt(e.target.value) || 0)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] text-slate-500">Números</span>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        value={simNumbers}
                        onChange={(e) => setSimNumbers(parseInt(e.target.value) || 0)}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simHasBack}
                        onChange={(e) => setSimHasBack(e.target.checked)}
                        className="rounded accent-[#d4af37]"
                      />
                      <span>Costas</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simHasSleeves}
                        onChange={(e) => setSimHasSleeves(e.target.checked)}
                        className="rounded accent-[#d4af37]"
                      />
                      <span>Mangas</span>
                    </label>
                  </div>
                </div>

                {/* Resultado do Recálculo */}
                {simCalculation && (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Preço Base Unitário:</span>
                      <span className="font-mono">R$ {simCalculation.unitBasePrice.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Personalizações Unitárias:</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400">
                        +R$ {simCalculation.unitCustomizations.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between font-medium text-slate-700 dark:text-zinc-300 pt-1 border-t border-dashed">
                      <span>Preço Bruto / Peça:</span>
                      <span className="font-mono">R$ {simCalculation.unitPriceBeforeDiscount.toFixed(2)}</span>
                    </div>

                    {simCalculation.discountPercent > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Desconto por Volume ({simCalculation.discountPercent}%):</span>
                        <span className="font-mono">-R$ {simCalculation.unitDiscountAmount.toFixed(2)} / un</span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-zinc-950 flex items-center justify-between font-bold">
                      <span>Preço Final Unitário:</span>
                      <span className="text-base text-slate-900 dark:text-[#d4af37] font-mono">
                        R$ {simCalculation.unitPrice.toFixed(2)}
                      </span>
                    </div>

                    {simCalculation.tierApplied && (
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded border border-emerald-200 dark:border-emerald-800 text-center font-medium">
                        🎉 {simCalculation.tierApplied.label}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-1">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal ({simCalculation.quantity} peças):</span>
                        <span className="font-mono">R$ {simCalculation.subtotal.toFixed(2)}</span>
                      </div>
                      {simCalculation.totalDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Economia Total:</span>
                          <span className="font-mono">-R$ {simCalculation.totalDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-1">
                        <span>TOTAL GERAL:</span>
                        <span className="text-[#d4af37] font-mono">
                          R$ {simCalculation.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
