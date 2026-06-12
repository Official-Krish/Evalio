import { useNavigate } from "react-router-dom"

const roles = ["Product Manager", "SWE", "Data Scientist"]

export function QuickStartStrip() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        paddingBottom: "8px",
      }}
    >
      <span style={{ fontSize: "13px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
        Practice a new role &rarr;
      </span>
      {roles.map((role) => (
        <button
          key={role}
          onClick={() => navigate("/interview/new")}
          style={{
            fontSize: "12px",
            padding: "4px 14px",
            borderRadius: "20px",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-hover)",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-bg-hover)"
            e.currentTarget.style.color = "var(--color-text)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-bg-hover)"
            e.currentTarget.style.color = "var(--color-text-muted)"
          }}
        >
          {role}
        </button>
      ))}
    </div>
  )
}
