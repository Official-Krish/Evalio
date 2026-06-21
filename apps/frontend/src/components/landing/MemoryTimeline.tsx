import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useInViewOnce } from "./hooks";

const TIMELINE = [
  {
    n: 1,
    company: "Google",
    round: "Behavioral",
    insight: "Missed metrics in every impact statement.",
    delta: -12,
    dims: [0.3, 0.4, 0.2, 0.35, 0.25],
    accent: "rgba(200,160,140,0.8)",
  },
  {
    n: 4,
    company: "Stripe",
    round: "System Design",
    insight: "Structure improving. Still rushing conclusions.",
    delta: +8,
    dims: [0.45, 0.5, 0.55, 0.4, 0.38],
    accent: "rgba(184,168,138,0.7)",
  },
  {
    n: 8,
    company: "Meta",
    round: "Technical",
    insight: "Technical depth is a strength. Communication catching up.",
    delta: +18,
    dims: [0.6, 0.55, 0.75, 0.58, 0.5],
    accent: "rgba(184,168,138,0.85)",
  },
  {
    n: 15,
    company: "Amazon",
    round: "Bar Raiser",
    insight: "Leadership signals emerging. Ownership now consistent.",
    delta: +24,
    dims: [0.72, 0.7, 0.8, 0.72, 0.68],
    accent: "rgba(160,200,160,0.75)",
  },
  {
    n: 21,
    company: "Palantir",
    round: "System Design",
    insight: "Clearer communication. Highest structure score yet.",
    delta: +31,
    dims: [0.82, 0.78, 0.85, 0.84, 0.79],
    accent: "rgba(160,200,160,0.9)",
  },
  {
    n: 37,
    company: "Airbnb",
    round: "Leadership",
    insight: "Ownership is now a strength. Identity fully shaped.",
    delta: +44,
    dims: [0.9, 0.88, 0.91, 0.92, 0.88],
    accent: "rgba(200,220,180,0.95)",
  },
];

function Sparkline({ dims, accent }: { dims: number[]; accent: string }) {
  const w = 56,
    h = 16;
  const pts = dims.map(
    (d, i) =>
      `${((i / (dims.length - 1)) * w).toFixed(1)},${(h - d * h).toFixed(1)}`,
  );
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden>
      <path
        d={`M ${pts.join(" L ")}`}
        stroke={accent}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {dims.map((d, i) => (
        <circle
          key={i}
          cx={(i / (dims.length - 1)) * w}
          cy={h - d * h}
          r="1.5"
          fill={accent}
        />
      ))}
    </svg>
  );
}

export function MemoryTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const { ref, visible } = useInViewOnce<HTMLDivElement>(0.15);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const lineScaleY = useTransform(scrollYProgress, [0.05, 0.82], [0, 1]);

  useEffect(() => {
    if (!visible) return;
    const el = nodeRefs.current.filter(Boolean) as HTMLDivElement[];
    if (el.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const best = entries.reduce<{ index: number; ratio: number } | null>(
          (acc, e) => {
            const idx = el.indexOf(e.target as HTMLDivElement);
            if (idx === -1) return acc;
            return !acc || e.intersectionRatio > acc.ratio
              ? { index: idx, ratio: e.intersectionRatio }
              : acc;
          },
          null,
        );
        if (best && best.ratio > 0) setActiveIndex(best.index);
      },
      { rootMargin: "-38% 0px -38% 0px" },
    );
    el.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [visible]);

  return (
    <section
      ref={sectionRef}
      className="landing-container relative py-[16vh] border-b"
    >
      <div
        className="absolute pointer-events-none left-0 top-1/3"
        style={{
          width: 400,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(184,168,138,0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden
      />

      {/* Header */}
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-[8vh]"
        >
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[var(--landing-fg-muted)] mb-8 block">
            <span
              className="inline-block w-8 h-px bg-[var(--landing-line)] align-middle"
              aria-hidden
            />
            Chapter II · Memory
            <span
              className="inline-block w-8 h-px bg-[var(--landing-line)] align-middle"
              aria-hidden
            />
          </span>
          <h2 className="landing-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.03em] text-[var(--landing-fg)]">
            Every interview makes{" "}
            <span className="landing-serif italic text-[var(--landing-accent)]">
              the next one smarter.
            </span>
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-5 text-[14px] leading-[1.75] text-[var(--landing-fg-muted)] max-w-lg mx-auto"
          >
            The landing doesn't reset. Your history builds context — so session
            37 knows everything sessions 1–36 revealed.
          </motion.p>
        </motion.div>
      </div>

      {/* 
        3-column grid: [left-content] [spine] [right-content]
        The spine column is exactly 1px wide — the dot is centered on it.
        This guarantees the dot always sits precisely on the line.
      */}
      <div className="max-w-2xl mx-auto">
        {/* Spine wrapper — relative so the animated fill line can be absolute inside */}
        <div
          className="relative"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1px 1fr",
          }}
        >
          {/* Spine track background */}
          <div
            className="absolute top-0 bottom-0 overflow-hidden pointer-events-none"
            style={{
              left: "calc(50% - 0.5px)",
              width: 1,
              background: "var(--landing-line)",
            }}
            aria-hidden
          >
            <motion.div
              className="w-full origin-top"
              style={{
                scaleY: lineScaleY,
                height: "100%",
                background:
                  "linear-gradient(to bottom, transparent, var(--landing-accent) 20%, var(--landing-accent))",
                opacity: 0.45,
              }}
            />
          </div>

          {TIMELINE.map((session, i) => {
            const isLeft = i % 2 === 0;
            const isActive = activeIndex === i;
            const isPositive = session.delta > 0;

            return (
              <div
                key={session.n}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                style={{ display: "contents" }}
              >
                {/* Left cell */}
                <motion.div
                  className={`py-6 ${isLeft ? "pr-8 text-right" : ""}`}
                  initial={{ opacity: 0, x: isLeft ? -16 : 0 }}
                  animate={visible ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.65,
                    delay: 0.08 + i * 0.09,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {isLeft && (
                    <NodeContent
                      session={session}
                      isActive={isActive}
                      isPositive={isPositive}
                      align="right"
                    />
                  )}
                </motion.div>

                {/* Spine cell — dot centered on the 1px column */}
                <div className="flex flex-col items-center py-6">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 relative z-10"
                    style={{ background: "var(--landing-bg)" }} // bg behind dot to mask spine line
                    animate={{
                      scale: isActive ? 1.6 : 1,
                      boxShadow: isActive
                        ? "0 0 0 3px rgba(184,168,138,0.2), 0 0 14px rgba(184,168,138,0.35)"
                        : "0 0 0 1px rgba(236,234,230,0.1)",
                      backgroundColor: isActive
                        ? "var(--landing-accent)"
                        : "var(--landing-fg-faint)",
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  />
                </div>

                {/* Right cell */}
                <motion.div
                  className={`py-6 ${!isLeft ? "pl-8 text-left" : ""}`}
                  initial={{ opacity: 0, x: !isLeft ? 16 : 0 }}
                  animate={visible ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.65,
                    delay: 0.08 + i * 0.09,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {!isLeft && (
                    <NodeContent
                      session={session}
                      isActive={isActive}
                      isPositive={isPositive}
                      align="left"
                    />
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* End node — sits below the grid, spine line does NOT extend into it */}
        <motion.div
          className="flex flex-col items-center pt-10 pb-2"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={visible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              border: "1px solid rgba(184,168,138,0.4)",
              background: "rgba(184,168,138,0.08)",
              boxShadow: "0 0 28px rgba(184,168,138,0.18)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 6h8M6 2l4 4-4 4"
                stroke="var(--landing-accent)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-[var(--landing-accent)]">
            Identity fully formed
          </p>
          <p className="mt-1 text-[12px] text-[var(--landing-fg-faint)]">
            You're ready.
          </p>
        </motion.div>
      </div>

      {/* Stat strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-[8vh] flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16"
      >
        {[
          { value: "30+", label: "sessions to peak identity" },
          { value: "6", label: "dimensions tracked per session" },
          { value: "∞", label: "context carried forward" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-[28px] font-light tabular-nums tracking-tight text-[var(--landing-fg)]">
              {value}
            </p>
            <p className="text-[11px] text-[var(--landing-fg-faint)] mt-1">
              {label}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function NodeContent({
  session,
  isActive,
  isPositive,
  align,
}: {
  session: (typeof TIMELINE)[number];
  isActive: boolean;
  isPositive: boolean;
  align: "left" | "right";
}) {
  return (
    <div>
      <div
        className={`flex items-center gap-1.5 mb-1 flex-wrap ${align === "right" ? "justify-end" : "justify-start"}`}
      >
        <span className="text-[9px] tracking-[0.18em] uppercase text-[var(--landing-fg-faint)] tabular-nums">
          #{session.n}
        </span>
        <span className="text-[9px] tracking-[0.12em] uppercase text-[var(--landing-accent)] opacity-75">
          {session.company}
        </span>
        <span className="text-[9px] text-[var(--landing-fg-faint)]">·</span>
        <span className="text-[9px] text-[var(--landing-fg-faint)]">
          {session.round}
        </span>
      </div>
      <p
        className="text-[13px] leading-[1.65] transition-all duration-500"
        style={{
          color: isActive ? "var(--landing-fg)" : "var(--landing-fg-faint)",
          opacity: isActive ? 1 : 0.5,
        }}
      >
        {session.insight}
      </p>
      <div
        className={`mt-2 flex items-center gap-2 ${align === "right" ? "justify-end" : "justify-start"}`}
      >
        <Sparkline dims={session.dims} accent={session.accent} />
        <span
          className="text-[11px] tabular-nums font-medium"
          style={{
            color: isPositive
              ? "rgba(160,200,160,0.9)"
              : "rgba(200,140,120,0.9)",
          }}
        >
          {isPositive ? "+" : ""}
          {session.delta}%
        </span>
      </div>
    </div>
  );
}
