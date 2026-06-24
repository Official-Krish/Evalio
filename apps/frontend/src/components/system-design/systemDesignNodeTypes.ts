export type SdNodeType = "service" | "storage" | "queue" | "cache" | "note";

export const SD_NODE_DEFS: {
  type: SdNodeType;
  label: string;
  color: string;
  shape: "rounded-rect" | "rect" | "ellipse";
  icon: string;
}[] = [
  {
    type: "service",
    label: "Service",
    color: "#5DCAA5",
    shape: "rounded-rect",
    icon: "⬡",
  },
  {
    type: "storage",
    label: "Storage",
    color: "#10b981",
    shape: "rect",
    icon: "🗄",
  },
  { type: "queue", label: "Queue", color: "#3b82f6", shape: "rect", icon: "⇶" },
  {
    type: "cache",
    label: "Cache",
    color: "#EF9F27",
    shape: "ellipse",
    icon: "⚡",
  },
  { type: "note", label: "Note", color: "#fbbf24", shape: "rect", icon: "📝" },
];

export function createSdElement(
  sdType: SdNodeType,
  x: number,
  y: number,
): Record<string, unknown> {
  const def = SD_NODE_DEFS.find((d) => d.type === sdType)!;
  const width = def.type === "cache" ? 100 : 140;
  const height = def.type === "cache" ? 100 : 80;

  return {
    type: def.shape === "ellipse" ? "ellipse" : "rectangle",
    x,
    y,
    width,
    height,
    strokeColor: def.color,
    backgroundColor: def.color + "25",
    fillStyle: "solid",
    strokeWidth: 2,
    roughness: 0,
    opacity: 100,
    roundness:
      def.shape === "rounded-rect"
        ? { type: 3, value: 8 }
        : def.shape === "ellipse"
          ? null
          : { type: 3, value: 2 },
    customData: { sdType },
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
    index: null,
  };
}
