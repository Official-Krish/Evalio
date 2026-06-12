import { useState, useCallback } from "react"
import { IconMail, IconBrandGithub, IconCalendar, IconEdit, IconCopy, IconCheck, IconExternalLink } from "@tabler/icons-react"

interface AccountDetailsProps {
  email: string | undefined
  githubUsername: string | null | undefined
  memberSince: string
  onEdit: () => void
}

export function AccountDetails({ email, githubUsername, memberSince, onEdit }: AccountDetailsProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyValue = useCallback(async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    } catch { /* ignore */ }
  }, [])

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "0.5px solid var(--color-border-light)",
        }}
      >
        <span style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          Account
        </span>
        <button
          onClick={onEdit}
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.2)",
            color: "#A78BFA",
            borderRadius: "6px",
            padding: "4px 12px",
            fontSize: "12px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.18)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)" }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.1)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)" }}
        >
          <IconEdit size={12} />
          Edit
        </button>
      </div>

      {/* Rows */}
      <div>
        <AccountRow
          icon={<IconMail size={16} color="var(--color-text-muted)" />}
          label="Email"
          value={email ?? "\u2014"}
          onCopy={() => email && copyValue("Email", email)}
          copied={copied === "Email"}
        />

        <AccountRow
          icon={<IconBrandGithub size={16} color="var(--color-text-muted)" />}
          label="GitHub"
          isLink
          linkHref={githubUsername ? `https://github.com/${githubUsername}` : undefined}
          onCopy={() => githubUsername && copyValue("GitHub", githubUsername)}
          copied={copied === "GitHub"}
        >
          {githubUsername || "Not linked"}
        </AccountRow>

        <AccountRow
          icon={<IconCalendar size={16} color="var(--color-text-muted)" />}
          label="Member since"
          value={memberSince}
          noBorder
          onCopy={() => copyValue("Member since", memberSince)}
          copied={copied === "Member since"}
        />
      </div>
    </div>
  )
}

/* ─── Row ─── */

function AccountRow({
  icon,
  label,
  value,
  children,
  noBorder,
  isLink,
  linkHref,
  onCopy,
  copied,
}: {
  icon: React.ReactNode
  label: string
  value?: string
  children?: React.ReactNode
  noBorder?: boolean
  isLink?: boolean
  linkHref?: string
  onCopy?: () => void
  copied?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  const valueContent = children ?? value
  const displayValue = isLink && linkHref ? (
    <a
      href={linkHref}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontSize: "14px",
        color: "#A78BFA",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {valueContent}
      <IconExternalLink size={12} />
    </a>
  ) : (
    <span style={{ fontSize: "14px", color: "var(--color-text)" }}>{valueContent}</span>
  )

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 20px",
        borderBottom: noBorder ? "none" : "0.5px solid var(--color-border-light)",
        transition: "background 0.15s ease",
        background: hovered ? "rgba(124,58,237,0.04)" : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ display: "flex", flexShrink: 0, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: "14px", color: "var(--color-text-muted)", minWidth: "90px" }}>{label}</span>
      <span style={{ flex: 1, textAlign: "right" }}>{displayValue}</span>
      <button
        onClick={onCopy}
        style={{
          background: "none",
          border: "none",
          padding: "0",
          cursor: "pointer",
          color: copied ? "#A78BFA" : hovered ? "var(--color-text-muted)" : "transparent",
          transition: "color 0.15s ease, opacity 0.15s ease",
          display: "flex",
          flexShrink: 0,
          opacity: copied || hovered ? 1 : 0,
        }}
        title="Copy"
      >
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </button>
    </div>
  )
}
