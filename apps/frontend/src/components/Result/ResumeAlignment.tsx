interface Props {
  strengths: string[];
  weaknesses: string[];
}

export function ResumeAlignment({ strengths, weaknesses }: Props) {
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
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        Resume Alignment
      </h3>
      <div className="res-narrative-grid">
        <div>
          <h4 className="text-[10px] font-bold tracking-[0.05em] uppercase text-[#5DCAA5] mb-3">
            ✓ Resume Fit (Strengths)
          </h4>
          <div className="res-narrative-log">
            {strengths.map((s, idx) => (
              <div key={`rs-pos-${idx}`} className="res-narrative-log-item">
                <span className="res-dot success" />
                <span className="res-narrative-text">{s}</span>
              </div>
            ))}
            {!strengths.length && (
              <p
                className="res-narrative-text italic"
                style={{ color: "var(--color-text-muted)" }}
              >
                No resume alignment fit signals registered.
              </p>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-bold tracking-[0.05em] uppercase text-[#EF9F27] mb-3">
            ⚠ Resume Gaps (Weaknesses)
          </h4>
          <div className="res-narrative-log">
            {weaknesses.map((w, idx) => (
              <div key={`rs-neg-${idx}`} className="res-narrative-log-item">
                <span className="res-dot warning" />
                <span className="res-narrative-text">{w}</span>
              </div>
            ))}
            {!weaknesses.length && (
              <p
                className="res-narrative-text italic"
                style={{ color: "var(--color-text-muted)" }}
              >
                No resume gaps or weaknesses registered.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
