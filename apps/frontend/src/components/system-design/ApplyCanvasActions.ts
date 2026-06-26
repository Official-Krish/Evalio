import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { CanvasDiffAction } from "@evalio/shared";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type El = Record<string, any>;

export function applyCanvasDiff(
  api: ExcalidrawImperativeAPI,
  actions: CanvasDiffAction[],
): void {
  const elements: El[] = api.getSceneElements().map((el: El) => ({ ...el }));
  const changed = new Set<string>();

  for (const action of actions) {
    switch (action.action) {
      case "highlight": {
        for (const nodeId of action.nodeIds) {
          const el = elements.find((e: El) => e.id === nodeId);
          if (el) {
            el.strokeColor = action.color ?? "#ef4444";
            el.strokeWidth = 4;
            changed.add(nodeId);
            setTimeout(() => {
              const current: El[] = api
                .getSceneElements()
                .map((e: El) => ({ ...e }));
              const restore = current.find((e: El) => e.id === nodeId);
              if (restore) {
                restore.strokeColor = el.customData?.sdType
                  ? "#5DCAA5"
                  : "var(--color-border-light, #2a2a3e)";
                restore.strokeWidth = 2;
                api.updateScene({ elements: current as never });
              }
            }, action.durationMs ?? 5000);
          }
        }
        break;
      }

      case "add_node": {
        const width = action.type === "cache" ? 100 : 140;
        const height = action.type === "cache" ? 100 : 80;
        const colorMap: Record<string, string> = {
          service: "#5DCAA5",
          storage: "#10b981",
          queue: "#3b82f6",
          cache: "#EF9F27",
          note: "#fbbf24",
        };
        const color = colorMap[action.type] ?? "#5DCAA5";

        elements.push({
          id: action.id,
          type: action.type === "cache" ? "ellipse" : "rectangle",
          x: action.x,
          y: action.y,
          width,
          height,
          strokeColor: color,
          backgroundColor: color + "20",
          fillStyle: "solid",
          strokeWidth: 2,
          strokeStyle: "dashed",
          roughness: 0,
          opacity: 85,
          roundness:
            action.type === "service"
              ? { type: 3, value: 8 }
              : action.type === "cache"
                ? null
                : { type: 3, value: 2 },
          customData: { sdType: action.type, origin: "ai" },
          seed: Math.floor(Math.random() * 100000),
          version: 1,
          versionNonce: Math.floor(Math.random() * 1000000),
          isDeleted: false,
          groupIds: [],
          frameId: null,
          boundElements: null,
          updated: Date.now(),
          link: null,
          locked: false,
          angle: 0,
        } as never);
        break;
      }

      case "remove_node": {
        const idx = elements.findIndex((e: El) => e.id === action.id);
        if (idx >= 0) {
          const el = elements[idx]!;
          if (
            el.customData &&
            typeof el.customData === "object" &&
            "origin" in el.customData &&
            el.customData.origin === "ai"
          ) {
            elements.splice(idx, 1);
          }
        }
        break;
      }

      case "annotate": {
        const noteId = `ai-note-${Date.now()}`;
        elements.push({
          id: noteId,
          type: "rectangle",
          x: action.x,
          y: action.y,
          width: 200,
          height: 60,
          strokeColor: "#fbbf24",
          backgroundColor: "#fbbf2415",
          fillStyle: "solid",
          strokeWidth: 1,
          roughness: 0,
          opacity: 90,
          roundness: { type: 3, value: 4 },
          customData: { sdType: "note", origin: "ai" },
          seed: Math.floor(Math.random() * 100000),
          version: 1,
          versionNonce: Math.floor(Math.random() * 1000000),
          isDeleted: false,
          groupIds: [],
          frameId: null,
          boundElements: null,
          updated: Date.now(),
          link: null,
          locked: false,
          angle: 0,
        } as never);
        const textId = `ai-note-text-${Date.now()}`;
        elements.push({
          id: textId,
          type: "text",
          x: action.x + 8,
          y: action.y + 8,
          width: 184,
          height: 44,
          text: action.text,
          fontSize: 13,
          fontFamily: 2,
          textAlign: "left",
          strokeColor: "#fbbf24",
          backgroundColor: "transparent",
          fillStyle: "solid",
          strokeWidth: 0,
          roughness: 0,
          opacity: 100,
          roundness: null,
          containerId: noteId,
          customData: null,
          seed: Math.floor(Math.random() * 100000),
          version: 1,
          versionNonce: Math.floor(Math.random() * 1000000),
          isDeleted: false,
          groupIds: [],
          frameId: null,
          boundElements: null,
          updated: Date.now(),
          link: null,
          locked: false,
          angle: 0,
        } as never);
        break;
      }

      case "clear_highlights": {
        for (const el of elements) {
          el.strokeWidth = 2;
          el.strokeColor = el.customData?.sdType
            ? "#5DCAA5"
            : "var(--color-border-light, #2a2a3e)";
        }
        break;
      }
    }
  }

  if (
    changed.size > 0 ||
    actions.some((a: CanvasDiffAction) => a.action !== "highlight")
  ) {
    api.updateScene({
      elements: elements as never,
      captureUpdate: "IMMEDIATELY" as const,
    });
  }
}
