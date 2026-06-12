import { useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useProximity, useAnimatedScore } from "./hooks"

const METRICS = [
  { label: "Communication", target: 84 },
  { label: "Leadership Signals", target: 72 },
  { label: "Confidence", target: 91 },
] as const

const DETECTED = [
  { text: "Ownership", positive: true },
  { text: "Strategic Thinking", positive: true },
  { text: "Missing Metrics", positive: false },
] as const

function ScoreBar({
  label,
  target,
  observing,
}: {
  label: string
  target: number
  observing: boolean
}) {
  const value = useAnimatedScore(target, observing)

  return (
    <div className="landing-score-row">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--landing-fg-faint)]">
          {label}
        </span>
        <span className="text-[10px] tabular-nums text-[var(--landing-fg-muted)]">{value}%</span>
      </div>
      <div className="landing-score-track">
        <motion.div
          className="landing-score-fill"
          animate={{ width: `${value}%` }}
          transition={{ duration: observing ? 0.6 : 1.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

function SignalBlock({ observing }: { observing: boolean }) {
  const pauses = observing ? 3 : 2

  return (
    <div className="landing-signals">
      <div className="landing-signal-row">
        <span className="landing-signal-label">Pauses</span>
        <span className="landing-signal-value" aria-label={`${pauses} pauses`}>
          {"■".repeat(pauses)}
          {"□".repeat(5 - pauses)}
        </span>
      </div>
      <div className="landing-signal-row">
        <span className="landing-signal-label">Filler words</span>
        <span className={`landing-signal-value tabular-nums ${observing ? "landing-signal-flash" : ""}`}>
          {observing ? 3 : 2}
        </span>
      </div>
      <div className="landing-signal-row">
        <span className="landing-signal-label">Answer depth</span>
        <span className="landing-signal-value landing-signal-high">High</span>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--landing-line)]">
        <span className="text-[9px] tracking-[0.16em] uppercase text-[var(--landing-fg-faint)] block mb-2">
          Detected
        </span>
        <div className="flex flex-wrap gap-1.5">
          {DETECTED.map((tag) => (
            <span
              key={tag.text}
              className={`landing-tag ${tag.positive ? "landing-tag-pos" : "landing-tag-neg"} ${observing ? "landing-tag-active" : ""}`}
            >
              {tag.positive ? "+" : "−"} {tag.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function InterviewSystem() {
  const panelRef = useRef<HTMLDivElement>(null)
  const observing = useProximity(panelRef, 340)

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`landing-interview-system ${observing ? "landing-interview-system-observing" : ""}`}
    >
      {/* Status bar */}
      <div className="landing-interview-status">
        <AnimatePresence mode="wait">
          {observing ? (
            <motion.span
              key="observing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="landing-status-observing"
            >
              <span className="landing-pulse-dot" />
              AI observing…
            </motion.span>
          ) : (
            <motion.span
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="landing-status-analyzing"
            >
              <span className="landing-analyze-pulse" aria-hidden />
              AI analyzing…
            </motion.span>
          )}
        </AnimatePresence>
        <span className="text-[9px] tracking-[0.14em] uppercase text-[var(--landing-fg-faint)] tabular-nums">
          02:31
        </span>
      </div>

      {/* Live transcript */}
      <div className="landing-interview-transcript">
        <div className="landing-fragment landing-fragment-q">
          <span className="text-[9px] tracking-[0.14em] uppercase text-[var(--landing-fg-faint)] block mb-1.5">
            Interviewer
          </span>
          <p className="text-[13px] leading-[1.55] text-[var(--landing-fg)]">
            Walk me through a decision you reversed.
          </p>
        </div>
        <div className="landing-fragment landing-fragment-a">
          <span className="text-[9px] tracking-[0.14em] uppercase text-[var(--landing-fg-faint)] block mb-1.5">
            You
          </span>
          <p className="text-[13px] leading-[1.55] text-[var(--landing-fg)]">
            We killed a feature three weeks from launch
            <span className="landing-blink-cursor" aria-hidden />
          </p>
        </div>
      </div>

      {/* Live metrics */}
      <div className="landing-interview-metrics">
        {METRICS.map((m) => (
          <ScoreBar key={m.label} label={m.label} target={m.target} observing={observing} />
        ))}
      </div>

      {/* Signals */}
      <SignalBlock observing={observing} />

      {/* Micro activity line */}
      <div className={`landing-micro-activity ${observing ? "landing-micro-activity-hot" : ""}`} aria-hidden>
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            className="landing-micro-bar"
            style={{
              animationDelay: `${(i * 0.05) % 0.8}s`,
              animationDuration: observing ? `${0.35 + (i % 4) * 0.08}s` : `${0.6 + (i % 5) * 0.1}s`,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
