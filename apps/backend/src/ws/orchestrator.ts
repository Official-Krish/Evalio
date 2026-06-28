import { jwtVerify } from "jose";
import { z } from "zod";
import { createGeminiSession } from "../gemini";
import { prisma } from "../lib/prisma";
import { dedupAppend } from "./dedup";
import { handleDsaMarkers } from "./helpers/dsa-markers";
import { handleSdMarkers, resetSdCounters } from "./helpers/sd-markers";
import {
  isNewQuestion,
  flushChallengeTurn,
  isChallengeMode,
} from "./helpers/turn";
import {
  initiateClosing,
  handleTurnCompleteDuringClosing,
} from "./helpers/cleanup";
import { startSilenceTimer, resetSilenceState } from "./helpers/silence";
import type { InterviewConnection } from "./session";
import { DSA_PHASES } from "../prompt/dsa";
const SECRET = Bun.env.JWT_SECRET;
const encoder = new TextEncoder();

export async function verifyWsToken(
  token: string,
): Promise<{ id: string; email: string } | null> {
  if (!SECRET) return null;
  try {
    const key = encoder.encode(SECRET);
    const { payload } = await jwtVerify(token, key);
    if (typeof payload.id === "string" && typeof payload.email === "string") {
      return { id: payload.id, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}

// Safe index: defaults to 0, clamped to non-negative, capped at sane max
export function safeIndex(n: unknown): number {
  if (typeof n !== "number" || !Number.isInteger(n) || n < 0) return 0;
  return Math.min(n, 20);
}

// Safe phase: must be one of the known DSA_PHASES, else "implementation"
export function safePhase(p: unknown): string {
  if (typeof p !== "string") return "implementation";
  return DSA_PHASES.includes(p as (typeof DSA_PHASES)[number])
    ? p
    : "implementation";
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

// ── Function handler types ──

type FunctionResult = Record<string, unknown>;

interface FunctionHandler {
  schema: z.ZodType<unknown>;
  handler: (
    conn: InterviewConnection,
    args: unknown,
  ) => Promise<FunctionResult>;
}

function sendFunctionResponse(
  conn: InterviewConnection,
  callId: string | undefined,
  fnName: string,
  result: FunctionResult,
) {
  if (!callId || !conn.gemini) return;
  conn.gemini.send(
    JSON.stringify({
      clientContent: {
        turns: [
          {
            role: "user",
            parts: [
              {
                functionResponse: {
                  id: callId,
                  name: fnName,
                  response: result,
                },
              },
            ],
          },
        ],
        turnComplete: false,
      },
    }),
  );
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

  // Idempotency: ignore if already transitioning
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
    // Idempotency: don't advance if pacing already at this stage
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

// ── Handler registry ──

const functionHandlers: Record<string, FunctionHandler> = {
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
};

// ── Orchestrator ──

// Strip control characters and ASR artifacts from model output
function stripCtrl(s: string): string {
  return s
    .replace(/<\/?ctrl\d+>/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function startInterview(
  conn: InterviewConnection,
  systemPrompt: string,
  timeLimitMs: number,
) {
  conn.isQueued = false;
  console.log(
    "[orchestrator] startInterview, isSystemDesign:",
    conn.isSystemDesign,
  );
  await prisma.interviewSession.update({
    where: { id: conn.interviewId! },
    data: { status: "ACTIVE", startedAt: new Date() },
  });

  try {
    conn.gemini = await createGeminiSession(systemPrompt);
    if (conn.isSystemDesign) {
      console.log("[orchestrator] resetting SD counters");
      resetSdCounters(conn);
    }
  } catch (err) {
    console.error("[ws] Gemini session failed:", err);
    await conn.safeSend({
      error: "Failed to connect to AI. Please try again.",
    });
    return;
  }

  console.log("[ws] sending initial clientContent to start interview...");

  let greetings: string[];
  if (conn.isDsaMode) {
    greetings = [
      "Start the DSA coding interview. Say you're their interviewer for the day. Mention the role and company they're interviewing for. Tell the candidate their first coding problem is displayed on the right side of their screen. Ask them to take a moment to read it and let you know when they're ready. Then STOP — wait for their response. Do NOT discuss the problem or ask any technical questions until they confirm they're ready. Do not use a name or introduce yourself personally — just say you're their interviewer.",
      "Begin the DSA coding interview. Briefly mention the role they're interviewing for and the company. Do not say your name or introduce yourself personally — just say you're their interviewer. Point out that the first question is visible on their screen. Ask if they can see it and if they have any immediate questions. Then wait for their reply before proceeding.",
    ];
  } else if (conn.isDiscussionMode) {
    greetings = [
      "Start the case study discussion. Greet the candidate naturally. Say you are their interviewer for the day and mention the role and company. No name. Tell them the case study is displayed on the right side of their screen. Ask them to read it and let you know when they are ready. Then STOP and wait. Do NOT discuss the case until they confirm they are ready.",
      "Begin the case study discussion. Briefly mention the role and company. No name. Point out the case study is visible on their screen. Ask if they can see it and if they have any questions. Then wait for their reply before proceeding.",
      "Start the session. Greet the candidate conversationally — say you are their interviewer for the day and state the role and company. No name. Tell them the case is on their right screen. Ask them to read it and let you know when they are ready. Then wait.",
    ];
  } else {
    greetings = [
      "Start the interview. Greet the candidate naturally. Say you are their interviewer for the day and mention the role and company they are interviewing for. No name. Then ask your first question.",
      "Begin the interview. Welcome the candidate — just say you are their interviewer, mention what they are here for (role at company), and keep it brief. No name. Then move to questions.",
      "Start the session. Greet the candidate conversationally — say you are their interviewer for the day and state the role and company. No name. Then lead into the first question.",
    ];
  }
  conn.gemini.send(
    JSON.stringify({
      clientContent: {
        turns: [
          {
            role: "user",
            parts: [
              {
                text: greetings[0],
              },
            ],
          },
        ],
        turnComplete: true,
      },
    }),
  );

  conn.gemini.on("message", async (event) => {
    const data = event instanceof Buffer ? event.toString() : String(event);

    try {
      const parsed = JSON.parse(data);

      if (parsed.error) {
        console.error("[gemini] ERROR:", JSON.stringify(parsed.error));
      }

      const hasContent = !!parsed.serverContent;
      const hasSetup = !!parsed.setupComplete;
      if (hasContent || hasSetup) {
        const label = hasSetup ? "setupComplete" : "serverContent";
        const hasAudio = !!parsed.serverContent?.modelTurn?.parts?.some(
          (p: Record<string, unknown>) => p.inlineData,
        );
        console.log(
          `[gemini] \u2192 ${label}${hasAudio ? " (with audio)" : ""} turnComplete=${!!parsed.serverContent?.turnComplete}`,
        );
      } else if (!parsed.setupComplete) {
        const sanitized = { ...parsed };
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
          "[gemini] \u2192 other message:",
          JSON.stringify(sanitized).slice(0, 300),
        );
      }

      if (!parsed.setupComplete) {
        await conn.safeSendRaw(data);
      }

      const inputText = parsed.serverContent?.inputTranscription?.text;
      const outputText = stripCtrl(
        parsed.serverContent?.outputTranscription?.text ?? "",
      );

      // Also grab raw text from modelTurn.parts
      const rawText = stripCtrl(
        parsed.serverContent?.modelTurn?.parts
          ?.filter((p: Record<string, unknown>) => typeof p.text === "string")
          .map((p: Record<string, unknown>) => p.text as string)
          .join(" ") ?? "",
      );

      // Accumulate raw text for fallback marker extraction
      const markerText =
        ((conn.isDsaMode || conn.isSystemDesign) && rawText) || outputText;

      // Accumulate clean spoken text for DB storage
      const cleanText = outputText || rawText;

      if (markerText && conn.interviewId) {
        conn.questionBuf = dedupAppend(conn.questionBuf, markerText);
      }

      if (cleanText && conn.interviewId) {
        conn.cleanQuestionBuf = dedupAppend(conn.cleanQuestionBuf, cleanText);
      }

      if (inputText && conn.interviewId) {
        conn.answerBuf = dedupAppend(conn.answerBuf, inputText);
      }

      const turnComplete = parsed.serverContent?.turnComplete === true;

      // ── Function call handling (preferred path) ──
      const fnCalls: Array<Record<string, unknown>> = [];
      for (const part of parsed.serverContent?.modelTurn?.parts ?? []) {
        if (part.functionCall) fnCalls.push(part);
      }
      for (const call of parsed.toolCall?.functionCalls ?? []) {
        fnCalls.push({ functionCall: call });
      }

      for (const part of fnCalls) {
        const fnCall = part.functionCall as {
          name?: string;
          args?: Record<string, unknown>;
          id?: string;
        };
        const { name, args, id: callId } = fnCall;
        if (!name) continue;

        // Dedup: skip if same function + args already processed
        const hash = `${name}:${JSON.stringify(args ?? {})}`;
        if (hash === conn.lastFunctionHash) {
          console.log(`[fn] skipping duplicate: ${name}`);
          continue;
        }
        conn.lastFunctionHash = hash;

        const handler = functionHandlers[name];
        if (!handler) {
          console.error(`[fn] unknown function: ${name}`);
          sendFunctionResponse(conn, callId, name, {
            success: false,
            error: `Unknown function: ${name}`,
            requestId: callId ?? null,
            timestamp: Date.now(),
          });
          continue;
        }

        // Validate
        const parsed = handler.schema.safeParse(args);
        if (!parsed.success) {
          console.error(`[fn] invalid args for ${name}:`, parsed.error);
          sendFunctionResponse(conn, callId, name, {
            success: false,
            error: `Invalid arguments: ${parsed.error.message}`,
            requestId: callId ?? null,
            timestamp: Date.now(),
          });
          continue;
        }

        // Execute and await completion
        console.log(`[fn] executing: ${name}`);
        const result = await handler.handler(conn, parsed.data);

        // Send response only after execution completed
        sendFunctionResponse(conn, callId, name, {
          ...result,
          requestId: callId ?? null,
          timestamp: Date.now(),
        });
        console.log(`[fn] completed: ${name}`, result);
      }

      // ── Tool call cancellation ──
      if (parsed.toolCallCancellation?.ids?.length > 0) {
        console.log(
          "[fn] tool call cancelled:",
          parsed.toolCallCancellation.ids,
        );
      }

      // ── Fallback: text marker detection (preferred over function calls) ──
      if (fnCalls.length === 0) {
        // DSA/SQL mode: detect READY_FOR_NEXT / ALL_DONE / CODE_UPDATE
        if (
          turnComplete &&
          conn.isDsaMode &&
          !conn.isQuantMode &&
          !conn.dsaTransitioned
        ) {
          console.log(
            "[dsa] turnComplete, buf:",
            JSON.stringify(conn.questionBuf).slice(0, 200),
          );
          await handleDsaMarkers(conn);
        }

        // System Design mode: detect canvas_diff / canvas_example markers
        if (turnComplete && conn.isSystemDesign) {
          await handleSdMarkers(conn);
        }
      }

      // ── Parse stage and question markers (fallback) ──
      const markers = markerText || "";
      if (turnComplete && fnCalls.length === 0) {
        if (conn.pacing) {
          const stageMatch = markers.match(/\[STAGE:(\w+(?:-\w+)*)\]/);
          const stageName = stageMatch?.[1];
          if (stageName) {
            conn.pacing.advanceTo(stageName);
          }
        }

        const questionMatch = markers.match(/\[QUESTION:next\]/i);
        if (questionMatch && conn.isCanvasMode) {
          console.log("[orchestrator] [QUESTION:next] detected for canvas");
          conn.canvasQuestionIndex = safeIndex(conn.canvasQuestionIndex + 1);
          conn.safeSend({
            type: "canvas:next",
            questionIndex: conn.canvasQuestionIndex,
          });
        }
      }

      // Reset waitingForAiResponse on turnComplete
      if (turnComplete && conn.waitingForAiResponse && !conn.closingMode) {
        conn.waitingForAiResponse = false;

        if (conn.silencePromptActive) {
          conn.lastAudioTime = Date.now();
          conn.silencePromptActive = false;
        }

        if (isChallengeMode(conn) && isNewQuestion(conn, conn.questionBuf)) {
          await flushChallengeTurn(conn);
          conn.currentTurnId = null;
        }
      }

      if (conn.closingMode && turnComplete) {
        await handleTurnCompleteDuringClosing(conn);
      }
    } catch {
      // Not JSON or parse error — just relay
    }
  });

  conn.gemini.on("close", (...args: unknown[]) => {
    const code = args[0] as number | undefined;
    const reason = args[1] as string | undefined;
    if (!conn.finalized) {
      if (code === 1011 && !conn.closingMode) {
        conn.safeSend({
          type: "error",
          code: "gemini_timeout",
          message: "AI session expired - please try again.",
        });
      }
      console.log(
        `[gemini] connection closed code=${code} reason="${reason}" - triggering cleanup`,
      );
      conn.cleanup("gemini_close");
    }
  });

  conn.gemini.on("error", (err) => {
    console.error("[gemini] error:", err);
    conn.safeSend({ error: "Gemini connection error" });
  });

  // Start pacing timer (30s heartbeat)
  if (conn.pacing) {
    conn.pacingTimer = setInterval(() => {
      if (conn.gemini && conn.pacing) {
        const cs = conn.candidateState;
        const pacingMsg = conn.pacing.buildMessage(
          `n=${cs.nervousness},e=${cs.engagement},c=${cs.confidence},sig=${cs.currentSignal}`,
        );
        try {
          conn.gemini.send(
            JSON.stringify({
              clientContent: {
                turns: [
                  {
                    role: "user",
                    parts: [{ text: pacingMsg }],
                  },
                ],
                turnComplete: false,
              },
            }),
          );
        } catch {
          // Non-critical
        }
      }
    }, 30_000);
  }

  console.log("[ws] sending ready signal to client");
  resetSilenceState(conn);
  startSilenceTimer(conn);
  await conn.safeSend({ type: "ready" });
  await conn.safeSend({ type: "time_limit", limitMs: timeLimitMs });

  conn.timeWarningTimer = setTimeout(
    () => {
      conn.safeSend({ type: "time_warning", remainingMs: 60_000 });
      if (conn.gemini) {
        try {
          conn.gemini.send(
            JSON.stringify({
              clientContent: {
                turns: [
                  {
                    role: "user",
                    parts: [
                      {
                        text: `[SYSTEM: 1 minute remaining. Wrap up current topic and begin closing. Do NOT start new discussions.]`,
                      },
                    ],
                  },
                ],
                turnComplete: false,
              },
            }),
          );
        } catch {
          // Non-critical
        }
      }
    },
    Math.max(0, timeLimitMs - 60_000),
  );

  conn.timeCapTimer = setTimeout(() => {
    console.log("[ws] time cap reached — initiating closing");
    conn.safeSend({ type: "time_limit_reached" });
    initiateClosing(conn);
  }, timeLimitMs);
}
