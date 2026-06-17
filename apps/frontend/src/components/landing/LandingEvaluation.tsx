import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { useInViewOnce } from "./hooks";
import { TerrainMap } from "./svg/TerrainMap";

const dimensions = [
  {
    label: "Communication",
    short: "How you structure answers",
    story:
      "Did your story have a beginning, tension, and resolution — or did it wander?",
  },
  {
    label: "Product Thinking",
    short: "Code connected to outcomes",
    story:
      "Can you explain why this feature matters to a user, not just how you'd build it?",
  },
  {
    label: "Technical Depth",
    short: "How deep expertise runs",
    story: "When they push past the surface, do you have another layer ready?",
  },
  {
    label: "Leadership Signals",
    short: "Ambiguity and ownership",
    story:
      "Do you wait for direction, or do you frame the problem and propose a path?",
  },
  {
    label: "Cultural Alignment",
    short: "Fit with team rhythm",
    story: "Would this team want to work with you on a hard Tuesday afternoon?",
  },
  {
    label: "Growth Potential",
    short: "Learning from feedback",
    story:
      "When corrected mid-session, did you adapt — or repeat the same mistake?",
  },
];

export function LandingEvaluation() {
  const sectionRef = useRef<HTMLElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { ref: headerRef, visible } = useInViewOnce<HTMLElement>(0.1);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    beatRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setActiveIndex(i);
        },
        { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [visible]);

  return (
    <section
      ref={sectionRef}
      className="landing-container relative py-[16vh] border-b"
    >
      <motion.div
        ref={headerRef as React.Ref<HTMLDivElement>}
        initial={{ opacity: 0, y: 16 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="mb-12 max-w-xl"
      >
        <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[var(--landing-fg-faint)] mb-8">
          <span className="w-8 h-px bg-[var(--landing-line)]" aria-hidden />
          Chapter V · The reflection
        </span>
        <h2 className="landing-display text-[clamp(1.85rem,3.8vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-[var(--landing-fg)]">
          Not a score.{" "}
          <span className="landing-serif italic text-[var(--landing-fg-muted)]">
            A landscape.
          </span>
        </h2>
        <p className="mt-5 text-[14px] leading-[1.8] text-[var(--landing-fg-muted)]">
          Pass/fail tells you nothing useful. Six peaks show where you stood
          tall, where you dipped, and exactly what to climb next.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-10 lg:gap-14 items-start">
        <div className="lg:sticky lg:top-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.15 }}
            className="relative"
            style={{
              filter: "drop-shadow(0 20px 48px rgba(184,168,138,0.12))",
            }}
          >
            <TerrainMap
              activeIndex={activeIndex}
              drawProgress={visible ? 1 : 0}
              className="w-full h-auto"
            />
          </motion.div>

          <motion.p
            className="mt-4 text-[11px] text-[var(--landing-fg-faint)] italic text-center lg:text-left"
            animate={{ opacity: activeIndex >= 0 ? 0.7 : 0 }}
          >
            Peaks rise where you showed strength · valleys mark where to grow
          </motion.p>
        </div>

        <div className="relative space-y-[8vh] lg:space-y-[10vh]">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--landing-line)] to-transparent hidden sm:block" />

          {dimensions.map((d, i) => {
            const isActive = activeIndex === i;
            return (
              <motion.div
                key={d.label}
                ref={(el) => {
                  beatRefs.current[i] = el;
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={visible ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.7,
                  delay: 0.12 + i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative pl-0 sm:pl-10"
              >
                <motion.span
                  className="absolute left-2 top-2 hidden sm:block w-2 h-2 rounded-full"
                  animate={{
                    scale: isActive ? 1.4 : 1,
                    backgroundColor: isActive
                      ? "var(--landing-accent)"
                      : "var(--landing-line)",
                    boxShadow: isActive
                      ? "0 0 16px rgba(184,168,138,0.4)"
                      : "0 0 0 transparent",
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                />

                <div
                  className="transition-all duration-500"
                  style={{
                    opacity: isActive ? 1 : 0.4,
                    transform: isActive ? "translateX(0)" : "translateX(4px)",
                  }}
                >
                  <p className="text-[10px] tracking-[0.14em] uppercase text-[var(--landing-accent)] mb-1.5">
                    {d.label}
                  </p>
                  <p className="landing-display text-[15px] text-[var(--landing-fg)] mb-2 tracking-tight">
                    {d.short}
                  </p>
                  <p className="text-[13px] leading-[1.7] text-[var(--landing-fg-muted)] max-w-md">
                    {d.story}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
