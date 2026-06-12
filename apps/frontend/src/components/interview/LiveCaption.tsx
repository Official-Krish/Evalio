import { motion, AnimatePresence } from "motion/react"

interface CaptionMessage {
  role: "user" | "assistant"
  text: string
  id: string
}

interface LiveCaptionProps {
  messages: CaptionMessage[]
  phase: "connecting" | "ready" | "ai_speaking" | "user_speaking" | "ended"
}

export function LiveCaption({ messages, phase }: LiveCaptionProps) {
  const latest = messages[messages.length - 1]
  const previous = messages.length > 1 ? messages[messages.length - 2] : null

  return (
    <div className="interview-caption" aria-live="polite">
      <AnimatePresence mode="wait">
        {latest ? (
          <motion.div
            key={latest.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="interview-caption-current"
          >
            <span className="interview-caption-role">
              {latest.role === "assistant" ? "Interviewer" : "You"}
            </span>
            <p className="interview-caption-text">{latest.text}</p>
          </motion.div>
        ) : (
          <motion.p
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="interview-caption-waiting"
          >
            {phase === "ai_speaking" ? "Interviewer is speaking…" : "Session opening…"}
          </motion.p>
        )}
      </AnimatePresence>

      {previous && (
        <p className="interview-caption-previous">
          <span className="opacity-50">{previous.role === "assistant" ? "Interviewer" : "You"}:</span>{" "}
          {previous.text.length > 90 ? `${previous.text.slice(0, 90)}…` : previous.text}
        </p>
      )}
    </div>
  )
}
