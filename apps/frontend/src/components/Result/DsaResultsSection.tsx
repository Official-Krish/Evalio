import { DIFFICULTY_COLORS, APPROACH_LABELS } from "./constants";
import { CodeBlock } from "./CodeBlock";
import { formatTime } from "./helpers";
import type { DsaSessionData } from "./types";

export function DsaResultsSection({ session }: { session: DsaSessionData }) {
  const problems = session.problems;

  const statusColors: Record<string, string> = {
    IN_PROGRESS: "#eab308",
    SUBMITTED: "#7F77DD",
    EVALUATED: "#22c55e",
  };

  const statusBg: Record<string, string> = {
    IN_PROGRESS: "rgba(234,179,8,0.12)",
    SUBMITTED: "rgba(127,119,221,0.12)",
    EVALUATED: "rgba(34,197,94,0.12)",
  };

  const scoredProblems = problems.filter((p) => p.score != null);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <p
          className="text-[11px] tracking-[0.1em] uppercase m-0 font-semibold"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          CODING ASSESSMENT
        </p>
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-[600] px-[8px] py-[2px] rounded-md uppercase tracking-[0.04em]"
            style={{
              color: statusColors[session.status] ?? "var(--color-text-muted)",
              background: statusBg[session.status] ?? "var(--color-bg-hover)",
            }}
          >
            {session.status === "EVALUATED"
              ? "Evaluated"
              : session.status === "SUBMITTED"
                ? "Submitted"
                : "In Progress"}
          </span>
          {session.timeTaken != null && (
            <span
              className="text-[10px] px-[8px] py-[2px] rounded-md"
              style={{
                color: "var(--color-text-muted)",
                background: "var(--color-bg-hover)",
              }}
            >
              {formatTime(session.timeTaken)}
            </span>
          )}
        </div>
      </div>

      {scoredProblems.length > 0 && (
        <div
          className="flex items-center gap-4 mb-6 px-5 py-3 rounded-lg"
          style={{
            background: "var(--color-bg-hover)",
            border: "1px solid var(--color-border)",
          }}
        >
          {scoredProblems.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <span
                className="text-[11px] font-[500]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Q{p.index + 1}:
              </span>
              <span
                className="text-[12px] font-[600]"
                style={{
                  color:
                    p.score! >= 7
                      ? "#5DCAA5"
                      : p.score! >= 4
                        ? "#eab308"
                        : "#ef4444",
                }}
              >
                {Math.round(p.score!)}/10
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-8">
        {problems.map((problem) => {
          const snapshots = problem.codeSnapshots ?? {};
          const diffColor =
            DIFFICULTY_COLORS[problem.difficulty] ?? "var(--color-text-muted)";

          const approaches = [
            "understanding",
            "brute_force",
            "optimization",
            "implementation",
            "testing",
          ].filter((p) => snapshots[p]);

          return (
            <div
              key={problem.id}
              className="rounded-xl border"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg-card)",
                overflow: "hidden",
              }}
            >
              {/* Problem Header */}
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{
                  borderBottom: "1px solid var(--color-border)",
                  background: "var(--color-bg-hover)",
                }}
              >
                <span
                  className="text-[13px] font-[600]"
                  style={{ color: "var(--color-text)" }}
                >
                  Problem {problem.index + 1}
                </span>
                <span
                  className="text-[13px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {problem.title}
                </span>
                <span
                  className="text-[10px] font-[600] px-[8px] py-[2px] rounded-md uppercase tracking-[0.04em]"
                  style={{ color: diffColor, background: `${diffColor}18` }}
                >
                  {problem.difficulty}
                </span>
                <span
                  className="text-[10px] px-[8px] py-[2px] rounded-md"
                  style={{
                    color: "var(--color-text-muted)",
                    background: "var(--color-bg-hover)",
                  }}
                >
                  {session.language}
                </span>
                {problem.timeTaken != null && (
                  <span
                    className="text-[10px] px-[8px] py-[2px] rounded-md ml-auto"
                    style={{
                      color: "var(--color-text-muted)",
                      background: "var(--color-bg-hover)",
                    }}
                  >
                    {formatTime(problem.timeTaken)}
                  </span>
                )}
              </div>

              {/* Body — score, feedback, code all in one */}
              <div className="p-5">
                {problem.score != null && (
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-[12px] font-[500]"
                      style={{
                        color:
                          problem.score >= 7
                            ? "#5DCAA5"
                            : problem.score >= 4
                              ? "#eab308"
                              : "#ef4444",
                      }}
                    >
                      Score: {Math.round(problem.score)}/10
                    </span>
                    {problem.complexity && (
                      <span
                        className="text-[11px] font-mono px-[8px] py-[2px] rounded-md"
                        style={{
                          color: "var(--color-text-muted)",
                          background: "var(--color-bg-hover)",
                        }}
                      >
                        {problem.complexity}
                      </span>
                    )}
                  </div>
                )}

                {problem.feedback && (
                  <div
                    className="text-[12.5px] leading-[1.6] mb-5 p-4 rounded-lg"
                    style={{
                      color: "var(--color-text-secondary)",
                      background: "var(--color-bg-hover)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {problem.feedback}
                  </div>
                )}

                {/* Show code from snapshots or fallback to problem.code */}
                {approaches.length > 0
                  ? approaches.map((phase) => {
                      const info = APPROACH_LABELS[phase] ?? {
                        label: phase,
                        description: "",
                      };
                      return (
                        <div key={phase} className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-[10px] font-[600] tracking-[0.06em] uppercase"
                              style={{
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              {info.label}
                            </span>
                            <span
                              className="text-[10px]"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              — {info.description}
                            </span>
                          </div>
                          <CodeBlock
                            code={snapshots[phase]!}
                            language={session.language}
                          />
                        </div>
                      );
                    })
                  : problem.code && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] font-[600] tracking-[0.06em] uppercase"
                            style={{
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            Code
                          </span>
                        </div>
                        <CodeBlock
                          code={problem.code}
                          language={session.language}
                        />
                      </div>
                    )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
