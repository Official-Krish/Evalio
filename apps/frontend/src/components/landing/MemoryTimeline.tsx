import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { useInViewOnce } from "./hooks";

const TIMELINE = [
  {
    n: 1,
    company: "Google",
    round: "Behavioral",
    insight: "Missed metrics in every impact statement.",
    accent: "rgba(200,160,140,0.8)",
  },
  {
    n: 4,
    company: "Stripe",
    round: "System Design",
    insight: "Structure improving. Still rushing conclusions.",
    accent: "rgba(184,168,138,0.7)",
  },
  {
    n: 8,
    company: "Meta",
    round: "Technical",
    insight: "Technical depth is a strength. Communication catching up.",
    accent: "rgba(184,168,138,0.85)",
  },
  {
    n: 15,
    company: "Amazon",
    round: "Bar Raiser",
    insight: "Leadership signals emerging. Ownership now consistent.",
    accent: "rgba(160,200,160,0.75)",
  },
  {
    n: 21,
    company: "Palantir",
    round: "System Design",
    insight: "Clearer communication. Highest structure score yet.",
    accent: "rgba(160,200,160,0.9)",
  },
];

/* ─── Path Geometry Helpers ─── */

const CURVE_FACTOR = 0.55;

function getSegmentLength(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
) {
  if (Math.abs(p1.x - p2.x) < 10) {
    return Math.abs(p2.y - p1.y);
  }
  const steps = 12;
  let len = 0;
  let prevX = p1.x;
  let prevY = p1.y;
  const deltaY = p2.y - p1.y;
  const cx1 = p1.x;
  const cy1 = p1.y + deltaY * CURVE_FACTOR;
  const cx2 = p2.x;
  const cy2 = p2.y - deltaY * CURVE_FACTOR;

  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const mt = 1 - t;
    const x =
      mt * mt * mt * p1.x +
      3 * mt * mt * t * cx1 +
      3 * mt * t * t * cx2 +
      t * t * t * p2.x;
    const y =
      mt * mt * mt * p1.y +
      3 * mt * mt * t * cy1 +
      3 * mt * t * t * cy2 +
      t * t * t * p2.y;
    len += Math.sqrt((x - prevX) ** 2 + (y - prevY) ** 2);
    prevX = x;
    prevY = y;
  }
  return len;
}

function getPathSegment(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
) {
  if (Math.abs(p1.x - p2.x) < 10) {
    return ` L ${p2.x} ${p2.y}`;
  }
  const dy = p2.y - p1.y;
  return ` C ${p1.x} ${p1.y + dy * CURVE_FACTOR}, ${p2.x} ${p2.y - dy * CURVE_FACTOR}, ${p2.x} ${p2.y}`;
}

/* ─── Scroll-linked card reveal ─── */

function TimelineCard({
  children,
  progress,
  threshold,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  threshold: number;
}) {
  const t0 = Math.max(0, threshold - 0.05);
  const t1 = Math.min(1, threshold);

  const opacity = useSpring(useTransform(progress, [t0, t1], [0, 1]), {
    stiffness: 100,
    damping: 22,
  });
  const y = useSpring(useTransform(progress, [t0, t1], [28, 0]), {
    stiffness: 100,
    damping: 22,
  });

  return (
    <motion.div style={{ opacity, y }} className="timeline-card-wrapper">
      {children}
    </motion.div>
  );
}

function TimelineEndNode({
  children,
  progress,
  threshold,
  innerRef,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  threshold: number;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const t0 = Math.max(0, threshold - 0.04);
  const t1 = Math.min(1, threshold);

  const opacity = useSpring(useTransform(progress, [t0, t1], [0, 1]), {
    stiffness: 100,
    damping: 22,
  });
  const scale = useSpring(useTransform(progress, [t0, t1], [0.85, 1]), {
    stiffness: 100,
    damping: 22,
  });

  return (
    <motion.div
      ref={innerRef}
      style={{ opacity, scale }}
      className="flex flex-col items-center pt-12 pb-4 relative z-10"
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export function MemoryTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const endNodeRef = useRef<HTMLDivElement>(null);
  const bgPathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGGElement>(null);
  const { ref, visible } = useInViewOnce<HTMLDivElement>(0.15);

  const [activeIndex, setActiveIndex] = useState(-1);
  const activeIdxRef = useRef(-1);
  const thresholdsRef = useRef<number[]>([]);

  const [pathD, setPathD] = useState("");
  const [thresholds, setThresholds] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 85%"],
  });

  const pathSpring = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 100,
  });

  // Keep threshold ref in sync
  useEffect(() => {
    thresholdsRef.current = thresholds;
  }, [thresholds]);

  // Responsive breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Build path from measured dot positions ──
  useEffect(() => {
    const updatePath = () => {
      const container = containerRef.current;
      if (!container) return;

      const cRect = container.getBoundingClientRect();
      const points = dotRefs.current.filter(Boolean).map((dot) => {
        const r = dot!.getBoundingClientRect();
        return {
          x: r.left - cRect.left + r.width / 2,
          y: r.top - cRect.top + r.height / 2,
        };
      });

      if (points.length === 0) return;

      const first = points[0]!;
      const last = points[points.length - 1]!;
      const centerX = isMobile ? first.x : cRect.width / 2;

      // End node measurement
      let endPt = { x: centerX, y: last.y + 120 };
      const endEl = endNodeRef.current;
      if (endEl) {
        const icon = endEl.querySelector(".end-node-icon");
        const r = (icon || endEl).getBoundingClientRect();
        endPt = {
          x: r.left - cRect.left + r.width / 2,
          y: r.top - cRect.top + r.height / 2,
        };
      }

      const startPt = { x: centerX, y: Math.max(0, first.y - 150) };
      const startCurvePt = { x: centerX, y: Math.max(0, first.y - 90) };
      const endPathY = endPt.y - 20;
      const endCurvePt = { x: centerX, y: endPathY - 40 };
      const endPathPt = { x: centerX, y: endPathY };

      // Build SVG path string
      let d = `M ${startPt.x} ${startPt.y}`;
      if (!isMobile) {
        d += ` L ${startCurvePt.x} ${startCurvePt.y}`;
        d += getPathSegment(startCurvePt, first);
      } else {
        d += ` L ${first.x} ${first.y}`;
      }

      for (let i = 0; i < points.length - 1; i++) {
        d += getPathSegment(points[i]!, points[i + 1]!);
      }

      if (!isMobile) {
        d += getPathSegment(last, endCurvePt);
        d += ` L ${endPathPt.x} ${endPathPt.y}`;
      } else {
        d += ` L ${endPathPt.x} ${endPathPt.y}`;
      }
      setPathD(d);

      // Cumulative segment-length thresholds
      const lens: number[] = [];
      if (!isMobile) {
        lens.push(60 + getSegmentLength(startCurvePt, first));
      } else {
        lens.push(first.y - startPt.y);
      }

      for (let i = 0; i < points.length - 1; i++) {
        lens.push(getSegmentLength(points[i]!, points[i + 1]!));
      }

      if (!isMobile) {
        lens.push(getSegmentLength(last, endCurvePt) + 40);
      } else {
        lens.push(endPathPt.y - last.y);
      }

      const total = lens.reduce((a, b) => a + b, 0);
      const ths: number[] = [];
      let cum = lens[0]!;
      ths.push(cum / total);
      for (let i = 1; i < points.length; i++) {
        cum += lens[i]!;
        ths.push(cum / total);
      }
      setThresholds(ths);
    };

    const t1 = setTimeout(updatePath, 60);
    const t2 = setTimeout(updatePath, 400);
    window.addEventListener("resize", updatePath);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", updatePath);
    };
  }, [visible, isMobile]);

  // ── Imperatively track the traveling tip + active index ──
  useMotionValueEvent(pathSpring, "change", (v) => {
    // Move the glowing tip along the path (no React re-renders)
    const path = bgPathRef.current;
    const tip = tipRef.current;
    if (path && tip && pathD) {
      try {
        const total = path.getTotalLength();
        const pt = path.getPointAtLength(Math.min(v, 0.999) * total);
        tip.setAttribute("transform", `translate(${pt.x},${pt.y})`);
        tip.style.opacity = v > 0.005 && v < 0.995 ? "1" : "0";
      } catch {
        /* path not ready */
      }
    }

    // Determine which node is active
    const ths = thresholdsRef.current;
    if (ths.length === 0) return;
    let active = -1;
    for (let i = 0; i < ths.length; i++) {
      const th = ths[i];
      if (th !== undefined && v >= th - 0.02) active = i;
    }
    if (active !== activeIdxRef.current) {
      activeIdxRef.current = active;
      setActiveIndex(active);
    }
  });

  /* ── Render ── */

  return (
    <section
      ref={sectionRef}
      className="relative py-[14vh] border-b overflow-hidden"
    >
      {/* Ambient glows */}
      <div
        className="absolute pointer-events-none left-0 top-1/4"
        style={{
          width: 600,
          height: 600,
          background:
            "radial-gradient(ellipse, rgba(184,168,138,0.04) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden
      />
      <div
        className="absolute pointer-events-none right-0 bottom-1/4"
        style={{
          width: 500,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(184,168,138,0.03) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden
      />

      {/* ── Header ── */}
      <div className="landing-container">
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
              The landing doesn't reset. Your history builds context — so
              session 37 knows everything sessions 1–36 revealed.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* ── Full-width timeline ── */}
      <div className="relative w-full" ref={containerRef}>
        {/* SVG canvas */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-500"
          style={{ opacity: pathD ? 1 : 0 }}
        >
          <defs>
            <filter
              id="timeline-tip-glow"
              x="-300%"
              y="-300%"
              width="700%"
              height="700%"
            >
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background trace (also used for getPointAtLength) */}
          <path
            ref={bgPathRef}
            d={pathD}
            stroke="var(--landing-line)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Active drawing line */}
          <motion.path
            d={pathD}
            stroke="var(--landing-accent)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            style={{ pathLength: pathSpring }}
          />

          {/* Traveling tip — positioned imperatively for 60 fps */}
          <g ref={tipRef} style={{ opacity: 0 }}>
            <circle r="24" fill="var(--landing-accent)" opacity="0.05" />
            <circle
              r="5"
              fill="var(--landing-accent)"
              opacity="0.35"
              filter="url(#timeline-tip-glow)"
            />
            <circle r="2.5" fill="var(--landing-accent)" />
          </g>
        </svg>

        {/* Node rows */}
        <div className="relative z-10">
          {TIMELINE.map((session, i) => {
            const isLeft = i % 2 === 0;
            const isActive = activeIndex === i;
            const threshold =
              thresholds[i] !== undefined
                ? thresholds[i]!
                : (i + 1) / (TIMELINE.length + 2);

            return (
              <div
                key={session.n}
                className={`timeline-wide-row ${isLeft ? "timeline-wide-left" : "timeline-wide-right"}`}
              >
                {/* Dot anchor */}
                <div
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  className="timeline-wide-dot"
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border border-[var(--landing-accent)] pointer-events-none"
                      initial={{ opacity: 0.5, scale: 1 }}
                      animate={{ opacity: 0, scale: 2.2 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.8,
                        ease: "easeOut",
                      }}
                    />
                  )}
                  <motion.div
                    className="w-[16px] h-[16px] rounded-full border-[1.5px] relative z-10"
                    style={{ background: "var(--landing-bg)" }}
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      borderColor: isActive
                        ? "var(--landing-accent)"
                        : "rgba(184,168,138,0.35)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  />
                </div>

                {/* Content card */}
                <TimelineCard progress={pathSpring} threshold={threshold}>
                  <NodeContent
                    session={session}
                    index={i}
                    isActive={isActive}
                    alignRight={isLeft && !isMobile}
                  />
                </TimelineCard>
              </div>
            );
          })}
        </div>

        {/* End node */}
        <TimelineEndNode
          progress={pathSpring}
          threshold={thresholds.length > 0 ? 1 : 0.95}
          innerRef={endNodeRef}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center end-node-icon"
            style={{
              border: "1px solid rgba(184,168,138,0.4)",
              background: "rgba(184,168,138,0.06)",
              boxShadow: "0 0 32px rgba(184,168,138,0.15)",
            }}
          >
            <svg
              width="14"
              height="14"
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
        </TimelineEndNode>
      </div>

      {/* ── Stat strip ── */}
      <div className="landing-container">
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
      </div>
    </section>
  );
}

/* ─── Node Content ─── */

function NodeContent({
  session,
  index,
  isActive,
  alignRight,
}: {
  session: (typeof TIMELINE)[number];
  index: number;
  isActive: boolean;
  alignRight: boolean;
}) {
  return (
    <div
      className={`timeline-node-content ${alignRight ? "timeline-node-right" : ""}`}
    >
      <span className="timeline-step-num">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="timeline-step-title">{session.company}</h3>
      <p className="timeline-step-round">{session.round}</p>
      <p
        className="timeline-step-desc"
        style={{
          color: isActive
            ? "var(--landing-fg-muted)"
            : "var(--landing-fg-faint)",
          transition: "color 0.5s ease",
        }}
      >
        {session.insight}
      </p>
    </div>
  );
}
