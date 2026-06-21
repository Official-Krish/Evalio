type SessionPhase =
  | "connecting"
  | "ready"
  | "ai_speaking"
  | "user_speaking"
  | "ended";

interface SessionHeaderProps {
  position: string | null;
  duration: number;
  phase: SessionPhase;
  timeLimit: number | null;
  remainingMs: number | null;
  companyName?: string | null;
  interviewStyle?: string | null;
  interviewDepth?: string | null;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatMs(ms: number) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const PHASE_LABEL: Record<SessionPhase, string> = {
  connecting: "Connecting",
  ready: "Your turn",
  ai_speaking: "Interviewer",
  user_speaking: "You're live",
  ended: "Ended",
};

export function SessionHeader({
  position,
  duration,
  phase,
  timeLimit,
  remainingMs,
  companyName,
  interviewStyle,
  interviewDepth,
}: SessionHeaderProps) {
  const styleLabel =
    interviewStyle === "SUPPORTIVE"
      ? "Supportive"
      : interviewStyle === "PROFESSIONAL"
        ? "Professional"
        : interviewStyle === "CHALLENGING"
          ? "Challenging"
          : interviewStyle === "BAR_RAISER"
            ? "Bar Raiser"
            : null;
  const depthLabel =
    interviewDepth === "STANDARD"
      ? "Standard"
      : interviewDepth === "PROBING"
        ? "Probing"
        : interviewDepth === "CHALLENGE"
          ? "Challenge"
          : interviewDepth === "BAR_RAISER"
            ? "Bar Raiser"
            : null;

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

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {companyName && (
            <span className="text-[10px] tracking-[0.06em] text-[var(--app-accent,#b8a88a)] border border-[rgba(184,168,138,0.3)] px-2 py-0.5 rounded">
              {companyName}
            </span>
          )}
          {styleLabel && (
            <span className="text-[10px] tracking-[0.06em] text-[#FCD34D] border border-[rgba(251,191,36,0.3)] px-2 py-0.5 rounded">
              {styleLabel}
            </span>
          )}
          {depthLabel && (
            <span className="text-[10px] tracking-[0.06em] text-[#6EE7B7] border border-[rgba(52,211,153,0.3)] px-2 py-0.5 rounded">
              {depthLabel}
            </span>
          )}
        </div>
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
  );
}
