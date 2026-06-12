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
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "220px 1fr 220px",
        gap: "24px",
        alignItems: "start",
      }}
      className="max-lg:grid-cols-[220px_1fr] max-md:grid-cols-1 py-6"
    >
      {/* Left — Identity */}
      <div className="max-lg:row-span-1">
        <IdentityCard user={user} memberSince={memberSince} key={identityEditKey} />
      </div>

      {/* Middle — Stats / Account / Appearance */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <StatsSection
          totalSessions={totalSessions}
          totalMinutes={totalMinutes}
          avgScore={avgScore}
        />
        <AccountDetails
          email={user?.email}
          githubUsername={githubUsername}
          memberSince={memberSince}
          onEdit={() => setIdentityEditKey((k) => k + 1)}
        />
        <AppearanceToggle theme={theme} onToggle={toggle} />
      </div>

      {/* Right — Resume vault / Streak */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <ResumeVault resumes={resumes} />
        <StreakHeatmap interviews={interviews} />
      </div>
    </div>
  )
}
