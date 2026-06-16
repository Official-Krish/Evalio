import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

function useCountUp(target: number, duration = 1200, delay = 200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const t0 = performance.now();
      let raf: number;
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(eased * target));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return count;
}

function SubScoreBar({
  label,
  score,
  delay,
}: {
  label: string;
  score: number;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const animated = useCountUp(score, 900, visible ? delay : 99999);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const pct = (score / 10) * 100;
  const color =
    score >= 7
      ? "#4ade80"
      : score >= 5
        ? "#facc15"
        : "var(--app-accent, #b8a88a)";

  return (
    <div
      ref={ref}
      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          {label}
        </span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ delay: delay / 1000 + 0.1 }}
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {animated}
          <span
            style={{
              fontSize: "12px",
              fontWeight: 400,
              color: "var(--color-text-muted)",
              marginLeft: "2px",
            }}
          >
            /10
          </span>
        </motion.span>
      </div>
      <div
        style={{
          height: "2px",
          background: "var(--color-border)",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: "0%" }}
          animate={visible ? { width: `${pct}%` } : {}}
          transition={{
            duration: 1.1,
            delay: delay / 1000,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ height: "100%", background: color, borderRadius: "999px" }}
        />
      </div>
    </div>
  );
}

export function ScoreSection({
  overall,
  delta,
  comm,
  tech,
  prob,
}: {
  overall: number;
  delta: number | null;
  comm: number;
  tech: number;
  prob: number;
}) {
  const animatedOverall = useCountUp(overall, 1400, 400);

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* ── Giant score reveal ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "0",
          marginBottom: "64px",
          position: "relative",
        }}
      >
        {/* Ambient glow behind the number */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: "-20px",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(ellipse, var(--app-accent-glow, rgba(184,168,138,0.08)) 0%, transparent 65%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Score label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="evalio-section-label"
          style={{ marginBottom: "16px", position: "relative", zIndex: 1 }}
        >
          Overall Score
        </motion.p>

        {/* Giant number */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: "8px",
            lineHeight: 1,
          }}
        >
          <motion.span
            className="evalio-score-explode"
            style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: "clamp(96px, 18vw, 200px)",
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: 0.88,
              letterSpacing: "-0.04em",
              color: "var(--color-text)",
              fontVariantNumeric: "tabular-nums",
              display: "block",
            }}
          >
            {animatedOverall}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--color-text-muted)",
              lineHeight: 1.1,
              paddingBottom: "4px",
            }}
          >
            /10
          </motion.span>
        </div>

        {/* Delta badge */}
        {delta != null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            style={{
              marginTop: "20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              borderRadius: "999px",
              background:
                delta >= 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${delta >= 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              fontSize: "13px",
              fontWeight: 500,
              color: delta >= 0 ? "#4ade80" : "#f87171",
            }}
          >
            <span style={{ fontSize: "10px" }}>{delta >= 0 ? "▲" : "▼"}</span>
            {delta >= 0 ? "+" : ""}
            {delta} from last session
          </motion.div>
        )}

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="evalio-scroll-bob"
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-text-muted)",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 5l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>

      {/* ── Sub-score bars ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "28px 32px",
          borderRadius: "16px",
          border: "1px solid var(--color-border)",
          background: "var(--color-bg-card)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Card ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(ellipse, var(--app-accent-glow, rgba(184,168,138,0.06)) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <p className="evalio-section-label" style={{ marginBottom: "4px" }}>
          Dimension Breakdown
        </p>
        <SubScoreBar label="Communication" score={comm} delay={0} />
        <SubScoreBar label="Technical" score={tech} delay={120} />
        <SubScoreBar label="Problem Solving" score={prob} delay={240} />
      </motion.div>
    </div>
  );
}
