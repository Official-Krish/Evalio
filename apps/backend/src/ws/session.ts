import { WebSocket as WsWebSocket } from "ws";
import type { GeminiSession } from "../gemini";
import { cleanup, initiateClosing } from "./helpers/cleanup";
import { safeIndex, safePhase } from "./orchestrator";
import { handleInit } from "./handlers/init";
import { handleAudioChunk, handleAudioStreamEnd } from "./handlers/audio";
import { prisma } from "../lib/prisma";
import type { PacingTracker } from "./helpers/pacing";

export class InterviewConnection {
  interviewId: string | null = null;
  gemini: GeminiSession | null = null;
  currentTurnId: string | null = null;
  questionBuf = "";
  cleanQuestionBuf = "";
  answerBuf = "";
  nextOrderNumber = 1;
  finalized = false;
  closingMode = false;
  timeWarningTimer: ReturnType<typeof setTimeout> | null = null;
  timeCapTimer: ReturnType<typeof setTimeout> | null = null;
  interviewDepth: string = "STANDARD";
  waitingForAiResponse = false;
  isQueued = false;
  isDsaMode = false;
  dsaTransitioned = false;
  isSystemDesign = false;
  heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  pongTimeoutId: ReturnType<typeof setTimeout> | null = null;
  lastAudioTime = 0;
  canvasInactivityTimer: ReturnType<typeof setTimeout> | null = null;

  // Silence detection
  silenceTimer: ReturnType<typeof setInterval> | null = null;
  lastCodePreviewTime = 0;
  lastCanvasSnapshotTime = 0;
  lastCanvasSnapshotData: unknown = null;
  silencePromptCount = 0;
  lastSilencePromptTime = 0;
  silencePromptActive = false;

  // Pacing system
  pacing: PacingTracker | null = null;
  pacingTimer: ReturnType<typeof setInterval> | null = null;

  // Rate limiter: max 20 WS messages per second per connection
  private messageTimestamps: number[] = [];
  private readonly MAX_WS_MSGS_PER_SEC = 20;

  private isRateLimited(): boolean {
    const now = Date.now();
    this.messageTimestamps = this.messageTimestamps.filter(
      (t) => now - t < 1000,
    );
    if (this.messageTimestamps.length >= this.MAX_WS_MSGS_PER_SEC) {
      return true;
    }
    this.messageTimestamps.push(now);
    return false;
  }

  constructor(
    readonly client: WsWebSocket,
    readonly wsMap: Map<string, WsWebSocket>,
    readonly startCallbacks: Map<string, () => Promise<void>>,
    readonly onDequeue: () => Promise<void>,
    readonly onPositionUpdate: () => Promise<void>,
  ) {
    this.setupListeners();
  }

  private setupListeners() {
    const MAX_MESSAGE_SIZE = 1024 * 1024;

    this.client.on("message", async (raw) => {
      const rawData = raw instanceof Buffer ? raw : Buffer.from(raw.toString());
      if (rawData.length > MAX_MESSAGE_SIZE) {
        this.safeSend({ error: "Message too large" });
        this.client.close();
        return;
      }

      try {
        const msg = JSON.parse(rawData.toString());
        await this.handleMessage(msg);
      } catch {
        this.safeSend({ error: "Invalid JSON" });
      }
    });

    this.client.on("close", () => {
      console.log("[ws] candidate disconnected");
      cleanup(this);
    });

    this.client.on("error", () => {
      cleanup(this);
    });
  }

  async safeSend(data: unknown) {
    try {
      this.client.send(JSON.stringify(data));
    } catch {
      // Client already disconnected
    }
  }

  async safeSendRaw(data: string) {
    try {
      this.client.send(data);
    } catch {
      // Client already disconnected
    }
  }

  async cleanup(reason?: string) {
    await cleanup(this, reason);
  }

  private async handleMessage(msg: Record<string, unknown>) {
    if (msg.type !== "audio_chunk" && this.isRateLimited()) {
      this.safeSend({ error: "Too many messages. Slow down." });
      return;
    }

    switch (msg.type) {
      case "init":
        await handleInit(this, msg);
        break;

      case "audio_chunk":
        await handleAudioChunk(this, msg);
        break;

      case "audio_stream_end":
        await handleAudioStreamEnd(this, msg);
        break;

      case "code_preview": {
        if (!this.gemini || this.closingMode) return;
        this.lastCodePreviewTime = Date.now();
        const prevMsg = msg as {
          code?: string;
          language?: string;
          questionIndex?: number;
          phase?: string;
        };
        if (prevMsg.code === undefined || prevMsg.code.length > 100000) break;
        const idx = safeIndex(prevMsg.questionIndex);
        const phase = safePhase(prevMsg.phase);
        this.gemini.send(
          JSON.stringify({
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `[Code Preview — Question ${idx}, ${phase} phase, not yet saved]\n\n\`\`\`${prevMsg.language ?? "javascript"}\n${prevMsg.code}\n\`\`\``,
                    },
                  ],
                },
              ],
              turnComplete: true,
            },
          }),
        );
        break;
      }

      case "code_snapshot": {
        if (!this.gemini || this.closingMode) return;
        const codeMsg = msg as {
          code?: string;
          language?: string;
          questionIndex?: number;
          phase?: string;
        };
        if (codeMsg.code === undefined || codeMsg.code.length > 100000) break;
        const idx = safeIndex(codeMsg.questionIndex);
        const phase = safePhase(codeMsg.phase);
        const codeText = `\`\`\`${codeMsg.language ?? "javascript"}\n${codeMsg.code}\n\`\`\``;
        this.gemini.send(
          JSON.stringify({
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `[Code Snapshot for Question ${idx} during ${phase} phase]\n\n${codeText}`,
                    },
                  ],
                },
              ],
              turnComplete: true,
            },
          }),
        );

        if (this.interviewId) {
          try {
            const dsaSession = await prisma.dsaSession.findUnique({
              where: { interviewId: this.interviewId },
              include: { problems: { orderBy: { index: "asc" } } },
            });
            if (dsaSession && idx < dsaSession.problems.length) {
              const problem = dsaSession.problems[idx];
              if (problem) {
                const currentSnapshots = (problem.codeSnapshots ??
                  {}) as Record<string, string>;
                currentSnapshots[phase] = codeMsg.code;
                await prisma.dsaProblem.update({
                  where: { id: problem.id },
                  data: {
                    code: codeMsg.code,
                    codeSnapshots: currentSnapshots,
                  },
                });
              }
            }
          } catch {
            // Silently fail — code snapshot persistence is non-critical
          }
        }
        break;
      }

      case "phase_update": {
        if (this.closingMode) return;
        const phaseMsg = msg as { phase?: string; questionIndex?: number };
        if (this.gemini) {
          const idx = safeIndex(phaseMsg.questionIndex);
          this.gemini.send(
            JSON.stringify({
              clientContent: {
                turns: [
                  {
                    role: "user",
                    parts: [
                      {
                        text: `[Phase Update] Moving to "${safePhase(phaseMsg.phase)}" phase for question ${idx}.`,
                      },
                    ],
                  },
                ],
                turnComplete: true,
              },
            }),
          );
        }
        break;
      }

      case "request_hint": {
        if (!this.gemini || this.closingMode || !this.isDsaMode) return;
        const hintMsg = msg as { questionIndex?: number };
        const idx = safeIndex(hintMsg.questionIndex);
        this.gemini.send(
          JSON.stringify({
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `[Hint Request] The candidate is asking for a hint on Question ${idx}. Provide a subtle hint that guides them toward the solution without giving it away. Use a Socratic approach — ask a leading question or point them toward the relevant data structure/algorithm to consider.`,
                    },
                  ],
                },
              ],
              turnComplete: true,
            },
          }),
        );
        break;
      }

      case "language_change": {
        if (!this.isDsaMode || !this.gemini) break;
        const langMsg = msg as { language?: string };
        const newLang = langMsg.language;
        if (!newLang) break;
        console.log(`[dsa] language change to "${newLang}"`);

        try {
          await prisma.dsaSession.update({
            where: { interviewId: this.interviewId! },
            data: { language: newLang },
          });

          this.gemini.send(
            JSON.stringify({
              clientContent: {
                turns: [
                  {
                    role: "user",
                    parts: [
                      {
                        text: `[Language Change] The candidate has switched to coding in **${newLang}**. Adjust your code review expectations and feedback accordingly. Be aware of ${newLang}-specific idioms, syntax, and conventions.`,
                      },
                    ],
                  },
                ],
                turnComplete: true,
              },
            }),
          );
        } catch (err) {
          console.error("[dsa] failed to update language:", err);
        }
        break;
      }

      case "end_interview":
        console.log("[ws] end_interview from client");
        await initiateClosing(this);
        break;

      case "canvas_snapshot": {
        if (!this.gemini || this.closingMode || !this.isSystemDesign) {
          break;
        }
        this.lastCanvasSnapshotTime = Date.now();
        const canvasMsg = msg as { state?: unknown };
        if (!canvasMsg.state) {
          break;
        }
        this.lastCanvasSnapshotData = canvasMsg.state;

        try {
          await prisma.interviewSession.update({
            where: { id: this.interviewId! },
            data: {
              finalDiagram: canvasMsg.state,
              canvasGraphHistory: { push: canvasMsg.state },
            },
          });
        } catch (err) {
          console.error("[ws] failed to persist canvas snapshot:", err);
        }

        this.gemini.send(
          JSON.stringify({
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `[Canvas Snapshot]\n\n${JSON.stringify(canvasMsg.state)}`,
                    },
                  ],
                },
              ],
              turnComplete: false,
            },
          }),
        );

        // Auto-flush canvas-only silence: if the user is drawing without speaking,
        // send a turn complete after a delay so Gemini responds to the canvas state.
        if (!this.waitingForAiResponse) {
          const silenceMs = Date.now() - this.lastAudioTime;
          if (silenceMs > 8_000 && !this.canvasInactivityTimer) {
            this.canvasInactivityTimer = setTimeout(() => {
              this.canvasInactivityTimer = null;
              if (this.gemini && !this.closingMode && !this.finalized) {
                this.gemini.send(
                  JSON.stringify({
                    clientContent: {
                      turns: [],
                      turnComplete: true,
                    },
                  }),
                );
                this.waitingForAiResponse = true;
              }
            }, 5_000);
          }
        }
        break;
      }

      default:
        await this.safeSend({
          error: `Unknown message type: ${msg.type}`,
        });
    }
  }
}
