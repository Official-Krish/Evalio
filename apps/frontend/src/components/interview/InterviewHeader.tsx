import { motion } from "motion/react"
import { IconClock, IconUserCircle } from "@tabler/icons-react"

interface InterviewHeaderProps {
  position: string | null
  duration: number
  phase: "connecting" | "ready" | "ai_speaking" | "user_speaking" | "ended"
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export function InterviewHeader({ position, duration, phase }: InterviewHeaderProps) {
  const statusColor =
    phase === "ai_speaking"
      ? "#10B981"
      : phase === "user_speaking"
        ? "#7C3AED"
        : phase === "connecting"
          ? "#F59E0B"
          : "var(--color-text-muted)"

  const statusLabel =
    phase === "ai_speaking"
      ? "AI speaking"
      : phase === "user_speaking"
        ? "Listening"
        : phase === "connecting"
          ? "Connecting"
          : phase === "ready"
            ? "Ready"
            : "Ended"

  return (
    <div className="flex items-center justify-between px-4">
      <div className="flex items-center gap-2.5">
        <motion.div
          animate={{ scale: phase === "ai_speaking" || phase === "user_speaking" ? [1, 1.3, 1] : 1 }}
          transition={{ repeat: phase === "ai_speaking" || phase === "user_speaking" ? Infinity : 0, duration: 1.5 }}
          className="size-2 rounded-full"
          style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
        />
        <span className="text-sm text-[var(--color-text-muted)] font-medium">{statusLabel}</span>
      </div>

      <div className="flex items-center gap-6">
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] font-mono tabular-nums"
        >
          <IconClock size={14} />
          {formatDuration(duration)}
        </motion.div>

        {position && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <IconUserCircle size={16} color="var(--color-text-muted)" />
            <span className="text-xs font-medium text-[var(--color-text)]">{position}</span>
          </div>
        )}
      </div>
    </div>
  )
}
