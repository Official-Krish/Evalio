interface Props {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

export function SignalSection({ strengths, weaknesses, improvements }: Props) {
  const uniqueWeaknesses = Array.from(
    new Set([...weaknesses, ...improvements]),
  );

  return (
    <div className="mb-10">
      <h3 className="res-narrative-title">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--app-accent)" }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        Interview Signals
      </h3>
      <div className="res-narrative-grid">
        <div>
          <h4 className="text-[10px] font-bold tracking-[0.05em] uppercase text-[#5DCAA5] mb-3">
            ✓ What Worked (Strengths)
          </h4>
          <div className="res-narrative-log">
            {strengths.map((s, idx) => (
              <div key={`is-pos-${idx}`} className="res-narrative-log-item">
                <span className="res-dot success" />
                <span className="res-narrative-text">{s}</span>
              </div>
            ))}
            {!strengths.length && (
              <p
                className="res-narrative-text italic"
                style={{ color: "var(--color-text-muted)" }}
              >
                No positive interview feedback signals registered.
              </p>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-bold tracking-[0.05em] uppercase text-[#EF4444] mb-3">
            ⚠ Areas to Improve (Critiques)
          </h4>
          <div className="res-narrative-log">
            {uniqueWeaknesses.map((w, idx) => (
              <div key={`is-neg-${idx}`} className="res-narrative-log-item">
                <span
                  className={`res-dot ${weaknesses.includes(w) ? "danger" : "warning"}`}
                />
                <span className="res-narrative-text">{w}</span>
              </div>
            ))}
            {!uniqueWeaknesses.length && (
              <p
                className="res-narrative-text italic"
                style={{ color: "var(--color-text-muted)" }}
              >
                No interview improvement critiques registered.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
