import { DIFFICULTY_COLORS, APPROACH_LABELS } from "./constants";
import { CodeBlock } from "./CodeBlock";
import { formatTime } from "./helpers";
import type { DsaSessionData } from "./types";

export function DsaResultsSection({ session }: { session: DsaSessionData }) {
  const questions = session.questions as Array<{
    dbId: string;
    leetcodeId: number;
    title: string;
    slug: string;
    difficulty: string;
  }>;

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

  const scoredAttempts = session.attempts.filter((a) => a.score != null);

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

      {scoredAttempts.length > 0 && (
        <div
          className="flex items-center gap-4 mb-6 px-5 py-3 rounded-lg"
          style={{
            background: "var(--color-bg-hover)",
            border: "1px solid var(--color-border)",
          }}
        >
          {scoredAttempts.map((a, i) => (
            <div key={a.id} className="flex items-center gap-2">
              <span
                className="text-[11px] font-[500]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Q{a.index + 1}:
              </span>
              <span
                className="text-[12px] font-[600]"
                style={{
                  color:
                    a.score! >= 7
                      ? "#5DCAA5"
                      : a.score! >= 4
                        ? "#eab308"
                        : "#ef4444",
                }}
              >
                {Math.round(a.score!)}/10
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-8">
        {questions.map((q, qIdx) => {
          const attempt = session.attempts.find((a) => a.index === qIdx);
          const snapshots = attempt?.codeSnapshots ?? {};
          const diffColor =
            DIFFICULTY_COLORS[q.difficulty] ?? "var(--color-text-muted)";

          const approaches = [
            "understanding",
            "brute_force",
            "optimization",
          ].filter((p) => snapshots[p]);

          return (
            <div
              key={q.dbId}
              className="rounded-xl border p-5"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg-card)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[13px] font-[600]"
                  style={{ color: "var(--color-text)" }}
                >
                  {qIdx + 1}. {q.title}
                </span>
                <span
                  className="text-[10px] font-[600] px-[8px] py-[2px] rounded-md uppercase tracking-[0.04em]"
                  style={{ color: diffColor, background: `${diffColor}18` }}
                >
                  {q.difficulty}
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
                {attempt?.timeTaken != null && (
                  <span
                    className="text-[10px] px-[8px] py-[2px] rounded-md ml-auto"
                    style={{
                      color: "var(--color-text-muted)",
                      background: "var(--color-bg-hover)",
                    }}
                  >
                    {formatTime(attempt.timeTaken)}
                  </span>
                )}
              </div>

              {attempt?.score != null && (
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-[12px] font-[500]"
                    style={{
                      color:
                        attempt.score >= 7
                          ? "#5DCAA5"
                          : attempt.score >= 4
                            ? "#eab308"
                            : "#ef4444",
                    }}
                  >
                    Score: {Math.round(attempt.score)}/10
                  </span>
                  {attempt.complexity && (
                    <span
                      className="text-[11px] font-mono px-[8px] py-[2px] rounded-md"
                      style={{
                        color: "var(--color-text-muted)",
                        background: "var(--color-bg-hover)",
                      }}
                    >
                      {attempt.complexity}
                    </span>
                  )}
                </div>
              )}

              {attempt?.feedback && (
                <blockquote
                  className="text-[12.5px] leading-[1.6] italic mb-4 pl-4"
                  style={{
                    color: "var(--color-text-muted)",
                    borderLeft: "2px solid var(--app-accent-border)",
                  }}
                >
                  {attempt.feedback}
                </blockquote>
              )}

              {approaches.length > 0 ? (
                approaches.map((phase) => {
                  const info = APPROACH_LABELS[phase] ?? {
                    label: phase,
                    description: "",
                  };
                  return (
                    <div key={phase} className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-[600] tracking-[0.06em] uppercase"
                          style={{ color: "var(--color-text-secondary)" }}
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
              ) : (
                <p
                  className="text-[12px] italic"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {attempt?.code
                    ? "Code submitted during implementation phase."
                    : "No code submitted for this question."}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
