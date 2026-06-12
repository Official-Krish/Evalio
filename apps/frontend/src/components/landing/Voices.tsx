import { motion } from "motion/react"
import { useInViewOnce } from "./hooks"

const quotes = [
  {
    text: "It asked about a project I'd buried on page two of my résumé. That alone was worth it.",
    meta: "PM · Series B",
    initials: "PM",
  },
  {
    text: "The feedback on my system design answer was more specific than any mock interview I've paid for.",
    meta: "Senior SWE",
    initials: "SW",
  },
  {
    text: "I stopped rambling after the second session. The pacing notes are eerily accurate.",
    meta: "New grad · FAANG offer",
    initials: "NG",
  },
]

export function Voices() {
  const { ref, visible } = useInViewOnce<HTMLElement>(0.15)

  return (
    <section ref={ref} className="landing-container py-[12vh] overflow-hidden border-b">
      <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--landing-fg-faint)] mb-12">
        From the room
      </p>

      <div className="flex flex-col gap-[6vh]">
        {quotes.map((q, i) => (
          <motion.figure
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className={`
              max-w-[520px]
              ${i === 1 ? "lg:ml-[18%]" : ""}
              ${i === 2 ? "lg:ml-[36%]" : ""}
            `}
          >
            <blockquote className="landing-serif text-[clamp(1.25rem,2.5vw,1.75rem)] leading-[1.35] text-[var(--landing-fg)]">
              "{q.text}"
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-2.5">
              <span className="landing-avatar" aria-hidden>
                {q.initials}
              </span>
              <span className="text-[11px] tracking-[0.12em] uppercase text-[var(--landing-fg-faint)]">
                {q.meta}
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
