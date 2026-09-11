"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Rect, Circle, Text as KonvaText, Group, Transformer, Path, Image as KonvaImage } from "react-konva";
import type Konva from "konva";
import { useConfiguratorStore } from "@/stores/configurator.store";
import { getGarmentType, getGarmentTemplate } from "@/lib/svg-templates";
import type { CustomizerElement } from "@/types/configurator";
import type { CustomizationZone } from "@/types/uniform-model";

// Componente para carregar imagens assincronamente no Konva
function CanvasImageItem({
  element,
  zone,
  onSelect,
  onChange,
}: {
  element: CustomizerElement;
  zone?: CustomizationZone;
  onSelect: () => void;
  onChange: (newAttrs: Partial<CustomizerElement>) => void;
}) {
  const imageRef = useRef<Konva.Image | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!element.src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = element.src;
    img.onload = () => setImage(img);
  }, [element.src]);

  // Restrição de arraste para a zona permitida
  const dragBoundFunc = (pos: { x: number; y: number }) => {
    if (!zone) return pos;
    const scaleX = element.scaleX || 1;
    const scaleY = element.scaleY || 1;
    const elemWidth = (element.width || 100) * scaleX;
    const elemHeight = (element.height || 100) * scaleY;

    const minX = zone.x;
    const maxX = zone.x + zone.width - elemWidth;
    const minY = zone.y;
    const maxY = zone.y + zone.height - elemHeight;

    return {
      x: Math.max(minX, Math.min(pos.x, maxX > minX ? maxX : minX)),
      y: Math.max(minY, Math.min(pos.y, maxY > minY ? maxY : minY)),
    };
  };

  return (
    <KonvaImage
      ref={imageRef}
      id={element.id}
      image={image || undefined}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      scaleX={element.scaleX || 1}
      scaleY={element.scaleY || 1}
      rotation={element.rotation || 0}
      draggable
      dragBoundFunc={dragBoundFunc}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={() => {
        const node = imageRef.current;
        if (!node) return;
        onChange({
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation(),
        });
      }}
    />
  );
}

function CanvasTextItem({
  element,
  displayText,
  zone,
  onSelect,
  onChange,
}: {
  element: CustomizerElement;
  displayText?: string;
  zone?: CustomizationZone;
  onSelect: () => void;
  onChange: (newAttrs: Partial<CustomizerElement>) => void;
}) {
  const textRef = useRef<Konva.Text | null>(null);

  const dragBoundFunc = (pos: { x: number; y: number }) => {
    if (!zone) return pos;
    const scaleX = element.scaleX || 1;
    const scaleY = element.scaleY || 1;
    const elemWidth = (element.width || 120) * scaleX;
    const elemHeight = (element.height || 60) * scaleY;

    const minX = zone.x;
    const maxX = zone.x + zone.width - elemWidth;
    const minY = zone.y;
    const maxY = zone.y + zone.height - elemHeight;

    return {
      x: Math.max(minX, Math.min(pos.x, maxX > minX ? maxX : minX)),
      y: Math.max(minY, Math.min(pos.y, maxY > minY ? maxY : minY)),
    };
  };

  return (
    <KonvaText
      ref={textRef}
      id={element.id}
      text={displayText !== undefined ? displayText : element.text || "TEXTO"}
      fontSize={element.fontSize || 36}
      fontFamily={element.fontFamily || "Impact"}
      fill={element.fill || "#FFFFFF"}
      fontStyle={element.type === "NUMBER" ? "bold" : "normal"}
      x={element.x}
      y={element.y}
      scaleX={element.scaleX || 1}
      scaleY={element.scaleY || 1}
      rotation={element.rotation || 0}
      draggable
      dragBoundFunc={dragBoundFunc}
      onClick={onSelect}
      onTap={onSelect}
      shadowColor="rgba(0,0,0,0.3)"
      shadowBlur={2}
      shadowOffsetX={1}
      shadowOffsetY={1}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={() => {
        const node = textRef.current;
        if (!node) return;
        onChange({
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation(),
        });
      }}
    />
  );
}

export function KonvaConfiguratorStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const [scale, setScale] = useState(1);
  const baseSize = 800;

  const {
    selectedModel,
    selectedColor,
    selectedViewSide,
    elements,
    selectedElementId,
    showZones,
    selectElement,
    updateElement,
    getActiveViewZones,
    teamRoster,
    getActivePreviewMember,
  } = useConfiguratorStore();

  const currentElements = useMemo(
    () => elements[selectedViewSide] || [],
    [elements, selectedViewSide]
  );
  const currentZones = getActiveViewZones();

  // Responsividade: Ajustar tamanho do canvas ao container pai
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const newScale = Math.min(width / baseSize, 1);
      setScale(newScale > 0.35 ? newScale : 0.35);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sincronizar transformer com o nó selecionado
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    const tr = transformerRef.current;

    if (!selectedElementId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    const stage = stageRef.current;
    const selectedNode = stage.findOne(`#${selectedElementId}`);
    if (selectedNode) {
      tr.nodes([selectedNode]);
      tr.getLayer()?.batchDraw();
    } else {
      tr.nodes([]);
    }
  }, [selectedElementId, currentElements, selectedViewSide]);

  // Expor captura de foto de estúdio em altíssima definição (2000px+)
  useEffect(() => {
    function exportKonvaStage(): string | null {
      if (!stageRef.current) return null;
      try {
        if (transformerRef.current) {
          transformerRef.current.nodes([]);
          transformerRef.current.getLayer()?.batchDraw();
        }
        return stageRef.current.toDataURL({ pixelRatio: 2.5, mimeType: "image/png" });
      } catch (err) {
        console.error("Erro ao exportar foto de estúdio Konva:", err);
        return null;
      }
    }

    (window as unknown as { __konva_export_studio__?: () => string | null }).__konva_export_studio__ = exportKonvaStage;
    return () => {
      delete (window as unknown as { __konva_export_studio__?: () => string | null }).__konva_export_studio__;
    };
  }, []);

  // Obter zona ativa do elemento selecionado para limitar escala min/max
  const selectedElement = currentElements.find((el) => el.id === selectedElementId);
  const selectedElementZone = currentZones.find((z) => z.id === selectedElement?.zoneId);

  // Integrante ativo para pré-visualização no uniforme
  const activePreviewMember = getActivePreviewMember();

  const getDisplayText = (elem: CustomizerElement) => {
    if (teamRoster.enabled && activePreviewMember) {
      if (elem.linkedMemberField === "name") {
        return activePreviewMember.name;
      }
      if (elem.linkedMemberField === "number") {
        return activePreviewMember.number || elem.text || "10";
      }
      if (elem.type === "NUMBER" && activePreviewMember.number) {
        return activePreviewMember.number;
      }
      if (
        elem.type === "TEXT" &&
        (elem.text?.toUpperCase() === "NOME" ||
          elem.text?.toLowerCase() === "{nome}" ||
          elem.text?.toUpperCase() === "NOME DO INTEGRANTE")
      ) {
        return activePreviewMember.name;
      }
    }
    return elem.text || (elem.type === "NUMBER" ? "10" : "TEXTO");
  };

  // Template visual dinâmico de acordo com o modelo selecionado (Polo, Manga Longa ou Tradicional)
  const garmentType = getGarmentType(selectedModel?.name || selectedModel?.id);
  const garmentTemplate = getGarmentTemplate(garmentType, selectedViewSide);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-[680px] mx-auto rounded-2xl bg-slate-100/70 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-inner flex items-center justify-center overflow-hidden"
    >
      {/* Grid de alinhamento suave */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <Stage
        ref={stageRef}
        width={baseSize * scale}
        height={baseSize * scale}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={(e) => {
          // Deselecionar ao clicar no fundo vazio
          if (e.target === e.target.getStage()) {
            selectElement(null);
          }
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) {
            selectElement(null);
          }
        }}
      >
        {/* Camada 1: Silhueta da Peça com Profundidade Fotográfica, Sombras 3D e Acabamentos Reais */}
        <Layer>
          <Group>
            {/* 1. Sombra suave projetada no piso de estúdio */}
            <Path
              data={garmentTemplate.path}
              fill="rgba(0,0,0,0.12)"
              offsetX={-6}
              offsetY={-10}
            />

            {/* 2. Tecido Base (Tingimento instantâneo com a cor do cliente) */}
            <Path
              data={garmentTemplate.path}
              fill={selectedColor.hex}
              stroke={selectedColor.hex === "#FFFFFF" ? "#CBD5E1" : "rgba(0,0,0,0.35)"}
              strokeWidth={2.5}
              lineJoin="round"
            />

            {/* 3. Sombras Anatômicas de Dobras Naturais e Caimento */}
            {garmentTemplate.shadowPath && (
              <Path
                data={garmentTemplate.shadowPath}
                stroke={selectedColor.hex === "#FFFFFF" ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.26)"}
                strokeWidth={3}
                lineCap="round"
                lineJoin="round"
              />
            )}

            {/* 4. Costuras Pespontadas Duplas de Confecção */}
            {garmentTemplate.stitchesPath && (
              <Path
                data={garmentTemplate.stitchesPath}
                stroke={selectedColor.hex === "#FFFFFF" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.20)"}
                strokeWidth={1.5}
                dash={[5, 3]}
              />
            )}

            {/* 5. Acabamentos de Ribana (Mangas e Punhos Longos) */}
            {garmentTemplate.cuffsPath && (
              <Path
                data={garmentTemplate.cuffsPath}
                fill={selectedColor.hex === "#FFFFFF" ? "#F1F5F9" : "rgba(0,0,0,0.14)"}
                stroke={selectedColor.hex === "#FFFFFF" ? "#94A3B8" : "rgba(255,255,255,0.18)"}
                strokeWidth={1.5}
              />
            )}

            {/* 6. Peitilho da Camisa Polo */}
            {garmentTemplate.placketPath && (
              <Path
                data={garmentTemplate.placketPath}
                fill={selectedColor.hex === "#FFFFFF" ? "#F8FAFC" : "rgba(0,0,0,0.12)"}
                stroke={selectedColor.hex === "#FFFFFF" ? "#94A3B8" : "rgba(255,255,255,0.25)"}
                strokeWidth={2}
              />
            )}

            {/* 7. Gola Base */}
            {garmentTemplate.collarPath && (
              <Path
                data={garmentTemplate.collarPath}
                fill={selectedColor.hex === "#FFFFFF" ? "#F1F5F9" : "rgba(0,0,0,0.2)"}
                stroke={selectedColor.hex === "#FFFFFF" ? "#94A3B8" : "rgba(255,255,255,0.25)"}
                strokeWidth={2}
              />
            )}

            {/* 8. Lapelas estruturadas da Gola Polo dobrada com sombra suave */}
            {garmentTemplate.collarFlapsPath && (
              <Path
                data={garmentTemplate.collarFlapsPath}
                fill={selectedColor.hex === "#FFFFFF" ? "#FFFFFF" : selectedColor.hex}
                stroke={selectedColor.hex === "#FFFFFF" ? "#64748B" : "rgba(0,0,0,0.38)"}
                strokeWidth={2}
                shadowColor="rgba(0,0,0,0.28)"
                shadowBlur={8}
                shadowOffset={{ x: 0, y: 4 }}
              />
            )}

            {/* 9. Botões com Costura e Reflexo Perolado */}
            {garmentTemplate.buttons?.map((btn, bIdx) => (
              <Group key={bIdx} x={btn.x} y={btn.y}>
                <Circle radius={btn.r} fill="rgba(0,0,0,0.25)" offsetY={-1.5} />
                <Circle
                  radius={btn.r}
                  fill="#F8FAFC"
                  stroke="#64748B"
                  strokeWidth={1.2}
                />
                <Circle radius={btn.r - 2} stroke="#CBD5E1" strokeWidth={0.8} />
                <Circle x={-1.5} y={-1.5} radius={0.7} fill="#334155" />
                <Circle x={1.5} y={-1.5} radius={0.7} fill="#334155" />
                <Circle x={-1.5} y={1.5} radius={0.7} fill="#334155" />
                <Circle x={1.5} y={1.5} radius={0.7} fill="#334155" />
              </Group>
            ))}
          </Group>
        </Layer>

        {/* Camada 2: Áreas/Zonas Técnicas Permitidas (se showZones estiver ativo) */}
        {showZones && (
          <Layer>
            {currentZones.map((zone) => {
              const isSelectedZone = selectedElement?.zoneId === zone.id;
              return (
                <Group key={zone.id}>
                  <Rect
                    x={zone.x}
                    y={zone.y}
                    width={zone.width}
                    height={zone.height}
                    stroke={isSelectedZone ? "#d4af37" : "rgba(59, 130, 246, 0.75)"}
                    strokeWidth={isSelectedZone ? 2.5 : 1.5}
                    dash={isSelectedZone ? [6, 3] : [4, 4]}
                    fill={isSelectedZone ? "rgba(212, 175, 55, 0.08)" : "rgba(59, 130, 246, 0.04)"}
                    cornerRadius={4}
                  />
                  <KonvaText
                    x={zone.x + 6}
                    y={zone.y + 6}
                    text={`${zone.zone_name.toUpperCase()}`}
                    fontSize={11}
                    fontFamily="sans-serif"
                    fontStyle="bold"
                    fill={isSelectedZone ? "#b45309" : "#2563eb"}
                  />
                </Group>
              );
            })}
          </Layer>
        )}

        {/* Camada 3: Elementos de Personalização (Textos, Números, Logos, Imagens) */}
        <Layer>
          {currentElements.map((elem) => {
            const zone = currentZones.find((z) => z.id === elem.zoneId);

            if (elem.type === "IMAGE" || elem.type === "LOGO") {
              return (
                <CanvasImageItem
                  key={elem.id}
                  element={elem}
                  zone={zone}
                  onSelect={() => selectElement(elem.id)}
                  onChange={(updates) => updateElement(elem.id, updates)}
                />
              );
            }

            return (
              <CanvasTextItem
                key={elem.id}
                element={elem}
                displayText={getDisplayText(elem)}
                zone={zone}
                onSelect={() => selectElement(elem.id)}
                onChange={(updates) => updateElement(elem.id, updates)}
              />
            );
          })}

          {/* Transformer interativo com suporte a rotação e restrição de escala */}
          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right",
            ]}
            borderStroke="#d4af37"
            borderStrokeWidth={2}
            anchorFill="#d4af37"
            anchorStroke="#09090b"
            anchorSize={9}
            anchorCornerRadius={2}
            boundBoxFunc={(oldBox, newBox) => {
              // Respeitar escala mínima e máxima da zona permitida
              const minScale = selectedElementZone?.min_scale || 0.2;
              const maxScale = selectedElementZone?.max_scale || 3.0;

              const baseW = selectedElement?.width || 100;
              const currentScale = newBox.width / baseW;

              if (currentScale < minScale || currentScale > maxScale) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}
