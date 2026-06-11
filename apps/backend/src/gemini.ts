import { WebSocket as WsWebSocket } from "ws"

export async function createGeminiSession() {
  const apiKey = process.env.GEMINI_API_KEY!
  if (!apiKey) throw new Error("GEMINI_API_KEY env not set")

  const ws = new WsWebSocket(
    `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`
  )

  await new Promise<void>((resolve, reject) => {
    ws.once("open", () => resolve())
    ws.once("error", reject)
  })

  ws.send(
    JSON.stringify({
      setup: {
        model: "models/gemini-2.5-flash-preview-native-audio-dialog",
      },
    })
  )

  return ws
}
