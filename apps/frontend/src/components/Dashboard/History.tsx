import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { IconChevronRight } from "@tabler/icons-react";
import type { InterviewSession } from "@evalio/shared";

interface HistoryProps {
  completed: (InterviewSession & { _count?: { turns: number } })[];
}

export function History({ completed }: HistoryProps) {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredSessions = useMemo(() => {
    return completed;
  }, [completed]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedSessions = filteredSessions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  if (completed.length === 0) return null;

  const thStyle: React.CSSProperties = {
    fontSize: "10px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
  };

  return (
    <section id="history" className="db-history-section">
      <div className="db-section-header">
        <h3 className="db-section-label">Mock Session History</h3>
        {filteredSessions.length > 0 && (
          <span className="db-sidebar-item-badge">
            {filteredSessions.length} total
          </span>
        )}
      </div>

      {paginatedSessions.length > 0 ? (
        <>
          <div className="db-history-list">
            <div
              className="db-history-row"
              style={{
                cursor: "default",
                borderBottom: "1px solid var(--color-border-light)",
                paddingBottom: "8px",
                marginBottom: "4px",
              }}
            >
              <div className="db-history-role" style={thStyle}>
                Position / Role
              </div>
              <div className="db-history-meta" style={thStyle}>
                Company
              </div>
              <div className="db-history-meta" style={thStyle}>
                Date
              </div>
              <div
                className="db-history-score-wrapper flex items-center gap-4"
                style={thStyle}
              >
                Score
              </div>
            </div>
            {paginatedSessions.map((session) => {
              const scoreClass =
                session.overallScore != null && session.overallScore >= 70
                  ? "high"
                  : session.overallScore != null && session.overallScore >= 40
                    ? "medium"
                    : "low";

              return (
                <Link
                  key={session.id}
                  to={`/results/${session.id}`}
                  className="db-history-row"
                >
                  <div className="db-history-role">
                    {session.position || "Interview session"}
                  </div>
                  <div className="db-history-meta text-ellipsis overflow-hidden whitespace-nowrap">
                    {session.companyName || "Standard template"}
                  </div>
                  <div className="db-history-meta">
                    {new Date(session.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="db-history-score-wrapper flex items-center gap-4">
                    {session.overallScore != null ? (
                      <span className={`db-history-score ${scoreClass}`}>
                        {Math.round(session.overallScore)}%
                      </span>
                    ) : (
                      <span className="db-history-score text-[var(--color-text-muted)]">
                        Incomplete
                      </span>
                    )}
                    <div className="db-history-action">
                      <IconChevronRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="db-pagination">
              <button
                className="db-page-btn"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`db-page-btn ${n === safePage ? "active" : ""}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="db-page-btn"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-[13px] text-[var(--color-text-secondary)] py-8 text-center">
          No sessions found matching your search.
        </p>
      )}
    </section>
  );
}
