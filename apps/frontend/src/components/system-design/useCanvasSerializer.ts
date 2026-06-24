import { useRef, useCallback, useEffect } from "react";
import type { CanvasSnapshot, CanvasNode, CanvasEdge } from "@evalio/shared";

const HEURISTIC_RULES: [RegExp, string, number, string[]?][] = [
  [/db|postgres|mysql|mongo|s3|cassandra|dynamo/i, "storage", 0.9],
  [/redis|memcached|cache/i, "cache", 0.9],
  [/queue|kafka|rabbitmq|sqs|pubsub/i, "queue", 0.9],
  [/lb|load.?balancer|nginx|haproxy/i, "service", 0.85, ["load_balancer"]],
  [/cdn|cloudfront|cloudflare/i, "service", 0.85, ["cdn"]],
  [/auth|gateway|api|worker/i, "service", 0.7],
];

function heuristicType(label: string): {
  type: string;
  confidence: number;
  tags?: string[];
} {
  for (const [regex, type, confidence, tags] of HEURISTIC_RULES) {
    if (regex.test(label)) {
      return { type, confidence, tags };
    }
  }
  return { type: "service", confidence: 0.3 };
}

function extractNodesAndEdges(elements: readonly Record<string, unknown>[]): {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
} {
  const nodes: CanvasNode[] = [];
  const edges: CanvasEdge[] = [];

  const textByContainer = new Map<string, string>();

  for (const el of elements) {
    if (el.isDeleted) continue;
    if (el.type === "text" && el.containerId) {
      textByContainer.set(
        el.containerId as string,
        (el.text ?? el.originalText ?? "") as string,
      );
    }
  }

  for (const el of elements) {
    if (el.isDeleted) continue;
    const id = el.id as string;
    const elType = el.type as string;

    if (elType === "arrow") {
      const source = (el as Record<string, unknown>).startBinding as Record<
        string,
        unknown
      > | null;
      const target = (el as Record<string, unknown>).endBinding as Record<
        string,
        unknown
      > | null;
      if (source?.elementId && target?.elementId) {
        const label = (el as Record<string, unknown>).text as
          | string
          | undefined;
        edges.push({
          id,
          source: source.elementId as string,
          target: target.elementId as string,
          label: label || undefined,
        });
      }
      continue;
    }

    if (elType === "text" && !el.containerId) {
      nodes.push({
        id,
        type: "note",
        label: (el.text ?? el.originalText ?? "") as string,
        origin: "user",
        confidence: 0.5,
        inference: "heuristic",
      });
      continue;
    }

    if (elType === "text") continue;

    const customData = el.customData as Record<string, unknown> | undefined;
    if (customData?.sdType) {
      const label = (textByContainer.get(id) ??
        el.text ??
        el.originalText ??
        "") as string;
      nodes.push({
        id,
        type: customData.sdType as string,
        label,
        origin: (customData.origin as "user" | "ai") ?? "user",
        confidence: 1.0,
        inference: "explicit",
      });
      continue;
    }

    if (
      elType === "rectangle" ||
      elType === "ellipse" ||
      elType === "diamond"
    ) {
      const label = textByContainer.get(id) ?? "";
      if (!label) continue;
      const { type, confidence, tags } = heuristicType(label);
      nodes.push({
        id,
        type,
        label,
        origin: "user",
        confidence,
        inference: "heuristic",
        ...(tags ? { tags } : {}),
      });
    }
  }

  return { nodes, edges };
}

export interface SerializerAPI {
  getSnapshot: () => CanvasSnapshot | null;
  resetCanvas: () => void;
  onChange: (elements: readonly Record<string, unknown>[]) => void;
}

export function useCanvasSerializer(
  onSnapshot: (snapshot: CanvasSnapshot) => void,
): SerializerAPI {
  const snapshotRef = useRef<CanvasSnapshot | null>(null);
  const elementsRef = useRef<readonly Record<string, unknown>[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const forceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);

  const emitSnapshot = useCallback(() => {
    if (!pendingRef.current) return;
    pendingRef.current = false;
    const { nodes, edges } = extractNodesAndEdges(elementsRef.current);
    const snapshot: CanvasSnapshot = {
      version: 1,
      timestamp: Date.now(),
      nodes,
      edges,
    };
    snapshotRef.current = snapshot;
    onSnapshot(snapshot);
  }, [onSnapshot]);

  const scheduleSnapshot = useCallback(
    (elements: readonly Record<string, unknown>[]) => {
      elementsRef.current = elements;
      pendingRef.current = true;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (forceTimerRef.current) clearTimeout(forceTimerRef.current);

      debounceRef.current = setTimeout(emitSnapshot, 15_000);
      forceTimerRef.current = setTimeout(emitSnapshot, 35_000);
    },
    [emitSnapshot],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (forceTimerRef.current) clearTimeout(forceTimerRef.current);
    };
  }, []);

  const getSnapshot = useCallback(() => snapshotRef.current, []);

  const resetCanvas = useCallback(() => {
    snapshotRef.current = null;
    elementsRef.current = [];
    pendingRef.current = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (forceTimerRef.current) clearTimeout(forceTimerRef.current);
  }, []);

  return { getSnapshot, resetCanvas, onChange: scheduleSnapshot };
}

export type { CanvasSnapshot };
export { extractNodesAndEdges };
