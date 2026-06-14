type MessageHandler = (data: unknown) => void

export class InterviewSocket {
  private ws: WebSocket | null = null
  private handlers = new Map<string, MessageHandler[]>()
  private userId: string
  private closed = false

  constructor(userId: string) {
    this.userId = userId
  }

  connect(interviewId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const host: string =
        typeof import.meta.env !== "undefined"
          ? (import.meta.env as Record<string, string | undefined>).VITE_WS_HOST || "localhost:8080"
          : "localhost:8080"
      this.ws = new WebSocket(`${protocol}//${host}`)

      this.ws.onopen = () => {
        this.send({ type: "init", interviewId, token: this.userId })
      }

      this.ws.onmessage = (event) => {
        if (this.closed) return
        try {
          const data = JSON.parse(event.data)
          if (data.type === "ready") {
            this.emit("ready", data)
            resolve()
            return
          }
          if (data.error) {
            this.emit("error", data)
            reject(new Error(data.error))
            return
          }
          this.emit("message", data)
          if (data.serverContent?.inputTranscription) {
            this.emit("transcript:user", data.serverContent.inputTranscription)
          }
          if (data.serverContent?.outputTranscription) {
            this.emit("transcript:assistant", data.serverContent.outputTranscription)
          }
        } catch {
          this.emit("raw", event.data)
        }
      }

      this.ws.onerror = () => {
        reject(new Error("WebSocket connection failed"))
      }

      this.ws.onclose = () => {
        this.emit("close", null)
      }
    })
  }

  sendAudio(base64Pcm: string) {
    this.send({ type: "audio_chunk", data: base64Pcm })
  }

  sendAudioStreamEnd() {
    this.send({ type: "audio_stream_end" })
  }

  sendInterruptedStreamEnd() {
    this.send({ type: "audio_stream_end", interrupted: true })
  }

  sendEndInterview() {
    this.send({ type: "end_interview" })
  }

  forceClose() {
    this.closed = true
    this.handlers.clear()
    this.ws?.close()
    this.ws = null
  }

  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) this.handlers.set(event, [])
    this.handlers.get(event)!.push(handler)
    return () => {
      const handlers = this.handlers.get(event)
      if (handlers) {
        const idx = handlers.indexOf(handler)
        if (idx >= 0) handlers.splice(idx, 1)
      }
    }
  }

  private emit(event: string, data: unknown) {
    this.handlers.get(event)?.forEach((h) => h(data))
  }

  private send(data: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
}
