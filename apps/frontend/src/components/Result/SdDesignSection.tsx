import { useEffect, useMemo, useState } from "react";
import type { CanvasSnapshot } from "@evalio/shared";

interface SdDesignSectionProps {
  finalDiagram: CanvasSnapshot | null;
}

export function SdDesignSection({ finalDiagram }: SdDesignSectionProps) {
  const [Excalidraw, setExcalidraw] = useState<React.ComponentType<{
    viewModeEnabled?: boolean;
    initialData?: {
      elements: never[];
      appState: { viewBackgroundColor: string };
      scrollToContent: boolean;
    };
    theme?: string;
  }> | null>(null);

  useEffect(() => {
    import("@excalidraw/excalidraw").then((mod) => {
      setExcalidraw(() => mod.Excalidraw);
    });
  }, []);

  useEffect(() => {
    if (document.querySelector('link[href*="excalidraw"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/excalidraw.css";
    document.head.appendChild(link);
  }, []);

  const initialData = useMemo(() => {
    if (!finalDiagram) return undefined;
    const elements =
      finalDiagram.scene && finalDiagram.scene.length > 0
        ? (finalDiagram.scene as never[])
        : [];
    return {
      elements,
      appState: { viewBackgroundColor: "#1a1a2e" },
      scrollToContent: true,
    };
  }, [finalDiagram]);

  if (!finalDiagram) return null;

  return (
    <div className="mb-10">
      <p
        className="text-[11px] tracking-[0.1em] uppercase mb-4 font-semibold"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        YOUR SYSTEM DESIGN
      </p>
      <div
        className="rounded-lg overflow-hidden border"
        style={{
          height: "500px",
          borderColor: "var(--color-border)",
        }}
      >
        {Excalidraw ? (
          <Excalidraw
            viewModeEnabled={true}
            initialData={initialData}
            theme="dark"
          />
        ) : (
          <div
            className="flex items-center justify-center h-full"
            style={{
              background: "var(--color-bg-hover)",
            }}
          >
            <span className="text-[13px] text-[var(--color-text-muted)]">
              Loading design diagram...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
