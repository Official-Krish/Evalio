import { Link } from "react-router-dom";

interface RoleRec {
  role: string;
  reason: string;
}

interface RoleRecommendationsProps {
  recommendations: RoleRec[];
}

const difficultyMap: Record<string, string> = {
  "Backend Engineer": "Hard",
  "Data Scientist": "Medium",
  "Engineering Manager": "Medium",
  "Frontend Engineer": "Medium",
  "Product Manager": "Easy",
  "ML Engineer": "Hard",
};

function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Hard: { bg: "rgba(239,68,68,0.1)", text: "#FCA5A5" },
    Medium: { bg: "rgba(245,158,11,0.1)", text: "#FDE68A" },
    Easy: { bg: "rgba(16,185,129,0.1)", text: "#6EE7B7" },
  };
  const c = colors[level] ?? {
    bg: "var(--color-border-light)",
    text: "var(--color-text-muted)",
  };
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        fontSize: "10px",
        fontWeight: 500,
        borderRadius: "999px",
        padding: "2px 8px",
      }}
    >
      {level}
    </span>
  );
}

export function RoleRecommendations({
  recommendations,
}: RoleRecommendationsProps) {
  return (
    <section>
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "10px",
        }}
      >
        RECOMMENDED NEXT
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {recommendations.map((rec, i) => {
          const diff = difficultyMap[rec.role] ?? "Medium";
          return (
            <Link
              key={i}
              to="/interview/new"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                borderRadius: "10px",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)";
                e.currentTarget.style.background = "rgba(124,58,237,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.background = "var(--color-bg-card)";
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "2px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "var(--color-text)",
                    }}
                  >
                    {rec.role}
                  </span>
                  <DifficultyBadge level={diff} />
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                    margin: 0,
                  }}
                >
                  {rec.reason}
                </p>
              </div>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(124,58,237,0.15)",
                  color: "#A78BFA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#7C3AED";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(124,58,237,0.15)";
                  e.currentTarget.style.color = "#A78BFA";
                }}
              >
                &rarr;
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
