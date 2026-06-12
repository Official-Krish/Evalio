type SessionPhase = "connecting" | "ready" | "ai_speaking" | "user_speaking" | "ended"

interface SessionHeaderProps {
  position: string | null
  duration: number
  phase: SessionPhase
  timeLimit: number | null
  remainingMs: number | null
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function formatMs(ms: number) {
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

const PHASE_LABEL: Record<SessionPhase, string> = {
  connecting: "Connecting",
  ready: "Your turn",
  ai_speaking: "Interviewer",
  user_speaking: "You're live",
  ended: "Ended",
}

export function SessionHeader({ position, duration, phase, timeLimit, remainingMs }: SessionHeaderProps) {
  return (
    <header className="interview-session-header">
      <div className="flex items-center gap-2">
        <span
          className={`interview-status-dot ${phase === "ai_speaking" || phase === "user_speaking" ? "interview-status-dot-active" : ""}`}
          aria-hidden
        />
        <span className="text-[11px] tracking-[0.14em] uppercase text-[var(--landing-fg-faint)]">
          {PHASE_LABEL[phase]}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <span
          className={`text-[12px] tabular-nums font-mono ${remainingMs !== null && remainingMs < 120_000 ? "text-[var(--landing-accent)]" : "text-[var(--landing-fg-muted)]"}`}
        >
          {timeLimit
            ? `${formatMs(remainingMs ?? 0)} / ${formatMs(timeLimit)}`
            : formatDuration(duration)}
        </span>
        {position && (
          <span className="text-[11px] tracking-[0.06em] text-[var(--landing-fg-muted)] border border-[var(--landing-line)] px-2.5 py-1">
            {position}
          </span>
        )}
      </div>
    </header>
  )
}
