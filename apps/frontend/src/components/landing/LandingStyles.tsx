import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useInViewOnce } from "./hooks";
import type { InterviewStyle } from "@evalio/shared";

interface StyleInfo {
  style: InterviewStyle;
  num: string;
  name: string;
  whisper: string;
  story: string;
  intensity: number; // 0-1 visual intensity for the gradient
}

const styles: StyleInfo[] = [
  {
    style: "SUPPORTIVE",
    num: "01",
    name: "Supportive",
    whisper: "A coach, not a critic",
    story:
      "When you're building confidence, you need someone who catches you mid-fall — not someone who waits to grade the landing.",
    intensity: 0.25,
  },
  {
    style: "PROFESSIONAL",
    num: "02",
    name: "Professional",
    whisper: "Structured and fair",
    story:
      "The classic format. Clear questions, balanced depth, no surprises. The baseline most rooms expect.",
    intensity: 0.45,
  },
  {
    style: "CHALLENGING",
    num: "03",
    name: "Challenging",
    whisper: "Pushes every answer",
    story:
      "Weak reasoning gets probed. Vague claims get challenged. The room that doesn't let you off easy.",
    intensity: 0.7,
  },
  {
    style: "BAR_RAISER",
    num: "04",
    name: "Bar Raiser",
    whisper: "Holds the highest bar",
    story:
      "Amazon's infamous final gate. Edge cases under pressure. Evaluating whether you'd raise the bar for everyone.",
    intensity: 1,
  },
];

export function LandingStyles() {
  const { ref: headerRef, visible } = useInViewOnce<HTMLDivElement>(0.15);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="landing-container relative py-[16vh] border-b overflow-hidden">
      {/* Ambient background glow */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            key={activeIndex}
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] rounded-full"
              style={{
                background: `radial-gradient(ellipse, rgba(184,168,138,${0.04 + styles[activeIndex]!.intensity * 0.06}) 0%, transparent 70%)`,
                filter: "blur(80px)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 16 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg mb-16"
      >
        <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[var(--landing-fg-muted)] mb-8">
          <span className="w-8 h-px bg-[var(--landing-line)]" aria-hidden />
          Chapter IV · The voice
        </span>
        <h2 className="landing-display text-[clamp(1.85rem,3.8vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-[var(--landing-fg)]">
          Same questions.{" "}
          <span className="landing-serif italic text-[var(--landing-fg-muted)]">
            Four temperaments.
          </span>
        </h2>
        <p className="mt-5 text-[14px] leading-[1.8] text-[var(--landing-fg-muted)]">
          Real interviewers aren&apos;t interchangeable. Some guide, some grill.
          Pick the temperament you need to face — or the one that scares you
          most.
        </p>
      </motion.div>

      {/* Intensity spectrum line */}
      <div className="relative z-10 mb-14">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[9px] tracking-[0.14em] uppercase text-[var(--landing-fg-faint)]">
            gentle
          </span>
          <div className="flex-1 h-px relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--landing-line)] via-[var(--landing-accent)] to-[var(--landing-fg-muted)] opacity-40" />
            {/* Active position marker */}
            <AnimatePresence>
              {activeIndex !== null && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--landing-accent)]"
                  style={{
                    left: `${(activeIndex / (styles.length - 1)) * 100}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    left: `${(activeIndex / (styles.length - 1)) * 100}%`,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  layoutId="intensity-dot"
                >
                  <span className="absolute inset-0 rounded-full bg-[var(--landing-accent)] animate-ping opacity-30" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="text-[9px] tracking-[0.14em] uppercase text-[var(--landing-fg-faint)]">
            intense
          </span>
        </div>
      </div>

      {/* Style cards — clean, borderless, editorial feel */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
        {styles.map((s, i) => {
          const isActive = activeIndex === i;
          const isDimmed = activeIndex !== null && !isActive;

          return (
            <motion.button
              key={s.style}
              type="button"
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.1 + i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(i)}
              onBlur={() => setActiveIndex(null)}
              className="group relative text-left bg-transparent border-0 p-0 cursor-default outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)] rounded-sm transition-all duration-500"
              style={{ opacity: isDimmed ? 0.3 : 1 }}
            >
              {/* Separator line between cards */}
              {i > 0 && (
                <div className="absolute left-0 top-4 bottom-4 w-px bg-[var(--landing-line)] hidden sm:block" />
              )}

              <div className="py-6 sm:px-6 lg:px-8">
                {/* Number + intensity bar */}
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="text-[clamp(1.5rem,2.5vw,2rem)] landing-display font-light tabular-nums transition-colors duration-400"
                    style={{
                      color: isActive
                        ? "var(--landing-accent)"
                        : "var(--landing-fg-faint)",
                      opacity: isActive ? 1 : 0.4,
                    }}
                  >
                    {s.num}
                  </span>
                  <div className="flex-1 h-[2px] rounded-full overflow-hidden bg-[var(--landing-line)]">
                    <motion.div
                      className="h-full rounded-full bg-[var(--landing-accent)]"
                      initial={{ width: 0 }}
                      animate={{
                        width: isActive
                          ? `${s.intensity * 100}%`
                          : `${s.intensity * 30}%`,
                      }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      style={{ opacity: isActive ? 0.8 : 0.25 }}
                    />
                  </div>
                </div>

                {/* Name */}
                <h3
                  className="landing-display text-[clamp(1.1rem,1.8vw,1.3rem)] tracking-tight text-[var(--landing-fg)] mb-1 transition-transform duration-400"
                  style={{
                    transform: isActive ? "translateX(4px)" : "translateX(0)",
                  }}
                >
                  {s.name}
                </h3>

                {/* Whisper */}
                <p
                  className="landing-serif italic text-[13px] text-[var(--landing-accent)] mb-4 transition-opacity duration-400"
                  style={{ opacity: isActive ? 1 : 0.6 }}
                >
                  {s.whisper}
                </p>

                {/* Story — reveals on hover */}
                <AnimatePresence>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="text-[13px] leading-[1.75] text-[var(--landing-fg-muted)] overflow-hidden"
                    >
                      {s.story}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
