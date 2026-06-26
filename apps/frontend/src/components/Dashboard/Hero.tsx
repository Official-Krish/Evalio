import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IconFlame } from "@tabler/icons-react";
import type { InterviewSession } from "@evalio/shared";
import { computeReadiness, computeStreak } from "./helpers";
import { useTheme } from "../../lib/use-theme";
import { Liveline } from "liveline";

interface HeroProps {
  completed: InterviewSession[];
  interviews: InterviewSession[];
}

export function Hero({ completed, interviews }: HeroProps) {
  const { theme } = useTheme();

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

  const [nowSecs] = useState(() => {
    const t = Date.now() / 1000;
    return Math.floor(t / 60) * 60;
  });
  const stepSeconds = 60; // 1 minute per session

  const livelineData = useMemo(() => {
    return scoreHistory.map((v, i) => ({
      time: nowSecs - (scoreHistory.length - 1 - i) * stepSeconds,
      value: v,
    }));
  }, [scoreHistory, nowSecs]);

  const windowSecs = useMemo(() => {
    return scoreHistory.length * stepSeconds;
  }, [scoreHistory.length]);

  const formatValue = useMemo(() => {
    return (v: number) => `${Math.round(v)}%`;
  }, []);

  const formatTime = useMemo(() => {
    return (t: number) => {
      const index = Math.round(
        (t - nowSecs) / stepSeconds + (scoreHistory.length - 1),
      );
      if (index >= 0 && index < scoreHistory.length) {
        return `${index + 1}`;
      }
      return "";
    };
  }, [scoreHistory.length, nowSecs]);

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

        <div
          className="db-wave-container relative flex flex-col justify-end"
          style={{ height: "130px" }}
        >
          {scoreHistory.length >= 2 ? (
            <>
              <div className="flex-1 relative flex items-stretch min-h-0">
                {/* Rotated Y-Axis Label */}
                <div
                  className="flex items-center justify-center w-6 select-none shrink-0"
                  style={{ marginRight: "-4px" }}
                >
                  <span
                    className="text-[8px] font-mono uppercase tracking-[0.15em] text-[var(--color-text-muted)] whitespace-nowrap block"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    Score (%)
                  </span>
                </div>

                {/* Liveline Canvas Container */}
                <div className="flex-grow relative min-w-0 h-full">
                  <Liveline
                    data={livelineData}
                    value={readinessScore}
                    color="#b8a88a"
                    theme={theme}
                    grid={true}
                    badge={true}
                    scrub={true}
                    paused={true}
                    window={windowSecs}
                    formatValue={formatValue}
                    formatTime={formatTime}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              </div>

              {/* X-Axis Label */}
              <div className="text-center mt-2 select-none">
                <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  Timeline (Sessions)
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
              <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                Complete interviews to populate your readiness curve
              </span>
            </div>
          )}
        </div>
      </div>

      {completed.length > 0 && (
        <Link to="/analysis" className="db-hero-analysis-link">
          <span className="db-hero-analysis-link-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
          </span>
          <span className="db-hero-analysis-link-text">
            <span className="db-hero-analysis-link-title">
              Deep Performance Analysis
            </span>
            <span className="db-hero-analysis-link-desc">
              View detailed dimension scores, trends, and personalized
              improvement insights.
            </span>
          </span>
          <span className="db-hero-analysis-link-arrow">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 4l4 4-4 4" />
            </svg>
          </span>
        </Link>
      )}
    </section>
  );
}
