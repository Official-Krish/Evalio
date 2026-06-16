import type { InterviewSummary } from "@evalio/shared";

export function ResumeAnalysis({ summary }: { summary: InterviewSummary }) {
  const strengths = summary.resumeStrengths as string[];
  const weaknesses = summary.resumeWeaknesses as string[];

  if (strengths.length === 0 && weaknesses.length === 0) return null;

  return (
    <div className="pb-12">
      <p
        className="text-[11px] tracking-[0.1em] uppercase mb-4"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        RESUME ANALYSIS
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {strengths.length > 0 && (
          <div
            className="rounded-xl border-[0.5px] flex flex-col gap-2"
            style={{
              borderColor: "var(--color-border-secondary)",
              background: "rgba(93, 202, 165, 0.06)",
              padding: "1.25rem",
            }}
          >
            <p
              className="text-[11px] tracking-[0.09em] uppercase font-[500] mb-1"
              style={{ color: "#5DCAA5" }}
            >
              What works
            </p>
            {strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span
                  className="w-1 h-1 rounded-full mt-[7px] flex-shrink-0"
                  style={{ background: "#5DCAA5" }}
                />
                <p
                  className="text-[13px] leading-[1.55] m-0"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {s}
                </p>
              </div>
            ))}
          </div>
        )}

        {weaknesses.length > 0 && (
          <div
            className="rounded-xl border-[0.5px] flex flex-col gap-2"
            style={{
              borderColor: "var(--color-border-secondary)",
              background: "rgba(239, 159, 39, 0.06)",
              padding: "1.25rem",
            }}
          >
            <p
              className="text-[11px] tracking-[0.09em] uppercase font-[500] mb-1"
              style={{ color: "#EF9F27" }}
            >
              What to improve
            </p>
            {weaknesses.map((w, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span
                  className="w-1 h-1 rounded-full mt-[7px] flex-shrink-0"
                  style={{ background: "#EF9F27" }}
                />
                <p
                  className="text-[13px] leading-[1.55] m-0"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {w}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
