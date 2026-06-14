import { useState } from "react"
import { motion } from "motion/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../../lib/api"
import type { User } from "@evalio/shared"
import toast from "react-hot-toast"
import { IconCalendar, IconEdit } from "@tabler/icons-react"

interface IdentityCardProps {
  user: User | null | undefined
  memberSince?: string
}

export function IdentityCard({ user, memberSince }: IdentityCardProps) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? "")

  const updateMutation = useMutation({
    mutationFn: api.updateUser,
    onSuccess: () => {
      toast.success("Profile updated")
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ["user"] })
      queryClient.invalidateQueries({ queryKey: ["session"] })
    },
    onError: (err) => toast.error((err as Error).message),
  })

  const handleSave = () => {
    if (!name.trim()) { toast.error("Name cannot be empty"); return }
    updateMutation.mutate({ name: name.trim() })
  }

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "var(--app-accent-glow, rgba(184,168,138,0.08))",
          pointerEvents: "none",
        }}
      />

      {/* Avatar */}
      <div style={{ position: "relative" }}>
        <motion.div
          initial={{ boxShadow: "0 0 0 0px var(--app-accent-bg, rgba(184,168,138,0.1))" }}
          animate={{
            boxShadow: [
              "0 0 0 0px var(--app-accent-bg, rgba(184,168,138,0.1))",
              "0 0 0 4px var(--app-accent-bg, rgba(184,168,138,0.1)), 0 0 20px var(--app-accent-glow, rgba(184,168,138,0.12))",
              "0 0 0 4px var(--app-accent-bg, rgba(184,168,138,0.1)), 0 0 20px var(--app-accent-glow, rgba(184,168,138,0.12))",
            ],
          }}
          transition={{ duration: 1.2, ease: "easeOut", times: [0, 0.5, 1] }}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-bg-card)",
            border: "2px solid var(--app-accent-border, rgba(184,168,138,0.35))",
            fontSize: "28px",
            fontWeight: 500,
            color: "var(--app-accent, #b8a88a)",
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "?"}
        </motion.div>
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#22C55E",
            border: "2px solid var(--color-bg)",
          }}
        />
      </div>

      {/* Name / email */}
      <div style={{ textAlign: "center" }}>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                fontSize: "14px",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                outline: "none",
                boxSizing: "border-box",
                textAlign: "center",
              }}
              autoFocus
              onFocus={(e) => e.target.style.borderColor = "#7C3AED"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
            />
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                style={{
                  flex: 1,
                  padding: "5px 0",
                  borderRadius: "6px",
                  border: "none",
                  background: "var(--landing-fg, #eceae6)",
                  color: "var(--landing-bg, #080808)",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: updateMutation.isPending ? "not-allowed" : "pointer",
                  opacity: updateMutation.isPending ? 0.6 : 1,
                }}
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setName(user?.name ?? "") }}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  color: "var(--color-text-muted)",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "18px", fontWeight: 500, color: "var(--color-text)", margin: 0, lineHeight: 1.2 }}>
              {user?.name || "Unnamed"}
            </p>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "4px 0 0", lineHeight: 1.3 }}>
              {user?.email}
            </p>
          </>
        )}
      </div>

      {/* Edit button */}
      {!editing && (
        <button
          onClick={() => { setName(user?.name ?? ""); setEditing(true) }}
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "999px",
            padding: "6px 16px",
            fontSize: "12px",
            color: "var(--color-text-muted)",
            background: "transparent",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--app-accent-border, rgba(184,168,138,0.35))"; e.currentTarget.style.color = "var(--app-accent, #b8a88a)" }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "var(--color-text-muted)" }}
        >
          <IconEdit size={14} />
          Edit profile
        </button>
      )}

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: "8px" }} />

      {/* Member since */}
      <div
        style={{
          width: "100%",
          paddingTop: "16px",
          borderTop: "0.5px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          fontSize: "12px",
          color: "var(--color-text-muted)",
        }}
      >
        <IconCalendar size={14} />
        Member since{" "}
        {memberSince || "\u2014"}
      </div>
    </div>
  )
}
