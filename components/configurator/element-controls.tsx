"use client";

import React, { useRef, useState } from "react";
import {
  Type,
  Hash,
  Image as ImageIcon,
  Upload,
  Palette,
  Layers,
  Sparkles,
  Sliders,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  useConfiguratorStore,
  FABRIC_COLORS,
  AVAILABLE_FONTS,
} from "@/stores/configurator.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ViewSide } from "@/types/configurator";

const VIEW_TABS: { side: ViewSide; label: string }[] = [
  { side: "FRONT", label: "Frente" },
  { side: "BACK", label: "Costas" },
  { side: "LEFT_SLEEVE", label: "Manga Esq." },
  { side: "RIGHT_SLEEVE", label: "Manga Dir." },
];

const TEXT_COLORS = [
  "#FFFFFF",
  "#000000",
  "#D4AF37",
  "#DC2626",
  "#2563EB",
  "#16A34A",
  "#F59E0B",
  "#9333EA",
  "#9CA3AF",
];

export function ElementControls() {
  const {
    models,
    selectedModel,
    selectModel,
    selectedColor,
    selectColor,
    selectedViewSide,
    selectViewSide,
    getActiveViewZones,
    addElement,
    getSelectedElement,
    updateElement,
    deleteElement,
    duplicateElement,
  } = useConfiguratorStore();

  const [activeTab, setActiveTab] = useState<"add" | "properties" | "model">("add");
  const [selectedTargetZoneId, setSelectedTargetZoneId] = useState<string>("");
  const [newText, setNewText] = useState("SUA MARCA");
  const [newNumber, setNewNumber] = useState("10");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zones = getActiveViewZones();

  // Garante que a primeira zona da vista esteja selecionada como alvo padrão
  const targetZone =
    zones.find((z) => z.id === selectedTargetZoneId) || zones[0] || null;

  const selectedElement = getSelectedElement();

  // Adicionar Texto
  const handleAddText = () => {
    if (!targetZone) {
      setFeedbackError("Nenhuma zona de personalização disponível nesta vista.");
      return;
    }

    const res = addElement(
      {
        type: "TEXT",
        viewSide: selectedViewSide,
        zoneId: targetZone.id,
        x: targetZone.x + 10,
        y: targetZone.y + 15,
        width: Math.min(targetZone.width - 20, 160),
        height: 50,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        text: newText || "TEXTO",
        fontSize: 32,
        fontFamily: "Impact",
        fill: "#FFFFFF",
      },
      targetZone
    );

    if (!res.success) {
      setFeedbackError(res.error || "Erro ao adicionar texto.");
    } else {
      setFeedbackError(null);
      setActiveTab("properties");
    }
  };

  // Adicionar Número
  const handleAddNumber = () => {
    if (!targetZone) {
      setFeedbackError("Nenhuma zona de personalização disponível nesta vista.");
      return;
    }

    const res = addElement(
      {
        type: "NUMBER",
        viewSide: selectedViewSide,
        zoneId: targetZone.id,
        x: targetZone.x + (targetZone.width - 100) / 2,
        y: targetZone.y + (targetZone.height - 100) / 2,
        width: 90,
        height: 90,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        text: newNumber || "10",
        fontSize: 72,
        fontFamily: "Impact",
        fill: "#FFFFFF",
      },
      targetZone
    );

    if (!res.success) {
      setFeedbackError(res.error || "Erro ao adicionar número.");
    } else {
      setFeedbackError(null);
      setActiveTab("properties");
    }
  };

  // Upload de Imagem / Logo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetZone) return;

    if (!file.type.startsWith("image/")) {
      setFeedbackError("Apenas arquivos de imagem (PNG, JPG, SVG, WebP) são permitidos.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const res = addElement(
        {
          type: "IMAGE",
          viewSide: selectedViewSide,
          zoneId: targetZone.id,
          x: targetZone.x + 10,
          y: targetZone.y + 10,
          width: Math.min(targetZone.width - 20, 140),
          height: Math.min(targetZone.height - 20, 140),
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          src,
        },
        targetZone
      );

      if (!res.success) {
        setFeedbackError(res.error || "Erro ao adicionar imagem.");
      } else {
        setFeedbackError(null);
        setActiveTab("properties");
      }
    };
    reader.readAsDataURL(file);
    // Limpar o input para permitir upload do mesmo arquivo novamente se desejado
    e.target.value = "";
  };

  // Adicionar Logo da GH Camiseteria
  const handleAddDefaultLogo = () => {
    if (!targetZone) return;
    const res = addElement(
      {
        type: "LOGO",
        viewSide: selectedViewSide,
        zoneId: targetZone.id,
        x: targetZone.x + 10,
        y: targetZone.y + 10,
        width: Math.min(targetZone.width - 20, 110),
        height: Math.min(targetZone.height - 20, 110),
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        src: "/logo.png",
      },
      targetZone
    );

    if (!res.success) {
      setFeedbackError(res.error || "Erro ao adicionar logo.");
    } else {
      setFeedbackError(null);
      setActiveTab("properties");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {/* Abas Superiores do Painel */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 p-1 gap-1">
        <button
          onClick={() => setActiveTab("add")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "add"
              ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-[#d4af37] shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Adicionar
        </button>

        <button
          onClick={() => setActiveTab("properties")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "properties"
              ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-[#d4af37] shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          Propriedades
        </button>

        <button
          onClick={() => setActiveTab("model")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "model"
              ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-[#d4af37] shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Modelo & Cores
        </button>
      </div>

      {/* Alerta de erro de compatibilidade ou zona */}
      {feedbackError && (
        <div className="mx-4 mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-start justify-between gap-2">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span>{feedbackError}</span>
          </div>
          <button onClick={() => setFeedbackError(null)} className="text-red-500 font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* Conteúdo das Abas */}
      <div className="flex-1 p-4 overflow-y-auto space-y-5">
        {/* ================= ABA 1: ADICIONAR ELEMENTOS ================= */}
        {activeTab === "add" && (
          <div className="space-y-4">
            {/* Seletor de Zona Alvo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Zona de Aplicação Alvo ({selectedViewSide}):
              </label>
              {zones.length > 0 ? (
                <select
                  value={targetZone?.id || ""}
                  onChange={(e) => setSelectedTargetZoneId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-[#d4af37]"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.zone_name} ({z.zone_type}) - Aceita: {(z.allowed_element_types || []).join(", ")}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-slate-400">Nenhuma zona cadastrada nesta vista.</p>
              )}
            </div>

            {/* Inserir Texto */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-zinc-200">
                <Type className="h-4 w-4 text-[#d4af37]" />
                <span>Adicionar Texto / Frase</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Digite o texto..."
                  className="text-xs h-9"
                />
                <Button
                  size="sm"
                  onClick={handleAddText}
                  className="h-9 px-3 text-xs bg-slate-900 text-white hover:bg-slate-800 dark:bg-[#d4af37] dark:text-zinc-950 dark:font-semibold"
                >
                  Inserir
                </Button>
              </div>
            </div>

            {/* Inserir Número */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-zinc-200">
                <Hash className="h-4 w-4 text-[#d4af37]" />
                <span>Adicionar Numeração</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="Ex: 10"
                  maxLength={3}
                  className="text-xs h-9"
                />
                <Button
                  size="sm"
                  onClick={handleAddNumber}
                  className="h-9 px-3 text-xs bg-slate-900 text-white hover:bg-slate-800 dark:bg-[#d4af37] dark:text-zinc-950 dark:font-semibold"
                >
                  Inserir
                </Button>
              </div>
            </div>

            {/* Inserir Logo / Upload de Imagem */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-zinc-200">
                <ImageIcon className="h-4 w-4 text-[#d4af37]" />
                <span>Logomarcas e Imagens</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddDefaultLogo}
                  className="text-xs h-9 gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
                  Logo GH
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs h-9 gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5 text-blue-500" />
                  Upload
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <p className="text-[10px] text-slate-400">
                Formatos aceitos: PNG transparente, JPG, SVG ou WebP até 10MB.
              </p>
            </div>
          </div>
        )}

        {/* ================= ABA 2: PROPRIEDADES DO ELEMENTO SELECIONADO ================= */}
        {activeTab === "properties" && (
          <div className="space-y-4">
            {selectedElement ? (
              <div className="space-y-4">
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-zinc-950 text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                  <span>Tipo: {selectedElement.type}</span>
                  <span className="text-[10px] text-[#d4af37] font-mono">ID: {selectedElement.id.slice(-6)}</span>
                </div>

                {/* Se for Texto ou Número: Opções Tipográficas */}
                {(selectedElement.type === "TEXT" || selectedElement.type === "NUMBER") && (
                  <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Conteúdo do Texto
                      </label>
                      <Input
                        value={selectedElement.text || ""}
                        onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                        className="text-xs h-9"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Família da Fonte
                      </label>
                      <select
                        value={selectedElement.fontFamily || "Arial"}
                        onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs"
                      >
                        {AVAILABLE_FONTS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        <span>Tamanho da Fonte: {selectedElement.fontSize || 32}px</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="120"
                        value={selectedElement.fontSize || 32}
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                        className="w-full accent-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                        Cor do Texto
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {TEXT_COLORS.map((hex) => (
                          <button
                            key={hex}
                            onClick={() => updateElement(selectedElement.id, { fill: hex })}
                            style={{ backgroundColor: hex }}
                            className={`h-6 w-6 rounded-full border border-slate-300 dark:border-zinc-700 transition-transform ${
                              selectedElement.fill === hex ? "scale-125 ring-2 ring-[#d4af37]" : "hover:scale-110"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ajuste de Rotação Manual */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    <span>Rotação: {Math.round(selectedElement.rotation || 0)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={Math.round(selectedElement.rotation || 0)}
                    onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                    className="w-full accent-[#d4af37]"
                  />
                </div>

                {/* Ações Rápidas */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateElement(selectedElement.id)}
                    className="text-xs"
                  >
                    Duplicar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteElement(selectedElement.id)}
                    className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                <Sliders className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Clique em um elemento no uniforme para ajustar fonte, cores, rotação ou redimensioná-lo.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 3: MODELO E CORES DO TECIDO ================= */}
        {activeTab === "model" && (
          <div className="space-y-4">
            {/* Seleção do Modelo de Uniforme cadastrado no banco */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#d4af37]" />
                Modelo do Uniforme
              </label>
              <div className="space-y-1.5">
                {models.map((model) => {
                  const isSelected = selectedModel?.id === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => selectModel(model)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-[#d4af37] bg-[#d4af37]/10 text-slate-900 dark:text-[#d4af37] font-semibold"
                          : "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      <div>
                        <div className="font-bold">{model.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400">{model.product_name || "Base Corporativa"}</div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-[#d4af37]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paleta de Cores do Tecido */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-[#d4af37]" />
                Cor do Uniforme: {selectedColor.name}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {FABRIC_COLORS.map((color) => {
                  const isSelected = selectedColor.id === color.id;
                  return (
                    <button
                      key={color.id}
                      onClick={() => selectColor(color)}
                      style={{ backgroundColor: color.hex }}
                      className={`h-9 rounded-lg border border-slate-300 dark:border-zinc-700 flex items-center justify-center transition-all ${
                        isSelected ? "scale-105 ring-2 ring-[#d4af37] ring-offset-2" : "hover:scale-105"
                      }`}
                      title={color.name}
                    >
                      {isSelected && (
                        <Check
                          className="h-4 w-4 drop-shadow"
                          style={{ color: color.textColor }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seletor de Vistas Inferior (Frente, Costas, Mangas) */}
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60">
        <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1.5">Vista Ativa:</div>
        <div className="grid grid-cols-4 gap-1.5">
          {VIEW_TABS.map((tab) => {
            const isSelected = selectedViewSide === tab.side;
            return (
              <button
                key={tab.side}
                onClick={() => selectViewSide(tab.side)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all truncate text-center ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
