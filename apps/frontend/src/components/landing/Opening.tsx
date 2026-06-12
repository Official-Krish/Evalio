import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { SonarRings } from "./svg/SonarRings"
import { InterviewSystem } from "./InterviewSystem"

const PUNCH_LINES = [
  "Uploads your résumé.",
  "Challenges your assumptions.",
  "Finds the weak answers.",
]

export function Opening() {
  return (
    <section className="landing-hero relative flex flex-col justify-center overflow-hidden pb-[6vh]">
      <SonarRings className="absolute top-[12%] left-[58%] -translate-x-1/2 opacity-60" />

      <div className="landing-hero-grid">
        {/* Copy — 65% */}
        <div className="relative z-10 landing-hero-copy">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase text-[var(--landing-fg-faint)] mb-6 lg:mb-10"
          >
            <span className="landing-pulse-dot" />
            Session initialized
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="landing-hero-headline"
          >
            <span className="landing-hero-lead block">You're already</span>
            <span className="landing-hero-drama landing-serif italic block">
              being
              <br />
              interviewed.
            </span>
          </motion.h1>

          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="landing-punch-lines mt-8 lg:mt-10"
          >
            {PUNCH_LINES.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
              >
                {line}
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 lg:mt-12 flex items-center gap-6"
          >
            <Link to="/signup" className="landing-cta-primary landing-cta-sharp">
              Start interview
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <span className="text-[12px] text-[var(--landing-fg-faint)]">No card · 12 min avg</span>
          </motion.div>
        </div>

        {/* Interview system — 35%, bleeds offscreen */}
        <div className="landing-hero-stage">
          <InterviewSystem />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--landing-fg-faint)]"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden>
          <rect x="4.5" y="2" width="3" height="6" rx="1.5" fill="currentColor" opacity="0.4">
            <animate attributeName="y" values="2;6;2" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="1" y="1" width="10" height="18" rx="5" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
        </svg>
      </motion.div>
    </section>
  )
}
