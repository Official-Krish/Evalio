import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { User } from "@evalio/shared";
import toast from "react-hot-toast";
import {
  IconCalendar,
  IconEdit,
  IconCheck,
  IconAward,
  IconMail,
  IconBrandGithub,
  IconCopy,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useTheme } from "../../lib/use-theme";

interface IdentityCardProps {
  user: (User & { role?: "FREE" | "PRO" | "ADMIN" }) | null | undefined;
  memberSince?: string;
  githubUsername?: string | null;
}

export function IdentityCard({
  user,
  memberSince,
  githubUsername,
}: IdentityCardProps) {
  const queryClient = useQueryClient();
  const { theme, toggle } = useTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [copied, setCopied] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: api.updateUser,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    updateMutation.mutate({ name: name.trim() });
  };

  const copyValue = useCallback(async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  }, []);

  const initials =
    user?.name?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    "?";

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-card)",
        padding: "28px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "200px",
          height: "200px",
          background:
            "radial-gradient(ellipse, var(--app-accent-glow, rgba(184,168,138,0.08)) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Main avatar & name section */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--color-bg)",
                border:
                  "2px solid var(--app-accent-border, rgba(184,168,138,0.35))",
                fontSize: "24px",
                fontWeight: 600,
                color: "var(--app-accent, #b8a88a)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                cursor: "default",
              }}
            >
              {initials}
            </motion.div>
            <div
              style={{
                position: "absolute",
                bottom: "1px",
                right: "1px",
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: "#22c55e",
                border: "2px solid var(--color-bg-card)",
                boxShadow: "0 0 6px rgba(34,197,94,0.4)",
              }}
            />
          </div>

          {/* Name & Email Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                      if (e.key === "Escape") {
                        setEditing(false);
                        setName(user?.name ?? "");
                      }
                    }}
                    style={{
                      width: "100%",
                      fontSize: "14px",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border:
                        "1px solid var(--app-accent-border, rgba(184,168,138,0.4))",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    autoFocus
                  />
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "999px",
                        border: "none",
                        background: "var(--color-text)",
                        color: "var(--color-bg)",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setName(user?.name ?? "");
                      }}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "999px",
                        border: "1px solid var(--color-border)",
                        background: "transparent",
                        color: "var(--color-text-muted)",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "var(--color-text)",
                        margin: 0,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {user?.name || "Unnamed"}
                    </h2>
                    <button
                      onClick={() => {
                        setName(user?.name ?? "");
                        setEditing(true);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-text-muted)",
                        display: "flex",
                        padding: "2px",
                      }}
                      title="Edit name"
                    >
                      <IconEdit size={13} />
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                      margin: "2px 0 0",
                    }}
                  >
                    {user?.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Account Properties */}
        <div
          style={{
            borderTop: "1px solid var(--color-border-light)",
            paddingTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Email row */}
          <ProfileDetailRow
            icon={<IconMail size={15} />}
            label="Email"
            value={user?.email ?? "—"}
            onCopy={() => user?.email && copyValue("Email", user.email)}
            copied={copied === "Email"}
          />

          {/* GitHub link status */}
          <ProfileDetailRow
            icon={<IconBrandGithub size={15} />}
            label="GitHub"
            value={githubUsername ? `@${githubUsername}` : "Not Connected"}
            isLink={!!githubUsername}
            linkHref={
              githubUsername
                ? `https://github.com/${githubUsername}`
                : undefined
            }
            onCopy={
              githubUsername
                ? () => copyValue("GitHub", githubUsername)
                : undefined
            }
            copied={copied === "GitHub"}
          />

          {/* Membership tier */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "var(--color-text-muted)",
              }}
            >
              <IconAward size={15} />
              Membership
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: "4px",
                background:
                  user?.role === "PRO"
                    ? "var(--app-accent-bg, rgba(184,168,138,0.12))"
                    : "var(--color-bg)",
                border:
                  user?.role === "PRO"
                    ? "1px solid var(--app-accent-border, rgba(184,168,138,0.25))"
                    : "1px solid var(--color-border)",
                color:
                  user?.role === "PRO"
                    ? "var(--app-accent, #b8a88a)"
                    : "var(--color-text-muted)",
              }}
            >
              {user?.role ?? "FREE"}
            </span>
          </div>

          {/* Member since */}
          <ProfileDetailRow
            icon={<IconCalendar size={15} />}
            label="Member Since"
            value={memberSince ?? "—"}
          />
        </div>

        {/* Dynamic theme switcher inside profile */}
        <div
          style={{
            borderTop: "1px solid var(--color-border-light)",
            paddingTop: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "var(--color-text-secondary)",
              fontWeight: 500,
            }}
          >
            Interface Theme
          </span>
          <div
            style={{
              display: "flex",
              background: "var(--color-bg)",
              borderRadius: "8px",
              padding: "3px",
              gap: "2px",
            }}
          >
            <button
              onClick={() => theme === "dark" && toggle()}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                background:
                  theme === "light" ? "var(--color-bg-card)" : "transparent",
                color:
                  theme === "light"
                    ? "var(--app-accent, #b8a88a)"
                    : "var(--color-text-muted)",
                fontSize: "11px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s",
              }}
            >
              <IconSun size={12} />
              Light
            </button>
            <button
              onClick={() => theme === "light" && toggle()}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                background:
                  theme === "dark" ? "var(--color-bg-card)" : "transparent",
                color:
                  theme === "dark"
                    ? "var(--app-accent, #b8a88a)"
                    : "var(--color-text-muted)",
                fontSize: "11px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s",
              }}
            >
              <IconMoon size={12} />
              Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ProfileDetailRow Helper ─── */
interface ProfileDetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
  linkHref?: string;
  onCopy?: () => void;
  copied?: boolean;
}

function ProfileDetailRow({
  icon,
  label,
  value,
  isLink,
  linkHref,
  onCopy,
  copied,
}: ProfileDetailRowProps) {
  const [hovered, setHovered] = useState(false);

  const content =
    isLink && linkHref ? (
      <a
        href={linkHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "var(--app-accent, #b8a88a)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {value}
        <IconBrandGithub size={11} style={{ opacity: 0.7 }} />
      </a>
    ) : (
      <span style={{ color: "var(--color-text)" }}>{value}</span>
    );

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "12px",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--color-text-muted)",
        }}
      >
        {icon}
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {content}
        {onCopy && (
          <button
            onClick={onCopy}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              padding: 0,
              display: "flex",
              opacity: hovered || copied ? 1 : 0,
              transition: "opacity 0.15s ease",
            }}
          >
            {copied ? (
              <IconCheck size={11} color="var(--app-accent)" />
            ) : (
              <IconCopy size={11} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
