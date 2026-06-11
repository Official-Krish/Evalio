import { WebSocketServer } from "ws"
import { createGeminiSession, type GeminiSession } from "./gemini"
import { prisma } from "./lib/prisma"
import { buildInterviewPrompt } from "./prompt"
import { evaluateInterview } from "./services/evaluate"

const WS_PORT = parseInt(Bun.env.WS_PORT ?? "8080")

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
  const t = incoming.trim()
  if (!t) return buf
  if (!buf) return t
  if (t.startsWith(buf)) return t
  if (buf.endsWith(t) || buf.startsWith(t)) return buf
  return buf + " " + t
}

async function finalizeInterview(interviewId: string) {
  try {
    const interview = await prisma.interviewSession.findUnique({
      where: { id: interviewId },
      select: { status: true, startedAt: true },
    })
    if (!interview || interview.status === "COMPLETED") return

    await prisma.interviewSession.update({
      where: { id: interviewId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
        ...(interview.startedAt
          ? {
              durationSeconds: Math.round(
                (Date.now() - new Date(interview.startedAt).getTime()) / 1000
              ),
            }
          : {}),
      },
    })

    console.log(`[ws] finalizing interview ${interviewId}, triggering evaluation`)
    evaluateInterview(interviewId).catch((err) =>
      console.error("Evaluation failed:", err)
    )
  } catch (err) {
    console.error("finalizeInterview error:", err)
  }
}

export function startWsServer() {
  const wss = new WebSocketServer({ port: WS_PORT })

  wss.on("connection", async (client) => {
    console.log("[ws] candidate connected")

    let interviewId: string | null = null
    let gemini: GeminiSession | null = null
    let currentTurnId: string | null = null
    let questionBuf = ""
    let answerBuf = ""
    let nextOrderNumber = 1
    let finalized = false

    async function createTurn(questionText: string) {
      const turn = await prisma.interviewTurn.create({
        data: {
          interviewId: interviewId!,
          orderNumber: nextOrderNumber++,
          questionText,
          answerText: "",
        },
      })
      console.log(`[ws] created turn ${turn.id}: "${questionText.slice(0, 60)}..."`)
      return turn.id
    }

    async function safeSend(data: unknown) {
      try {
        client.send(JSON.stringify(data))
      } catch {
        // Client already disconnected
      }
    }

    async function safeSendRaw(data: string) {
      try {
        client.send(data)
      } catch {
        // Client already disconnected
      }
    }

    /** Flush the turn: save the current question-answer pair as a turn + transcript events, then clear buffers. */
    async function flushTurn() {
      if (!interviewId || !questionBuf) return

      const turnId = await createTurn(questionBuf)

      if (answerBuf) {
        await prisma.interviewTurn.update({
          where: { id: turnId },
          data: { answerText: answerBuf },
        })
        await prisma.transcriptEvent.create({
          data: {
            interviewId,
            turnId,
            role: "USER",
            text: answerBuf,
          },
        })
      }

      await prisma.transcriptEvent.create({
        data: {
          interviewId,
          turnId,
          role: "ASSISTANT",
          text: questionBuf,
        },
      })

      currentTurnId = turnId
      questionBuf = ""
      answerBuf = ""
    }

    async function cleanup() {
      if (interviewId && !finalized) {
        finalized = true
        // flush remaining buffers
        if (questionBuf) {
          await flushTurn()
        } else if (currentTurnId && answerBuf) {
          // user spoke last with no AI follow-up — append to previous answer
          const prev = await prisma.interviewTurn.findUnique({
            where: { id: currentTurnId },
            select: { answerText: true },
          })
          const merged = prev?.answerText
            ? prev.answerText + " " + answerBuf
            : answerBuf
          await prisma.interviewTurn.update({
            where: { id: currentTurnId },
            data: { answerText: merged },
          })
          answerBuf = ""
        }

        if (currentTurnId) {
          await finalizeInterview(interviewId)
        } else {
          console.log(`[ws] skipping finalize — no turns recorded for ${interviewId}`)
        }
      }
      gemini?.close()
    }

    client.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString())

        switch (msg.type) {
          case "init": {
            const userId = msg.token
            if (!userId) {
              await safeSend({ error: "Authentication required" })
              client.close()
              return
            }

            interviewId = msg.interviewId
            if (!interviewId) {
              await safeSend({ error: "interviewId is required" })
              return
            }

            console.log(`[ws] init: user=${userId} interview=${interviewId}`)

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
            })
            if (!interview) {
              await safeSend({ error: "Interview not found" })
              return
            }
            if (interview.userId !== userId) {
              await safeSend({ error: "Unauthorized" })
              return
            }

            if (interview.status === "COMPLETED") {
              await safeSend({ error: "Interview already completed" })
              return
            }

            await prisma.interviewSession.update({
              where: { id: interviewId },
              data: { status: "ACTIVE", startedAt: new Date() },
            })

            const lastTurn = await prisma.interviewTurn.findFirst({
              where: { interviewId },
              orderBy: { orderNumber: "desc" },
              select: { orderNumber: true },
            })
            nextOrderNumber = (lastTurn?.orderNumber ?? 0) + 1

            const github = interview.user.githubProfile
            const promptInput = {
              position: interview.position,
              candidateName: interview.user.name,
              resumeText: interview.resume?.extractedText ?? null,
              githubUsername: github?.username ?? null,
              githubSummary: github?.summary ?? null,
              githubLanguages: (github?.languages as string[]) ?? [],
              githubProjects: (github?.projects as { name: string; description: string | null; stars: number; language: string | null }[]) ?? [],
            }

            const systemPrompt = buildInterviewPrompt(promptInput)

            try {
              gemini = await createGeminiSession(systemPrompt)
            } catch (err) {
              console.error("[ws] Gemini session failed:", err)
              await safeSend({ error: `Failed to connect to AI: ${(err as Error).message}` })
              return
            }

            console.log("[ws] sending initial clientContent to start interview...")
            gemini.send(
              JSON.stringify({
                clientContent: {
                  turns: [
                    {
                      role: "user",
                      parts: [{ text: "Start the interview with a greeting and some instructions." }],
                    },
                  ],
                  turnComplete: true,
                },
              })
            )

            gemini.on("message", async (event) => {
              const data =
                event instanceof Buffer ? event.toString() : String(event)

              try {
                const parsed = JSON.parse(data)

                if (parsed.error) {
                  console.error("[gemini] ERROR:", JSON.stringify(parsed.error))
                }

                const hasContent = !!parsed.serverContent
                const hasSetup = !!parsed.setupComplete
                if (hasContent || hasSetup) {
                  const label = hasSetup ? "setupComplete" : "serverContent"
                  const hasAudio = !!parsed.serverContent?.modelTurn?.parts?.some(
                    (p: Record<string, unknown>) => p.inlineData
                  )
                  console.log(
                    `[gemini] → ${label}${hasAudio ? " (with audio)" : ""} turnComplete=${!!parsed.serverContent?.turnComplete}`
                  )
                } else if (!parsed.setupComplete) {
                  console.log("[gemini] → other message:", JSON.stringify(parsed).slice(0, 300))
                }

                // Forward Gemini messages to client (skip setupComplete)
                if (!parsed.setupComplete) {
                  await safeSendRaw(data)
                }

                const inputText =
                  parsed.serverContent?.inputTranscription?.text
                const outputText =
                  parsed.serverContent?.outputTranscription?.text

                // Buffer AI speech (incremental chunks — dedupAppend handles progressive refinement)
                if (outputText && interviewId) {
                  questionBuf = dedupAppend(questionBuf, outputText)
                }

                // Buffer user speech (incremental VAD transcription)
                if (inputText && interviewId) {
                  answerBuf = dedupAppend(answerBuf, inputText)
                }
              } catch {
                // Not JSON or parse error — just relay
              }
            })

            gemini.on("close", () => {
              console.log("[gemini] connection closed")
              cleanup()
              client.close()
            })

            gemini.on("error", (err) => {
              console.error("[gemini] error:", err)
              safeSend({ error: "Gemini connection error" })
            })

            console.log("[ws] sending ready signal to client")
            await safeSend({ type: "ready" })
            break
          }

          case "audio_chunk": {
            if (!gemini) {
              await safeSend({
                error: "Not initialized. Send init first.",
              })
              return
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
                })
              )
            } catch {
              await safeSend({ error: "Failed to send audio" })
            }
            break
          }

          case "audio_stream_end": {
            if (!gemini) {
              await safeSend({
                error: "Not initialized. Send init first.",
              })
              return
            }
            console.log("[ws] audio_stream_end from client → Gemini")

            // --- TURN BOUNDARY ---
            // User stopped recording — save the question accumulated from
            // the AI's previous speaking turn + the answer the user just gave.
            if (interviewId && questionBuf) {
              await flushTurn()
            } else if (interviewId && currentTurnId && answerBuf) {
              // No new question but user spoke — append to previous answer
              const prev = await prisma.interviewTurn.findUnique({
                where: { id: currentTurnId },
                select: { answerText: true },
              })
              const merged = prev?.answerText
                ? prev.answerText + " " + answerBuf
                : answerBuf
              await prisma.interviewTurn.update({
                where: { id: currentTurnId },
                data: { answerText: merged },
              })
              answerBuf = ""
            }

            try {
              gemini.send(
                JSON.stringify({
                  realtimeInput: {
                    audioStreamEnd: true,
                  },
                })
              )
            } catch {
              await safeSend({ error: "Failed to end audio stream" })
            }
            break
          }

          case "end_interview": {
            console.log("[ws] end_interview from client")
            await cleanup()
            client.close()
            break
          }

          default:
            await safeSend({
              error: `Unknown message type: ${msg.type}`,
            })
        }
      } catch {
        safeSend({ error: "Invalid JSON" })
      }
    })

    client.on("close", () => {
      console.log("[ws] candidate disconnected")
      cleanup()
    })

    client.on("error", () => {
      cleanup()
    })
  })

  console.log(`WS server running on port ${WS_PORT}`)
}
