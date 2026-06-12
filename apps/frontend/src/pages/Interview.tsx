import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "../lib/auth"
import { useMicrophone } from "../hooks/useMicrophone"
import { useAudioPlayer } from "../hooks/useAudioPlayer"
import { InterviewSocket } from "../lib/ws"
import { api } from "../lib/api"
import { Ambient } from "@/components/landing/Ambient"
import { PresenceOrb } from "@/components/interview/PresenceOrb"
import { SessionControls } from "@/components/interview/SessionControls"
import { SessionHeader } from "@/components/interview/SessionHeader"
import { LiveCaption } from "@/components/interview/LiveCaption"
import { InterviewConnecting } from "@/components/interview/InterviewConnecting"
import toast from "react-hot-toast"

type Phase = "connecting" | "ready" | "ai_speaking" | "user_speaking" | "ended"

export function InterviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: session } = useSession()
  const user = session?.user

  const { data: interviewData } = useQuery({
    queryKey: ["interview-meta", id],
    queryFn: () => api.getInterview(id!),
    enabled: !!id,
  })
  const position = interviewData?.interview?.position ?? null

  const { start: startMic, stop: stopMic, isRecording: micActive, analyserRef: userAnalyserRef } =
    useMicrophone()
  const { playPcm, stop: stopAudio, isPlaying: aiPlaying, analyserRef: aiAnalyserRef } =
    useAudioPlayer()
  const socketRef = useRef<InterviewSocket | null>(null)
  const endedRef = useRef(false)

  const [isConnecting, setIsConnecting] = useState(true)
  const [isEnding, setIsEnding] = useState(false)
  const [aiTurnActive, setAiTurnActive] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string; id: string }>
  >([])

  const phase = useMemo((): Phase => {
    if (endedRef.current || isEnding) return "ended"
    if (isConnecting) return "connecting"
    if (aiPlaying || aiTurnActive) return "ai_speaking"
    if (micActive) return "user_speaking"
    return "ready"
  }, [isEnding, isConnecting, aiPlaying, aiTurnActive, micActive])

  const aiSpeakingRef = useRef(false)
  const phaseRef = useRef(phase)
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useEffect(() => {
    aiSpeakingRef.current = aiPlaying
    if (!aiPlaying && !endedRef.current && !micActive) {
      setAiTurnActive(false)
    }
  }, [aiPlaying, micActive])

  useEffect(() => {
    document.documentElement.classList.add("landing-active")
    return () => document.documentElement.classList.remove("landing-active")
  }, [])

  const teardown = useCallback(() => {
    endedRef.current = true
    setAiTurnActive(false)
    stopMic()
    stopAudio()
    socketRef.current?.end()
    socketRef.current = null
  }, [stopMic, stopAudio])

  useEffect(() => {
    return () => teardown()
  }, [teardown])

  const connectSocket = useCallback(async () => {
    if (!user || !id || endedRef.current) return

    const socket = new InterviewSocket(user.id)
    socketRef.current = socket

    socket.on("ready", () => {
      if (endedRef.current) return
      setIsConnecting(false)
      setAiTurnActive(true)
    })

    socket.on("transcript:assistant", () => {
      if (endedRef.current) return
      aiSpeakingRef.current = true
      setAiTurnActive(true)
    })

    socket.on("transcript:user", () => {
      if (endedRef.current) return
      setAiTurnActive(false)
    })

    socket.on("message", (raw: unknown) => {
      if (endedRef.current) return

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
      const modelTurn = sc.modelTurn as Record<string, unknown> | undefined
      const parts = (modelTurn?.parts as Array<Record<string, unknown>> | undefined) ?? []

      let audioBase64: string | null = null
      for (const part of parts) {
        const inlineData = part.inlineData as Record<string, unknown> | undefined
        if (inlineData && (inlineData.mimeType as string)?.includes("audio")) {
          audioBase64 = inlineData.data as string
        }
      }

      if (audioBase64 && !endedRef.current) {
        aiSpeakingRef.current = true
        playPcm(audioBase64)
        setAiTurnActive(true)
      }

      if (turnComplete && outputText) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: outputText, id: `ai-${Date.now()}` },
        ])
        if (!audioBase64 && !aiSpeakingRef.current) {
          setAiTurnActive(false)
        }
      }

      if (turnComplete && inputText && !outputText) {
        setMessages((prev) => [
          ...prev,
          { role: "user", text: inputText, id: `user-${Date.now()}` },
        ])
        setAiTurnActive(true)
      }
    })

    socket.on("error", (err: unknown) => {
      if (endedRef.current) return
      const msg = (err as Record<string, unknown>)?.error as string | undefined
      setError(msg || "Connection failed")
    })

    socket.on("close", () => {
      if (!endedRef.current && phaseRef.current !== "ended") {
        teardown()
      }
    })

    await socket.connect(id)
  }, [user, id, playPcm, teardown])

  useEffect(() => {
    connectSocket().catch((err: Error) => {
      if (!endedRef.current) setError(err.message)
    })
  }, [connectSocket])

  useEffect(() => {
    if (phase === "ended" || phase === "connecting") return
    const interval = setInterval(() => setDuration((d) => d + 1), 1000)
    return () => clearInterval(interval)
  }, [phase])

  const handleEnd = useCallback(() => {
    if (endedRef.current || isEnding) return
    setIsEnding(true)
    teardown()
    navigate(`/results/${id}`, { replace: true })
  }, [id, isEnding, navigate, teardown])

  const handleMicToggle = async () => {
    if (endedRef.current || isEnding) return

    if (micActive) {
      stopMic()
      socketRef.current?.sendAudioStreamEnd()
      return
    }

    if (aiSpeakingRef.current || aiPlaying) {
      toast.error("Wait for the interviewer to finish")
      return
    }

    try {
      await startMic((base64) => {
        if (!endedRef.current) {
          socketRef.current?.sendAudio(base64)
        }
      })
    } catch {
      toast.error("Microphone access denied")
    }
  }

  const activeSide = phase === "ai_speaking" ? "ai" : "user"
  const activeAnalyser = activeSide === "ai" ? aiAnalyserRef : userAnalyserRef

  if (error) {
    return (
      <div className="interview-room flex flex-col items-center justify-center min-h-[100dvh] gap-6 px-6">
        <p className="text-[14px] text-[var(--landing-fg-muted)] text-center max-w-sm">{error}</p>
        <button type="button" onClick={() => navigate("/dashboard")} className="landing-cta-primary landing-cta-sharp text-[13px]">
          Back to dashboard
        </button>
      </div>
    )
  }

  if (phase === "connecting") {
    return <InterviewConnecting />
  }

  return (
    <div className="interview-room landing-page min-h-[100dvh] flex flex-col relative overflow-hidden">
      <Ambient />

      <div className="relative z-10 flex flex-col min-h-[100dvh]">
        <div className="landing-container pt-6">
          <SessionHeader position={position} duration={duration} phase={phase} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
          <div className="interview-orb-stage">
            <PresenceOrb analyserRef={activeAnalyser} phase={phase} side={activeSide} />
          </div>

          <p className="interview-phase-label">
            {phase === "ai_speaking" && "Listening to interviewer"}
            {phase === "user_speaking" && "You're speaking"}
            {phase === "ready" && "Tap the mic when you're ready to answer"}
            {phase === "ended" && "Session ended"}
          </p>
        </div>

        <div className="landing-container pb-4">
          <LiveCaption messages={messages} phase={phase} />
        </div>

        <div className="landing-container pb-10 pt-2">
          <SessionControls
            micActive={micActive}
            phase={phase}
            onMicToggle={handleMicToggle}
            onEnd={handleEnd}
            ending={isEnding}
          />
        </div>
      </div>
    </div>
  )
}
