import { useMemo } from "react"
import { motion } from "motion/react"
import { COMPANIES } from "@evalio/shared"

interface RolePickerProps {
  companyId: string | null
  selectedRoleTitle: string | null
  customRole: string
  onSelectRole: (title: string | null) => void
  onCustomRoleChange: (val: string) => void
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: "15px",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid var(--color-border)",
  background: "var(--color-bg-hover)",
  color: "var(--color-text)",
  outline: "none",
}

export function RolePicker({
  companyId,
  selectedRoleTitle,
  customRole,
  onSelectRole,
  onCustomRoleChange,
}: RolePickerProps) {
  const company = useMemo(() => {
    if (!companyId || companyId === "__custom__") return null
    return COMPANIES.find((c) => c.id === companyId) ?? null
  }, [companyId])

  const roles = company?.roles ?? []
  const isCustom = companyId === "__custom__"
  const showCustomInput = selectedRoleTitle === null && (isCustom || roles.length > 0)

  if (!companyId) {
    return (
      <p style={{ fontSize: "14px", color: "var(--color-text-muted)", textAlign: "center", padding: "32px 0" }}>
        Select a company first
      </p>
    )
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {!isCustom && roles.map((role) => {
          const active = selectedRoleTitle === role.title
          return (
            <motion.button
              key={role.title}
              onClick={() => {
                onSelectRole(active ? null : role.title)
                if (active) onCustomRoleChange("")
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                textAlign: "left",
                padding: "18px 20px",
                borderRadius: "12px",
                border: active
                  ? "1.5px solid var(--color-accent, #6366f1)"
                  : "1px solid var(--color-border-light)",
                background: active
                  ? "rgba(99,102,241,0.06)"
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                    {role.title}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "4px 0 0" }}>
                    {role.description}
                  </p>
                </div>
                <span style={{
                  fontSize: "11px",
                  color: "var(--color-text-muted)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border-light)",
                  whiteSpace: "nowrap",
                }}>
                  ~{role.duration}min
                </span>
              </div>
            </motion.button>
          )
        })}

        {/* Custom role option */}
        {!isCustom && (
          <>
            <motion.button
              onClick={() => {
                onSelectRole(null)
                if (!customRole) onCustomRoleChange("")
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                textAlign: "left",
                padding: "18px 20px",
                borderRadius: "12px",
                border: showCustomInput && !selectedRoleTitle
                  ? "1.5px solid var(--color-accent, #6366f1)"
                  : "1px dashed var(--color-border)",
                background: showCustomInput && !selectedRoleTitle
                  ? "rgba(99,102,241,0.06)"
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-secondary)", margin: 0 }}>
                    Other (not listed)
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "2px 0 0" }}>
                    Enter a custom role — AI will adapt
                  </p>
                </div>
              </div>
            </motion.button>

            {showCustomInput && !selectedRoleTitle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ paddingLeft: "4px" }}
              >
                <input
                  value={customRole}
                  onChange={(e) => onCustomRoleChange(e.target.value)}
                  placeholder="e.g. Staff Engineer, TPM, Design Lead..."
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                  autoFocus
                />
              </motion.div>
            )}
          </>
        )}

        {/* Custom company: just the text input */}
        {isCustom && (
          <input
            value={customRole}
            onChange={(e) => onCustomRoleChange(e.target.value)}
            placeholder="Enter the role you're applying for..."
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
            autoFocus
          />
        )}
      </div>
    </div>
  )
}
