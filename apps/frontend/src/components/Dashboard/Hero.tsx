import { useMemo } from "react";
import { motion } from "motion/react";
import { IconFlame } from "@tabler/icons-react";
import type { InterviewSession } from "@evalio/shared";
import { computeReadiness, computeStreak } from "./helpers";

interface HeroProps {
  completed: InterviewSession[];
  interviews: InterviewSession[];
}

export function Hero({ completed, interviews }: HeroProps) {
  const readinessScore = useMemo(
    () => computeReadiness(completed),
    [completed],
  );
  const streak = useMemo(() => computeStreak(interviews), [interviews]);

  const scoreHistory = useMemo(() => {
    const sorted = [...completed].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return sorted
      .map((i) => i.overallScore)
      .filter((s): s is number => s != null);
  }, [completed]);

  const points = useMemo(() => {
    if (scoreHistory.length < 2) return [];
    const width = 500,
      height = 90,
      padding = 10;
    const usableWidth = width - padding * 2,
      usableHeight = height - padding * 2;
    const min = Math.min(...scoreHistory, 40);
    const max = Math.max(...scoreHistory, 100);
    const range = max - min || 1;
    return scoreHistory.map((score, index) => {
      const x = padding + (index / (scoreHistory.length - 1)) * usableWidth;
      const y = padding + usableHeight - ((score - min) / range) * usableHeight;
      return { x, y, score };
    });
  }, [scoreHistory]);

  const sparklinePath = useMemo(() => {
    if (points.length < 2) return "";
    let d = `M ${points[0]!.x} ${points[0]!.y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i]!,
        next = points[i + 1]!;
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      d += ` C ${cpX1} ${curr.y}, ${cpX2} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  }, [points]);

  const sparklineAreaPath = useMemo(() => {
    if (points.length < 2 || !sparklinePath) return "";
    const lastX = points[points.length - 1]!.x;
    const firstX = points[0]!.x;
    return `${sparklinePath} L ${lastX} 90 L ${firstX} 90 Z`;
  }, [points, sparklinePath]);

  const scoreMin = useMemo(
    () => (scoreHistory.length > 0 ? Math.min(...scoreHistory, 40) : 0),
    [scoreHistory],
  );
  const scoreMax = useMemo(
    () => (scoreHistory.length > 0 ? Math.max(...scoreHistory, 100) : 100),
    [scoreHistory],
  );

  return (
    <section className="db-canvas-hero">
      <div className="db-canvas-hero-title">
        <div>
          <span className="db-canvas-hero-label">Readiness Track</span>
          <p
            className="text-[10px] text-[var(--color-text-muted)] mt-1"
            style={{ margin: "2px 0 0", lineHeight: 1.3 }}
          >
            Overall score progression across{" "}
            {scoreHistory.length > 0
              ? `${scoreHistory.length} completed session${scoreHistory.length !== 1 ? "s" : ""}`
              : "sessions"}
          </p>
        </div>
        <span className="db-canvas-hero-meta">
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="db-canvas-hero-body py-8">
        <div
          className="db-canvas-hero-score"
          style={{ display: "flex", alignItems: "center", gap: "20px" }}
        >
          <div>
            <p className="db-canvas-hero-score-val">
              {readinessScore > 0 ? `${readinessScore}%` : "0%"}
            </p>
            {streak >= 2 ? (
              <div className="db-canvas-hero-trend text-[#fb923c]">
                <IconFlame size={14} className="animate-pulse" />
                <span>{streak} day streak</span>
              </div>
            ) : (
              <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">
                Prep readiness index.
              </p>
            )}
          </div>
        </div>

        <div className="db-wave-container">
          {points.length >= 2 ? (
            <svg
              width="100%"
              height="100"
              viewBox="0 0 500 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-accent)"
                    stopOpacity="0.25"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-accent)"
                    stopOpacity="0.0"
                  />
                </linearGradient>
              </defs>
              {/* y-axis labels */}
              <text
                x="2"
                y="12"
                fill="var(--color-text-secondary)"
                fontSize="8"
                fontFamily="ui-monospace, monospace"
              >
                {scoreMax}%
              </text>
              <text
                x="2"
                y="96"
                fill="var(--color-text-secondary)"
                fontSize="8"
                fontFamily="ui-monospace, monospace"
              >
                {scoreMin}%
              </text>
              {/* x-axis label */}
              <text
                x="480"
                y="98"
                fill="var(--color-text-secondary)"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
                textAnchor="end"
              >
                Session &rarr;
              </text>
              {/* area fill */}
              <path d={sparklineAreaPath} className="db-wave-gradient" />
              {/* line */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                d={sparklinePath}
                className="db-wave-path"
              />
              {/* data point dots + values */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="3"
                    fill="var(--color-accent)"
                    stroke="var(--db-card-bg)"
                    strokeWidth="1.5"
                  />
                  <text
                    x={p.x}
                    y={p.y - 8}
                    fill="var(--color-text)"
                    fontSize="9"
                    fontFamily="ui-monospace, monospace"
                    textAnchor="middle"
                    fontWeight="600"
                    opacity="0.85"
                  >
                    {p.score}%
                  </text>
                </g>
              ))}
            </svg>
          ) : (
            <svg
              width="100%"
              height="100"
              viewBox="0 0 500 100"
              preserveAspectRatio="none"
            >
              <text
                x="250"
                y="54"
                textAnchor="middle"
                fill="var(--color-text-secondary)"
                fontSize="10px"
                fontFamily="ui-monospace, monospace"
                letterSpacing="0.05em"
              >
                Complete interviews to populate your readiness curve
              </text>
            </svg>
          )}
        </div>
      </div>
    </section>
  );
}
