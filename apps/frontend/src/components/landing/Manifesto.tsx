import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"
import { useInViewOnce } from "./hooks"
import { ScanLine } from "./svg/ScanLine"

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null)
  const { ref, visible } = useInViewOnce<HTMLDivElement>(0.25)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const asideOpacity = useTransform(scrollYProgress, [0.2, 0.6], [0, 1])

  return (
    <section ref={sectionRef} className="landing-container relative py-[18vh] border-b">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-6">
        <div className="lg:col-span-2 hidden lg:flex justify-center">
          <ScanLine className="h-[280px] w-2 text-[var(--landing-fg-faint)]" progress={visible ? 0.6 : 0.1} />
        </div>

        <div ref={ref} className="lg:col-span-7 lg:col-start-4">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] tracking-[0.2em] uppercase text-[var(--landing-fg-faint)] mb-10"
          >
            The problem
          </motion.p>

          <motion.blockquote
            initial={{ opacity: 0, y: 32 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="landing-serif text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.15] tracking-[-0.02em] text-[var(--landing-fg)]"
          >
            Most candidates don't fail interviews because they lack skill.{" "}
            <span className="text-[var(--landing-fg-muted)]">
              They fail because they've never heard themselves answer under pressure.
            </span>
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-14 flex flex-col sm:flex-row gap-10 sm:gap-16"
          >
            <div className="landing-stat max-w-[200px]">
              <p className="text-[32px] font-light tracking-tight text-[var(--landing-fg)] tabular-nums">73%</p>
              <p className="mt-1 text-[12px] leading-[1.5] text-[var(--landing-fg-faint)]">
                report anxiety as their primary blocker
              </p>
            </div>
            <div className="landing-stat max-w-[200px]">
              <p className="text-[32px] font-light tracking-tight text-[var(--landing-fg)] tabular-nums">4.2×</p>
              <p className="mt-1 text-[12px] leading-[1.5] text-[var(--landing-fg-faint)]">
                more likely to pass after three sessions
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: asideOpacity }}
          className="lg:col-span-4 lg:col-start-9 flex items-end"
        >
          <p className="landing-serif text-[24px] leading-[1.35] text-[var(--landing-fg-muted)] max-w-[280px]">
            We built the rehearsal room your calendar never had.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
