import { EventEmitter } from "node:events";
import { GoogleGenAI, Modality, type Session, type Tool } from "@google/genai";

export interface GeminiSession {
  on(
    event: "message" | "error" | "close",
    listener: (...args: unknown[]) => void,
  ): this;
  send(data: string): void;
  close(): void;
}

const ai = new GoogleGenAI({
  apiKey: Bun.env.GEMINI_API_KEY,
});

export const FUNCTION_DECLARATIONS = [
  {
    name: "updateCandidateCode",
    description:
      "Update the candidate's code in the editor. Provide the FULL updated source code — it completely replaces whatever the candidate has in their editor. Call this to fix bugs, demonstrate a point, add inline comments as examples, show an alternative approach, or write test cases.",
    parameters: {
      type: "OBJECT" as any,
      properties: {
        code: {
          type: "STRING" as any,
          description:
            "The full updated source code that will replace the candidate's current code in the editor.",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "advanceToNextQuestion",
    description:
      "Signal that the current question has been sufficiently discussed and the interview should move to the next question. Optionally provide a 1-based question number to skip ahead (e.g., 3 to jump to the third question when the first was too easy). This replaces the READY_FOR_NEXT signal.",
    parameters: {
      type: "OBJECT",
      properties: {
        skipToIndex: {
          type: "INTEGER",
          description:
            "Optional 1-based question index to skip to (e.g., 3 to jump directly to question 3). Omit to advance by one.",
        },
      },
    },
  },
  {
    name: "allDone",
    description:
      "Signal that all questions have been completed and the interview should wrap up. Call this when time is nearly up or the candidate clearly cannot continue. This replaces the ALL_DONE signal.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "canvasDiff",
    description:
      "Apply additive modifications to the candidate's whiteboard canvas. Actions are additive — they never remove the candidate's work. Use to highlight specific nodes, add suggestion nodes (dashed border), place sticky-note annotations, or clear all highlights.",
    parameters: {
      type: "OBJECT",
      properties: {
        actions: {
          type: "ARRAY",
          description: "List of canvas actions to apply in sequence.",
          items: {
            type: "OBJECT",
            properties: {
              action: {
                type: "STRING",
                description: "The action to perform.",
                enum: [
                  "highlight",
                  "add_node",
                  "remove_node",
                  "annotate",
                  "clear_highlights",
                ],
              },
              nodeIds: {
                type: "ARRAY",
                description: "For highlight: node IDs to glow.",
                items: { type: "STRING" },
              },
              color: {
                type: "STRING",
                description: "For highlight: hex color (e.g., '#ef4444').",
              },
              durationMs: {
                type: "NUMBER",
                description: "For highlight: duration in milliseconds.",
              },
              id: {
                type: "STRING",
                description:
                  "For add_node/remove_node: unique node identifier.",
              },
              type: {
                type: "STRING",
                description:
                  "For add_node: the node type (service, storage, queue, cache, note).",
              },
              label: {
                type: "STRING",
                description: "For add_node: display label text.",
              },
              x: {
                type: "NUMBER",
                description: "For add_node: horizontal position.",
              },
              y: {
                type: "NUMBER",
                description: "For add_node: vertical position.",
              },
              text: {
                type: "STRING",
                description: "For annotate: sticky note content.",
              },
            },
            required: ["action"],
          },
        },
      },
      required: ["actions"],
    },
  },
  {
    name: "canvasExample",
    description:
      "Generate a reference architecture overlay when the candidate is completely stuck or explicitly asks for the 'right' answer. Opens as a separate overlay the candidate can toggle on/off — their own diagram is never replaced.",
    parameters: {
      type: "OBJECT",
      properties: {
        example: {
          type: "OBJECT",
          description: "The reference architecture payload.",
          properties: {
            id: {
              type: "STRING",
              description: "Unique reference identifier.",
            },
            title: {
              type: "STRING",
              description: "Title for the reference architecture overlay.",
            },
            nodes: {
              type: "ARRAY",
              description: "Node definitions for the reference architecture.",
              items: { type: "OBJECT" },
            },
            edges: {
              type: "ARRAY",
              description: "Edge definitions connecting the nodes.",
              items: { type: "OBJECT" },
            },
          },
          required: ["id", "title", "nodes", "edges"],
        },
      },
      required: ["example"],
    },
  },
  {
    name: "advanceStage",
    description:
      "Advance the interview pacing to a specific named stage. Use to track progress through structured interview stages (e.g., 'requirements', 'deep-dive', 'tradeoffs'). This replaces the [STAGE:...] text marker.",
    parameters: {
      type: "OBJECT",
      properties: {
        stage: {
          type: "STRING",
          description:
            "Stage name to advance to (e.g., 'deep-dive', 'requirements', 'tradeoffs').",
        },
      },
      required: ["stage"],
    },
  },
  {
    name: "advanceCanvasQuestion",
    description:
      "Advance to the next canvas question. Call this when the current question has been sufficiently discussed and the candidate's screen should update to show the next question. Optionally provide a 1-based question index to skip ahead. This replaces the [QUESTION:next] text marker.",
    parameters: {
      type: "OBJECT",
      properties: {
        skipToIndex: {
          type: "INTEGER",
          description:
            "Optional 1-based question index to skip to. Omit to advance by one.",
        },
      },
    },
  },
] as NonNullable<NonNullable<Tool["functionDeclarations"]>>;

class GeminiSessionAdapter implements GeminiSession {
  constructor(
    private readonly session: Session,
    private readonly bus: EventEmitter,
  ) {}

  on(
    event: "message" | "error" | "close",
    listener: (...args: unknown[]) => void,
  ): this {
    this.bus.on(event, listener);
    return this;
  }

  send(data: string) {
    const message = JSON.parse(data) as {
      clientContent?: {
        turns?: Array<Record<string, unknown>>;
        turnComplete?: boolean;
      };
      realtimeInput?: {
        audioStreamEnd?: boolean;
        mediaChunks?: Array<{
          mimeType?: string;
          data?: string;
        }>;
      };
    };

    if (message.clientContent) {
      this.session.sendClientContent({
        turns: message.clientContent.turns?.length
          ? (message.clientContent.turns as Array<{
              role?: string;
              parts?: Array<Record<string, unknown>>;
            }>)
          : undefined,
        turnComplete: message.clientContent.turnComplete,
      });
      return;
    }

    if (message.realtimeInput?.audioStreamEnd) {
      this.session.sendRealtimeInput({ audioStreamEnd: true });
      return;
    }

    for (const chunk of message.realtimeInput?.mediaChunks ?? []) {
      if (!chunk.data || !chunk.mimeType) continue;
      this.session.sendRealtimeInput({
        audio: {
          data: chunk.data,
          mimeType: chunk.mimeType,
        },
      });
    }
  }

  close() {
    this.session.close();
  }
}

export async function createGeminiSession(systemPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY env not set");
  const bus = new EventEmitter();

  const session = await ai.live.connect({
    model: "gemini-2.5-flash-native-audio-preview-12-2025",
    config: {
      responseModalities: [Modality.AUDIO],
      outputAudioTranscription: {},
      systemInstruction: systemPrompt,
      tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
    },
    callbacks: {
      onmessage: (message) => {
        const json = JSON.stringify(message);
        // Log first message content summary
        if (message.serverContent?.modelTurn?.parts) {
          const hasAudio = message.serverContent.modelTurn.parts.some(
            (p) => "inlineData" in p,
          );
          const hasText = message.serverContent.modelTurn.parts.some(
            (p) => "text" in p,
          );
          const hasFnCall = message.serverContent.modelTurn.parts.some(
            (p) => "functionCall" in p,
          );
          console.log(
            `[gemini SDK] serverContent turnComplete=${!!message.serverContent.turnComplete} audio=${hasAudio} text=${hasText} functionCall=${hasFnCall}`,
          );
        } else if (message.serverContent?.turnComplete) {
          console.log("[gemini SDK] turnComplete (no parts)");
        } else {
          const sanitized = JSON.parse(json) as Record<string, unknown>;
          if (
            typeof sanitized.clientContent === "object" &&
            sanitized.clientContent
          ) {
            (sanitized.clientContent as Record<string, unknown>).turns =
              "[redacted]";
          }
          if (sanitized.realtimeInput) {
            sanitized.realtimeInput = "[redacted]";
          }
          console.log(
            "[gemini SDK] message:",
            JSON.stringify(sanitized).slice(0, 200),
          );
        }
        bus.emit("message", Buffer.from(json));
      },
      onerror: (event) => {
        const detail =
          typeof event.error === "object"
            ? JSON.stringify(event.error).slice(0, 300)
            : String(event.error);
        console.error("[gemini SDK] error:", detail);
        const error =
          event.error instanceof Error
            ? event.error
            : new Error(`Gemini Live API error: ${detail}`);
        bus.emit("error", error);
      },
      onclose: (event) => {
        console.log(
          `[gemini SDK] closed code=${event.code} reason="${event.reason}"`,
        );
        bus.emit("close", event.code, event.reason);
      },
    },
  });

  return new GeminiSessionAdapter(session, bus);
}
