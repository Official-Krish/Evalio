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

export function ReadinessHero({
  user,
  totalSessions,
  readinessScore,
  interviews,
}: ReadinessHeroProps) {
  const streak = computeStreak(interviews);

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
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  fontSize: "52px",
                  fontWeight: 300,
                  color: "var(--color-text)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  margin: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {totalSessions > 0
                  ? `${totalSessions} session${totalSessions !== 1 ? "s" : ""} in.`
                  : "Start your first session."}
              </h1>

              {totalSessions > 0 && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "20px" }}
                >
                  <ReadinessArc score={readinessScore} />
                  <div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        margin: 0,
                      }}
                    >
                      Interview Preparedness
                    </p>
                    <div
                      style={{
                        height: "2px",
                        borderRadius: "999px",
                        background:
                          "var(--app-accent-bg, rgba(184,168,138,0.12))",
                        overflow: "hidden",
                        width: "100px",
                        marginTop: "6px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: "999px",
                          background: "var(--app-accent, #b8a88a)",
                          width: `${readinessScore}%`,
                          transition: "width 0.8s ease",
                        }}
                      />
                    </div>
                  </div>
                  {streak >= 2 && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--color-warning)",
                        marginLeft: "4px",
                      }}
                    >
                      &#x1F525; {streak}-day streak
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function ReadinessArc({ score }: { score: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const anScore = useCountUp(score);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <div style={{ position: "relative", width: "100px", height: "100px" }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--app-accent-bg, rgba(184,168,138,0.12))"
            strokeWidth="6"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--app-accent, #b8a88a)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "var(--app-accent, #b8a88a)",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {anScore}
            <span style={{ fontSize: "14px", fontWeight: 400 }}>%</span>
          </span>
        </div>
      </div>
      <span
        style={{
          fontSize: "9px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        READINESS
      </span>
    </div>
  );
}
