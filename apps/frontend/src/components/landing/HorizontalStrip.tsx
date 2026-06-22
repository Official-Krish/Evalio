import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const EYE = [0.16, 1, 0.3, 1] as const; // easeOutExpo-ish

export type Direction = "left" | "right" | "up" | "down";

const DIR_OFFSET: Record<Direction, { x: number; y: number }> = {
  left: { x: -80, y: 0 },
  right: { x: 80, y: 0 },
  up: { x: 0, y: 60 },
  down: { x: 0, y: -60 },
};

/** True once an element scrolls into view (sticky — stays true). */
function useInViewOnce<T extends HTMLElement>(margin = "-12% 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin, seen]);
  return { ref, seen };
}

/** Reveal that flies in from a chosen direction when scrolled into view. */
function FlyIn({
  children,
  from = "up",
  delay = 0,
  className = "",
  amount = 60,
}: {
  children: ReactNode;
  from?: Direction;
  delay?: number;
  className?: string;
  amount?: number;
}) {
  const { ref, seen } = useInViewOnce<HTMLDivElement>("0px 0px -15% 0px");
  const off = DIR_OFFSET[from];
  const factor = amount / 60;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: off.x * factor, y: off.y * factor }}
      animate={seen ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: EYE }}
    >
      {children}
    </motion.div>
  );
}

const FILM_FRAMES = [
  {
    n: "01",
    title: "Set the room",
    body: "Pick company, role, seniority, and the style you want — structured, casual, or stress-test.",
  },
  {
    n: "02",
    title: "Speak naturally",
    body: "Live audio back-and-forth. The interviewer listens, follows up, and can cut you off mid-sentence.",
  },
  {
    n: "03",
    title: "Get interrupted",
    body: "The exact kind of follow-ups that catch people off guard — exactly when you'd expect them.",
  },
  {
    n: "04",
    title: "Read the debrief",
    body: "Clarity, depth, structure, signal — with the moments you won or lost the room, timestamped.",
  },
];

/** Horizontal pinned film-strip — scrubs left→right as you scroll vertically. */
export function FilmStrip() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0.05, 0.9], ["3%", "-68%"]);
  const railScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={targetRef} className="relative h-[320vh] border-b">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="landing-container mb-10 flex items-end justify-between gap-6">
          <FlyIn from="left">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[var(--landing-fg-muted)] font-medium">
              How a round unfolds
            </span>
            <h2 className="mt-3 font-medium tracking-[-0.03em] text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-[var(--landing-fg)]">
              Four moves, one{" "}
              <span className="landing-serif italic text-[var(--landing-accent)]">
                round
              </span>
            </h2>
          </FlyIn>
          <FlyIn from="right" className="hidden sm:block">
            <span className="text-[var(--landing-fg-muted)] text-xs tracking-[0.2em] uppercase">
              Scroll to pan →
            </span>
          </FlyIn>
        </div>

        <motion.div
          style={{ x }}
          className="flex gap-6 px-[max(1.25rem,calc((100vw-1180px)/2+1.25rem))]"
        >
          {FILM_FRAMES.map((f) => (
            <article
              key={f.n}
              className="group relative w-[82vw] sm:w-[440px] shrink-0 rounded-3xl border border-[var(--landing-line)] bg-[var(--landing-surface)] p-10 overflow-hidden hover:border-[var(--landing-accent-soft)] transition-colors duration-500"
            >
              <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(60%_60%_at_50%_0%,var(--landing-accent-soft),transparent)]" />
              <div className="landing-serif text-7xl text-[var(--landing-accent)] opacity-60">
                {f.n}
              </div>
              <h3 className="relative mt-6 text-2xl font-medium tracking-tight text-[var(--landing-fg)]">
                {f.title}
              </h3>
              <p className="relative mt-4 text-[var(--landing-fg-muted)] leading-relaxed">
                {f.body}
              </p>
              <span className="absolute right-8 bottom-8 text-[10px] uppercase tracking-[0.3em] text-[var(--landing-fg-muted)]">
                {f.n} / 04
              </span>
            </article>
          ))}
        </motion.div>

        {/* progress rail */}
        <div className="landing-container mt-10">
          <div className="relative h-px w-full bg-[var(--landing-line)]">
            <motion.div
              style={{ scaleX: railScaleX }}
              className="absolute left-0 top-0 h-px w-full origin-left bg-[var(--landing-accent)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
