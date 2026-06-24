import { useState, useRef, useCallback, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { NodeToolbar } from "./NodeToolbar";
import { useCanvasSerializer } from "./useCanvasSerializer";
import { applyCanvasDiff } from "./ApplyCanvasActions";
import type { SdNodeType } from "./systemDesignNodeTypes";
import type { CanvasDiffAction, CanvasSnapshot } from "@evalio/shared";

interface WhiteboardPanelProps {
  visible: boolean;
  topicTitle: string;
  topicDescription: string;
  onCanvasSnapshot: (snapshot: CanvasSnapshot) => void;
  canvasDiff: CanvasDiffAction[] | null;
  onClearCanvasDiff: () => void;
}

export function WhiteboardPanel({
  visible,
  topicTitle,
  topicDescription,
  onCanvasSnapshot,
  canvasDiff,
  onClearCanvasDiff,
}: WhiteboardPanelProps) {
  const [selectedType, setSelectedType] = useState<SdNodeType | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const serializer = useCanvasSerializer(
    useCallback(
      (snapshot: CanvasSnapshot) => {
        onCanvasSnapshot(snapshot);
      },
      [onCanvasSnapshot],
    ),
  );

  const handleExcalidrawChange = useCallback(
    (elements: readonly Record<string, unknown>[]) => {
      if (!canvasReady) return;
      serializer.onChange(elements);
    },
    [serializer, canvasReady],
  );

  const handleTypeSelect = useCallback((type: SdNodeType | null) => {
    setSelectedType(type);
    if (type && apiRef.current) {
      apiRef.current.setActiveTool({ type: "custom", customType: type });
    } else if (apiRef.current) {
      apiRef.current.setActiveTool({ type: "selection" });
    }
  }, []);

  useEffect(() => {
    if (canvasDiff && canvasDiff.length > 0 && apiRef.current) {
      applyCanvasDiff(apiRef.current, canvasDiff);
      onClearCanvasDiff();
    }
  }, [canvasDiff, onClearCanvasDiff]);

  useEffect(() => {
    if (document.querySelector('link[href*="excalidraw"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/excalidraw.css";
    document.head.appendChild(link);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "65vw",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        background: "var(--db-card-bg, #1a1a2e)",
        borderLeft: "1px solid var(--app-accent-border, #2a2a3e)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "var(--db-card-shadow, 0 0 40px rgba(0,0,0,0.3))",
      }}
    >
      {/* Topic question bar */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-border-light, #2a2a3e)",
          background: "var(--color-bg-hover, #141428)",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--color-text, #e2e8f0)",
          }}
        >
          {topicTitle}
        </h3>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "12px",
            color: "var(--color-text-secondary, #94a3b8)",
            lineHeight: 1.4,
          }}
        >
          {topicDescription}
        </p>
      </div>

      {/* Node toolbar */}
      <NodeToolbar
        selectedType={selectedType}
        onSelectType={handleTypeSelect}
      />

      {/* Excalidraw canvas */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Excalidraw
          excalidrawAPI={(api) => {
            apiRef.current = api;
            setCanvasReady(true);
          }}
          onChange={handleExcalidrawChange}
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: false,
              clearCanvas: false,
              export: false,
              loadScene: false,
              saveToActiveFile: false,
              toggleTheme: false,
              saveAsImage: false,
            },
            tools: {
              image: false,
            },
          }}
          theme="dark"
          viewModeEnabled={false}
          name="System Design Whiteboard"
        />
      </div>
    </div>
  );
}
