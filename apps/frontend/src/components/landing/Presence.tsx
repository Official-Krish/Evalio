import { motion } from "motion/react"
import { useInViewOnce } from "./hooks"

const moments = [
  {
    offset: "lg:translate-x-0",
    label: "00:14",
    text: "Your answer drifted from the STAR structure at the impact step.",
    align: "left",
    live: false,
  },
  {
    offset: "lg:translate-x-16 lg:-mt-6",
    label: "02:31",
    text: "Strong technical depth. Pause before the conclusion — interviewers notice the rush.",
    align: "right",
    live: true,
  },
  {
    offset: "lg:-translate-x-8 lg:mt-4",
    label: "05:08",
    text: "Clarifying question handled well. Confidence up 18% from session one.",
    align: "left",
    live: false,
  },
]

export function Presence() {
  const { ref, visible } = useInViewOnce<HTMLElement>(0.15)

  return (
    <section ref={ref} className="landing-container relative py-[14vh] border-b">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div className="lg:sticky lg:top-32">
          <motion.p
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="text-[11px] tracking-[0.2em] uppercase text-[var(--landing-fg-faint)] mb-6"
          >
            While you speak
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="landing-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.03em] text-[var(--landing-fg)] max-w-md"
          >
            Feedback that arrives{" "}
            <span className="landing-serif italic text-[var(--landing-fg-muted)]">in the moment</span>
            , not three days later.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 text-[14px] leading-[1.75] text-[var(--landing-fg-muted)] max-w-sm"
          >
            The way a senior interviewer thinks, surfaced as you talk.
          </motion.p>
        </div>

        <div className="relative min-h-[420px]">
          {moments.map((m, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 28 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={`
                landing-moment group relative mb-6 last:mb-0
                ${m.live ? "landing-moment-live" : ""}
                ${m.offset}
                ${m.align === "right" ? "lg:ml-auto lg:max-w-[340px]" : "lg:max-w-[360px]"}
              `}
            >
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <span className="text-[10px] tracking-[0.16em] uppercase text-[var(--landing-accent)] tabular-nums">
                  {m.label}
                </span>
                {m.live ? (
                  <span className="flex items-center gap-1.5 text-[10px] text-[var(--landing-fg-faint)]">
                    <span className="landing-live-indicator" aria-hidden />
                    Live
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--landing-fg-faint)] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Replay
                  </span>
                )}
              </div>
              <p className="text-[14px] leading-[1.65] text-[var(--landing-fg)]">
                {m.text}
                {m.live && <span className="landing-blink-cursor" aria-hidden />}
              </p>
              {m.live && (
                <div className="landing-live-progress mt-4" aria-hidden>
                  <span className="landing-live-progress-bar" />
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
