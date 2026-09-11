"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Settings2,
  X,
  RotateCw,
  Maximize2,
  Minimize2,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getGarmentType, getGarmentTemplate } from "@/lib/svg-templates";
import type {
  UniformModel,
  UniformView,
  CustomizationZone,
  ViewSide,
  StandardZoneType,
  ElementType,
} from "@/types/uniform-model";

const ELEMENT_TYPES: { id: ElementType; label: string }[] = [
  { id: "LOGO", label: "Logo (Vetor / Marca)" },
  { id: "TEXT", label: "Texto / Frase / Nome" },
  { id: "NUMBER", label: "Número (Dorsal / Manga)" },
  { id: "IMAGE", label: "Imagem / Estampa" },
];

const STANDARD_ZONE_TYPES: { id: StandardZoneType; label: string }[] = [
  { id: "PEITO_ESQUERDO", label: "Peito Esquerdo" },
  { id: "PEITO_DIREITO", label: "Peito Direito" },
  { id: "CENTRO_FRONTAL", label: "Centro Frontal" },
  { id: "COSTAS", label: "Costas" },
  { id: "MANGA_ESQUERDA", label: "Manga Esquerda" },
  { id: "MANGA_DIREITA", label: "Manga Direita" },
  { id: "PERSONALIZADO", label: "Personalizado" },
];

export default function AdminModelosPage() {
  const [models, setModels] = useState<UniformModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModel] = useState<UniformModel | null>(null);
  const [activeViewSide, setActiveViewSide] = useState<ViewSide>("FRONT");
  const [selectedZone, setSelectedZone] = useState<CustomizationZone | null>(null);

  // Modais
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isEditingModel, setIsEditingModel] = useState(false);
  const [modelForm, setModelForm] = useState({
    name: "",
    description: "",
    product_name: "Camiseta Corporativa Base",
    is_active: true,
  });

  // Notificações
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Carregar modelos
  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/modelos");
      const data = await res.json();
      if (data.success && data.models) {
        setModels(data.models);
        setActiveModel((prev) => {
          if (!prev && data.models.length > 0) return data.models[0];
          if (prev) {
            const updated = data.models.find((m: UniformModel) => m.id === prev.id);
            return updated || prev;
          }
          return null;
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Erro ao carregar lista de modelos." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Vista ativa atual
  const currentView: UniformView | undefined = activeModel?.views?.find(
    (v) => v.view_side.toUpperCase() === activeViewSide.toUpperCase()
  );

  const zonesOfCurrentView: CustomizationZone[] = currentView?.zones || [];
  const garmentType = getGarmentType(activeModel?.name || activeModel?.id);
  const garmentTemplate = getGarmentTemplate(garmentType, activeViewSide);

  // Salvar novo modelo ou editar modelo
  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelForm.name.trim()) return;

    try {
      if (isEditingModel && activeModel) {
        const res = await fetch(`/api/admin/modelos/${activeModel.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modelForm),
        });
        const data = await res.json();
        if (data.success) {
          setFeedback({ type: "success", message: "Modelo atualizado com sucesso!" });
          setIsModelModalOpen(false);
          fetchModels();
        }
      } else {
        const res = await fetch("/api/admin/modelos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modelForm),
        });
        const data = await res.json();
        if (data.success) {
          setFeedback({ type: "success", message: "Novo modelo criado com vistas e zonas padrão!" });
          setIsModelModalOpen(false);
          fetchModels();
          if (data.model) {
            setActiveModel(data.model);
            setActiveViewSide("FRONT");
          }
        }
      }
    } catch {
      setFeedback({ type: "error", message: "Erro ao salvar modelo." });
    }
  };

  // Excluir modelo
  const handleDeleteModel = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir o modelo "${name}" e todas as suas configurações de zonas?`)) return;

    try {
      const res = await fetch(`/api/admin/modelos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Modelo excluído com sucesso!" });
        setActiveModel(null);
        setSelectedZone(null);
        fetchModels();
      }
    } catch {
      setFeedback({ type: "error", message: "Erro ao excluir modelo." });
    }
  };

  // Criar nova zona na vista atual
  const handleCreateZone = async () => {
    if (!currentView) return;

    const newZoneDTO = {
      shirt_view_id: currentView.id,
      zone_name: `Nova Zona ${zonesOfCurrentView.length + 1}`,
      zone_type: "PERSONALIZADO",
      x: 300,
      y: 300,
      width: 150,
      height: 150,
      rotation: 0,
      min_scale: 0.2,
      max_scale: 2.5,
      allowed_element_types: ["LOGO", "TEXT", "NUMBER", "IMAGE"] as ElementType[],
      is_active: true,
    };

    try {
      const res = await fetch("/api/admin/zonas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newZoneDTO),
      });
      const data = await res.json();
      if (data.success && data.zone) {
        setSelectedZone(data.zone);
        setFeedback({ type: "success", message: "Zona criada com sucesso! Ajuste as coordenadas abaixo." });
        await fetchModels();
      }
    } catch {
      setFeedback({ type: "error", message: "Erro ao criar zona." });
    }
  };

  // Atualizar zona
  const handleUpdateZone = async (zone: CustomizationZone) => {
    try {
      const res = await fetch(`/api/admin/zonas/${zone.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zone),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: `Zona "${zone.zone_name}" salva no banco!` });
        await fetchModels();
      }
    } catch {
      setFeedback({ type: "error", message: "Erro ao atualizar zona." });
    }
  };

  // Excluir zona
  const handleDeleteZone = async (id: string, name: string) => {
    if (!confirm(`Remover a zona de personalização "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/zonas/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Zona removida com sucesso!" });
        setSelectedZone(null);
        await fetchModels();
      }
    } catch {
      setFeedback({ type: "error", message: "Erro ao remover zona." });
    }
  };

  // Alternar tipo de elemento permitido
  const toggleElementType = (type: ElementType) => {
    if (!selectedZone) return;
    const current = selectedZone.allowed_element_types || [];
    const exists = current.includes(type);
    const updated = exists ? current.filter((t) => t !== type) : [...current, type];
    setSelectedZone({ ...selectedZone, allowed_element_types: updated });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminHeader
          title="Modelos & Zonas de Personalização"
          description="Configure como cada peça poderá ser personalizada: vistas técnicas (Frente, Costas, Mangas) e zonas de aplicação com posições, rotações e escalas persistidas no banco."
        />
        <Button
          onClick={() => {
            setIsEditingModel(false);
            setModelForm({
              name: "",
              description: "",
              product_name: "Camiseta Corporativa Base",
              is_active: true,
            });
            setIsModelModalOpen(true);
          }}
          className="gap-2 shrink-0 bg-slate-900 text-white hover:bg-slate-800 dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] dark:font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Modelo
        </Button>
      </div>

      {/* Alerta de feedback */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-lg text-xs font-medium border ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Lista de Modelos (Abas / Seletor Superior) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando modelos do banco...
          </div>
        )}

        {!loading && models.map((model) => (
          <button
            key={model.id}
            onClick={() => {
              setActiveModel(model);
              setSelectedZone(null);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${
              activeModel?.id === model.id
                ? "bg-slate-900 text-white border-slate-900 shadow-sm dark:bg-[#d4af37] dark:text-zinc-950 dark:border-[#d4af37] dark:font-bold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>{model.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                activeModel?.id === model.id
                  ? "bg-white/20 text-white dark:bg-zinc-950/40 dark:text-zinc-900"
                  : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {model.views?.reduce((acc, v) => acc + (v.zones?.length || 0), 0) || 0} zonas
            </span>
          </button>
        ))}
      </div>

      {activeModel && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Canvas Visualizador da Peça e Zonas (8 colunas) */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="shadow-sm border-slate-200 dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{activeModel.name}</CardTitle>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          activeModel.is_active
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {activeModel.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <CardDescription className="mt-1">
                      {activeModel.description || "Sem descrição informada."}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingModel(true);
                        setModelForm({
                          name: activeModel.name,
                          description: activeModel.description || "",
                          product_name: activeModel.product_name || "Camiseta Corporativa Base",
                          is_active: activeModel.is_active,
                        });
                        setIsModelModalOpen(true);
                      }}
                      className="gap-1 text-xs"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Editar Modelo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteModel(activeModel.id, activeModel.name)}
                      className="gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Seletor de Vistas: FRONT, BACK, LEFT_SLEEVE, RIGHT_SLEEVE */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    {(["FRONT", "BACK", "LEFT_SLEEVE", "RIGHT_SLEEVE"] as ViewSide[]).map((side) => {
                      const labels: Record<ViewSide, string> = {
                        FRONT: "Frente (FRONT)",
                        BACK: "Costas (BACK)",
                        LEFT_SLEEVE: "Manga Esq. (LEFT_SLEEVE)",
                        RIGHT_SLEEVE: "Manga Dir. (RIGHT_SLEEVE)",
                        OTHER: "Outra Vista",
                      };
                      const isSelected = activeViewSide === side;
                      return (
                        <button
                          key={side}
                          onClick={() => {
                            setActiveViewSide(side);
                            setSelectedZone(null);
                          }}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-[#d4af37]"
                              : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                          }`}
                        >
                          {labels[side]}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    size="sm"
                    onClick={handleCreateZone}
                    className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 dark:bg-[#d4af37] dark:text-zinc-950 dark:font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar Zona
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                {/* Canvas SVG e Zonas */}
                <div className="relative mx-auto max-w-[560px] aspect-square rounded-xl bg-slate-100/60 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 overflow-hidden flex items-center justify-center p-4">
                  {/* Grid de coordenadas para precisão visual */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                  {/* Silhueta Vetorial SVG da Vista Realista */}
                  <svg
                    viewBox="0 0 800 800"
                    className="w-full h-full drop-shadow-md select-none"
                    style={{ pointerEvents: "none" }}
                  >
                    {/* Sombra de Piso */}
                    <path
                      d={garmentTemplate.path}
                      fill="rgba(0,0,0,0.06)"
                      transform="translate(0, 10)"
                    />

                    {/* Silhueta Base do Tecido */}
                    <path
                      d={garmentTemplate.path}
                      className="fill-white dark:fill-zinc-900 stroke-slate-300 dark:stroke-zinc-700"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                    />

                    {/* Sombras e Dobras Anatômicas de Caimento */}
                    {garmentTemplate.shadowPath && (
                      <path d={garmentTemplate.shadowPath} fill="rgba(0,0,0,0.08)" />
                    )}

                    {/* Pespontos Duplos */}
                    {garmentTemplate.stitchesPath && (
                      <path
                        d={garmentTemplate.stitchesPath}
                        stroke="rgba(0,0,0,0.2)"
                        strokeWidth="1.2"
                        strokeDasharray="3,3"
                        fill="none"
                      />
                    )}

                    {/* Punhos Canelados */}
                    {garmentTemplate.cuffsPath && (
                      <path
                        d={garmentTemplate.cuffsPath}
                        fill="rgba(0,0,0,0.05)"
                        stroke="rgba(0,0,0,0.2)"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Peitilho da Polo */}
                    {garmentTemplate.placketPath && (
                      <path
                        d={garmentTemplate.placketPath}
                        fill="rgba(0,0,0,0.08)"
                        stroke="rgba(0,0,0,0.25)"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Base da Gola */}
                    {garmentTemplate.collarPath && (
                      <path
                        d={garmentTemplate.collarPath}
                        className="fill-slate-200/60 dark:fill-zinc-800 stroke-slate-300 dark:stroke-zinc-700"
                        strokeWidth="2"
                      />
                    )}

                    {/* Lapelas Dobradas da Polo */}
                    {garmentTemplate.collarFlapsPath && (
                      <path
                        d={garmentTemplate.collarFlapsPath}
                        className="fill-slate-100 dark:fill-zinc-800 stroke-slate-400 dark:stroke-zinc-600"
                        strokeWidth="2"
                      />
                    )}

                    {/* Botões Perolados da Polo */}
                    {garmentTemplate.buttons?.map((btn, idx) => (
                      <circle
                        key={idx}
                        cx={btn.x}
                        cy={btn.y}
                        r={btn.r}
                        fill="#FAF9F6"
                        stroke="#94A3B8"
                        strokeWidth="1.2"
                      />
                    ))}
                  </svg>

                  {/* Zonas de Personalização Posicionadas no Canvas */}
                  {zonesOfCurrentView.map((zone) => {
                    const isSelected = selectedZone?.id === zone.id;
                    // Converter coordenadas de 800x800 para porcentagem
                    const leftPct = (zone.x / 800) * 100;
                    const topPct = (zone.y / 800) * 100;
                    const widthPct = (zone.width / 800) * 100;
                    const heightPct = (zone.height / 800) * 100;

                    return (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZone(zone)}
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${widthPct}%`,
                          height: `${heightPct}%`,
                          transform: `rotate(${zone.rotation}deg)`,
                        }}
                        className={`absolute cursor-pointer transition-all border-2 rounded-md flex flex-col items-center justify-center p-1 select-none ${
                          isSelected
                            ? "border-[#d4af37] bg-[#d4af37]/20 ring-2 ring-[#d4af37]/40 shadow-lg z-20"
                            : "border-blue-500/70 bg-blue-500/10 hover:border-blue-600 hover:bg-blue-500/20 z-10"
                        }`}
                      >
                        <div
                          className={`text-[10px] font-bold px-1 rounded text-center truncate max-w-full ${
                            isSelected
                              ? "bg-[#d4af37] text-zinc-950 font-extrabold"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {zone.zone_type}
                        </div>
                        <div className="text-[9px] text-slate-700 dark:text-zinc-300 truncate max-w-full font-mono mt-0.5">
                          {zone.width}x{zone.height}
                        </div>
                        {zone.rotation !== 0 && (
                          <div className="text-[8px] text-amber-600 dark:text-amber-400 font-mono">
                            {zone.rotation}°
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span>Zonas configuradas: {zonesOfCurrentView.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#d4af37]" />
                    <span>Zona selecionada: {selectedZone?.zone_name || "Nenhuma"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita: Painel de Edição da Zona Selecionada (4 colunas) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="shadow-sm border-slate-200 dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-[#d4af37]" />
                  Propriedades da Zona
                </CardTitle>
                <CardDescription>
                  {selectedZone
                    ? `Configurando ${selectedZone.zone_name}`
                    : "Selecione uma zona no canvas ou crie uma nova para editar."}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-5">
                {selectedZone ? (
                  <div className="space-y-4">
                    {/* Nome da Zona */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Nome da Zona
                      </label>
                      <Input
                        value={selectedZone.zone_name}
                        onChange={(e) => setSelectedZone({ ...selectedZone, zone_name: e.target.value })}
                        placeholder="Ex: Peito Esquerdo"
                      />
                    </div>

                    {/* Tipo da Zona */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Tipo da Zona
                      </label>
                      <select
                        value={selectedZone.zone_type}
                        onChange={(e) => setSelectedZone({ ...selectedZone, zone_type: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:ring-[#d4af37]"
                      >
                        {STANDARD_ZONE_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label} ({t.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Posição X e Y */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Posição X (px)
                        </label>
                        <Input
                          type="number"
                          value={selectedZone.x}
                          onChange={(e) => setSelectedZone({ ...selectedZone, x: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Posição Y (px)
                        </label>
                        <Input
                          type="number"
                          value={selectedZone.y}
                          onChange={(e) => setSelectedZone({ ...selectedZone, y: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    {/* Largura e Altura */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Largura (px)
                        </label>
                        <Input
                          type="number"
                          value={selectedZone.width}
                          onChange={(e) => setSelectedZone({ ...selectedZone, width: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Altura (px)
                        </label>
                        <Input
                          type="number"
                          value={selectedZone.height}
                          onChange={(e) => setSelectedZone({ ...selectedZone, height: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    {/* Rotação */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                          <RotateCw className="h-3.5 w-3.5" />
                          Rotação: {selectedZone.rotation}°
                        </label>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="5"
                        value={selectedZone.rotation}
                        onChange={(e) => setSelectedZone({ ...selectedZone, rotation: Number(e.target.value) })}
                        className="w-full accent-[#d4af37]"
                      />
                    </div>

                    {/* Escala Mínima e Máxima */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                          <Minimize2 className="h-3 w-3" />
                          Escala Mín.
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="2.0"
                          value={selectedZone.min_scale}
                          onChange={(e) => setSelectedZone({ ...selectedZone, min_scale: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                          <Maximize2 className="h-3 w-3" />
                          Escala Máx.
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="5.0"
                          value={selectedZone.max_scale}
                          onChange={(e) => setSelectedZone({ ...selectedZone, max_scale: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    {/* Tipos de Elementos Permitidos */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                        Elementos Permitidos
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {ELEMENT_TYPES.map((elem) => {
                          const isChecked = selectedZone.allowed_element_types?.includes(elem.id);
                          return (
                            <button
                              type="button"
                              key={elem.id}
                              onClick={() => toggleElementType(elem.id)}
                              className={`flex items-center gap-2 p-2 rounded-md border text-left text-xs font-medium transition-all ${
                                isChecked
                                  ? "border-[#d4af37] bg-[#d4af37]/10 text-slate-900 dark:text-[#d4af37]"
                                  : "border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                              }`}
                            >
                              <div
                                className={`h-3.5 w-3.5 rounded flex items-center justify-center border ${
                                  isChecked
                                    ? "bg-[#d4af37] border-[#d4af37] text-zinc-950"
                                    : "border-slate-300 dark:border-zinc-700"
                                }`}
                              >
                                {isChecked && <CheckCircle2 className="h-3 w-3" />}
                              </div>
                              <span className="truncate">{elem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status da Zona */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Zona Ativa</span>
                      <button
                        type="button"
                        onClick={() => setSelectedZone({ ...selectedZone, is_active: !selectedZone.is_active })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          selectedZone.is_active ? "bg-[#d4af37]" : "bg-slate-300 dark:bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            selectedZone.is_active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Botões Salvar e Excluir */}
                    <div className="pt-3 flex gap-2">
                      <Button
                        onClick={() => handleUpdateZone(selectedZone)}
                        className="flex-1 gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] dark:font-semibold"
                      >
                        <Save className="h-4 w-4" />
                        Salvar Zona
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteZone(selectedZone.id, selectedZone.zone_name)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg">
                    <Sparkles className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Clique em qualquer zona retangular no canvas da peça ao lado para editar suas dimensões, rotação e elementos permitidos.
                    </p>
                    <Button
                      size="sm"
                      onClick={handleCreateZone}
                      className="mt-4 gap-1.5 text-xs bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Criar Zona nesta Vista
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modal Criar / Editar Modelo */}
      {isModelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditingModel ? "Editar Modelo de Uniforme" : "Novo Modelo de Uniforme"}
              </h3>
              <button
                onClick={() => setIsModelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Nome do Modelo *
                </label>
                <Input
                  required
                  value={modelForm.name}
                  onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                  placeholder="Ex: Camiseta Dry Fit Performance"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={modelForm.description}
                  onChange={(e) => setModelForm({ ...modelForm, description: e.target.value })}
                  placeholder="Características da modelagem, gramatura e acabamento..."
                  className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:ring-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Produto Base Relacionado
                </label>
                <Input
                  value={modelForm.product_name}
                  onChange={(e) => setModelForm({ ...modelForm, product_name: e.target.value })}
                  placeholder="Ex: Camiseta Básica, Polo Piquet, Regata..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Status do Modelo</span>
                <button
                  type="button"
                  onClick={() => setModelForm({ ...modelForm, is_active: !modelForm.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    modelForm.is_active ? "bg-[#d4af37]" : "bg-slate-300 dark:bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      modelForm.is_active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {!isEditingModel && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
                  ⚡ As 4 vistas técnicas oficiais (<strong>FRONT</strong>, <strong>BACK</strong>, <strong>LEFT_SLEEVE</strong> e <strong>RIGHT_SLEEVE</strong>) e suas zonas padrão serão geradas automaticamente e salvas no banco.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setIsModelModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] dark:font-semibold"
                >
                  {isEditingModel ? "Salvar Alterações" : "Criar Modelo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
