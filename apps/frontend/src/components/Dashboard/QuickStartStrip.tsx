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
      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
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
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)"
            e.currentTarget.style.color = "var(--landing-fg)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)"
            e.currentTarget.style.color = "rgba(255,255,255,0.5)"
          }}
        >
          {role}
        </button>
      ))}
    </div>
  )
}
