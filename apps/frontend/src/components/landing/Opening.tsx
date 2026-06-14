import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { InterviewSystem } from "./InterviewSystem"
import { useSession } from "@/lib/auth"

const PUNCH_LINES = [
  "Uploads your résumé.",
  "Challenges your assumptions.",
  "Finds the weak answers.",
]

export function Opening() {
  const { data: session } = useSession();
  const user = session?.user ?? null;
  return (
    <section className="landing-hero relative flex flex-col justify-center overflow-hidden border-b">
      <div className="landing-hero-grid py-8 lg:mt-18">
        {/* Copy — 65% */}
        <div className="relative z-10 landing-hero-copy">

          {/* Early Access Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 lg:mb-8"
          >
            <span className="landing-early-access-badge">
              <span className="landing-early-access-dot" />
              <span className="landing-early-access-label">Early Access</span>
              <span className="landing-early-access-divider" />
              <span className="landing-early-access-slots">Limited spots open</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="landing-hero-headline pb-4"
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
            className="landing-punch-lines mt-10 lg:mt-12"
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
            className="mt-10 lg:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
          >
            <Link to={user ? "/dashboard" : "/signup"} className="landing-cta-primary landing-cta-sharp">
              {user ? "Go to dashboard" : "Request early access"}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="flex flex-col gap-1">
              <span className="landing-early-access-note">No credit card required</span>
              <span className="landing-early-access-note">Free during early access · 3 sessions/week</span>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="landing-avatars-stack">
              {["AR", "KL", "MV", "JT", "SP"].map((initials, i) => (
                <span
                  key={initials}
                  className="landing-avatar"
                  style={{ marginLeft: i === 0 ? 0 : "-8px", zIndex: 5 - i }}
                >
                  {initials}
                </span>
              ))}
            </div>
            <span className="landing-social-proof">
              <strong style={{ color: "var(--landing-fg)", fontWeight: 500 }}>240+</strong> candidates already practicing
            </span>
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
