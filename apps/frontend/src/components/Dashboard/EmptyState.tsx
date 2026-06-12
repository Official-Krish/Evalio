import { Link } from "react-router-dom"

interface EmptyStateProps {
  onUpload: () => void
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <section className="text-center py-16">
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>No sessions yet</p>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)", marginTop: "4px", marginBottom: "24px" }}>
        Upload a r&eacute;sum&eacute; and start your first practice
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onUpload}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px",
            padding: "8px 16px",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Upload r&eacute;sum&eacute;
        </button>
        <Link
          to="/interview/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 20px",
            borderRadius: "6px",
            background: "#6C63FF",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Start Interview
        </Link>
      </div>
    </section>
  )
}
