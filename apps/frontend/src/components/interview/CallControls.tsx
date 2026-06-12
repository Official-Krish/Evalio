import { motion, AnimatePresence } from "motion/react"
import { IconMicrophone, IconMicrophoneOff, IconCircleFilled, IconPhoneX } from "@tabler/icons-react"

interface CallControlsProps {
  isRecording: boolean
  phase: "connecting" | "ready" | "ai_speaking" | "user_speaking" | "ended"
  onMicToggle: () => void
  onEnd: () => void
}

export function CallControls({ isRecording, phase, onMicToggle, onEnd }: CallControlsProps) {
  const micDisabled = phase === "ai_speaking" || phase === "connecting" || phase === "ended"

  return (
    <div className="flex items-center justify-center gap-8">
      <motion.button
        onClick={onEnd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative size-12 rounded-full bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] transition-colors"
        aria-label="End interview"
      >
        <IconPhoneX size={18} />
      </motion.button>

      <AnimatePresence mode="wait">
        <motion.div
          key={isRecording ? "recording" : "idle"}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <button
            onClick={onMicToggle}
            disabled={micDisabled}
            className="relative size-16 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: isRecording
                ? "linear-gradient(135deg, #7C3AED, #A78BFA)"
                : "var(--color-bg-card)",
              border: isRecording
                ? "2px solid rgba(124,58,237,0.5)"
                : "2px solid var(--color-border)",
              boxShadow: isRecording
                ? "0 0 30px rgba(124,58,237,0.3), inset 0 0 20px rgba(124,58,237,0.1)"
                : "none",
            }}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <IconMicrophoneOff size={22} color="white" />
            ) : (
              <IconMicrophone size={22} color="var(--color-text)" />
            )}
            {isRecording && (
              <span className="absolute -top-0.5 -right-0.5 size-3">
                <span className="absolute inset-0 rounded-full bg-[#EF4444] animate-ping opacity-75" />
                <span className="absolute inset-0 rounded-full bg-[#EF4444]" />
              </span>
            )}
          </button>
        </motion.div>
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative size-12 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        aria-label="Mute"
        style={{ opacity: 0.5 }}
      >
        <IconCircleFilled size={18} />
      </motion.button>
    </div>
  )
}
