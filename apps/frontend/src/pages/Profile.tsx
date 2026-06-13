import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "../lib/auth"
import { IdentityCard } from "../components/Profile/IdentityCard"
import { StatsSection } from "../components/Profile/StatsSection"
import { AccountDetails } from "../components/Profile/AccountDetails"
import { AppearanceToggle } from "../components/Profile/AppearanceToggle"
import { ResumeVault } from "../components/Profile/ResumeVault"
import { StreakHeatmap } from "../components/Profile/StreakHeatmap"
import { api } from "../lib/api"
import { useTheme } from "../lib/use-theme"
import type { InterviewSession, Resume } from "@ai-interview/shared"

export function ProfilePage() {
  const { data: session } = useSession()
  const user = session?.user
  const { theme, toggle } = useTheme()
  const [identityEditKey, setIdentityEditKey] = useState(0)

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: () => api.getUser(),
    enabled: !!user,
  })

  const { data: interviewsData } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.listInterviews(0, 100),
    select: (d) => d.interviews as InterviewSession[],
  })

  const { data: resumesData } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.listResumes(),
    select: (d) => d.resumes as Resume[],
  })

  const interviews = interviewsData ?? []
  const resumes = resumesData ?? []
  const completed = interviews.filter((i) => i.status === "COMPLETED")
  const totalSessions = interviews.length
  const totalMinutes = completed.reduce(
    (sum, i) => sum + (i.durationSeconds ? Math.round(i.durationSeconds / 60) : 0),
    0,
  )
  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, i) => sum + (i.overallScore ?? 0), 0) /
            completed.length,
        )
      : null

  const userProfile = userData?.user as { createdAt?: string } | undefined
  const memberSince = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "\u2014"

  const githubUsername =
    userData?.user?.candidate?.githubUsername ?? null

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "48px" }} className="py-6">

      {/* ─── Profile Banner ────────────────────────── */}
      <div
        style={{
          position: "relative",
          marginBottom: "32px",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Banner gradient */}
        <div
          style={{
            height: "120px",
            background: "linear-gradient(135deg, var(--landing-bg, #080808) 0%, rgba(184,168,138,0.06) 40%, var(--landing-bg, #080808) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative lines */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 59px, var(--landing-line, rgba(236,234,230,0.06)) 59px, var(--landing-line, rgba(236,234,230,0.06)) 60px)", opacity: 0.5 }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 29px, var(--landing-line, rgba(236,234,230,0.06)) 29px, var(--landing-line, rgba(236,234,230,0.06)) 30px)", opacity: 0.5 }} />
          {/* Accent glow */}
          <div style={{ position: "absolute", top: "-30px", left: "50%", transform: "translateX(-50%)", width: "300px", height: "200px", background: "radial-gradient(ellipse, var(--app-accent-glow, rgba(184,168,138,0.1)) 0%, transparent 70%)", pointerEvents: "none" }} />
        </div>

        {/* Avatar row — overlaps banner */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "0 28px 24px",
            flexWrap: "wrap",
            gap: "12px",
            background: "var(--color-bg-card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", marginTop: "-40px" }}>
            {/* Avatar */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--color-bg)",
                border: "3px solid var(--color-bg-card)",
                fontSize: "28px",
                fontWeight: 500,
                color: "var(--app-accent, #b8a88a)",
                boxShadow: "0 0 0 1px var(--app-accent-border, rgba(184,168,138,0.3))",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "?"}
              {/* Online dot */}
              <div
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "4px",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#22C55E",
                  border: "2px solid var(--color-bg-card)",
                }}
              />
            </div>
            <div style={{ paddingBottom: "4px" }}>
              <p style={{ fontSize: "20px", fontWeight: 500, color: "var(--color-text)", margin: 0, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                {user?.name || "Unnamed"}
              </p>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "3px 0 0" }}>
                {user?.email}
              </p>
              <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "4px 0 0", letterSpacing: "0.04em" }}>
                Member since {memberSince}
              </p>
            </div>
          </div>

          {/* Quick stats pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingBottom: "4px" }}>
            <div style={{ padding: "6px 14px", borderRadius: "999px", background: "var(--app-accent-bg, rgba(184,168,138,0.06))", border: "1px solid var(--app-accent-border, rgba(184,168,138,0.15))", fontSize: "12px", color: "var(--color-text-secondary)" }}>
              <strong style={{ color: "var(--color-text)", fontWeight: 600 }}>{totalSessions}</strong>{" "}session{totalSessions !== 1 ? "s" : ""}
            </div>
            {avgScore != null && (
              <div style={{ padding: "6px 14px", borderRadius: "999px", background: "var(--app-accent-bg, rgba(184,168,138,0.06))", border: "1px solid var(--app-accent-border, rgba(184,168,138,0.15))", fontSize: "12px", color: "var(--color-text-secondary)" }}>
                Avg <strong style={{ color: "var(--app-accent, #b8a88a)", fontWeight: 600 }}>{avgScore}%</strong>
              </div>
            )}
            <div style={{ padding: "6px 14px", borderRadius: "999px", background: "var(--app-accent-bg, rgba(184,168,138,0.06))", border: "1px solid var(--app-accent-border, rgba(184,168,138,0.15))", fontSize: "12px", color: "var(--color-text-secondary)" }}>
              <strong style={{ color: "var(--color-text)", fontWeight: 600 }}>{totalMinutes}</strong>{" "}min practiced
            </div>
          </div>
        </div>
      </div>

      {/* ─── Below banner: 2-column layout ─────────── */}
      <div
        className="max-md:grid-cols-1"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <StatsSection
            totalSessions={totalSessions}
            totalMinutes={totalMinutes}
            avgScore={avgScore}
          />
          <AppearanceToggle theme={theme} onToggle={toggle} />
          <IdentityCard user={user} memberSince={memberSince} key={identityEditKey} />
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <AccountDetails
            email={user?.email}
            githubUsername={githubUsername}
            memberSince={memberSince}
            onEdit={() => setIdentityEditKey((k) => k + 1)}
          />
          <ResumeVault resumes={resumes} />
          <StreakHeatmap interviews={interviews} />
        </div>
      </div>
    </div>
  )
}
