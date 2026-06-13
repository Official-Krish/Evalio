import { IconSun, IconMoon } from "@tabler/icons-react"

interface AppearanceToggleProps {
  theme: "dark" | "light"
  onToggle: () => void
}

export function AppearanceToggle({ theme, onToggle }: AppearanceToggleProps) {
  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--color-border-light)" }}>
        <span style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          Appearance
        </span>
      </div>
      <div
        style={{
          padding: "12px 20px",
          display: "flex",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "var(--color-bg)",
            borderRadius: "8px",
            padding: "4px",
            gap: "4px",
            width: "100%",
          }}
        >
          {/* Light */}
          <button
            onClick={() => theme === "dark" && onToggle()}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 0",
              borderRadius: "6px",
              border: "none",
              background: theme === "light" ? "var(--landing-fg, #eceae6)" : "transparent",
              color: theme === "light" ? "var(--landing-bg, #080808)" : "var(--color-text-muted)",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <IconSun size={14} />
            Light
          </button>

          {/* Dark */}
          <button
            onClick={() => theme === "light" && onToggle()}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 0",
              borderRadius: "6px",
              border: "none",
              background: theme === "dark" ? "var(--landing-fg, #eceae6)" : "transparent",
              color: theme === "dark" ? "var(--landing-bg, #080808)" : "var(--color-text-muted)",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <IconMoon size={14} />
            Dark
          </button>
        </div>
      </div>
    </div>
  )
}
