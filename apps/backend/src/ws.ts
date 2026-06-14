import { WebSocketServer } from "ws";
import { createGeminiSession, type GeminiSession } from "./gemini";
import { prisma } from "./lib/prisma";
import { buildInterviewPrompt, type PromptInput } from "./prompt";
import { evaluateInterview } from "./services/evaluate";
import { COMPANIES } from "@evalio/shared";

const WS_PORT = parseInt(Bun.env.WS_PORT ?? "8080");

/**
 * Append incoming text with progressive-refinement dedup.
 *
 * Gemini sends incremental transcription chunks:
 *   "Tell" → "Tell me" → "Tell me about" → "Tell me about your journey"
 *
 * Each new chunk either:
 *  - starts with the buffer  → it's a refinement → replace buffer
 *  - ends with the buffer    → keep buffer (it's more complete)
 *  - buffer starts with it   → keep buffer
 *  - otherwise               → append as new content
 */
function dedupAppend(buf: string, incoming: string): string {
  const t = incoming.trim();
  if (!t) return buf;
  if (!buf) return t;
  if (t.startsWith(buf)) return t;
  if (buf.endsWith(t) || buf.startsWith(t)) return buf;

  // Character-level streaming: single letters concatenate without space
  // "I" + "a" + "m" → "Iam" not "I a m"
  const lastChar = buf[buf.length - 1];
  const firstChar = t[0];
  if (
    t.length <= 2 &&
    lastChar !== undefined &&
    firstChar !== undefined &&
    /[a-zA-Z]/.test(lastChar) &&
    /[a-zA-Z]/.test(firstChar)
  ) {
    return buf + t;
  }

  return buf + " " + t;
}

async function finalizeInterview(interviewId: string) {
  try {
    const interview = await prisma.interviewSession.findUnique({
      where: { id: interviewId },
      select: { status: true, startedAt: true },
    });
    if (!interview || interview.status === "COMPLETED") return;

    await prisma.interviewSession.update({
      where: { id: interviewId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
        ...(interview.startedAt
          ? {
              durationSeconds: Math.round(
                (Date.now() - new Date(interview.startedAt).getTime()) / 1000,
              ),
            }
          : {}),
      },
    });

    console.log(
      `[ws] finalizing interview ${interviewId}, triggering evaluation`,
    );
    evaluateInterview(interviewId).catch((err) =>
      console.error("Evaluation failed:", err),
    );
  } catch (err) {
    console.error("finalizeInterview error:", err);
  }
}

export function startWsServer() {
  const wss = new WebSocketServer({ port: WS_PORT });

  wss.on("connection", async (client) => {
    console.log("[ws] candidate connected");

    let interviewId: string | null = null;
    let gemini: GeminiSession | null = null;
    let currentTurnId: string | null = null;
    let questionBuf = "";
    let answerBuf = "";
    let nextOrderNumber = 1;
    let finalized = false;
    let closingMode = false;
    let timeWarningTimer: ReturnType<typeof setTimeout> | null = null;
    let timeCapTimer: ReturnType<typeof setTimeout> | null = null;
    let interviewDepth: string = "STANDARD";
    let waitingForAiResponse = false;

    function isNewQuestion(text: string): boolean {
      const lower = text.toLowerCase();
      const newQIndicators = [
        "let's move on",
        "let’s move on",
        "next question",
        "next, ",
        "now i'd like to",
        "now i’d like to",
        "tell me about",
        "how do you",
        "how would you",
        "what is your",
        "what's your",
        "let's talk about",
        "let’s talk about",
        "moving on",
        "another topic",
        "let me ask you",
        "now tell me",
      ];
      return newQIndicators.some((i) => lower.includes(i));
    }

    async function flushChallengeTurn() {
      if (!interviewId || !currentTurnId) return;
      if (answerBuf) {
        const prev = await prisma.interviewTurn.findUnique({
          where: { id: currentTurnId },
          select: { answerText: true },
        });
        const merged = prev?.answerText
          ? prev.answerText + "\n\n" + answerBuf
          : answerBuf;
        await prisma.interviewTurn.update({
          where: { id: currentTurnId },
          data: { answerText: merged },
        });
        answerBuf = "";
      }
    }

    async function createTurn(questionText: string) {
      const turn = await prisma.interviewTurn.create({
        data: {
          interviewId: interviewId!,
          orderNumber: nextOrderNumber++,
          questionText,
          answerText: "",
        },
      });
      console.log(
        `[ws] created turn ${turn.id}: "${questionText.slice(0, 60)}..."`,
      );
      return turn.id;
    }

    async function safeSend(data: unknown) {
      try {
        client.send(JSON.stringify(data));
      } catch {
        // Client already disconnected
      }
    }

    async function safeSendRaw(data: string) {
      try {
        client.send(data);
      } catch {
        // Client already disconnected
      }
    }

    /** Flush the turn: save the current question-answer pair as a turn + transcript events, then clear buffers. */
    async function flushTurn() {
      if (!interviewId || !questionBuf) return;

      const turnId = await createTurn(questionBuf);

      if (answerBuf) {
        await prisma.interviewTurn.update({
          where: { id: turnId },
          data: { answerText: answerBuf },
        });
      }

      currentTurnId = turnId;
      questionBuf = "";
      answerBuf = "";
    }

    async function cleanup() {
      if (timeWarningTimer) clearTimeout(timeWarningTimer);
      if (timeCapTimer) clearTimeout(timeCapTimer);
      if (interviewId && !finalized) {
        finalized = true;
        const isChallengeMode =
          interviewDepth === "CHALLENGE" || interviewDepth === "BAR_RAISER";

        if (isChallengeMode && currentTurnId) {
          await flushChallengeTurn();
        } else if (questionBuf) {
          await flushTurn();
        } else if (currentTurnId && answerBuf) {
          const prev = await prisma.interviewTurn.findUnique({
            where: { id: currentTurnId },
            select: { answerText: true },
          });
          const merged = prev?.answerText
            ? prev.answerText + " " + answerBuf
            : answerBuf;
          await prisma.interviewTurn.update({
            where: { id: currentTurnId },
            data: { answerText: merged },
          });
          answerBuf = "";
        }

        if (currentTurnId) {
          await finalizeInterview(interviewId);
        } else {
          console.log(
            `[ws] skipping finalize — no turns recorded for ${interviewId}`,
          );
        }
      }
      gemini?.close();
    }

    async function initiateClosing() {
      if (closingMode || finalized) return;
      closingMode = true;

      if (timeWarningTimer) clearTimeout(timeWarningTimer);
      if (timeCapTimer) clearTimeout(timeCapTimer);

      await safeSend({ type: "closing_started" });

      gemini?.send(
        JSON.stringify({
          clientContent: {
            turns: [
              {
                role: "user",
                parts: [
                  {
                    text: "The interview is now complete. Give a brief closing summary highlighting one key strength and one area for improvement, thank the candidate, and say goodbye.",
                  },
                ],
              },
            ],
            turnComplete: true,
          },
        }),
      );

      // safety: force cleanup after 20s if Gemini doesn't finish
      setTimeout(() => {
        if (!finalized) {
          console.log("[ws] closing safety timeout — forcing cleanup");
          cleanup();
        }
      }, 20_000);
    }

    async function handleTurnCompleteDuringClosing() {
      if (!interviewId || !closingMode || finalized) return;
      console.log("[ws] closing turn complete — finalizing");

      const isChallengeMode =
        interviewDepth === "CHALLENGE" || interviewDepth === "BAR_RAISER";

      if (isChallengeMode && currentTurnId) {
        await flushChallengeTurn();
      } else if (questionBuf) {
        await flushTurn();
      } else if (currentTurnId && answerBuf) {
        const prev = await prisma.interviewTurn.findUnique({
          where: { id: currentTurnId },
          select: { answerText: true },
        });
        const merged = prev?.answerText
          ? prev.answerText + " " + answerBuf
          : answerBuf;
        await prisma.interviewTurn.update({
          where: { id: currentTurnId },
          data: { answerText: merged },
        });
        answerBuf = "";
      }
      await finalizeInterview(interviewId);
      await safeSend({ type: "feedback_ready" });
      gemini?.close();
      client.close();
    }

    client.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        switch (msg.type) {
          case "init": {
            const userId = msg.token;
            if (!userId) {
              await safeSend({ error: "Authentication required" });
              client.close();
              return;
            }

            interviewId = msg.interviewId;
            if (!interviewId) {
              await safeSend({ error: "interviewId is required" });
              return;
            }

            console.log(`[ws] init: user=${userId} interview=${interviewId}`);

            const interview = await prisma.interviewSession.findUnique({
              where: { id: interviewId },
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
              await safeSend({ error: "Interview not found" });
              return;
            }
            if (interview.userId !== userId) {
              await safeSend({ error: "Unauthorized" });
              return;
            }

            if (interview.status === "COMPLETED") {
              await safeSend({ error: "Interview already completed" });
              return;
            }

            await prisma.interviewSession.update({
              where: { id: interviewId },
              data: { status: "ACTIVE", startedAt: new Date() },
            });

            const lastTurn = await prisma.interviewTurn.findFirst({
              where: { interviewId },
              orderBy: { orderNumber: "desc" },
              select: { orderNumber: true },
            });
            nextOrderNumber = (lastTurn?.orderNumber ?? 0) + 1;

            const github = interview.user.githubProfile;
            const userRole = interview.user.role ?? "FREE";
            const timeLimitMs =
              userRole === "ADMIN" || userRole === "PRO" ? 1_800_000 : 900_000;
            const durationMinutes = timeLimitMs / 60_000;
            const companyConfig = interview.companyId
              ? COMPANIES.find((c) => c.id === interview.companyId)
              : null;

            interviewDepth = interview.interviewDepth ?? "STANDARD";

            const selectedRole =
              companyConfig?.roles.find(
                (r) => r.title === interview.roleTitle,
              ) ?? null;

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
              interviewDepth: interviewDepth as PromptInput["interviewDepth"],
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
              candidateHistory: null,
            };

            const systemPrompt = buildInterviewPrompt(promptInput);

            try {
              gemini = await createGeminiSession(systemPrompt);
            } catch (err) {
              console.error("[ws] Gemini session failed:", err);
              await safeSend({
                error: `Failed to connect to AI: ${(err as Error).message}`,
              });
              return;
            }

            console.log(
              "[ws] sending initial clientContent to start interview...",
            );
            gemini.send(
              JSON.stringify({
                clientContent: {
                  turns: [
                    {
                      role: "user",
                      parts: [
                        {
                          text: "Start the interview with a greeting and some instructions.",
                        },
                      ],
                    },
                  ],
                  turnComplete: true,
                },
              }),
            );

            gemini.on("message", async (event) => {
              const data =
                event instanceof Buffer ? event.toString() : String(event);

              try {
                const parsed = JSON.parse(data);

                if (parsed.error) {
                  console.error(
                    "[gemini] ERROR:",
                    JSON.stringify(parsed.error),
                  );
                }

                const hasContent = !!parsed.serverContent;
                const hasSetup = !!parsed.setupComplete;
                if (hasContent || hasSetup) {
                  const label = hasSetup ? "setupComplete" : "serverContent";
                  const hasAudio =
                    !!parsed.serverContent?.modelTurn?.parts?.some(
                      (p: Record<string, unknown>) => p.inlineData,
                    );
                  console.log(
                    `[gemini] → ${label}${hasAudio ? " (with audio)" : ""} turnComplete=${!!parsed.serverContent?.turnComplete}`,
                  );
                } else if (!parsed.setupComplete) {
                  console.log(
                    "[gemini] → other message:",
                    JSON.stringify(parsed).slice(0, 300),
                  );
                }

                // Forward Gemini messages to client (skip setupComplete)
                if (!parsed.setupComplete) {
                  await safeSendRaw(data);
                }

                const inputText =
                  parsed.serverContent?.inputTranscription?.text;
                const outputText =
                  parsed.serverContent?.outputTranscription?.text;

                // Buffer AI speech (incremental chunks — dedupAppend handles progressive refinement)
                if (outputText && interviewId) {
                  questionBuf = dedupAppend(questionBuf, outputText);
                }

                // Buffer user speech (incremental VAD transcription)
                if (inputText && interviewId) {
                  answerBuf = dedupAppend(answerBuf, inputText);
                }

                // In challenge mode, detect new question vs challenge on AI turnComplete
                const turnComplete =
                  parsed.serverContent?.turnComplete === true;
                const isChallengeMode =
                  interviewDepth === "CHALLENGE" ||
                  interviewDepth === "BAR_RAISER";

                if (
                  turnComplete &&
                  outputText &&
                  isChallengeMode &&
                  waitingForAiResponse &&
                  !closingMode
                ) {
                  waitingForAiResponse = false;
                  if (isNewQuestion(questionBuf)) {
                    // AI moved to a new question — finalize the challenge turn
                    await flushChallengeTurn();
                    currentTurnId = null;
                  } else {
                    // AI is still challenging — keep the turn open, questionBuf stays
                    questionBuf = outputText;
                  }
                }

                if (
                  turnComplete &&
                  outputText &&
                  !isChallengeMode &&
                  waitingForAiResponse
                ) {
                  waitingForAiResponse = false;
                }

                // In closing mode, detect turnComplete to finalize
                if (closingMode && turnComplete) {
                  await handleTurnCompleteDuringClosing();
                }
              } catch {
                // Not JSON or parse error — just relay
              }
            });

            gemini.on("close", () => {
              console.log("[gemini] connection closed");
              cleanup();
              client.close();
            });

            gemini.on("error", (err) => {
              console.error("[gemini] error:", err);
              safeSend({ error: "Gemini connection error" });
            });

            console.log("[ws] sending ready signal to client");
            await safeSend({ type: "ready" });
            await safeSend({ type: "time_limit", limitMs: timeLimitMs });

            timeWarningTimer = setTimeout(
              () => {
                safeSend({ type: "time_warning", remainingMs: 60_000 });
              },
              Math.max(0, timeLimitMs - 60_000),
            );

            timeCapTimer = setTimeout(() => {
              console.log("[ws] time cap reached — initiating closing");
              safeSend({ type: "time_limit_reached" });
              initiateClosing();
            }, timeLimitMs);
            break;
          }

          case "audio_chunk": {
            if (closingMode) return;
            if (!gemini) {
              await safeSend({
                error: "Not initialized. Send init first.",
              });
              return;
            }
            try {
              gemini.send(
                JSON.stringify({
                  realtimeInput: {
                    mediaChunks: [
                      {
                        mimeType: "audio/pcm",
                        data: msg.data,
                      },
                    ],
                  },
                }),
              );
            } catch {
              await safeSend({ error: "Failed to send audio" });
            }
            break;
          }

          case "audio_stream_end": {
            if (closingMode) return;
            if (!gemini) {
              await safeSend({
                error: "Not initialized. Send init first.",
              });
              return;
            }
            console.log("[ws] audio_stream_end from client → Gemini");

            const isChallengeMode =
              interviewDepth === "CHALLENGE" || interviewDepth === "BAR_RAISER";
            const isInterrupted = msg.interrupted === true;

            if (isInterrupted) {
              // AI interrupted — save accumulated content, then reset
              if (currentTurnId && answerBuf) {
                const prev = await prisma.interviewTurn.findUnique({
                  where: { id: currentTurnId },
                  select: { answerText: true },
                });
                await prisma.interviewTurn.update({
                  where: { id: currentTurnId },
                  data: {
                    answerText: prev?.answerText
                      ? prev.answerText + "\n\n" + answerBuf
                      : answerBuf,
                  },
                });
              } else if (questionBuf) {
                await flushTurn();
              }
              answerBuf = "";
              currentTurnId = null;
              questionBuf = "";

              // Forward audioStreamEnd to Gemini but skip waitingForAiResponse
              try {
                gemini.send(
                  JSON.stringify({
                    realtimeInput: { audioStreamEnd: true },
                  }),
                );
              } catch {
                await safeSend({ error: "Failed to end audio stream" });
              }
              break;
            } else if (isChallengeMode) {
              // Challenge mode: accumulate answer into current turn
              if (interviewId) {
                if (!currentTurnId && questionBuf) {
                  currentTurnId = await createTurn(questionBuf);
                }
                if (currentTurnId && answerBuf) {
                  const prev = await prisma.interviewTurn.findUnique({
                    where: { id: currentTurnId },
                    select: { answerText: true },
                  });
                  const merged = prev?.answerText
                    ? prev.answerText + "\n\n" + answerBuf
                    : answerBuf;
                  await prisma.interviewTurn.update({
                    where: { id: currentTurnId },
                    data: { answerText: merged },
                  });
                  answerBuf = "";
                }
              }
            } else {
              // Standard/Probing: normal turn boundary
              if (interviewId && questionBuf) {
                await flushTurn();
              } else if (interviewId && currentTurnId && answerBuf) {
                const prev = await prisma.interviewTurn.findUnique({
                  where: { id: currentTurnId },
                  select: { answerText: true },
                });
                const merged = prev?.answerText
                  ? prev.answerText + " " + answerBuf
                  : answerBuf;
                await prisma.interviewTurn.update({
                  where: { id: currentTurnId },
                  data: { answerText: merged },
                });
                answerBuf = "";
              }
            }

            waitingForAiResponse = true;

            try {
              gemini.send(
                JSON.stringify({
                  realtimeInput: {
                    audioStreamEnd: true,
                  },
                }),
              );
            } catch {
              await safeSend({ error: "Failed to end audio stream" });
            }
            break;
          }

          case "end_interview": {
            console.log("[ws] end_interview from client");
            await initiateClosing();
            break;
          }

          default:
            await safeSend({
              error: `Unknown message type: ${msg.type}`,
            });
        }
      } catch {
        safeSend({ error: "Invalid JSON" });
      }
    });

    client.on("close", () => {
      console.log("[ws] candidate disconnected");
      cleanup();
    });

    client.on("error", () => {
      cleanup();
    });
  });

  console.log(`WS server running on port ${WS_PORT}`);
}
