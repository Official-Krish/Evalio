import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"

interface TranscriptMessage {
  role: "user" | "assistant"
  text: string
  id: string
}

interface TranscriptProps {
  messages: TranscriptMessage[]
  isAiSpeaking: boolean
}

export function Transcript({ messages, isAiSpeaking }: TranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="shrink-0 size-8 rounded-full bg-accent/10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </div>
            )}
            <div
              className={`
                max-w-[75%] rounded-[var(--radius-lg)] px-4 py-2.5 text-sm leading-relaxed
                ${msg.role === "user"
                  ? "bg-accent text-white rounded-tr-sm"
                  : "bg-[var(--color-bg-hover)] text-[var(--color-text)] rounded-tl-sm"
                }
              `}
            >
              {msg.text}
            </div>
            {msg.role === "user" && (
              <div className="shrink-0 size-8 rounded-full bg-accent flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </motion.div>
        ))}
        {isAiSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="shrink-0 size-8 rounded-full bg-accent/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <div className="bg-[var(--color-bg-hover)] rounded-[var(--radius-lg)] rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="size-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: "0s" }} />
                <span className="size-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: "0.15s" }} />
                <span className="size-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  )
}
