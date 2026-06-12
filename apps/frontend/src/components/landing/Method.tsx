import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { useRef, useState, useEffect } from "react"
import { useInViewOnce } from "./hooks"

const steps = [
  {
    num: "01",
    title: "Context",
    desc: "Upload your résumé. Questions adapt to your actual experience — not generic LeetCode prompts.",
  },
  {
    num: "02",
    title: "Conversation",
    desc: "A voice session that follows up, pushes back, and probes the way senior interviewers do.",
  },
  {
    num: "03",
    title: "Precision",
    desc: "A scored breakdown: what landed, what didn't, and exactly how to fix it before the real call.",
  },
]

export function Method() {
  const sectionRef = useRef<HTMLElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const { ref: headerRef, visible } = useInViewOnce<HTMLDivElement>(0.2)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.65", "end 0.35"],
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })
  const dotTop = useTransform(smoothProgress, (p) => `calc(${p * 100}% - 4px)`)

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    stepRefs.current.forEach((el, i) => {
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry && entry.isIntersecting) setActiveIndex(i)
        },
        { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [visible])

  return (
    <section ref={sectionRef} className="landing-container relative py-[16vh] border-b">
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 16 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="mb-16 max-w-lg"
      >
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--landing-fg-faint)] mb-6">
          Three movements
        </p>
        <h2 className="landing-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.1] tracking-[-0.02em] text-[var(--landing-fg)]">
          Résumé in.{" "}
          <span className="landing-serif italic text-[var(--landing-fg-muted)]">Session out.</span>
        </h2>
      </motion.div>

      <div className="flex gap-10 lg:gap-14">
        <div ref={railRef} className="hidden sm:block relative w-6 shrink-0 self-stretch min-h-[320px]">
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[var(--landing-line)]" />
          {steps.map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--landing-line)]"
              style={{ top: `${(i / (steps.length - 1)) * 100}%` }}
            />
          ))}
          <motion.div className="landing-method-dot" style={{ top: dotTop }} />
        </div>

        <div className="flex-1 space-y-[12vh]">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              ref={(el) => {
                stepRefs.current[i] = el
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`landing-method-step ${activeIndex === i ? "landing-method-step-active" : ""}`}
            >
              <span className="block text-[11px] tracking-[0.14em] text-[var(--landing-fg-faint)] mb-4 tabular-nums">
                {step.num}
              </span>
              <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-medium tracking-tight text-[var(--landing-fg)] mb-3">
                {step.title}
              </h3>
              <p className="text-[14px] leading-[1.75] text-[var(--landing-fg-muted)] max-w-md">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
