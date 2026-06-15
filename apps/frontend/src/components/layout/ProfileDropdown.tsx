import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { useLogout } from "../../lib/auth"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const items = [
  { label: "Profile", path: "/profile", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { label: "Pricing", path: "/pricing", icon: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M12 6v12 M9 9h4a2 2 0 0 1 0 4H9" },
]

export function ProfileDropdown({ user }: { user: { name: string; email: string; role?: string } }) {
  const navigate = useNavigate()
  const logout = useLogout()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--landing-surface)] transition-colors duration-200"
      >
        <span className="flex size-7 rounded-full items-center justify-center text-[11px] font-semibold" style={{ background: "rgba(108,99,255,0.3)", border: "1px solid rgba(108,99,255,0.5)", color: "#fff" }}>
          {initials(user.name ?? "")}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={`text-[var(--landing-fg-faint)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 3.5l3 3 3-3" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -3, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -3, scale: 0.97 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 min-w-[200px] rounded-xl overflow-hidden"
            style={{
              background: "var(--color-bg-elevated)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid var(--color-border)",
              transformOrigin: "top right",
            }}
          >
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex size-8 rounded-full items-center justify-center text-[12px] font-semibold" style={{ background: "rgba(108,99,255,0.3)", border: "1px solid rgba(108,99,255,0.5)", color: "#fff" }}>
                  {initials(user.name ?? "")}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--landing-fg)] leading-tight">{user.name}</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-[var(--landing-fg-muted)] mt-0.5">
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full rounded-full bg-[#22C55E] animate-ping opacity-75" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-[#22C55E]" />
                    </span>
                    Ready for Interview
                  </p>
                </div>
              </div>
            </div>

            <div className="px-1.5 pb-1.5 space-y-0.5">
              {items.map((item) => (
                <DropdownItem
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  onClick={() => {
                    setOpen(false)
                    navigate(item.path)
                  }}
                />
              ))}
              {user.role === "ADMIN" && (
                <DropdownItem
                  label="Admin"
                  icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z M3.65 11.25a.5.5 0 0 0 0 .9l.2.1a2.5 2.5 0 0 1 1.25 2.15v.3a.5.5 0 0 0 .5.5h.15a2.5 2.5 0 0 1 2.15 1.25l.1.2a.5.5 0 0 0 .9 0l.1-.2a2.5 2.5 0 0 1 2.15-1.25h.15a.5.5 0 0 0 .5-.5v-.3a2.5 2.5 0 0 1 1.25-2.15l.2-.1a.5.5 0 0 0 0-.9l-.2-.1a2.5 2.5 0 0 1-1.25-2.15v-.3a.5.5 0 0 0-.5-.5h-.15a2.5 2.5 0 0 1-2.15-1.25l-.1-.2a.5.5 0 0 0-.9 0l-.1.2a2.5 2.5 0 0 1-2.15 1.25h-.15a.5.5 0 0 0-.5.5v.3a2.5 2.5 0 0 1-1.25 2.15z"
                  onClick={() => {
                    setOpen(false)
                    navigate("/admin/feedback")
                  }}
                />
              )}
            </div>

            <div className="px-1.5 pb-1.5">
              <DropdownItem
                label="Sign Out"
                icon="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9"
                onClick={() => {
                  setOpen(false)
                  logout.mutate()
                }}
                danger
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DropdownItem({
  label,
  icon,
  onClick,
  danger,
}: {
  label: string
  icon: string
  onClick: () => void
  danger?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors duration-150"
      style={{
        color: danger ? "var(--color-danger)" : "var(--color-text-secondary)",
        background: hovered
          ? danger
            ? "rgba(239,68,68,0.08)"
            : "var(--color-bg-hover)"
          : "transparent",
      }}
    >
      <span className="flex items-center gap-2.5">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
          style={{ opacity: 0.4 }}
        >
          <path d={icon} />
        </svg>
        {label}
      </span>
      {!danger && (
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ x: hovered ? 4 : 0, opacity: hovered ? 0.6 : 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ opacity: hovered ? 0.6 : 0 }}
        >
          <path d="M4 2l4 4-4 4" />
        </motion.svg>
      )}
    </button>
  )
}
