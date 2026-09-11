"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Rect, Text as KonvaText, Group, Transformer, Path, Image as KonvaImage } from "react-konva";
import type Konva from "konva";
import { useConfiguratorStore } from "@/stores/configurator.store";
import { SHIRT_SVG_TEMPLATES } from "@/lib/svg-templates";
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

// Componente para renderizar Textos e Números no Konva
function CanvasTextItem({
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
      text={element.text || "TEXTO"}
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
    selectedColor,
    selectedViewSide,
    elements,
    selectedElementId,
    showZones,
    selectElement,
    updateElement,
    getActiveViewZones,
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

  // Obter zona ativa do elemento selecionado para limitar escala min/max
  const selectedElement = currentElements.find((el) => el.id === selectedElementId);
  const selectedElementZone = currentZones.find((z) => z.id === selectedElement?.zoneId);

  // Template SVG para a vista ativa
  const svgTemplate =
    (SHIRT_SVG_TEMPLATES as Record<string, { path: string; collarPath: string }>)[selectedViewSide] ||
    SHIRT_SVG_TEMPLATES.FRONT;

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
        {/* Camada 1: Silhueta da Camiseta com a cor do tecido selecionada */}
        <Layer>
          <Group>
            {/* Sombra da peça */}
            <Path
              data={svgTemplate.path}
              fill="rgba(0,0,0,0.08)"
              offsetX={-4}
              offsetY={-6}
            />
            {/* Peça principal */}
            <Path
              data={svgTemplate.path}
              fill={selectedColor.hex}
              stroke={selectedColor.hex === "#FFFFFF" ? "#E2E8F0" : "#27272A"}
              strokeWidth={3}
              lineJoin="round"
            />
            {/* Detalhe da gola / recortes */}
            <Path
              data={svgTemplate.collarPath}
              fill={selectedColor.hex === "#FFFFFF" ? "#F1F5F9" : "rgba(0,0,0,0.15)"}
              stroke={selectedColor.hex === "#FFFFFF" ? "#CBD5E1" : "rgba(255,255,255,0.15)"}
              strokeWidth={2}
            />
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
