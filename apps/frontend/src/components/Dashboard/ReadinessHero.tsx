import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { greeting, computeStreak } from "./helpers";
import type { InterviewSession } from "@evalio/shared";

interface ReadinessHeroProps {
  user: { name?: string | null } | null | undefined;
  totalSessions: number;
  readinessScore: number;
  interviews: InterviewSession[];
}

function useCountUp(target: number, duration = 1400, delay = 200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target <= 0) return;
    const timer = setTimeout(() => {
      const t0 = performance.now();
      let raf: number;
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4);
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

function getReadinessLabel(score: number) {
  if (score >= 80) return { label: "Interview Ready", color: "#4ade80" };
  if (score >= 60)
    return { label: "Getting There", color: "var(--app-accent, #b8a88a)" };
  if (score >= 40) return { label: "Keep Practicing", color: "#facc15" };
  return { label: "Just Starting", color: "var(--color-text-muted)" };
}

export function ReadinessHero({
  user,
  totalSessions,
  readinessScore,
  interviews,
}: ReadinessHeroProps) {
  const streak = computeStreak(interviews);
  const animatedScore = useCountUp(readinessScore, 1600, 300);
  const animatedSessions = useCountUp(totalSessions, 900, 100);
  const { label: readinessLabel, color: readinessColor } =
    getReadinessLabel(readinessScore);

  return (
    <section style={{ position: "relative", paddingBottom: "8px" }}>
      {/* Ambient radial glow */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          left: "-40px",
          width: "500px",
          height: "400px",
          background:
            "radial-gradient(ellipse, var(--app-accent-glow, rgba(184,168,138,0.07)) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Greeting label */}
        {user && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="evalio-section-label"
            style={{ marginBottom: "12px" }}
          >
            {greeting()}, {user.name?.split(" ")[0] ?? "there"}
          </motion.p>
        )}

        {totalSessions === 0 ? (
          /* ── Empty state — first session prompt ── */
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontSize: "clamp(48px, 10vw, 96px)",
                fontWeight: 400,
                fontStyle: "italic",
                lineHeight: 0.92,
                letterSpacing: "-0.04em",
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              Start your
              <br />
              first session.
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ marginTop: "32px" }}
            >
              <Link
                to="/interview/new"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "999px",
                  background: "var(--color-text)",
                  color: "var(--color-bg)",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Begin interview
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7h8M8 4l3 3-3 3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        ) : (
          /* ── Has sessions — hero layout ── */
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "32px",
              flexWrap: "wrap",
            }}
          >
            {/* Left: Giant session count */}
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "8px",
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: '"Instrument Serif", Georgia, serif',
                    fontSize: "clamp(64px, 12vw, 130px)",
                    fontWeight: 400,
                    fontStyle: "italic",
                    lineHeight: 0.88,
                    letterSpacing: "-0.04em",
                    color: "var(--color-text)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {animatedSessions}
                </span>
                <span
                  style={{
                    fontFamily: '"Instrument Serif", Georgia, serif',
                    fontSize: "clamp(24px, 4vw, 44px)",
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: "var(--color-text-muted)",
                    paddingBottom: "8px",
                  }}
                >
                  session{totalSessions !== 1 ? "s" : ""}
                </span>
              </motion.div>

              {/* Streak badge */}
              {streak >= 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  style={{
                    marginTop: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 14px",
                    borderRadius: "999px",
                    background: "rgba(251,146,60,0.08)",
                    border: "1px solid rgba(251,146,60,0.2)",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#fb923c",
                  }}
                >
                  🔥 {streak}-day streak
                </motion.div>
              )}
            </div>

            {/* Right: Readiness score ring */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <ReadinessRing
                score={readinessScore}
                animated={animatedScore}
                color={readinessColor}
              />
              <div style={{ textAlign: "center" }}>
                <p className="evalio-section-label">{readinessLabel}</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Start new session CTA */}
        {totalSessions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ marginTop: "32px" }}
          >
            <Link
              to="/interview/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "999px",
                border: "1px solid var(--color-border)",
                background: "var(--color-bg-card)",
                color: "var(--color-text-secondary)",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--app-accent-border, rgba(184,168,138,0.4))";
                e.currentTarget.style.color = "var(--app-accent, #b8a88a)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
            >
              New session
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 6.5h8M7 3.5l3 3-3 3" />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function ReadinessRing({
  score,
  animated,
  color,
}: {
  score: number;
  animated: number;
  color: string;
}) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ position: "relative", width: "128px", height: "128px" }}>
      {/* Glow blur layer */}
      <div
        style={{
          position: "absolute",
          inset: "8px",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${color}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <svg
        width="128"
        height="128"
        viewBox="0 0 128 128"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Track */}
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="6"
        />
        {/* Filled arc */}
        <motion.circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          transform="rotate(-90 64 64)"
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
        />
      </svg>
      {/* Center value */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: "var(--color-text)",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {animated}
          <span
            style={{
              fontSize: "14px",
              fontWeight: 400,
              color: "var(--color-text-muted)",
            }}
          >
            %
          </span>
        </span>
      </div>
    </div>
  );
}
