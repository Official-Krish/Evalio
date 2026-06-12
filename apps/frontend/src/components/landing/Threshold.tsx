import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { useInViewOnce } from "./hooks"
import { useSession } from "@/lib/auth"

const questions = [
  "Tell me about yourself.",
  "Describe a project that failed.",
  "Walk me through a decision you reversed.",
  "What's something you changed your mind about?",
]

export function Threshold() {
  const { ref, visible } = useInViewOnce<HTMLElement>(0.3)
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0)
  const [qIndex, setQIndex] = useState(0)
  const { data: session } = useSession();
  const user = session?.user ?? null;

  useEffect(() => {
    if (!visible) return
    const t1 = setTimeout(() => setPhase(1), 1200)
    const t2 = setTimeout(() => setPhase(2), 4200)
    const t3 = setTimeout(() => setPhase(3), 5800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [visible])

  useEffect(() => {
    if (phase < 3) return
    const interval = setInterval(() => {
      setQIndex((i) => (i + 1) % questions.length)
    }, 5500)
    return () => clearInterval(interval)
  }, [phase])

  return (
    <section ref={ref} className="landing-container relative pt-[16vh] pb-[10vh] min-h-150">
      <div className="relative flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[11px] tracking-[0.22em] uppercase text-[var(--landing-fg-faint)] mb-8"
        >
          Ready when you are
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="landing-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] tracking-[-0.03em] text-[var(--landing-fg)]"
        >
          Enter the room.
        </motion.h2>

        <AnimatePresence>
          {phase >= 1 && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-4 text-lg text-[var(--landing-fg-muted)] font-light tracking-wide"
            >
              The interviewer is waiting.
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 2 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mt-4 text-2xl tracking-[0.3em] text-[var(--landing-fg-faint)] select-none"
              aria-label="silence"
            >
              . . .
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-6 h-7 relative">
          <AnimatePresence mode="wait">
            {phase >= 3 && (
              <motion.p
                key={questions[qIndex]}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-base text-[var(--landing-fg-subtle)] font-light italic tracking-wide"
              >
                {questions[qIndex]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-10"
        >
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--landing-fg-muted)] hover:text-[var(--landing-fg)] transition-colors border border-[var(--landing-border)] hover:border-[var(--landing-fg-faint)] rounded-lg px-5 py-2.5"
          >
            I'm ready
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3l4 4-4 4" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
