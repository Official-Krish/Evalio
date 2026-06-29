import { z } from "zod";
import { prisma } from "../lib/prisma";
import { DSA_PHASES } from "../prompt/dsa";
import type { InterviewConnection } from "./session";

// ── Utility ──

export function safeIndex(n: unknown): number {
  if (typeof n !== "number" || !Number.isInteger(n) || n < 0) return 0;
  return Math.min(n, 20);
}

export function safePhase(p: unknown): string {
  if (typeof p !== "string") return "implementation";
  return DSA_PHASES.includes(p as (typeof DSA_PHASES)[number])
    ? p
    : "implementation";
}

// ── Live Assessment type ──

export interface LiveAssessment {
  orderNumber: number;
  confidence: "low" | "medium" | "high";
  nervousness: "low" | "medium" | "high";
  engagement: "low" | "medium" | "high";
  clarity: "low" | "medium" | "high";
  fluency: "low" | "medium" | "high";
  signal: "none" | "strong" | "struggling" | "off_track" | "going_deep";
  hesitationLevel?: "low" | "medium" | "high";
  fillerLevel?: "low" | "medium" | "high";
  rationale: string;
}

// ── Zod validation schemas for function arguments ──

const UpdateCodeSchema = z.object({
  code: z.string(),
});

const AdvanceQuestionSchema = z.object({
  skipToIndex: z.number().int().optional(),
});

const AllDoneSchema = z.object({});

const CanvasDiffActionSchema = z.object({
  action: z.enum([
    "highlight",
    "add_node",
    "remove_node",
    "annotate",
    "clear_highlights",
  ]),
  nodeIds: z.array(z.string()).optional(),
  color: z.string().optional(),
  durationMs: z.number().optional(),
  id: z.string().optional(),
  type: z.string().optional(),
  label: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  text: z.string().optional(),
});

const CanvasDiffSchema = z.object({
  actions: z.array(CanvasDiffActionSchema),
});

const CanvasExampleSchema = z.object({
  example: z.object({
    id: z.string(),
    title: z.string(),
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }),
});

const AdvanceStageSchema = z.object({
  stage: z.string(),
});

const AdvanceCanvasQuestionSchema = z.object({
  skipToIndex: z.number().int().optional(),
});

const AssessTurnSchema = z.object({
  nervousness: z.enum(["low", "medium", "high"]),
  confidence: z.enum(["low", "medium", "high"]),
  engagement: z.enum(["low", "medium", "high"]),
  clarity: z.enum(["low", "medium", "high"]),
  fluency: z.enum(["low", "medium", "high"]),
  signal: z.enum(["none", "strong", "struggling", "off_track", "going_deep"]),
  hesitationLevel: z.enum(["low", "medium", "high"]).optional(),
  fillerLevel: z.enum(["low", "medium", "high"]).optional(),
  rationale: z.string(),
});

export type AssessTurnArgs = z.infer<typeof AssessTurnSchema>;

// ── Function handler types ──

type FunctionResult = Record<string, unknown>;

interface FunctionHandler {
  schema: z.ZodType<unknown>;
  handler: (
    conn: InterviewConnection,
    args: unknown,
  ) => Promise<FunctionResult>;
}

// ── Function handlers ──

async function handleUpdateCandidateCode(
  conn: InterviewConnection,
  args: unknown,
): Promise<FunctionResult> {
  const { code } = args as z.infer<typeof UpdateCodeSchema>;
  console.log("[fn] updateCandidateCode — updating editor");

  await conn.safeSend({ type: "dsa_code_update", code });

  try {
    const dsaSession = await prisma.dsaSession.findUnique({
      where: { interviewId: conn.interviewId! },
      include: { problems: { orderBy: { index: "asc" } } },
    });
    if (dsaSession) {
      const problem = dsaSession.problems[dsaSession.currentIndex];
      if (problem) {
        const currentSnapshots = (problem.codeSnapshots ?? {}) as Record<
          string,
          string
        >;
        const currentPhase = problem.currentPhase;
        currentSnapshots[currentPhase] = code;
        await prisma.dsaProblem.update({
          where: { id: problem.id },
          data: {
            code,
            codeSnapshots: currentSnapshots,
          },
        });
      }
    }
  } catch (err) {
    console.error("[fn] updateCandidateCode — db persist failed:", err);
    return { success: false, error: "Failed to persist code" };
  }

  return { success: true };
}

async function handleAdvanceToNextQuestion(
  conn: InterviewConnection,
  args: unknown,
): Promise<FunctionResult> {
  const { skipToIndex } = args as z.infer<typeof AdvanceQuestionSchema>;
  const skipIdx = skipToIndex != null ? Math.max(0, skipToIndex - 1) : null;

  if (conn.dsaTransitioned) {
    return { success: true, skipped: true, reason: "already transitioning" };
  }

  await conn.safeSend({ type: "dsa_ready_next", index: skipIdx });
  console.log(
    `[fn] advanceToNextQuestion — ${
      skipIdx != null ? `skip to Q${skipIdx + 1}` : "next question"
    }`,
  );

  try {
    const dsaSession = await prisma.dsaSession.findUnique({
      where: { interviewId: conn.interviewId! },
      include: { problems: { orderBy: { index: "asc" } } },
    });
    if (dsaSession) {
      const nextIdx = skipIdx != null ? skipIdx : dsaSession.currentIndex + 1;
      const nextProblem = dsaSession.problems[nextIdx];
      if (nextProblem) {
        await prisma.dsaSession.update({
          where: { id: dsaSession.id },
          data: { currentIndex: nextIdx },
        });

        conn.gemini?.send(
          JSON.stringify({
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [
                    {
                      text:
                        skipIdx != null
                          ? `[System] Skip ahead. The candidate is now on Question ${nextIdx + 1}: "${nextProblem.title}" (${nextProblem.difficulty}). Do NOT read it aloud — it's on their screen. Wait for them to indicate they've read it, then start with comprehension checks.`
                          : `[System] The interview has moved to the next question. The candidate is now on Question ${nextIdx + 1}: "${nextProblem.title}" (${nextProblem.difficulty}). Do NOT read the question aloud — it's displayed on their screen. Wait for the candidate to indicate they've read it before discussing. Start with comprehension checks.`,
                    },
                  ],
                },
              ],
              turnComplete: false,
            },
          }),
        );
      }
    }
  } catch (err) {
    console.error("[fn] advanceToNextQuestion — db update failed:", err);
    return { success: false, error: "Failed to advance question" };
  }

  conn.dsaTransitioned = true;
  return { success: true };
}

async function handleAllDone(
  conn: InterviewConnection,
  _args: unknown,
): Promise<FunctionResult> {
  if (conn.dsaTransitioned) {
    return { success: true, skipped: true, reason: "already transitioning" };
  }
  console.log("[fn] allDone");
  await conn.safeSend({ type: "dsa_all_done" });
  conn.dsaTransitioned = true;
  return { success: true };
}

async function handleCanvasDiff(
  conn: InterviewConnection,
  args: unknown,
): Promise<FunctionResult> {
  const { actions } = args as z.infer<typeof CanvasDiffSchema>;
  const now = Date.now();
  const canSend =
    now - conn.lastCanvasDiffTime >= 15_000 && conn.canvasDiffCount < 50;

  if (!canSend) {
    return { success: false, error: "Rate limited", skipped: true };
  }

  await conn.safeSend({ type: "canvas_diff", actions });
  conn.canvasDiffCount++;
  conn.lastCanvasDiffTime = now;
  return { success: true };
}

async function handleCanvasExample(
  conn: InterviewConnection,
  args: unknown,
): Promise<FunctionResult> {
  const { example } = args as z.infer<typeof CanvasExampleSchema>;
  const now = Date.now();
  const canSend =
    now - conn.lastCanvasExampleTime >= 60_000 && conn.canvasExampleCount < 5;

  if (!canSend) {
    return { success: false, error: "Rate limited", skipped: true };
  }

  await conn.safeSend({ type: "canvas_example", ...example });
  conn.canvasExampleCount++;
  conn.lastCanvasExampleTime = now;
  return { success: true };
}

async function handleAdvanceStage(
  conn: InterviewConnection,
  args: unknown,
): Promise<FunctionResult> {
  const { stage } = args as z.infer<typeof AdvanceStageSchema>;
  if (conn.pacing) {
    conn.pacing.advanceTo(stage);
  }
  return { success: true };
}

async function handleAdvanceCanvasQuestion(
  conn: InterviewConnection,
  args: unknown,
): Promise<FunctionResult> {
  const { skipToIndex } = args as z.infer<typeof AdvanceCanvasQuestionSchema>;
  const nextIndex =
    skipToIndex != null
      ? Math.max(0, skipToIndex - 1)
      : safeIndex(conn.canvasQuestionIndex + 1);

  conn.canvasQuestionIndex = nextIndex;
  await conn.safeSend({
    type: "canvas:next",
    questionIndex: nextIndex,
  });
  return { success: true };
}

async function handleAssessTurn(
  conn: InterviewConnection,
  args: unknown,
): Promise<FunctionResult> {
  const assessment = args as AssessTurnArgs;
  console.log(
    `[fn] assessTurn #${conn.liveAssessments.length + 1}: confidence=${assessment.confidence}, engagement=${assessment.engagement}, signal=${assessment.signal}`,
  );

  // Persist assessment
  conn.liveAssessments.push({
    orderNumber: conn.nextOrderNumber,
    ...assessment,
  });

  // Update candidate state so [PACING] messages reflect latest observations
  conn.candidateState = {
    nervousness: assessment.nervousness,
    engagement: assessment.engagement,
    confidence: assessment.confidence,
    currentSignal: assessment.signal,
  };

  return { success: true };
}

// ── Handler registry ──

export const functionHandlers: Record<string, FunctionHandler> = {
  updateCandidateCode: {
    schema: UpdateCodeSchema,
    handler: handleUpdateCandidateCode,
  },
  advanceToNextQuestion: {
    schema: AdvanceQuestionSchema,
    handler: handleAdvanceToNextQuestion,
  },
  allDone: {
    schema: AllDoneSchema,
    handler: handleAllDone,
  },
  canvasDiff: {
    schema: CanvasDiffSchema,
    handler: handleCanvasDiff,
  },
  canvasExample: {
    schema: CanvasExampleSchema,
    handler: handleCanvasExample,
  },
  advanceStage: {
    schema: AdvanceStageSchema,
    handler: handleAdvanceStage,
  },
  advanceCanvasQuestion: {
    schema: AdvanceCanvasQuestionSchema,
    handler: handleAdvanceCanvasQuestion,
  },
  assessTurn: {
    schema: AssessTurnSchema,
    handler: handleAssessTurn,
  },
};

// ── Function declarations for Gemini ──

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
            "Optional 1-based question index to skip to (e.g., 3 to skip directly to question 3). Omit to advance by one.",
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
  {
    name: "assessTurn",
    description:
      "Record behavioral observations about the candidate's just-completed turn. Call this after EVERY candidate response, before asking the next question. Base your assessment primarily on observable delivery (confidence, hesitation, pacing, engagement, clarity) rather than answer correctness.",
    parameters: {
      type: "OBJECT",
      properties: {
        nervousness: {
          type: "STRING",
          enum: ["low", "medium", "high"],
          description: "How nervous did the candidate sound?",
        },
        confidence: {
          type: "STRING",
          enum: ["low", "medium", "high"],
          description: "How confident was their delivery?",
        },
        engagement: {
          type: "STRING",
          enum: ["low", "medium", "high"],
          description: "How engaged and present were they?",
        },
        clarity: {
          type: "STRING",
          enum: ["low", "medium", "high"],
          description: "How clearly did they structure their response?",
        },
        fluency: {
          type: "STRING",
          enum: ["low", "medium", "high"],
          description: "How fluent was their speech (pacing, flow)?",
        },
        signal: {
          type: "STRING",
          enum: ["none", "strong", "struggling", "off_track", "going_deep"],
          description: "Overall delivery signal for this turn.",
        },
        hesitationLevel: {
          type: "STRING",
          enum: ["low", "medium", "high"],
          description: "Level of hesitation or pausing.",
        },
        fillerLevel: {
          type: "STRING",
          enum: ["low", "medium", "high"],
          description: "Use of filler words (um, uh, like, you know).",
        },
        rationale: {
          type: "STRING",
          description:
            "Brief 1-sentence rationale describing what you observed.",
        },
      },
      required: [
        "nervousness",
        "confidence",
        "engagement",
        "clarity",
        "fluency",
        "signal",
        "rationale",
      ],
    },
  },
] as any;
