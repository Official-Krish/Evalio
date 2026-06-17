import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useInViewOnce } from "./hooks";
import { CompanyOrbit, type CompanyDef } from "./svg/CompanyOrbit";

// 12 companies evenly distributed at 30° intervals.
//
// FIX: The original data had angle=300 for Anthropic and angle=-60 for Stripe.
// These are the same angle (300° = -60° mod 360), so Anthropic and Stripe
// would be rendered at exactly the same position. The missing slot was 270°
// (the 9-o'clock / left position). Anthropic is now correctly placed at 270°.
const companies: CompanyDef[] = [
  { name: "Stripe", listen: "Pushes on tradeoffs", angle: -60 }, // upper-left (300°)
  { name: "Google", listen: "Hunts for clean thinking", angle: -30 }, // upper-left-ish (330°)
  { name: "Amazon", listen: "Listens for ownership", angle: 0 }, // top (0°)
  { name: "Meta", listen: "Questions everything", angle: 30 }, // upper-right-ish (30°)
  { name: "Apple", listen: "Obsesses over craft", angle: 60 }, // upper-right (60°)
  { name: "Netflix", listen: "Values context", angle: 90 }, // right (90°)
  { name: "Microsoft", listen: "Growth mindset", angle: 120 }, // lower-right (120°)
  { name: "Notion", listen: "Cares about taste", angle: 150 }, // lower-right-ish (150°)
  { name: "Linear", listen: "Demands clarity", angle: 180 }, // bottom (180°)
  { name: "Figma", listen: "Thinks in systems", angle: 210 }, // lower-left-ish (210°)
  { name: "Vercel", listen: "Ships, then refines", angle: 240 }, // lower-left (240°)
  { name: "Anthropic", listen: "First principles", angle: 270 }, // left (270°) ← was 300, collided with Stripe
];

export function LandingCompanies() {
  const { ref: sectionRef, visible } = useInViewOnce<HTMLElement>(0.08);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? companies[activeIndex]! : null;

  const handleHover = useCallback((i: number | null) => setActiveIndex(i), []);

  return (
    <section
      ref={sectionRef}
      className="landing-container relative py-[16vh] border-b overflow-hidden"
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-12 lg:gap-16 items-center">
        <div className="relative z-10 max-w-md">
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[var(--landing-fg-faint)] mb-8"
          >
            <span className="w-8 h-px bg-[var(--landing-line)]" aria-hidden />
            Chapter III · The room
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.08 }}
            className="landing-display text-[clamp(1.85rem,3.8vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-[var(--landing-fg)]"
          >
            Walk into the wrong room and you&apos;re practicing the{" "}
            <span className="landing-serif italic text-[var(--landing-fg-muted)]">
              wrong conversation
            </span>
            .
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-5 text-[14px] leading-[1.8] text-[var(--landing-fg-muted)]"
          >
            Every company listens for something different. Stripe probes
            tradeoffs. Google watches how you think. Amazon hunts for ownership
            signals.
          </motion.p>

          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.name}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 pl-4 border-l-2 border-[var(--landing-accent)]"
                style={{ boxShadow: "-8px 0 24px rgba(184,168,138,0.08)" }}
              >
                <p className="text-[11px] tracking-[0.12em] uppercase text-[var(--landing-accent)] mb-1">
                  {active.name} listens for
                </p>
                <p className="landing-serif italic text-[clamp(1.1rem,2vw,1.35rem)] text-[var(--landing-fg)] leading-snug">
                  {active.listen}
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-8 text-[12px] text-[var(--landing-fg-faint)] italic"
              >
                Hover a name to hear what that room cares about
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="relative mx-auto min-w-[600px] aspect-square max-lg:hidden"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={visible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <CompanyOrbit
            activeIndex={activeIndex}
            companies={companies}
            onHover={handleHover}
            className="absolute inset-0 w-full h-full"
          />
        </motion.div>
      </div>

      {/* Mobile company list */}
      <div className="mt-14 lg:hidden">
        <div className="flex flex-col gap-3">
          {companies.map((c, i) => {
            const isActive = activeIndex === i;
            return (
              <button
                key={c.name}
                onClick={() => setActiveIndex(isActive ? null : i)}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-all duration-200"
                style={{
                  background: isActive
                    ? "var(--landing-surface-hover)"
                    : "transparent",
                }}
              >
                <span
                  className="text-[13px] font-medium shrink-0"
                  style={{
                    color: isActive
                      ? "var(--landing-accent)"
                      : "var(--landing-fg-muted)",
                    transition: "color 0.2s",
                  }}
                >
                  {c.name}
                </span>
                <span className="h-px flex-1 bg-[var(--landing-line)]" />
                <span
                  className="landing-serif italic text-[12px] truncate max-w-[180px]"
                  style={{
                    color: isActive
                      ? "var(--landing-fg)"
                      : "var(--landing-fg-faint)",
                    transition: "color 0.2s",
                  }}
                >
                  {c.listen}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
