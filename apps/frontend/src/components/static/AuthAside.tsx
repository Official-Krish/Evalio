import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ConfidenceOrb } from "@/components/landing/svg/ConfidenceOrb"
import { WaveTrace } from "@/components/landing/svg/WaveTrace"

const LOGIN_LINES = [
  "Your last session is still warm.",
  "Pick up where the feedback left off.",
  "The room remembers your weak spots.",
]

const SIGNUP_LINES = [
  "Twelve minutes to your first real answer.",
  "No card. No scheduling. Just talk.",
  "Upload a résumé. Get challenged immediately.",
]

const STATS = [
  { value: "12m", label: "avg session" },
  { value: "3×", label: "pass rate lift" },
  { value: "Live", label: "feedback" },
]

type AuthAsideProps = {
  variant: "login" | "signup"
}

export function AuthAside({ variant }: AuthAsideProps) {
  const lines = variant === "login" ? LOGIN_LINES : SIGNUP_LINES
  const [lineIndex, setLineIndex] = useState(0)
  const [score, setScore] = useState(42)

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((i) => (i + 1) % lines.length)
      setScore((s) => (s >= 88 ? 42 : s + 14))
    }, 4200)
    return () => clearInterval(interval)
  }, [lines.length])

  return (
    <aside className="relative hidden lg:flex flex-col justify-between border-r border-[var(--landing-line)] bg-[var(--landing-surface)] px-10 py-12 overflow-hidden">
      <div className="absolute inset-0 landing-grain pointer-events-none opacity-60" />

      <div className="relative">
        <p className="text-[10px] tracking-[0.22em] uppercase text-[var(--landing-fg-faint)]">
          {variant === "login" ? "Session resume" : "First session"}
        </p>
        <h2 className="mt-5 landing-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.08] tracking-[-0.03em] text-[var(--landing-fg)] max-w-[280px]">
          {variant === "login" ? (
            <>
              Back in the{" "}
              <span className="landing-serif italic text-[var(--landing-fg-muted)]">room.</span>
            </>
          ) : (
            <>
              Your rehearsal{" "}
              <span className="landing-serif italic text-[var(--landing-fg-muted)]">starts now.</span>
            </>
          )}
        </h2>

        <div className="mt-6 h-12 relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={lines[lineIndex]}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute text-[13px] leading-[1.7] text-[var(--landing-fg-muted)] max-w-[260px]"
            >
              {lines[lineIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative flex flex-col items-center py-8">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ConfidenceOrb score={score} listening size={180} className="text-[var(--landing-fg-faint)]" />
        </motion.div>
        <p className="mt-4 text-[10px] tracking-[0.18em] uppercase text-[var(--landing-fg-faint)]">
          Clarity {score}%
        </p>
      </div>

      <div className="relative">
        <div className="flex gap-6 mb-6">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-[18px] font-light tracking-tight text-[var(--landing-fg)] tabular-nums">
                {stat.value}
              </p>
              <p className="mt-0.5 text-[10px] tracking-[0.1em] uppercase text-[var(--landing-fg-faint)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <WaveTrace className="w-full h-8 text-[var(--landing-accent)] opacity-50" />
      </div>
    </aside>
  )
}
