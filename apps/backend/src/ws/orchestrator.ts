import { jwtVerify } from "jose";
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
      resetSdCounters();
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
  } else {
    greetings = [
      "Start the interview. Greet the candidate naturally. Say you're their interviewer for the day and mention the role and company they're interviewing for. Do not introduce yourself with a name. Then ask your first question.",
      "Begin the interview. Welcome the candidate — just say you're their interviewer, mention what they're here for (role at company), and keep it brief. Do not use a name. Then move to questions.",
      "Start the session. Greet the candidate conversationally — say you're their interviewer for the day and state the role and company. No name or personal introduction. Then lead into the first question.",
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
      const outputText = parsed.serverContent?.outputTranscription?.text;

      // Also grab raw text from modelTurn.parts (preserves markers like READY_FOR_NEXT)
      const rawText =
        parsed.serverContent?.modelTurn?.parts
          ?.filter((p: Record<string, unknown>) => typeof p.text === "string")
          .map((p: Record<string, unknown>) => p.text as string)
          .join(" ") ?? "";

      // Accumulate raw text for marker extraction (preserves <canvas_diff>, READY_FOR_NEXT, etc.)
      const markerText =
        ((conn.isDsaMode || conn.isSystemDesign) && rawText) || outputText;

      // Accumulate clean spoken text for DB storage (avoids Gemini internal reasoning)
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

      // DSA mode: detect READY_FOR_NEXT / ALL_DONE / CODE_UPDATE signals
      // (runs before isNewQuestion to avoid questionBuf overwrite)
      if (turnComplete && conn.isDsaMode && !conn.dsaTransitioned) {
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

      // Parse markers from model output — order: [STAGE:] → [QUESTION:next] → [PACING]
      const markers = markerText || "";
      if (turnComplete) {
        if (conn.pacing) {
          const stageMatch = markers.match(/\[STAGE:(\w+(?:-\w+)*)\]/);
          if (stageMatch) {
            conn.pacing.advanceTo(stageMatch[1]);
          }
        }

        const questionMatch = markers.match(/\[QUESTION:next\]/i);
        if (questionMatch) {
          console.log("[orchestrator] [QUESTION:next] detected");
          if (conn.isSqlMode) {
            conn.safeSend({ type: "question:next" });
          }
        }
      }

      // Reset waitingForAiResponse on turnComplete
      if (turnComplete && conn.waitingForAiResponse && !conn.closingMode) {
        conn.waitingForAiResponse = false;

        // If a silence prompt just completed, reset the silence timer
        // so the next silence window starts fresh from this response
        if (conn.silencePromptActive) {
          conn.lastAudioTime = Date.now();
          conn.silencePromptActive = false;
        }

        if (isChallengeMode(conn) && isNewQuestion(conn.questionBuf)) {
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

  // Start pacing timer (30s heartbeat to keep [PACING] fresh during monologues)
  if (conn.pacing) {
    conn.pacingTimer = setInterval(() => {
      if (conn.gemini && conn.pacing) {
        const pacingMsg = conn.pacing.buildMessage();
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
      // Also signal the AI that 60 seconds remain
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
