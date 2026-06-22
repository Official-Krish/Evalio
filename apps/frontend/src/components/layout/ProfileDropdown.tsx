import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLogout } from "../../lib/auth";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const navItems = [
  {
    label: "Profile",
    path: "/profile",
    description: "View your account",
  },
  {
    label: "Pricing",
    path: "/pricing",
    description: "Plans & billing",
  },
];

const adminItem = {
  label: "Admin Panel",
  path: "/admin/feedback",
  description: "Manage platform",
};

export function ProfileDropdown({
  user,
}: {
  user: { name: string; email: string; role?: string };
}) {
  const navigate = useNavigate();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allItems = [...navItems, ...(user.role === "ADMIN" ? [adminItem] : [])];

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "5px 8px 5px 5px",
          borderRadius: "999px",
          border: "1px solid",
          borderColor: open ? "var(--app-accent-border)" : "transparent",
          background: open ? "var(--app-accent-bg)" : "transparent",
          cursor: "pointer",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          outline: "none",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            const el = e.currentTarget;
            el.style.borderColor = "var(--color-border)";
            el.style.background = "var(--color-bg-hover)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            const el = e.currentTarget;
            el.style.borderColor = "transparent";
            el.style.background = "transparent";
          }
        }}
      >
        <AvatarRing initials={initials(user.name ?? "")} active={open} />
        <span
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            maxWidth: "80px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "none",
          }}
          className="profile-name-label"
        >
          {user.name.split(" ")[0]}
        </span>
        <motion.svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ color: "var(--color-text-muted)", flexShrink: 0 }}
        >
          <path d="M2 3.5l3 3 3-3" />
        </motion.svg>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -8, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.94, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: "240px",
              borderRadius: "18px",
              overflow: "hidden",
              background: "var(--color-bg-elevated)",
              backdropFilter: "blur(32px) saturate(160%)",
              WebkitBackdropFilter: "blur(32px) saturate(160%)",
              border: "1px solid var(--color-border)",
              boxShadow:
                "0 0 0 0.5px var(--color-border-light), 0 24px 48px -8px rgba(0,0,0,0.22), 0 4px 16px -4px rgba(0,0,0,0.1)",
              transformOrigin: "top right",
              zIndex: 50,
            }}
          >
            {/* Subtle accent glow at top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "60%",
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, var(--app-accent), transparent)",
                opacity: 0.6,
              }}
            />

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.2 }}
              style={{
                padding: "16px 16px 14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <AvatarRing
                initials={initials(user.name ?? "")}
                size={36}
                active
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: "var(--color-text)",
                    margin: 0,
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginTop: "3px",
                  }}
                >
                  <span
                    style={{
                      position: "relative",
                      display: "flex",
                      width: "6px",
                      height: "6px",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        background: "#22c55e",
                        opacity: 0.5,
                        animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                      }}
                    />
                    <span
                      style={{
                        position: "relative",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#22c55e",
                        flexShrink: 0,
                      }}
                    />
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Ready for Interview
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Separator */}
            <div
              style={{
                height: "1px",
                background: "var(--color-border-light)",
                margin: "0 12px",
              }}
            />

            {/* Nav items */}
            <div style={{ padding: "8px" }}>
              {allItems.map((item, i) => (
                <MenuRow
                  key={item.label}
                  label={item.label}
                  description={item.description}
                  index={i}
                  onClick={() => {
                    setOpen(false);
                    navigate(item.path);
                  }}
                />
              ))}
            </div>

            {/* Separator */}
            <div
              style={{
                height: "1px",
                background: "var(--color-border-light)",
                margin: "0 12px",
              }}
            />

            {/* Sign out */}
            <div style={{ padding: "8px" }}>
              <SignOutRow
                index={allItems.length}
                onClick={() => {
                  setOpen(false);
                  logout.mutate();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes shimmer-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (min-width: 640px) {
          .profile-name-label { display: block !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Avatar with spinning accent ring ─────────────────────────────────── */
function AvatarRing({
  initials,
  size = 28,
  active: _active = false,
}: {
  initials: string;
  size?: number;
  active?: boolean;
}) {
  return (
    <span
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Mask to make it look like a ring */}
      <span
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: "50%",
          background: "var(--color-bg-elevated)",
          zIndex: 1,
        }}
      />
      {/* Inner avatar */}
      <span
        style={{
          position: "relative",
          zIndex: 2,
          width: size - 4,
          height: size - 4,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, var(--app-accent-bg), rgba(184,168,138,0.2))",
          border: "1px solid var(--app-accent-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.38,
          fontWeight: 700,
          color: "var(--app-accent)",
          letterSpacing: "-0.02em",
          userSelect: "none",
        }}
      >
        {initials}
      </span>
    </span>
  );
}

/* ─── Nav menu row ──────────────────────────────────────────────────── */
function MenuRow({
  label,
  description,
  index,
  onClick,
}: {
  label: string;
  description: string;
  index: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.06 + index * 0.04,
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 10px",
        borderRadius: "10px",
        border: "none",
        background: hovered ? "var(--color-bg-hover)" : "transparent",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s ease",
        outline: "none",
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 500,
            color: hovered
              ? "var(--color-text)"
              : "var(--color-text-secondary)",
            lineHeight: 1.3,
            transition: "color 0.15s",
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "11px",
            color: "var(--color-text-muted)",
            marginTop: "1px",
          }}
        >
          {description}
        </span>
      </span>
      <motion.span
        animate={{ x: hovered ? 0 : -4, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        style={{
          color: "var(--app-accent)",
          display: "flex",
          flexShrink: 0,
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 2l4 4-4 4" />
        </svg>
      </motion.span>
    </motion.button>
  );
}

/* ─── Sign out row ──────────────────────────────────────────────────── */
function SignOutRow({
  index,
  onClick,
}: {
  index: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.06 + index * 0.04,
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 10px",
        borderRadius: "10px",
        border: "none",
        background: hovered ? "rgba(239,68,68,0.07)" : "transparent",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s ease",
        outline: "none",
      }}
    >
      <span
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "8px",
          background: hovered
            ? "rgba(239,68,68,0.08)"
            : "var(--color-bg-hover)",
          border: "1px solid",
          borderColor: hovered
            ? "rgba(239,68,68,0.2)"
            : "var(--color-border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: hovered ? "var(--color-danger)" : "var(--color-text-muted)",
          flexShrink: 0,
          transition: "all 0.2s ease",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </span>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: hovered
            ? "var(--color-danger)"
            : "var(--color-text-secondary)",
          flex: 1,
          transition: "color 0.15s",
        }}
      >
        Sign Out
      </span>
    </motion.button>
  );
}
