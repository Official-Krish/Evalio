import { useRef, useState, useEffect } from "react";

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

function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreRing({ score }: { score: number }) {
  const animatedScore = useCountUp(score, 1400, 400);
  const offset = CIRCUMFERENCE - (animatedScore / 10) * CIRCUMFERENCE;

  return (
    <div className="relative size-[120px] flex-shrink-0">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        style={{ display: "block" }}
      >
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth="7"
        />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="#5DCAA5"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-[34px] font-[500] leading-none"
          style={{
            color: "var(--color-text)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {animatedScore}
        </span>
        <span
          className="text-[12px] leading-none mt-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          /10
        </span>
      </div>
    </div>
  );
}

function getVerdict(score: number): { label: string; description: string } {
  if (score <= 1)
    return {
      label: "Incomplete session",
      description:
        "No responses were recorded. The session ended before any meaningful interaction.",
    };
  if (score <= 3)
    return {
      label: "Needs development",
      description:
        "Significant gaps in responses. Focus on structuring answers with concrete examples.",
    };
  if (score <= 5)
    return {
      label: "Getting started",
      description:
        "Some foundation present but responses lacked depth and specificity.",
    };
  if (score <= 7)
    return {
      label: "Solid performance",
      description:
        "Good answers with relevant examples. Fine-tuning would elevate further.",
    };
  return {
    label: "Strong performance",
    description:
      "Well-structured, specific, and confident responses throughout the session.",
  };
}

const DIMENSION_COLORS: Record<string, string> = {
  Communication: "#5DCAA5",
  Technical: "#7F77DD",
  "Problem Solving": "#EF9F27",
};

function DimensionBar({ label, score }: { label: string; score: number }) {
  const { ref, visible } = useInView();
  const pct = (score / 10) * 100;
  const color = DIMENSION_COLORS[label] ?? "var(--color-text-secondary)";

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span
        className="text-[12px] tracking-[0.07em] uppercase w-[140px] flex-shrink-0"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-[3px] rounded-full overflow-hidden"
        style={{ background: "var(--ring-track)" }}
      >
        {visible && (
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: color }}
          />
        )}
      </div>
      <span
        className="text-[13px] font-[500] w-10 text-right"
        style={{
          color: "var(--color-text-muted)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {score}
      </span>
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
  const verdict = getVerdict(overall);

  return (
    <div className="pb-20">
      {/* Score ring + verdict */}
      <div className="grid grid-cols-[auto_1fr] gap-10 items-center mb-16 max-md:grid-cols-1 max-md:justify-items-center max-md:text-center">
        <ScoreRing score={overall} />
        <div>
          <p
            className="text-[18px] font-[500] mb-1"
            style={{ color: "var(--color-text)" }}
          >
            {verdict.label}
          </p>
          <p
            className="text-[13px] leading-[1.5]"
            style={{ color: "var(--color-text-muted)" }}
          >
            {verdict.description}
          </p>
          {delta != null && (
            <div
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[13px] font-[500]"
              style={{
                background:
                  delta >= 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${delta >= 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                color: delta >= 0 ? "#4ade80" : "#f87171",
              }}
            >
              <span className="text-[10px]">{delta >= 0 ? "▲" : "▼"}</span>
              {delta >= 0 ? "+" : ""}
              {delta} from last session
            </div>
          )}
        </div>
      </div>

      {/* Dimension breakdown */}
      <div>
        <p
          className="text-[11px] tracking-[0.1em] uppercase mb-4"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          DIMENSION BREAKDOWN
        </p>
        <div className="flex flex-col gap-[14px]">
          <DimensionBar label="Communication" score={comm} />
          <DimensionBar label="Technical" score={tech} />
          <DimensionBar label="Problem Solving" score={prob} />
        </div>
      </div>
    </div>
  );
}
