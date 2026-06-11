import { WebSocketServer, WebSocket as WsWebSocket } from "ws"
import { createGeminiSession } from "./gemini"
import { prisma } from "./lib/prisma"
import { buildInterviewPrompt } from "./prompt"
import { evaluateInterview } from "./services/evaluate"

const WS_PORT = parseInt(Bun.env.WS_PORT ?? "8080")

async function aggregateTurn(turnId: string) {
  const events = await prisma.transcriptEvent.findMany({
    where: { turnId, role: "USER" },
    orderBy: { startMs: "asc" },
  })

  const deduped: string[] = []
  for (const event of events) {
    const text = event.text.trim()
    if (!text) continue
    if (deduped.length === 0) {
      deduped.push(text)
    } else {
      const last = deduped[deduped.length - 1]!
      if (text.startsWith(last)) {
        deduped[deduped.length - 1] = text
      } else {
        deduped.push(text)
      }
    }
  }

  const answerText = deduped.join(" ")

  await prisma.interviewTurn.update({
    where: { id: turnId },
    data: { answerText: answerText || "" },
  })
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
    console.log("candidate connected")

    let interviewId: string | null = null
    let gemini: WsWebSocket | null = null
    let currentTurnId: string | null = null
    let hasReceivedInputSinceLastTurn = false
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
      return turn.id
    }

    async function safeSend(data: unknown) {
      try {
        client.send(JSON.stringify(data))
      } catch {
        // Client already disconnected
      }
    }

    async function cleanup() {
      if (interviewId && !finalized) {
        finalized = true
        await finalizeInterview(interviewId)
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
              gemini = await createGeminiSession()
            } catch (err) {
              await safeSend({ error: `Failed to connect to AI: ${(err as Error).message}` })
              return
            }

            gemini.on("message", async (event) => {
              const data = event.toString()
              client.send(data)

              try {
                const parsed = JSON.parse(data)
                const inputText =
                  parsed.serverContent?.inputTranscription?.text
                const outputText =
                  parsed.serverContent?.outputTranscription?.text

                if (inputText && interviewId) {
                  await prisma.transcriptEvent.create({
                    data: {
                      interviewId,
                      turnId: currentTurnId,
                      role: "USER",
                      text: inputText,
                    },
                  })
                  hasReceivedInputSinceLastTurn = true
                }

                if (outputText && interviewId) {
                  await prisma.transcriptEvent.create({
                    data: {
                      interviewId,
                      turnId: currentTurnId,
                      role: "ASSISTANT",
                      text: outputText,
                    },
                  })

                  if (hasReceivedInputSinceLastTurn) {
                    await aggregateTurn(currentTurnId!)
                    hasReceivedInputSinceLastTurn = false
                    currentTurnId = await createTurn(outputText)
                  } else if (!currentTurnId) {
                    currentTurnId = await createTurn(outputText)
                  } else {
                    const turn = await prisma.interviewTurn.findUnique({
                      where: { id: currentTurnId },
                      select: { questionText: true },
                    })
                    if (
                      turn &&
                      outputText.length > turn.questionText.length
                    ) {
                      await prisma.interviewTurn.update({
                        where: { id: currentTurnId },
                        data: { questionText: outputText },
                      })
                    }
                  }
                }
              } catch {
                // Not JSON or parse error — just relay
              }
            })

            gemini.on("close", () => {
              client.close()
            })

            gemini.on("error", () => {
              safeSend({ error: "Gemini connection error" })
            })

            gemini.send(
              JSON.stringify({
                clientContent: {
                  turns: [
                    {
                      role: "user",
                      parts: [{ text: systemPrompt }],
                    },
                  ],
                  turnComplete: true,
                },
              })
            )

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

          case "end_interview": {
            if (interviewId) {
              if (currentTurnId && hasReceivedInputSinceLastTurn) {
                await aggregateTurn(currentTurnId)
              }
            }
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
      console.log("candidate disconnected")
      cleanup()
    })

    client.on("error", () => {
      cleanup()
    })
  })

  console.log(`WS server running on port ${WS_PORT}`)
}
