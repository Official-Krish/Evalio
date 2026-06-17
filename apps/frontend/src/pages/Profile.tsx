import { useQuery } from "@tanstack/react-query";
import { useSession } from "../lib/auth";
import { IdentityCard } from "../components/Profile/IdentityCard";
import { ResumeVault } from "../components/Profile/ResumeVault";
import { StreakHeatmap } from "../components/Profile/StreakHeatmap";
import { SkillProfileCard } from "../components/Profile/SkillProfileCard";
import { IdentityProfileCard } from "../components/Dashboard/IdentityProfileCard";
import { FailurePatternDetailCard } from "../components/Profile/FailurePatternDetailCard";
import { GithubIntegrationCard } from "../components/Profile/GithubIntegrationCard";
import { api } from "../lib/api";
import { usePageTitle } from "@/lib/usePageTitle";
import type { InterviewSession, Resume } from "@evalio/shared";

export function ProfilePage() {
  usePageTitle("Profile");
  const { data: session } = useSession();
  const user = session?.user;

  // Fetch full user details
  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: () => api.getUser(),
    enabled: !!user,
  });

  // Fetch interviews history
  const { data: interviewsData } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.listInterviews(0, 100),
    select: (d) => d.interviews as InterviewSession[],
  });

  // Fetch resumes
  const { data: resumesData } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.listResumes(),
    select: (d) => d.resumes as Resume[],
  });

  // Fetch AI skill profile
  const { data: skillsData, isLoading: skillsLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: api.getSkillProfile,
    enabled: !!user,
  });

  const failurePatterns =
    (skillsData?.profile as { failurePatterns?: unknown } | null)
      ?.failurePatterns ?? [];
  const normalizedPatterns = Array.isArray(failurePatterns)
    ? failurePatterns
    : [];

  const identityTraits =
    (skillsData?.profile as { identityTraits?: unknown } | null)
      ?.identityTraits ?? null;

  // Fetch Github details
  const { data: githubProfileData } = useQuery({
    queryKey: ["githubProfile"],
    queryFn: api.getGithubProfile,
    enabled: !!user,
  });

  const interviews = interviewsData ?? [];
  const resumes = resumesData ?? [];
  const completedCount = interviews.filter(
    (i) => i.status === "COMPLETED",
  ).length;

  const userProfile = userData?.user as
    | (import("@evalio/shared").User & {
        createdAt?: string;
        candidate?: { githubUsername: string | null };
      })
    | undefined;
  const memberSince = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "—";

  // Combined github username from both candidate record and github profile table
  const githubUsername =
    userProfile?.candidate?.githubUsername ??
    githubProfileData?.profile?.username ??
    null;

  return (
    <div
      style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px 64px" }}
    >
      {/* ─── Bento Grid ───────────────────────────────────────── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
        style={{ alignItems: "start" }}
      >
        {/* Left Column (lg:col-span-5) */}
        <div
          className="lg:col-span-5"
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <IdentityCard
            user={user}
            memberSince={memberSince}
            githubUsername={githubUsername}
          />
          <StreakHeatmap interviews={interviews} />
        </div>

        {/* Right Column (lg:col-span-7) */}
        <div
          className="lg:col-span-7"
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <IdentityProfileCard
            traits={
              identityTraits as
                | import("../constants/signals").IdentityTraits
                | null
            }
            completedCount={completedCount}
          />
          <SkillProfileCard
            profile={skillsData?.profile}
            loading={skillsLoading}
          />
          <FailurePatternDetailCard
            patterns={
              normalizedPatterns as import("../constants/signals").FailurePattern[]
            }
            completedCount={completedCount}
          />
          <GithubIntegrationCard initialUsername={githubUsername} />
          <ResumeVault resumes={resumes} />
        </div>
      </div>
    </div>
  );
}
