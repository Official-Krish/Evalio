import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { useSession } from "../lib/auth"
import { useMicrophone } from "../hooks/useMicrophone"
import { useAudioPlayer } from "../hooks/useAudioPlayer"
import { InterviewSocket } from "../lib/ws"
import { Transcript } from "../components/interview/Transcript"
import { VoiceVisualizer } from "../components/interview/VoiceVisualizer"
import { Button } from "../components/ui/Button"
import toast from "react-hot-toast"

type Phase = "connecting" | "ready" | "ai_speaking" | "user_speaking" | "ended"

export function InterviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: session } = useSession()
  const user = session?.user
  const {
    start: startMic,
    stop: stopMic,
    isRecording,
    analyserRef: userAnalyserRef,
  } = useMicrophone()
  const { playPcm, isPlaying: aiPlaying, analyserRef: aiAnalyserRef } = useAudioPlayer()
  const socketRef = useRef<InterviewSocket | null>(null)
  const [hasEnded, setHasEnded] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [aiTurnActive, setAiTurnActive] = useState(false)
  const phase = useMemo((): Phase => {
    if (hasEnded) return "ended"
    if (isConnecting) return "connecting"
    if (aiPlaying || aiTurnActive) return "ai_speaking"
    if (isRecording) return "user_speaking"
    return "ready"
  }, [hasEnded, isConnecting, aiPlaying, aiTurnActive, isRecording])
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string; id: string }>
  >([])
  const [error, setError] = useState<string | null>(null)
  const aiSpeakingRef = useRef(false)
  const phaseRef = useRef(phase)
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    aiSpeakingRef.current = aiPlaying
  }, [aiPlaying])

  const cleanup = useCallback(() => {
    stopMic()
    socketRef.current?.end()
    socketRef.current = null
  }, [stopMic])

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  const connectSocket = useCallback(async () => {
    if (!user || !id) return
    const socket = new InterviewSocket(user.id)
    socketRef.current = socket

    socket.on("ready", () => {
      setIsConnecting(false)
      setAiTurnActive(true)
    })

    socket.on("transcript:assistant", () => {
      aiSpeakingRef.current = true
      setAiTurnActive(true)
    })

    socket.on("transcript:user", () => {
      setAiTurnActive(false)
    })

    socket.on("message", (raw: unknown) => {
      const data = raw as Record<string, unknown>
      const sc = data?.serverContent as Record<string, unknown> | undefined
      if (!sc) return

      const inputText = (
        sc.inputTranscription as Record<string, unknown> | undefined
      )?.text as string | undefined
      const outputText = (
        sc.outputTranscription as Record<string, unknown> | undefined
      )?.text as string | undefined
      const turnComplete = sc.turnComplete === true
      const modelTurn = sc.modelTurn as
        | Record<string, unknown>
        | undefined

      const parts = (modelTurn?.parts as Array<Record<string, unknown>> | undefined) ?? []

      let audioBase64: string | null = null
      for (const part of parts) {
        const inlineData = part.inlineData as
          | Record<string, unknown>
          | undefined
        if (
          inlineData &&
          (inlineData.mimeType as string)?.includes("audio")
        ) {
          audioBase64 = inlineData.data as string
        }
      }

      if (audioBase64) {
        aiSpeakingRef.current = true
        playPcm(audioBase64)
        setAiTurnActive(true)
      }

      if (turnComplete && outputText) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: outputText,
            id: `ai-${Date.now()}`,
          },
        ])
        if (!audioBase64 && !aiSpeakingRef.current) {
          setAiTurnActive(false)
        }
      }

      if (turnComplete && inputText && !outputText) {
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            text: inputText,
            id: `user-${Date.now()}`,
          },
        ])
        setAiTurnActive(true)
      }
    })

    socket.on("error", (err: unknown) => {
      const msg = (err as Record<string, unknown>)?.error as string | undefined
      setError(msg || "Connection failed")
    })

    socket.on("close", () => {
      if (phaseRef.current !== "ended") cleanup()
    })

    await socket.connect(id)
  }, [user, id, cleanup, playPcm])

  useEffect(() => {
    connectSocket().catch((err: Error) => setError(err.message))
  }, [connectSocket])

  const handleEnd = () => {
    phaseRef.current = "ended"
    setHasEnded(true)
    socketRef.current?.end()
    cleanup()
    navigate(`/results/${id}`)
  }

  const handleMicToggle = async () => {
    if (isRecording) {
      stopMic()
      socketRef.current?.sendAudioStreamEnd()
      return
    }
    if (aiSpeakingRef.current) {
      toast.error("Please wait for the AI to finish speaking")
      return
    }
    try {
      await startMic((base64) => {
        socketRef.current?.sendAudio(base64)
      })
    } catch {
      toast.error("Microphone access denied")
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="size-16 rounded-full bg-danger/10 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-danger)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-[var(--color-text-secondary)]">{error}</p>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    )
  }

  if (phase === "connecting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center">
          <svg className="animate-spin size-8" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="var(--color-accent)"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="var(--color-accent)"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
        <p className="text-[var(--color-text-secondary)]">
          Connecting to interview...
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-h-[800px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`size-2.5 rounded-full transition-colors duration-300 ${
              phase === "ai_speaking"
                ? "bg-success animate-pulse"
                : phase === "user_speaking"
                  ? "bg-accent animate-pulse"
                  : "bg-[var(--color-text-muted)]"
            }`}
          />
          <span className="text-sm text-[var(--color-text-secondary)]">
            {phase === "ai_speaking" && "AI is speaking..."}
            {phase === "user_speaking" && "Listening..."}
            {phase === "ready" && "Ready for your response"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <VoiceVisualizer
            analyserRef={aiAnalyserRef}
            active={phase === "ai_speaking"}
            side="ai"
          />
          <VoiceVisualizer
            analyserRef={userAnalyserRef}
            active={phase === "user_speaking"}
            side="user"
          />
        </div>
      </div>

      <div className="flex-1 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden">
        <Transcript messages={messages} isAiSpeaking={phase === "ai_speaking"} />
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <AnimatePresence mode="wait">
          {phase !== "ended" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <button
                onClick={handleMicToggle}
                disabled={phase === "ai_speaking"}
                className={`
                  relative size-14 rounded-full flex items-center justify-center transition-all
                  ${
                    isRecording
                      ? "bg-danger text-white shadow-lg shadow-danger/30"
                      : "bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-accent/30 hover:text-accent"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isRecording ? (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                )}
                {isRecording && (
                  <span className="absolute -top-1 -right-1 size-3 bg-danger rounded-full animate-pulse" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <Button variant="danger" size="sm" onClick={handleEnd}>
          End Interview
        </Button>
      </div>

      {phase === "ai_speaking" && (
        <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
          Please wait for the AI to finish speaking before responding
        </p>
      )}
    </div>
  )
}
