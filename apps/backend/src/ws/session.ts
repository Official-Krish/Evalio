import { WebSocket as WsWebSocket } from "ws";
import { jwtVerify } from "jose";
import { createGeminiSession, type GeminiSession } from "../gemini";
import { prisma } from "../lib/prisma";
import { buildInterviewPrompt, type PromptInput } from "../prompt";
import { buildDsaSystemPrompt } from "../services/dsaPrompt";
import { COMPANIES } from "@evalio/shared";
import {
  tryActivate,
  enqueue as queueEnqueue,
  releaseSlot,
  removeFromQueue,
} from "../lib/queue";
import { dedupAppend } from "./dedup";
import { finalizeInterview } from "./finalize";
import { DSA_PHASES } from "../services/dsaPrompt";

const SECRET = Bun.env.JWT_SECRET;
const encoder = new TextEncoder();

async function verifyWsToken(
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

export class InterviewConnection {
  private interviewId: string | null = null;
  private gemini: GeminiSession | null = null;
  private currentTurnId: string | null = null;
  private questionBuf = "";
  private answerBuf = "";
  private nextOrderNumber = 1;
  private finalized = false;
  private closingMode = false;
  private timeWarningTimer: ReturnType<typeof setTimeout> | null = null;
  private timeCapTimer: ReturnType<typeof setTimeout> | null = null;
  private interviewDepth: string = "STANDARD";
  private waitingForAiResponse = false;
  private isQueued = false;
  private isDsaMode = false;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private pongTimeoutId: ReturnType<typeof setTimeout> | null = null;

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
    private client: WsWebSocket,
    private wsMap: Map<string, WsWebSocket>,
    private startCallbacks: Map<string, () => Promise<void>>,
    private onDequeue: () => Promise<void>,
    private onPositionUpdate: () => Promise<void>,
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
      this.cleanup();
    });

    this.client.on("error", () => {
      this.cleanup();
    });
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.client.readyState !== 1) {
        this.stopHeartbeat();
        return;
      }
      this.client.ping();
      this.pongTimeoutId = setTimeout(() => {
        console.log(`[ws] heartbeat timeout for ${this.interviewId}`);
        this.cleanup("heartbeat_timeout");
      }, 10000);
    }, 30000);

    this.client.on("pong", () => {
      if (this.pongTimeoutId) {
        clearTimeout(this.pongTimeoutId);
        this.pongTimeoutId = null;
      }
    });
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.pongTimeoutId) clearTimeout(this.pongTimeoutId);
    this.heartbeatTimer = null;
    this.pongTimeoutId = null;
  }

  private isNewQuestion(text: string): boolean {
    const lower = text.toLowerCase();
    const newQIndicators = [
      "let's move on",
      "let\u2019s move on",
      "next question",
      "next, ",
      "now i'd like to",
      "now i\u2019d like to",
      "tell me about",
      "how do you",
      "how would you",
      "what is your",
      "what's your",
      "let's talk about",
      "let\u2019s talk about",
      "moving on",
      "another topic",
      "let me ask you",
      "now tell me",
    ];
    return newQIndicators.some((i) => lower.includes(i));
  }

  private async flushChallengeTurn() {
    if (!this.interviewId || !this.currentTurnId) return;
    if (this.answerBuf) {
      const prev = await prisma.interviewTurn.findUnique({
        where: { id: this.currentTurnId },
        select: { answerText: true },
      });
      const merged = prev?.answerText
        ? prev.answerText + "\n\n" + this.answerBuf
        : this.answerBuf;
      await prisma.interviewTurn.update({
        where: { id: this.currentTurnId },
        data: { answerText: merged },
      });
      this.answerBuf = "";
    }
  }

  private async createTurn(questionText: string) {
    const turn = await prisma.interviewTurn.create({
      data: {
        interviewId: this.interviewId!,
        orderNumber: this.nextOrderNumber++,
        questionText,
        answerText: "",
      },
    });
    console.log(
      `[ws] created turn ${turn.id}: "${questionText.slice(0, 60)}..."`,
    );
    return turn.id;
  }

  private async safeSend(data: unknown) {
    try {
      this.client.send(JSON.stringify(data));
    } catch {
      // Client already disconnected
    }
  }

  private async safeSendRaw(data: string) {
    try {
      this.client.send(data);
    } catch {
      // Client already disconnected
    }
  }

  private async flushTurn() {
    if (!this.interviewId || !this.questionBuf) return;
    const turnId = await this.createTurn(this.questionBuf);
    if (this.answerBuf) {
      await prisma.interviewTurn.update({
        where: { id: turnId },
        data: { answerText: this.answerBuf },
      });
    }
    this.currentTurnId = turnId;
    this.questionBuf = "";
    this.answerBuf = "";
  }

  async cleanup(reason?: string) {
    this.stopHeartbeat();
    if (this.timeWarningTimer) clearTimeout(this.timeWarningTimer);
    if (this.timeCapTimer) clearTimeout(this.timeCapTimer);

    if (this.interviewId) {
      if (this.isQueued) {
        console.log(
          `[ws] cleanup queued ${this.interviewId} reason=${reason ?? "unknown"}`,
        );
        await removeFromQueue(this.interviewId);
        this.wsMap.delete(this.interviewId);
        this.startCallbacks.delete(this.interviewId);
        await this.onPositionUpdate();
      } else if (!this.finalized) {
        this.finalized = true;
        const isChallengeMode =
          this.interviewDepth === "CHALLENGE" ||
          this.interviewDepth === "BAR_RAISER";

        // Always attempt flush — don't rely on turnComplete having fired
        if (isChallengeMode && this.currentTurnId) {
          await this.flushChallengeTurn();
        } else if (this.questionBuf) {
          await this.flushTurn();
        } else if (this.currentTurnId && this.answerBuf) {
          const prev = await prisma.interviewTurn.findUnique({
            where: { id: this.currentTurnId },
            select: { answerText: true },
          });
          const merged = prev?.answerText
            ? prev.answerText + " " + this.answerBuf
            : this.answerBuf;
          await prisma.interviewTurn.update({
            where: { id: this.currentTurnId },
            data: { answerText: merged },
          });
          this.answerBuf = "";
        }

        await finalizeInterview(this.interviewId);

        await releaseSlot(this.interviewId);
        this.wsMap.delete(this.interviewId);
        this.startCallbacks.delete(this.interviewId);
        await this.onDequeue();
      }
    }
    this.gemini?.close();
  }

  private async initiateClosing() {
    if (this.closingMode || this.finalized) return;
    this.closingMode = true;

    if (this.timeWarningTimer) clearTimeout(this.timeWarningTimer);
    if (this.timeCapTimer) clearTimeout(this.timeCapTimer);

    await this.safeSend({ type: "closing_started" });

    this.gemini?.send(
      JSON.stringify({
        clientContent: {
          turns: [
            {
              role: "user",
              parts: [
                {
                  text: "The interview is now complete. Give a brief closing summary highlighting one key strength and one area for improvement. Thank the candidate for interviewing with Evalio, and mention that this was an Evalio AI-powered practice interview. Invite them to share feedback about their experience. Then say goodbye.",
                },
              ],
            },
          ],
          turnComplete: true,
        },
      }),
    );

    setTimeout(() => {
      if (!this.finalized) {
        console.log("[ws] closing safety timeout — forcing cleanup");
        this.cleanup();
      }
    }, 20_000);
  }

  private async handleTurnCompleteDuringClosing() {
    if (!this.interviewId || !this.closingMode || this.finalized) return;
    this.finalized = true;
    console.log("[ws] closing turn complete — finalizing");

    const isChallengeMode =
      this.interviewDepth === "CHALLENGE" ||
      this.interviewDepth === "BAR_RAISER";

    if (isChallengeMode && this.currentTurnId) {
      await this.flushChallengeTurn();
    } else if (this.questionBuf) {
      await this.flushTurn();
    } else if (this.currentTurnId && this.answerBuf) {
      const prev = await prisma.interviewTurn.findUnique({
        where: { id: this.currentTurnId },
        select: { answerText: true },
      });
      const merged = prev?.answerText
        ? prev.answerText + " " + this.answerBuf
        : this.answerBuf;
      await prisma.interviewTurn.update({
        where: { id: this.currentTurnId },
        data: { answerText: merged },
      });
      this.answerBuf = "";
    }
    await finalizeInterview(this.interviewId);
    await this.safeSend({ type: "feedback_ready" });
    this.gemini?.close();
    this.client.close();
  }

  async startInterview(systemPrompt: string, timeLimitMs: number) {
    this.isQueued = false;
    await prisma.interviewSession.update({
      where: { id: this.interviewId! },
      data: { status: "ACTIVE", startedAt: new Date() },
    });

    try {
      this.gemini = await createGeminiSession(systemPrompt);
    } catch (err) {
      console.error("[ws] Gemini session failed:", err);
      await this.safeSend({
        error: "Failed to connect to AI. Please try again.",
      });
      return;
    }

    console.log("[ws] sending initial clientContent to start interview...");

    let greetings: string[];
    if (this.isDsaMode) {
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
    this.gemini.send(
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

    this.gemini.on("message", async (event) => {
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
          await this.safeSendRaw(data);
        }

        const inputText = parsed.serverContent?.inputTranscription?.text;
        const outputText = parsed.serverContent?.outputTranscription?.text;

        if (outputText && this.interviewId) {
          this.questionBuf = dedupAppend(this.questionBuf, outputText);
        }

        if (inputText && this.interviewId) {
          this.answerBuf = dedupAppend(this.answerBuf, inputText);
        }

        const turnComplete = parsed.serverContent?.turnComplete === true;
        const isChallengeMode =
          this.interviewDepth === "CHALLENGE" ||
          this.interviewDepth === "BAR_RAISER";

        if (
          turnComplete &&
          outputText &&
          isChallengeMode &&
          this.waitingForAiResponse &&
          !this.closingMode
        ) {
          this.waitingForAiResponse = false;
          if (this.isNewQuestion(this.questionBuf)) {
            await this.flushChallengeTurn();
            this.currentTurnId = null;
          } else {
            this.questionBuf = outputText;
          }
        }

        if (
          turnComplete &&
          outputText &&
          !isChallengeMode &&
          this.waitingForAiResponse
        ) {
          this.waitingForAiResponse = false;
        }

        if (this.closingMode && turnComplete) {
          await this.handleTurnCompleteDuringClosing();
        }

        // DSA mode: detect READY_FOR_NEXT / ALL_DONE signals
        if (turnComplete && outputText && this.isDsaMode) {
          if (outputText.includes("READY_FOR_NEXT")) {
            // Parse optional target index: READY_FOR_NEXT:3 (1-based, skip to Q3)
            const skipMatch = outputText.match(
              /READY_FOR_NEXT\s*[:－]\s*(\d+)/,
            );
            const skipIdx = skipMatch
              ? Math.max(0, parseInt(skipMatch[1]!, 10) - 1)
              : null;
            await this.safeSend({ type: "dsa_ready_next", index: skipIdx });
            console.log(
              `[dsa] READY_FOR_NEXT detected — skipping to ${
                skipIdx != null ? `Q${skipIdx + 1}` : "next question"
              }`,
            );

            // Tell Gemini which question we're moving to
            try {
              const dsaSession = await prisma.dsaSession.findUnique({
                where: { interviewId: this.interviewId! },
                include: { problems: { orderBy: { index: "asc" } } },
              });
              if (dsaSession) {
                const nextIdx =
                  skipIdx != null ? skipIdx : dsaSession.currentIndex + 1;
                const nextProblem = dsaSession.problems[nextIdx];
                if (nextProblem) {
                  await prisma.dsaSession.update({
                    where: { id: dsaSession.id },
                    data: { currentIndex: nextIdx },
                  });
                  console.log(
                    `[dsa] updated currentIndex to ${nextIdx} (${nextProblem.title})`,
                  );

                  this.gemini?.send(
                    JSON.stringify({
                      clientContent: {
                        turns: [
                          {
                            role: "user",
                            parts: [
                              {
                                text:
                                  skipIdx != null
                                    ? `[System] Skip ahead. The candidate is now on Question ${nextIdx + 1}: "${nextProblem.title}" (${nextProblem.difficulty}). The previous questions were too easy for them, so we're jumping here. Do NOT read it aloud — it's on their screen. Wait for them to indicate they've read it, then start with comprehension checks.`
                                    : `[System] The interview has moved to the next question. The candidate is now on Question ${nextIdx + 1}: "${nextProblem.title}" (${nextProblem.difficulty}). Do NOT read the question aloud — it's displayed on their screen. Wait for the candidate to indicate they've read it before discussing. Start with comprehension checks: ask them to explain their understanding of this problem.`,
                              },
                            ],
                          },
                        ],
                        turnComplete: true,
                      },
                    }),
                  );
                }
              }
            } catch (err) {
              console.error("[dsa] failed to handle READY_FOR_NEXT:", err);
            }
          }
          if (outputText.includes("ALL_DONE")) {
            await this.safeSend({ type: "dsa_all_done" });
          }

          // DSA: detect CODE_UPDATE signal (AI modifying code)
          const codeUpdateMatch = outputText.match(
            /\[CODE_UPDATE\]\s*```(?:\w+)?\s*\n?([\s\S]*?)```\s*\[\/CODE_UPDATE\]/i,
          );
          if (codeUpdateMatch) {
            const updatedCode = codeUpdateMatch[1]!.trim();
            await this.safeSend({
              type: "dsa_code_update",
              code: updatedCode,
            });
            console.log("[dsa] CODE_UPDATE detected — saving");
            try {
              const dsaSession = await prisma.dsaSession.findUnique({
                where: { interviewId: this.interviewId! },
                include: { problems: { orderBy: { index: "asc" } } },
              });
              if (dsaSession) {
                const problem = dsaSession.problems[dsaSession.currentIndex];
                if (problem) {
                  const currentSnapshots = (problem.codeSnapshots ??
                    {}) as Record<string, string>;
                  const currentPhase = problem.currentPhase;
                  currentSnapshots[currentPhase] = updatedCode;
                  await prisma.dsaProblem.update({
                    where: { id: problem.id },
                    data: {
                      code: updatedCode,
                      codeSnapshots: currentSnapshots,
                    },
                  });
                }
              }
            } catch (err) {
              console.error("[dsa] failed to persist CODE_UPDATE:", err);
            }
          }
        }
      } catch {
        // Not JSON or parse error — just relay
      }
    });

    this.gemini.on("close", (...args: unknown[]) => {
      const code = args[0] as number | undefined;
      const reason = args[1] as string | undefined;
      if (!this.finalized) {
        if (code === 1011 && !this.closingMode) {
          this.safeSend({
            type: "error",
            code: "gemini_timeout",
            message: "AI session expired - please try again.",
          });
        }
        console.log(
          `[gemini] connection closed code=${code} reason="${reason}" - triggering cleanup`,
        );
        this.cleanup("gemini_close");
      }
    });

    this.gemini.on("error", (err) => {
      console.error("[gemini] error:", err);
      this.safeSend({ error: "Gemini connection error" });
    });

    console.log("[ws] sending ready signal to client");
    await this.safeSend({ type: "ready" });
    await this.safeSend({ type: "time_limit", limitMs: timeLimitMs });

    this.timeWarningTimer = setTimeout(
      () => {
        this.safeSend({ type: "time_warning", remainingMs: 60_000 });
      },
      Math.max(0, timeLimitMs - 60_000),
    );

    this.timeCapTimer = setTimeout(() => {
      console.log("[ws] time cap reached — initiating closing");
      this.safeSend({ type: "time_limit_reached" });
      this.initiateClosing();
    }, timeLimitMs);
  }

  private async handleMessage(msg: Record<string, unknown>) {
    if (this.isRateLimited()) {
      this.safeSend({ error: "Too many messages. Slow down." });
      return;
    }
    switch (msg.type) {
      case "init": {
        const token = msg.token as string | undefined;
        if (!token) {
          await this.safeSend({ error: "Authentication required" });
          this.client.close();
          return;
        }

        const payload = await verifyWsToken(token);
        if (!payload) {
          await this.safeSend({ error: "Invalid or expired token" });
          this.client.close();
          return;
        }

        const userId = payload.id;

        this.interviewId = msg.interviewId as string;
        if (!this.interviewId) {
          await this.safeSend({ error: "interviewId is required" });
          return;
        }

        console.log(`[ws] init: user=${userId} interview=${this.interviewId}`);

        const interview = await prisma.interviewSession.findUnique({
          where: { id: this.interviewId },
          include: {
            resume: true,
            user: {
              include: {
                githubProfile: true,
              },
            },
          },
        });
        if (!interview) {
          await this.safeSend({ error: "Interview not found" });
          return;
        }
        if (interview.userId !== userId) {
          await this.safeSend({ error: "Unauthorized" });
          return;
        }

        if (interview.status === "COMPLETED") {
          await this.safeSend({ error: "Interview already completed" });
          return;
        }

        const lastTurn = await prisma.interviewTurn.findFirst({
          where: { interviewId: this.interviewId },
          orderBy: { orderNumber: "desc" },
          select: { orderNumber: true },
        });
        this.nextOrderNumber = (lastTurn?.orderNumber ?? 0) + 1;

        const github = interview.user.githubProfile;
        const userRole = interview.user.role ?? "FREE";
        const timeLimitMs =
          userRole === "ADMIN" || userRole === "PRO" ? 1_800_000 : 900_000;
        const durationMinutes = timeLimitMs / 60_000;
        const companyConfig = interview.companyId
          ? COMPANIES.find((c) => c.id === interview.companyId)
          : null;

        this.interviewDepth = interview.interviewDepth ?? "STANDARD";

        const selectedRole =
          companyConfig?.roles.find((r) => r.title === interview.roleTitle) ??
          null;

        const pastInterviews = await prisma.interviewSession.findMany({
          where: {
            userId: interview.userId,
            status: "COMPLETED",
            id: { not: interview.id },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { summary: true },
        });

        const skillProfile = await prisma.candidateSkillProfile.findUnique({
          where: { userId: interview.userId },
        });

        const scoredInterviews = await prisma.interviewSession.findMany({
          where: {
            userId: interview.userId,
            status: "COMPLETED",
            overallScore: { not: null },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { overallScore: true },
        });
        const scores = scoredInterviews.map((i) => i.overallScore!).reverse();
        const scoreTrendLast5: "improving" | "stable" | "declining" | null =
          scores.length < 2
            ? null
            : scores[scores.length - 1]! > scores[0]! + 5
              ? "improving"
              : scores[scores.length - 1]! < scores[0]! - 5
                ? "declining"
                : "stable";

        const isDsa = (interview as { mode?: string }).mode === "DSA";
        this.isDsaMode = isDsa;

        let systemPrompt: string;

        if (isDsa) {
          const dsaSession = await prisma.dsaSession.findUnique({
            where: { interviewId: interview.id },
            include: { problems: { orderBy: { index: "asc" } } },
          });
          const problems =
            dsaSession?.problems.map((p) => ({
              index: p.index,
              title: p.title,
              description: p.description,
              difficulty: p.difficulty,
            })) ?? [];

          // Fetch past DSA interview history
          const pastDsaInterviews = await prisma.interviewSession.findMany({
            where: {
              userId: interview.userId,
              mode: "DSA",
              status: "COMPLETED",
              id: { not: interview.id },
              dsaSession: { isNot: null },
            },
            orderBy: { createdAt: "desc" },
            take: 3,
            include: {
              dsaSession: {
                include: { problems: { orderBy: { index: "asc" } } },
              },
            },
          });
          const dsaHistoryEntries = pastDsaInterviews.map((iv) => ({
            date: iv.createdAt.toISOString().slice(0, 10),
            overallScore: iv.overallScore,
            problemScores:
              iv.dsaSession?.problems.map((p) => ({
                title: p.title,
                score: p.score,
              })) ?? [],
          }));
          const dsaScored = await prisma.interviewSession.findMany({
            where: {
              userId: interview.userId,
              mode: "DSA",
              status: "COMPLETED",
              overallScore: { not: null },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { overallScore: true },
          });
          const dsaScores = dsaScored.map((i) => i.overallScore!).reverse();
          const dsaScoreTrend: "improving" | "stable" | "declining" | null =
            dsaScores.length < 2
              ? null
              : dsaScores[dsaScores.length - 1]! > dsaScores[0]! + 5
                ? "improving"
                : dsaScores[dsaScores.length - 1]! < dsaScores[0]! - 5
                  ? "declining"
                  : "stable";

          systemPrompt = buildDsaSystemPrompt(
            problems,
            dsaSession?.language ?? "python",
            {
              companyName: interview.companyName,
              roleTitle: (interview as { roleTitle?: string | null }).roleTitle,
              interviewRound: (interview as { interviewRound?: string | null })
                .interviewRound,
              position: interview.position,
              interviewDepth: (interview as { interviewDepth?: string | null })
                .interviewDepth,
            },
            {
              pastSessions: dsaHistoryEntries,
              scoreTrendLast5: dsaScoreTrend,
              mostImproved: skillProfile?.mostImprovedSkill ?? null,
              weakest: skillProfile?.weakestSkill ?? null,
            },
          );
        } else {
          const promptInput = {
            position: interview.position,
            candidateName: interview.user.name,
            resumeText: interview.resume?.extractedText ?? null,
            jobDescription:
              (interview as { jobDescription?: string | null })
                .jobDescription ?? null,
            githubUsername: github?.username ?? null,
            githubSummary: github?.summary ?? null,
            githubLanguages: (github?.languages as string[]) ?? [],
            githubProjects:
              (github?.projects as {
                name: string;
                description: string | null;
                stars: number;
                language: string | null;
              }[]) ?? [],
            durationMinutes,
            interviewStyle: (interview.interviewStyle ??
              "PROFESSIONAL") as PromptInput["interviewStyle"],
            interviewDepth: this
              .interviewDepth as PromptInput["interviewDepth"],
            companyName: interview.companyName ?? null,
            companyCulture: companyConfig?.culture ?? null,
            companyInterviewerBehavior:
              companyConfig?.interviewerBehavior ?? null,
            companyEvaluationBiases: companyConfig?.evaluationBiases ?? null,
            roleTopics: selectedRole?.topics ?? null,
            roleEvaluationCriteria: selectedRole?.evaluationCriteria ?? null,
            roleMustProbe: selectedRole?.mustProbe ?? null,
            interviewRound:
              (interview as { interviewRound?: string | null })
                .interviewRound ?? null,
            candidateHistory: pastInterviews.map((iv) => ({
              date: iv.createdAt.toISOString(),
              role: iv.roleTitle ?? iv.position,
              overallScore: iv.overallScore,
              strengths: (iv.summary?.strengths as string[]) ?? [],
              weaknesses: (iv.summary?.weaknesses as string[]) ?? [],
              summary: iv.summary?.summary ?? null,
            })),
            overallMostImproved: skillProfile?.mostImprovedSkill ?? null,
            overallWeakest: skillProfile?.weakestSkill ?? null,
            overallPatterns: (skillProfile?.commonPatterns as string[]) ?? [],
            scoreTrendLast5,
          };
          systemPrompt = buildInterviewPrompt(promptInput);
        }

        const startFn = async () => {
          await this.startInterview(systemPrompt, timeLimitMs);
        };

        const slotOpen = await tryActivate(this.interviewId);
        if (slotOpen) {
          this.wsMap.set(this.interviewId, this.client);
          this.startCallbacks.set(this.interviewId, startFn);
          await this.startInterview(systemPrompt, timeLimitMs);
          this.startHeartbeat();
        } else {
          this.isQueued = true;
          this.wsMap.set(this.interviewId, this.client);
          this.startCallbacks.set(this.interviewId, startFn);
          const position = await queueEnqueue(this.interviewId, userId);
          await this.safeSend({ type: "queued", position });
          this.startHeartbeat();
        }
        break;
      }

      case "audio_chunk": {
        if (this.closingMode) return;
        if (!this.gemini) {
          await this.safeSend({
            error: "Not initialized. Send init first.",
          });
          return;
        }
        try {
          this.gemini.send(
            JSON.stringify({
              realtimeInput: {
                mediaChunks: [
                  {
                    mimeType: "audio/pcm",
                    data: msg.data as string,
                  },
                ],
              },
            }),
          );
        } catch {
          await this.safeSend({ error: "Failed to send audio" });
        }
        break;
      }

      case "audio_stream_end": {
        if (this.closingMode) return;
        if (!this.gemini) {
          await this.safeSend({
            error: "Not initialized. Send init first.",
          });
          return;
        }
        console.log("[ws] audio_stream_end from client \u2192 Gemini");

        const isChallengeMode =
          this.interviewDepth === "CHALLENGE" ||
          this.interviewDepth === "BAR_RAISER";
        const isInterrupted =
          (msg as { interrupted?: boolean }).interrupted === true;

        if (isInterrupted) {
          if (this.questionBuf) {
            await this.flushTurn();
          } else if (this.currentTurnId && this.answerBuf) {
            const prev = await prisma.interviewTurn.findUnique({
              where: { id: this.currentTurnId },
              select: { answerText: true },
            });
            await prisma.interviewTurn.update({
              where: { id: this.currentTurnId },
              data: {
                answerText: prev?.answerText
                  ? prev.answerText + "\n\n" + this.answerBuf
                  : this.answerBuf,
              },
            });
          }
          this.answerBuf = "";
          this.currentTurnId = null;
          this.questionBuf = "";
          this.waitingForAiResponse = true;

          try {
            this.gemini.send(
              JSON.stringify({
                realtimeInput: { audioStreamEnd: true },
              }),
            );
          } catch {
            await this.safeSend({ error: "Failed to end audio stream" });
          }
          break;
        } else if (isChallengeMode) {
          if (this.interviewId) {
            if (!this.currentTurnId && this.questionBuf) {
              this.currentTurnId = await this.createTurn(this.questionBuf);
            }
            if (this.currentTurnId && this.answerBuf) {
              const prev = await prisma.interviewTurn.findUnique({
                where: { id: this.currentTurnId },
                select: { answerText: true },
              });
              const merged = prev?.answerText
                ? prev.answerText + "\n\n" + this.answerBuf
                : this.answerBuf;
              await prisma.interviewTurn.update({
                where: { id: this.currentTurnId },
                data: { answerText: merged },
              });
              this.answerBuf = "";
            }
          }
        } else {
          if (this.interviewId && this.questionBuf) {
            await this.flushTurn();
          } else if (this.interviewId && this.currentTurnId && this.answerBuf) {
            const prev = await prisma.interviewTurn.findUnique({
              where: { id: this.currentTurnId },
              select: { answerText: true },
            });
            const merged = prev?.answerText
              ? prev.answerText + " " + this.answerBuf
              : this.answerBuf;
            await prisma.interviewTurn.update({
              where: { id: this.currentTurnId },
              data: { answerText: merged },
            });
            this.answerBuf = "";
          }
        }

        this.waitingForAiResponse = true;

        try {
          this.gemini.send(
            JSON.stringify({
              realtimeInput: {
                audioStreamEnd: true,
              },
            }),
          );
        } catch {
          await this.safeSend({ error: "Failed to end audio stream" });
        }
        break;
      }

      case "code_preview": {
        if (!this.gemini || this.closingMode) return;
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
                      text: `[Code Preview — Question ${idx}, ${phase} phase, not yet saved]\n\n\`\`\`${prevMsg.language ?? "python"}\n${prevMsg.code}\n\`\`\``,
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
        const codeText = `\`\`\`${codeMsg.language ?? "python"}\n${codeMsg.code}\n\`\`\``;
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

        // Persist code snapshot to the DSA problem
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

      case "end_interview": {
        console.log("[ws] end_interview from client");
        await this.initiateClosing();
        break;
      }

      default:
        await this.safeSend({
          error: `Unknown message type: ${msg.type}`,
        });
    }
  }
}

// Safe index: defaults to 0, clamped to non-negative, capped at sane max
function safeIndex(n: unknown): number {
  if (typeof n !== "number" || !Number.isInteger(n) || n < 0) return 0;
  return Math.min(n, 20);
}

// Safe phase: must be one of the known DSA_PHASES, else "implementation"
function safePhase(p: unknown): string {
  if (typeof p !== "string") return "implementation";
  return DSA_PHASES.includes(p as (typeof DSA_PHASES)[number])
    ? p
    : "implementation";
}
