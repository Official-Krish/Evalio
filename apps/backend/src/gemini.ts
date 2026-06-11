import { EventEmitter } from "node:events"
import { GoogleGenAI, Modality, type Session } from "@google/genai"

export interface GeminiSession {
  on(
    event: "message" | "error" | "close",
    listener: (...args: unknown[]) => void
  ): this
  send(data: string): void
  close(): void
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

class GeminiSessionAdapter
  implements GeminiSession
{
  constructor(
    private readonly session: Session,
    private readonly bus: EventEmitter
  ) {}

  on(
    event: "message" | "error" | "close",
    listener: (...args: unknown[]) => void
  ): this {
    this.bus.on(event, listener)
    return this
  }

  send(data: string) {
    const message = JSON.parse(data) as {
      clientContent?: {
        turns?: Array<{
          role?: string
          parts?: Array<{ text?: string }>
        }>
        turnComplete?: boolean
      }
      realtimeInput?: {
        audioStreamEnd?: boolean
        mediaChunks?: Array<{
          mimeType?: string
          data?: string
        }>
      }
    }

    if (message.clientContent) {
      this.session.sendClientContent({
        turns: message.clientContent.turns,
        turnComplete: message.clientContent.turnComplete,
      })
      return
    }

    if (message.realtimeInput?.audioStreamEnd) {
      this.session.sendRealtimeInput({ audioStreamEnd: true })
      return
    }

    for (const chunk of message.realtimeInput?.mediaChunks ?? []) {
      if (!chunk.data || !chunk.mimeType) continue
      this.session.sendRealtimeInput({
        media: {
          data: chunk.data,
          mimeType: chunk.mimeType,
        },
      })
    }
  }

  close() {
    this.session.close()
  }
}

export async function createGeminiSession(systemPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY env not set")
  const bus = new EventEmitter()

  const session = await ai.live.connect({
    model: "gemini-2.5-flash-native-audio-preview-12-2025",
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction: systemPrompt,
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      realtimeInputConfig: {
        automaticActivityDetection: {
          silenceDurationMs: 30_000,
        },
      },
    },
    callbacks: {
      onmessage: (message) => {
        const json = JSON.stringify(message)
        // Log first message content summary
        if (message.serverContent?.modelTurn?.parts) {
          const hasAudio = message.serverContent.modelTurn.parts.some(
            (p) => "inlineData" in p
          )
          const hasText = message.serverContent.modelTurn.parts.some(
            (p) => "text" in p
          )
          console.log(
            `[gemini SDK] serverContent turnComplete=${!!message.serverContent.turnComplete} audio=${hasAudio} text=${hasText}`
          )
        } else if (message.serverContent?.turnComplete) {
          console.log("[gemini SDK] turnComplete (no parts)")
        } else {
          console.log("[gemini SDK] message:", JSON.stringify(message).slice(0, 200))
        }
        bus.emit("message", Buffer.from(json))
      },
      onerror: (event) => {
        const detail =
          typeof event.error === "object"
            ? JSON.stringify(event.error).slice(0, 300)
            : String(event.error)
        console.error("[gemini SDK] error:", detail)
        const error =
          event.error instanceof Error
            ? event.error
            : new Error(`Gemini Live API error: ${detail}`)
        bus.emit("error", error)
      },
      onclose: (event) => {
        console.log(`[gemini SDK] closed code=${event.code} reason="${event.reason}"`)
        bus.emit("close")
      },
    },
  })

  return new GeminiSessionAdapter(session, bus)
}
