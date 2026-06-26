import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import ScrollStack, { ScrollStackItem } from "../ui/ScrollStack";

const TRAITS = [
  {
    num: "01",
    label: "Perception",
    desc: "What do you notice before everyone else?",
    metric: "SIGNAL DETECTION",
    weight: "CRITICAL",
    glow: "rgba(184, 168, 138, 0.12)",
    hue: "rgba(184, 168, 138, 0.9)",
  },
  {
    num: "02",
    label: "Reasoning",
    desc: "How do you arrive at conclusions?",
    metric: "LOGIC DEPTH",
    weight: "CRITICAL",
    glow: "rgba(160, 200, 180, 0.12)",
    hue: "rgba(160, 200, 180, 0.9)",
  },
  {
    num: "03",
    label: "Agency",
    desc: "Do you act when certainty is unavailable?",
    metric: "INITIATIVE RATIO",
    weight: "HIGH",
    glow: "rgba(160, 170, 200, 0.12)",
    hue: "rgba(160, 170, 200, 0.9)",
  },
  {
    num: "04",
    label: "Navigation",
    desc: "Can you create a path through ambiguity?",
    metric: "PATHFINDING",
    weight: "HIGH",
    glow: "rgba(200, 180, 140, 0.12)",
    hue: "rgba(200, 180, 140, 0.9)",
  },
  {
    num: "05",
    label: "Presence",
    desc: "How strongly do your ideas resonate with others?",
    metric: "INFLUENCE SCORE",
    weight: "MEDIUM",
    glow: "rgba(200, 150, 150, 0.12)",
    hue: "rgba(200, 150, 150, 0.9)",
  },
  {
    num: "06",
    label: "Evolution",
    desc: "How quickly do you update your thinking?",
    metric: "ADAPTABILITY INDEX",
    weight: "CRITICAL",
    glow: "rgba(150, 200, 170, 0.12)",
    hue: "rgba(150, 200, 170, 0.9)",
  },
];

const TOTAL = TRAITS.length;

// ─── Per-card graphic (small visualizer specific to each trait) ────────

function CardGraphic({
  index,
  isActive,
}: {
  index: number;
  isActive: boolean;
}) {
  if (index === 0) {
    // Signal: Pulsing Equalizer/Waveform
    return (
      <div className="flex items-end gap-1.5 h-16 justify-center w-full px-4">
        {[0.4, 0.9, 0.6, 1.0, 0.7, 0.5, 0.8, 0.3].map((val, idx) => (
          <motion.div
            key={idx}
            className="w-1 lg:w-1.5 rounded-full bg-[var(--landing-accent)] shadow-[0_0_8px_var(--landing-accent-soft)]"
            animate={
              isActive
                ? { height: [`${val * 20}%`, `${val * 100}%`, `${val * 20}%`] }
                : { height: "20%" }
            }
            transition={{
              repeat: Infinity,
              duration: 1.0 + idx * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (index === 1) {
    // Agency: Sonar/Target Blip Radar
    return (
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[var(--landing-line)]" />
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[var(--landing-line)]" />
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-[var(--landing-accent)]"
            initial={{ scale: 0.2, opacity: 0.8 }}
            animate={isActive ? { scale: 1.15, opacity: 0 } : {}}
            transition={{
              repeat: Infinity,
              duration: 2.4,
              delay: i * 0.8,
              ease: "linear",
            }}
          />
        ))}
        <motion.div
          className="w-3 h-3 rounded-full bg-[var(--landing-accent)] shadow-[0_0_10px_var(--landing-accent)] z-10"
          animate={
            isActive ? { scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] } : {}
          }
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        />
      </div>
    );
  }

  if (index === 2) {
    // Reasoning: Staggered Glowing Matrix Grid
    return (
      <div className="grid grid-cols-3 gap-3 w-14 h-14 relative items-center justify-items-center">
        <div className="absolute inset-x-2.5 h-[1px] bg-[var(--landing-line)]" />
        <div className="absolute inset-y-2.5 w-[1px] bg-[var(--landing-line)]" />
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-[var(--landing-accent)] z-10"
            animate={
              isActive
                ? {
                    scale: [1, 1.45, 1],
                    opacity: [0.35, 1, 0.35],
                    boxShadow: [
                      "0 0 0px var(--landing-accent-soft)",
                      "0 0 8px var(--landing-accent)",
                      "0 0 0px var(--landing-accent-soft)",
                    ],
                  }
                : { scale: 1, opacity: 0.3 }
            }
            transition={{
              repeat: Infinity,
              duration: 2.0,
              delay: (i % 3) * 0.22 + Math.floor(i / 3) * 0.22,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (index === 3) {
    // Navigation: Stepper Linear progress path
    return (
      <div className="flex flex-col items-center justify-center w-full px-4 gap-2">
        <div className="relative w-full h-[3px] bg-[var(--landing-line)] rounded-full flex items-center justify-between">
          <motion.div
            className="absolute left-0 top-0 h-full bg-[var(--landing-accent)] rounded-full shadow-[0_0_6px_var(--landing-accent)]"
            animate={
              isActive ? { width: ["0%", "100%", "0%"] } : { width: "0%" }
            }
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3.5 h-3.5 rounded-full border-2 border-[var(--landing-accent)] bg-[#fdfcfa] dark:bg-[#111111] z-10 flex items-center justify-center"
              animate={
                isActive
                  ? {
                      scale: [1, 1.2, 1],
                    }
                  : {}
              }
              transition={{
                repeat: Infinity,
                duration: 6,
                delay: i * 1.5,
                ease: "easeInOut",
              }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]"
                animate={
                  isActive
                    ? {
                        opacity: [0.3, 1, 0.3],
                      }
                    : { opacity: 0.3 }
                }
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  delay: i * 1.5,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between w-full text-[7.5px] font-mono text-[var(--landing-fg-faint)] tracking-wider">
          <span>SRC</span>
          <span>PLAN</span>
          <span>DEST</span>
        </div>
      </div>
    );
  }

  if (index === 4) {
    // Influence: Concentric Expanding Waves
    return (
      <div className="relative w-20 h-20 flex items-center justify-center">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-[var(--landing-accent)] shadow-[0_0_8px_var(--landing-accent-soft)]"
            initial={{ scale: 0.1, opacity: 0 }}
            animate={
              isActive
                ? {
                    scale: [0.1, 1.25],
                    opacity: [0, 0.75, 0],
                  }
                : {}
            }
            transition={{
              repeat: Infinity,
              duration: 3.2,
              delay: i * 0.8,
              ease: "easeOut",
            }}
            style={{ width: "64px", height: "64px" }}
          />
        ))}
        <div className="w-3.5 h-3.5 rounded-full bg-[var(--landing-accent)] z-10 shadow-[0_0_8px_var(--landing-accent)]" />
      </div>
    );
  }

  // Adaptation: Liquid Morphing Rotating Ring
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <motion.div
        className="w-14 h-14 border-2 border-[var(--landing-accent)] border-double shadow-[0_0_10px_var(--landing-accent-soft)]"
        animate={
          isActive
            ? {
                borderRadius: [
                  "50%",
                  "30% 70% 70% 30% / 30% 30% 70% 70%",
                  "50%",
                ],
                rotate: [0, 180, 360],
              }
            : { borderRadius: "50%", rotate: 0 }
        }
        transition={{
          repeat: Infinity,
          duration: 6.5,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-6 h-6 border border-dashed border-[var(--landing-accent)] rounded-full opacity-40"
        animate={isActive ? { rotate: -360 } : {}}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      />
      <div className="absolute w-2 h-2 rounded-full bg-[var(--landing-accent)] shadow-[0_0_6px_var(--landing-accent)]" />
    </div>
  );
}

// ─── Stacking card ─────────────────────────────────────────────────────

interface StackingCardProps {
  trait: (typeof TRAITS)[number];
  index: number;
  progress: MotionValue<number>;
  isActive: boolean;
  isMobile: boolean;
}

function StackingCard({
  trait,
  index,
  progress,
  isActive,
  isMobile,
}: StackingCardProps) {
  // Define key frames for scroll-linked card transforms.
  const entryStart = index / TOTAL;
  const entryEnd = (index + 0.65) / TOTAL;

  // Build the unique inputs range.
  const inputRange: number[] = [0];
  if (entryStart > 0) inputRange.push(entryStart);
  inputRange.push(entryEnd);
  for (let j = index + 1; j < TOTAL; j++) {
    inputRange.push(j / TOTAL);
    inputRange.push((j + 0.65) / TOTAL);
  }
  inputRange.push(1);
  const uniqueInput = Array.from(new Set(inputRange)).sort((a, b) => a - b);

  // Generate outputs corresponding to each input checkpoint.
  const outputs = (() => {
    const yOut: number[] = [];
    const scaleOut: number[] = [];
    const opacityOut: number[] = [];
    const rotateOut: number[] = [];
    const overlayOut: number[] = [];

    uniqueInput.forEach((p) => {
      if (p <= entryStart) {
        // Not yet entered (hidden below)
        yOut.push(220);
        scaleOut.push(0.9);
        opacityOut.push(0);
        rotateOut.push(index % 2 === 0 ? 4 : -4);
        overlayOut.push(0.4);
      } else if (p <= entryEnd) {
        // Animating into active top-of-stack position
        const t = Math.max(
          0,
          Math.min(1, (p - entryStart) / (entryEnd - entryStart)),
        );
        yOut.push(220 - 220 * t);
        scaleOut.push(0.9 + 0.1 * t);
        opacityOut.push(t);
        rotateOut.push((index % 2 === 0 ? 4 : -4) * (1 - t));
        overlayOut.push(0.4 * (1 - t));
      } else {
        // Stacked underneath subsequent cards
        const numStacked = Math.max(0, (p - entryEnd) * TOTAL);
        yOut.push(-14 * numStacked);
        scaleOut.push(Math.max(0.83, 1.0 - 0.028 * numStacked));
        opacityOut.push(Math.max(0.12, 1.0 - 0.14 * numStacked));
        const stackTilt = (index % 2 === 0 ? -1.8 : 1.8) * numStacked;
        rotateOut.push(stackTilt);
        overlayOut.push(Math.min(0.55, 0.1 * numStacked));
      }
    });

    return {
      y: yOut,
      scale: scaleOut,
      opacity: opacityOut,
      rotate: rotateOut,
      overlay: overlayOut,
    };
  })();

  // Create Framer Motion transforms (unconditionally).
  const y = useTransform(progress, uniqueInput, outputs.y);
  const scale = useTransform(progress, uniqueInput, outputs.scale);
  const opacity = useTransform(progress, uniqueInput, outputs.opacity);
  const rotate = useTransform(progress, uniqueInput, outputs.rotate);
  const overlay = useTransform(progress, uniqueInput, outputs.overlay);

  // Mobile rendering (non-sticky, normal scroll list)
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-[200px] rounded-xl border bg-[#fdfcfa]/95 dark:bg-[#111111]/95 p-5 flex flex-row items-center justify-between overflow-hidden"
        style={{
          borderColor: "var(--landing-line)",
          boxShadow: "0 4px 12px -8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-45 dark:opacity-25"
          style={{
            background: `radial-gradient(circle 120px at 80% 20%, ${trait.glow}, transparent 80%)`,
          }}
          aria-hidden
        />
        <div className="flex flex-col justify-between h-full flex-1 pr-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] tracking-[0.14em] text-[var(--landing-accent)] font-semibold">
              {trait.num}
            </span>
            <span className="text-[8px] tracking-[0.1em] text-[var(--landing-fg-faint)] font-bold">
              // {trait.metric}
            </span>
          </div>
          <div className="my-auto">
            <h3 className="font-serif italic text-base text-[var(--landing-fg)] mb-1">
              {trait.label}
            </h3>
            <p className="font-sans text-[11px] leading-relaxed text-[var(--landing-fg-muted)] font-normal">
              {trait.desc}
            </p>
          </div>
          <div className="flex gap-1.5 mt-1">
            <span className="text-[8px] tracking-[0.12em] uppercase border border-[var(--landing-line)] px-2 py-0.5 rounded bg-[var(--landing-surface)] text-[var(--landing-fg-faint)] font-semibold">
              {trait.weight} WEIGHT
            </span>
          </div>
        </div>
        <div className="w-[85px] h-[85px] flex-shrink-0 relative z-10 flex items-center justify-center border border-[var(--landing-line)] rounded-lg bg-[var(--landing-surface)]">
          <CardGraphic index={index} isActive={isActive} />
        </div>
      </motion.div>
    );
  }

  // Desktop rendering (scroll-linked stacking cards)
  return (
    <motion.div
      style={{
        y,
        scale,
        opacity,
        rotate,
        transformStyle: "preserve-3d",
        zIndex: 10 * index,
        borderColor: isActive
          ? "rgba(184, 168, 138, 0.4)"
          : "var(--landing-line)",
        boxShadow: isActive
          ? "0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 24px -4px rgba(184, 168, 138, 0.05)"
          : "0 16px 32px -20px rgba(0, 0, 0, 0.2)",
      }}
      className="absolute top-0 left-0 w-full h-[340px] rounded-2xl border bg-[#fdfcfa]/95 dark:bg-[#111111]/95 backdrop-blur-xl p-8 flex flex-col justify-between overflow-hidden group select-none transition-colors duration-500"
    >
      {/* Technical Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(184, 168, 138, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(184, 168, 138, 0.1) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />

      {/* Sci-Fi Corner Brackets */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[var(--landing-accent)] opacity-40 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[var(--landing-accent)] opacity-40 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[var(--landing-accent)] opacity-40 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[var(--landing-accent)] opacity-40 transition-opacity duration-300 pointer-events-none" />

      {/* Soft trait glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-30"
        style={{
          background: `radial-gradient(circle 220px at 70% 30%, ${trait.glow}, transparent 80%)`,
        }}
        aria-hidden
      />

      {/* Stacked-card darkening overlay */}
      <motion.div
        style={{ opacity: overlay }}
        className="absolute inset-0 bg-[#f6f4f0]/45 dark:bg-black/65 pointer-events-none transition-opacity duration-300 z-20"
      />

      <div className="flex flex-row items-center justify-between h-full w-full relative z-10 gap-6">
        <div
          className="flex flex-col justify-between h-full flex-1 py-1"
          style={{ transform: "translateZ(15px)" }}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-[12px] tracking-[0.14em] text-[var(--landing-accent)] font-semibold">
              {trait.num}
            </span>
            <span className="text-[9px] tracking-[0.14em] text-[var(--landing-fg-faint)] font-bold">
              // {trait.metric}
            </span>
          </div>
          <div className="my-auto pr-2">
            <h3 className="font-serif italic text-2xl text-[var(--landing-fg)] mb-3">
              {trait.label}
            </h3>
            <p className="font-sans text-[13px] leading-relaxed text-[var(--landing-fg-muted)] max-w-[280px] font-normal">
              {trait.desc}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-[9px] tracking-[0.14em] uppercase border border-[var(--landing-line)] px-2.5 py-0.5 rounded bg-[var(--landing-surface)] text-[var(--landing-fg-faint)] font-semibold">
              {trait.weight} WEIGHT
            </span>
          </div>
        </div>
        <div className="w-[145px] h-[145px] flex-shrink-0 flex items-center justify-center border border-[var(--landing-line)] rounded-xl bg-[var(--landing-surface)]/20 shadow-inner overflow-hidden">
          <CardGraphic index={index} isActive={isActive} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Vertical chapter ticker (left rail) ───────────────────────────────

function ChapterTicker({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="mt-8 relative pl-6 border-l border-[var(--landing-line)] space-y-4">
      {TRAITS.map((t, idx) => {
        const isActive = idx === activeIndex;
        const isPast = activeIndex > idx;
        return (
          <div
            key={t.label}
            className="flex items-center gap-3 transition-all duration-300"
            style={{
              opacity: isActive ? 1 : isPast ? 0.7 : 0.3,
              transform: isActive ? "translateX(4px)" : "none",
            }}
          >
            <span
              className="font-mono text-[9px] font-semibold tabular-nums"
              style={{ color: isActive ? t.hue : "var(--landing-fg-faint)" }}
            >
              {t.num}
            </span>
            <span
              className="font-sans text-[11px] uppercase tracking-[0.1em] font-semibold"
              style={{
                color: isActive
                  ? "var(--landing-fg)"
                  : isPast
                    ? "var(--landing-fg-muted)"
                    : "var(--landing-fg-faint)",
              }}
            >
              {t.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Composition root ──────────────────────────────────────────────────

export type IdentityEmergenceProps = {
  className?: string;
};

export function IdentityEmergence({ className }: IdentityEmergenceProps) {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  const [activeIndex, setActiveIndex] = useState(-1);
  const [progressVal, setProgressVal] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setProgressVal(latest);
    const active = Math.min(Math.floor(latest * TOTAL), TOTAL - 1);
    setActiveIndex(latest > 0.01 ? active : -1);
  });

  return (
    <section
      ref={scrollContainerRef}
      className={`${className || ""} relative border-b ${
        isMobile ? "min-h-0 py-[10vh]" : "min-h-[480vh]"
      }`}
      style={{ background: "transparent" }}
    >
      {/* Ambient Background Glows */}
      <div
        className="absolute pointer-events-none right-0 top-1/4 w-[500px] h-[500px]"
        style={{
          background:
            "radial-gradient(circle, rgba(184,168,138,0.04) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
        aria-hidden
      />
      <div
        className="absolute pointer-events-none left-0 bottom-1/4 w-[400px] h-[400px]"
        style={{
          background:
            "radial-gradient(circle, rgba(184,168,138,0.02) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
        aria-hidden
      />

      {isMobile ? (
        // Mobile layout: header → visualizer → stacked editorial list
        <div className="landing-container w-full px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[var(--landing-fg-muted)] mb-4">
              <span className="w-8 h-px bg-[var(--landing-line)]" aria-hidden />
              Chapter I &middot; The Emergence
            </span>
            <h2 className="landing-display text-[clamp(1.7rem,6vw,2.2rem)] leading-[1.1] tracking-[-0.02em] text-[var(--landing-fg)]">
              Your answers fade.{" "}
              <span className="landing-serif italic text-[var(--landing-accent)]">
                Your identity remains.
              </span>
            </h2>
            <p className="mt-5 text-[13px] leading-[1.65] text-[var(--landing-fg-muted)] max-w-sm mx-auto font-normal">
              Your voice under pressure. The decisions you make when information
              is incomplete. The habits that repeat across interviews.
            </p>
            <p className="mt-2.5 text-[13px] leading-[1.65] text-[var(--landing-fg-muted)] max-w-sm mx-auto font-normal">
              Evalio tracks those signals and turns them into an evolving
              interview identity. No vague feedback. A sharp mirror.
            </p>
          </div>

          <div className="flex flex-col gap-6 w-full max-w-[420px] mx-auto">
            {TRAITS.map((trait, idx) => (
              <StackingCard
                key={trait.label}
                trait={trait}
                index={idx}
                progress={scrollYProgress}
                isActive={true}
                isMobile={true}
              />
            ))}
          </div>
        </div>
      ) : (
        // Desktop layout: sticky split-screen (Left=visualizer+header, Right=card deck)
        <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
          <div className="landing-container w-full">
            <div className="grid grid-cols-12 gap-12 lg:gap-16 w-full items-center">
              {/* ─── LEFT: Sticky Header + Visualizer ─── */}
              <div className="col-span-5 flex flex-col justify-center h-[calc(100vh-10rem)] py-6">
                <div>
                  <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[var(--landing-fg-muted)] mb-6">
                    <span
                      className="w-8 h-px bg-[var(--landing-line)]"
                      aria-hidden
                    />
                    Chapter I &middot; The Emergence
                  </span>
                  <h2 className="landing-display text-[clamp(1.75rem,2.6vw,2.3rem)] leading-[1.08] tracking-[-0.03em] text-[var(--landing-fg)] max-w-[18ch]">
                    Your answers fade.{" "}
                    <span className="landing-serif italic text-[var(--landing-accent)]">
                      Your identity remains.
                    </span>
                  </h2>
                  <p className="mt-5 text-[12.5px] leading-[1.7] text-[var(--landing-fg-muted)] max-w-[34ch] font-normal">
                    Your voice under pressure. The decisions you make when
                    information is incomplete. The habits that repeat across
                    interviews.
                  </p>
                  <p className="mt-2 text-[12.5px] leading-[1.7] text-[var(--landing-fg-muted)] max-w-[34ch] font-normal">
                    Evalio tracks those signals and turns them into an evolving
                    identity. A sharp mirror.
                  </p>
                </div>
                Visualizer
                {/* Chapter ticker */}
                <ChapterTicker activeIndex={activeIndex} />
              </div>

              {/* ─── RIGHT: Stacking Card Deck ─── */}
              <ScrollStack
                progress={progressVal}
                useWindowScroll={false}
                itemDistance={50}
                itemScale={0.03}
                itemStackDistance={15}
                stackPosition="10%"
                scaleEndPosition="5%"
                baseScale={0.85}
                className="col-span-7 relative w-full h-[450px] max-w-[520px] ml-auto scrollbar-none"
                innerClassName="pt-4 pb-96 w-full"
              >
                {TRAITS.map((trait, idx) => (
                  <ScrollStackItem
                    key={trait.label}
                    itemClassName="h-[340px] p-8 rounded-2xl bg-[#fdfcfa]/95 dark:bg-[#111111]/95 backdrop-blur-xl border flex flex-col justify-between overflow-hidden group select-none transition-colors duration-500"
                    style={{
                      borderColor:
                        activeIndex === idx
                          ? "rgba(184, 168, 138, 0.4)"
                          : "var(--landing-line)",
                      boxShadow:
                        activeIndex === idx
                          ? "0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 24px -4px rgba(184, 168, 138, 0.05)"
                          : "0 16px 32px -20px rgba(0, 0, 0, 0.2)",
                      zIndex: 10 * idx,
                    }}
                  >
                    {/* Technical Grid Background */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10"
                      style={{
                        backgroundImage: `linear-gradient(rgba(184, 168, 138, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(184, 168, 138, 0.1) 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                      }}
                      aria-hidden
                    />

                    {/* Sci-Fi Corner Brackets */}
                    <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[var(--landing-accent)] opacity-40 transition-opacity duration-300 pointer-events-none" />
                    <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[var(--landing-accent)] opacity-40 transition-opacity duration-300 pointer-events-none" />
                    <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[var(--landing-accent)] opacity-40 transition-opacity duration-300 pointer-events-none" />
                    <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[var(--landing-accent)] opacity-40 transition-opacity duration-300 pointer-events-none" />

                    {/* Soft trait glow */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-30"
                      style={{
                        background: `radial-gradient(circle 220px at 70% 30%, ${trait.glow}, transparent 80%)`,
                      }}
                      aria-hidden
                    />

                    <div className="flex flex-row items-center justify-between h-full w-full relative z-10 gap-6">
                      <div
                        className="flex flex-col justify-between h-full flex-1 py-1"
                        style={{ transform: "translateZ(15px)" }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[12px] tracking-[0.14em] text-[var(--landing-accent)] font-semibold">
                            {trait.num}
                          </span>
                          <span className="text-[9px] tracking-[0.14em] text-[var(--landing-fg-faint)] font-bold">
                            // {trait.metric}
                          </span>
                        </div>
                        <div className="my-auto pr-2">
                          <h3 className="font-serif italic text-2xl text-[var(--landing-fg)] mb-3">
                            {trait.label}
                          </h3>
                          <p className="font-sans text-[13px] leading-relaxed text-[var(--landing-fg-muted)] max-w-[280px] font-normal">
                            {trait.desc}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[9px] tracking-[0.14em] uppercase border border-[var(--landing-line)] px-2.5 py-0.5 rounded bg-[var(--landing-surface)] text-[var(--landing-fg-faint)] font-semibold">
                            {trait.weight} WEIGHT
                          </span>
                        </div>
                      </div>
                      <div className="w-[145px] h-[145px] flex-shrink-0 flex items-center justify-center border border-[var(--landing-line)] rounded-xl bg-[var(--landing-surface)]/20 shadow-inner overflow-hidden">
                        <CardGraphic
                          index={idx}
                          isActive={activeIndex === idx}
                        />
                      </div>
                    </div>
                  </ScrollStackItem>
                ))}
              </ScrollStack>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default IdentityEmergence;
