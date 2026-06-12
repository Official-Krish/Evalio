import type { ReactNode } from "react"

export function LiquidGlass({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(236,234,230,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        background: "rgba(236,234,230,0.03)",
      }}
    >
      {children}
    </div>
  )
}
