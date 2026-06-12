import { motion } from "motion/react"

type SessionPhase = "connecting" | "ready" | "ai_speaking" | "user_speaking" | "ended"

interface SessionControlsProps {
  micActive: boolean
  phase: SessionPhase
  onMicToggle: () => void
  onEnd: () => void
  ending?: boolean
}

export function SessionControls({
  micActive,
  phase,
  onMicToggle,
  onEnd,
  ending = false,
}: SessionControlsProps) {
  const micDisabled = phase === "ai_speaking" || phase === "connecting" || phase === "ended" || ending

  return (
    <div className="interview-controls">
      <button
        type="button"
        onClick={onEnd}
        disabled={ending}
        className="interview-control-end"
        aria-label="End session"
      >
        End session
      </button>

      <motion.button
        type="button"
        onClick={onMicToggle}
        disabled={micDisabled}
        whileTap={{ scale: 0.96 }}
        className={`interview-control-mic ${micActive ? "interview-control-mic-active" : ""}`}
        aria-label={micActive ? "Mute microphone" : "Open microphone"}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          {micActive ? (
            <>
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </svg>
      </motion.button>

      <div className="interview-control-spacer" aria-hidden />
    </div>
  )
}
