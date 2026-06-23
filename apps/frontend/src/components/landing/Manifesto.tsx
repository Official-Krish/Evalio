import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useInViewOnce } from "./hooks";
import { ScanLine } from "./svg/ScanLine";

function AnimatedCounter({
  value,
  suffix = "",
  delay = 0,
  duration = 1500,
  visible,
}: {
  value: number;
  suffix?: string;
  delay?: number;
  duration?: number;
  visible: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start: number | null = null;
    const timer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // cubic ease out
        setCount(eased * value);
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, visible, delay, duration]);

  const isFloat = value % 1 !== 0;
  const displayVal = isFloat ? count.toFixed(1) : Math.round(count).toString();

  return (
    <span className="tabular-nums">
      {displayVal}
      {suffix}
    </span>
  );
}

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const { ref, visible } = useInViewOnce<HTMLDivElement>(0.25);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const asideOpacity = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);

  // Split convergence transforms
  const leftX = useTransform(scrollYProgress, [0.05, 0.45], [-120, 0]);
  const rightX = useTransform(scrollYProgress, [0.05, 0.45], [120, 0]);
  const quoteOpacity = useTransform(scrollYProgress, [0.05, 0.3], [0, 1]);

  const leftSpringX = useSpring(leftX, { stiffness: 100, damping: 20 });
  const rightSpringX = useSpring(rightX, { stiffness: 100, damping: 20 });
  const quoteSpringOpacity = useSpring(quoteOpacity, {
    stiffness: 100,
    damping: 20,
  });

  // Background typographic drift transforms
  const bgTextX1 = useSpring(
    useTransform(scrollYProgress, [0, 1], [-200, 200]),
    { stiffness: 60, damping: 20 },
  );
  const bgTextX2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [200, -200]),
    { stiffness: 60, damping: 20 },
  );

  return (
    <section
      ref={sectionRef}
      className="w-full relative overflow-hidden border-b"
    >
      {/* Background Typographic Parallax */}
      <div
        className="absolute inset-0 flex flex-col justify-between py-[12vh] pointer-events-none select-none z-0"
        style={{ opacity: 0.02, userSelect: "none" }}
      >
        <motion.div
          style={{ x: bgTextX1 }}
          className="text-[12vw] font-mono font-bold tracking-widest whitespace-nowrap text-[var(--landing-fg)] leading-none"
        >
          PRACTICE · PRACTICE · REHEARSE · REVIEW · IMPROVE
        </motion.div>
        <motion.div
          style={{ x: bgTextX2 }}
          className="text-[12vw] font-mono font-bold tracking-widest whitespace-nowrap text-[var(--landing-fg)] leading-none text-right"
        >
          CONFIDENCE · SIGNAL · IDENTITY · EMERGENCE · REHEARSAL
        </motion.div>
      </div>

      <div className="landing-container relative py-[18vh] z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-6">
          <div className="lg:col-span-2 hidden lg:flex justify-center">
            <ScanLine
              className="h-[280px] w-2 text-[var(--landing-fg-faint)]"
              progress={visible ? 0.6 : 0.1}
            />
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

            <div className="landing-serif text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.15] tracking-[-0.02em] text-[var(--landing-fg)] flex flex-col gap-4 overflow-hidden mb-12">
              <motion.span
                style={{ x: leftSpringX, opacity: quoteSpringOpacity }}
                className="block text-left"
              >
                Most candidates don't fail interviews because they lack skill.
              </motion.span>
              <motion.span
                style={{ x: rightSpringX, opacity: quoteSpringOpacity }}
                className="block text-[var(--landing-fg-muted)] text-right lg:pr-12"
              >
                They fail because they've never heard themselves answer under
                pressure.
              </motion.span>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={visible ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-14 flex flex-col sm:flex-row gap-10 sm:gap-16"
            >
              <div className="landing-stat max-w-[200px]">
                <p className="text-[32px] font-light tracking-tight text-[var(--landing-fg)] tabular-nums">
                  <AnimatedCounter
                    value={73}
                    suffix="%"
                    visible={visible}
                    delay={300}
                  />
                </p>
                <p className="mt-1 text-[12px] leading-[1.5] text-[var(--landing-fg-faint)]">
                  report anxiety as their primary blocker
                </p>
              </div>
              <div className="landing-stat max-w-[200px]">
                <p className="text-[32px] font-light tracking-tight text-[var(--landing-fg)] tabular-nums">
                  <AnimatedCounter
                    value={4.2}
                    suffix="×"
                    visible={visible}
                    delay={450}
                  />
                </p>
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
      </div>
    </section>
  );
}
