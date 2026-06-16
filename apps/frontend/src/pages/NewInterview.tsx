import { useState, useMemo, useEffect, useRef, startTransition } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../lib/api";
import { useSession } from "../lib/auth";
import { ResumePreview } from "../components/ResumePreview";
import { ProgressStepper } from "../components/Create-Interview/ProgressStepper";
import { CompanyGrid } from "../components/Create-Interview/CompanyGrid";
import { RolePicker } from "../components/Create-Interview/RolePicker";
import { RoundPicker } from "../components/Create-Interview/RoundPicker";
import { StyleDepthPicker } from "../components/Create-Interview/StyleDepthPicker";
import { ResumeSection } from "../components/Create-Interview/ResumeSection";
import { SessionCard } from "../components/Create-Interview/SessionCard";
import { COMPANIES, getDefaultStyleDepth } from "@evalio/shared";
import { usePageTitle } from "@/lib/usePageTitle";
import type {
  Resume,
  InterviewSession,
  InterviewStyle,
  InterviewDepth,
} from "@evalio/shared";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const stepVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Reusable button styles
const btnNext = (enabled: boolean): React.CSSProperties => ({
  padding: "10px 24px",
  borderRadius: "8px",
  border: "none",
  background: enabled ? "var(--landing-fg, #eceae6)" : "var(--color-border)",
  color: enabled ? "var(--landing-bg, #080808)" : "var(--color-text-muted)",
  fontSize: "13px",
  fontWeight: 500,
  cursor: enabled ? "pointer" : "default",
  transition: "all 0.18s ease",
  letterSpacing: "-0.01em",
  opacity: enabled ? 1 : 0.55,
});

const btnBack: React.CSSProperties = {
  padding: "10px 24px",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  background: "transparent",
  color: "var(--color-text-muted)",
  fontSize: "13px",
  fontWeight: 400,
  cursor: "pointer",
  transition: "all 0.15s",
};

export function NewInterviewPage() {
  usePageTitle("New Interview");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const retryId = searchParams.get("retry");
  const [step, setStep] = useState(0);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string | null>(
    null,
  );
  const [customRole, setCustomRole] = useState("");
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [customRound, setCustomRound] = useState("");
  const [interviewStyle, setInterviewStyle] =
    useState<InterviewStyle>("PROFESSIONAL");
  const [interviewDepth, setInterviewDepth] =
    useState<InterviewDepth>("STANDARD");

  // Auto-set style/depth to company defaults when switching to a custom role
  const prevRoleTitle = useRef(selectedRoleTitle);
  useEffect(() => {
    if (
      selectedCompanyId &&
      selectedRoleTitle === null &&
      prevRoleTitle.current !== null
    ) {
      const defaults = getDefaultStyleDepth(selectedCompanyId);
      setInterviewStyle(defaults.style);
      setInterviewDepth(defaults.depth);
    }
    prevRoleTitle.current = selectedRoleTitle;
  }, [selectedRoleTitle, selectedCompanyId]);
  const prevCompanyId = useRef(selectedCompanyId);
  useEffect(() => {
    if (prevCompanyId.current !== selectedCompanyId) {
      setSelectedRound(null);
      setCustomRound("");
    }
    prevCompanyId.current = selectedCompanyId;
  }, [selectedCompanyId]);
  const [selectedResumeId, setSelectedResumeId] = useState<
    string | undefined
  >();
  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [githubOpen, setGithubOpen] = useState(false);
  const [useConnectedGithub, setUseConnectedGithub] = useState(true);
  const [jobDescription, setJobDescription] = useState("");

  const { data: retryInterview } = useQuery({
    queryKey: ["interview", retryId],
    queryFn: () => api.getInterview(retryId!),
    enabled: !!retryId,
    select: (d) => d.interview,
  });

  // Pre-fill form from retry interview
  const retryPrefilled = useRef(false);
  useEffect(() => {
    if (!retryInterview || retryPrefilled.current) return;
    retryPrefilled.current = true;
    startTransition(() => {
      const iv = retryInterview;
      if (iv.companyId && iv.roleTitle) {
        setSelectedCompanyId(iv.companyId);
        setSelectedRoleTitle(iv.roleTitle);
      } else if (iv.companyName) {
        const match = COMPANIES.find((c) => c.name === iv.companyName);
        if (match) {
          setSelectedCompanyId(match.id);
          if (iv.position) {
            const roleMatch = match.roles.find((r) => r.title === iv.position);
            if (roleMatch) setSelectedRoleTitle(roleMatch.title);
          }
        }
      }
      if (iv.position && !iv.roleTitle) setCustomRole(iv.position);
      if (iv.interviewRound) setSelectedRound(iv.interviewRound);
      if (iv.interviewStyle)
        setInterviewStyle(iv.interviewStyle as InterviewStyle);
      if (iv.interviewDepth)
        setInterviewDepth(iv.interviewDepth as InterviewDepth);
      if (iv.resume?.id) setSelectedResumeId(iv.resume.id);
      if (iv.jobDescription) setJobDescription(iv.jobDescription);
    });
  }, [retryInterview]);

  const { data: resumes, refetch: refetchResumes } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.listResumes(),
    select: (d) => d.resumes as Resume[],
  });

  const { data: githubProfile } = useQuery({
    queryKey: ["githubProfile"],
    queryFn: () => api.getGithubProfile(),
    select: (d) => d.profile,
    retry: 1,
    staleTime: 60_000,
  });

  const { data: session } = useSession();
  const currentRole = session?.user?.role;
  const isPro = currentRole === "PRO" || currentRole === "ADMIN";
  const userLimit = currentRole === "ADMIN" ? Infinity : isPro ? 6 : 3;

  const effectiveGithubUrl = useMemo(() => {
    if (useConnectedGithub && githubProfile?.username) {
      return `https://github.com/${githubProfile.username}`;
    }
    return githubUrl;
  }, [useConnectedGithub, githubProfile, githubUrl]);

  // Auto-default to the most recently uploaded resume (user can override)
  const sortedResumes = useMemo(() => {
    if (!resumes) return [];
    return [...resumes].sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
  }, [resumes]);
  const effectiveResumeId = selectedResumeId ?? sortedResumes[0]?.id;

  const { data: interviews } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.listInterviews(0, 100),
    select: (d) =>
      d.interviews as (InterviewSession & { _count?: { turns: number } })[],
  });

  const lastCompleted =
    (interviews ?? []).filter(
      (i) => i.status === "COMPLETED" && i.overallScore != null,
    )[0] ?? null;

  const [now] = useState(Date.now);

  const daysUntilSlot = useMemo(() => {
    if (!interviews) return null;
    if (userLimit === Infinity) return null;
    const since = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const recent = interviews
      .filter((i) => new Date(i.createdAt) >= since)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    if (recent.length < userLimit) return null;
    const oldest = new Date(recent[0]!.createdAt);
    const expiresAt = new Date(oldest.getTime() + 7 * 24 * 60 * 60 * 1000);
    return Math.ceil((expiresAt.getTime() - now) / (24 * 60 * 60 * 1000));
  }, [interviews, now, userLimit]);

  const selectedCompany =
    selectedCompanyId && selectedCompanyId !== "__custom__"
      ? (COMPANIES.find((c) => c.id === selectedCompanyId) ?? null)
      : null;

  const selectedRole =
    selectedCompany && selectedRoleTitle
      ? (selectedCompany.roles.find((r) => r.title === selectedRoleTitle) ??
        null)
      : null;

  const effectivePosition = selectedRole?.title ?? customRole;
  const effectiveRound = selectedRound ?? (customRound || undefined);
  const effectiveCompanyName = selectedCompany?.name ?? null;
  const effectiveCompanyId =
    selectedCompanyId && selectedCompanyId !== "__custom__"
      ? selectedCompanyId
      : null;

  const createMutation = useMutation({
    mutationFn: api.createInterview,
    onSuccess: (data) => {
      toast.success("Interview created!");
      navigate(`/interview/${data.interview.id}`);
    },
    onError: (err: Error) => {
      const msg = err.message ?? "";
      if (msg.toLowerCase().includes("rate limit")) {
        if (isPro) {
          toast.error(msg);
        } else {
          const dayMsg =
            daysUntilSlot != null && daysUntilSlot > 0
              ? ` Your next slot opens in ${daysUntilSlot} day${daysUntilSlot === 1 ? "" : "s"}.`
              : "";
          toast(
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: "4px 0",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-text)",
                  }}
                >
                  Free tier limit reached
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.4,
                  }}
                >
                  You've used all 3 free interviews this 7-day period.{dayMsg}
                </p>
              </div>
              <Link
                to="/contact?subject=Pro+upgrade"
                onClick={() => toast.dismiss()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 16px",
                  borderRadius: 6,
                  background: "var(--landing-accent, #b8a88a)",
                  color: "#080808",
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "opacity 0.15s",
                  alignSelf: "flex-start",
                }}
              >
                Contact for upgrade
              </Link>
            </div>,
            { duration: 10_000 },
          );
        }
      } else {
        const cleanMsg = msg
          .replace(/^Error:\s*/i, "")
          .replace(/^\[.*?\]\s*/, "")
          .trim();
        toast.error(cleanMsg || "Something went wrong. Please try again.");
      }
    },
  });

  const handleCreate = () => {
    if (!effectivePosition) {
      toast.error("Select a position");
      return;
    }
    if (!effectiveResumeId) {
      toast.error("Select a resume");
      return;
    }
    createMutation.mutate({
      position: effectivePosition,
      resumeId: effectiveResumeId,
      githubUrl: effectiveGithubUrl || undefined,
      jobDescription: jobDescription.trim() || undefined,
      companyId: effectiveCompanyId ?? undefined,
      companyName: effectiveCompanyName ?? undefined,
      roleTitle: selectedRoleTitle ?? undefined,
      interviewRound: effectiveRound,
      interviewStyle,
      interviewDepth,
    });
  };

  return (
    <div
      className="max-w-2xl mx-auto"
      style={{ paddingBottom: step === 4 ? "0" : "160px" }}
    >
      <ResumePreview
        resumeId={previewResumeId}
        open={!!previewResumeId}
        onClose={() => setPreviewResumeId(null)}
      />

      <ProgressStepper
        current={step}
        onStepClick={(s) => s < step && setStep(s)}
      />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step-0"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.15 }}
          >
            <div style={{ marginBottom: "28px" }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  margin: "0 0 6px",
                }}
              >
                Step 1 of 5
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
                  fontWeight: 500,
                  letterSpacing: "-0.025em",
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Select a company
              </motion.h1>
              {lastCompleted && !selectedCompanyId && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    fontSize: "13px",
                    color: "var(--color-text-muted)",
                    marginTop: "6px",
                    margin: "6px 0 0",
                  }}
                >
                  Last session: {lastCompleted.position}
                  {lastCompleted.overallScore != null
                    ? ` · ${Math.round(lastCompleted.overallScore)}%`
                    : ""}
                </motion.p>
              )}
            </div>
            <CompanyGrid
              selectedCompanyId={selectedCompanyId}
              onSelect={(id) => {
                setSelectedCompanyId(id);
                if (id) setStep(1);
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <motion.button
                onClick={() => setStep(selectedCompanyId ? 1 : 4)}
                whileHover={{ opacity: 0.88 }}
                whileTap={{ scale: 0.97 }}
                style={btnNext(true)}
              >
                {selectedCompanyId ? "Continue" : "Skip"} →
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-1"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.15 }}
          >
            <div style={{ marginBottom: "28px" }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  margin: "0 0 6px",
                }}
              >
                Step 2 of 5
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
                  fontWeight: 500,
                  letterSpacing: "-0.025em",
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {selectedCompany
                  ? `Role at ${selectedCompany.name}`
                  : "Enter your role"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  margin: "6px 0 0",
                }}
              >
                {selectedCompany
                  ? "Select the position you're applying for"
                  : "Type the role you're targeting"}
              </motion.p>
            </div>
            <RolePicker
              companyId={selectedCompanyId}
              selectedRoleTitle={selectedRoleTitle}
              customRole={customRole}
              onSelectRole={setSelectedRoleTitle}
              onCustomRoleChange={setCustomRole}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "24px",
              }}
            >
              <motion.button
                onClick={() => setStep(0)}
                whileTap={{ scale: 0.97 }}
                style={btnBack}
              >
                ← Back
              </motion.button>
              <motion.button
                onClick={() => {
                  if (effectivePosition) setStep(2);
                  else toast.error("Select a role first");
                }}
                whileHover={{ opacity: effectivePosition ? 0.88 : 1 }}
                whileTap={{ scale: 0.97 }}
                style={btnNext(!!effectivePosition)}
              >
                Continue to Round →
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.15 }}
          >
            <div style={{ marginBottom: "28px" }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  margin: "0 0 6px",
                }}
              >
                Step 3 of 5
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
                  fontWeight: 500,
                  letterSpacing: "-0.025em",
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Interview round
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  margin: "6px 0 0",
                }}
              >
                {selectedCompany
                  ? `What stage at ${selectedCompany.name}?`
                  : "What type of interview round?"}
              </motion.p>
            </div>
            <RoundPicker
              companyId={selectedCompanyId}
              selectedRound={selectedRound}
              customRound={customRound}
              onSelectRound={setSelectedRound}
              onCustomRoundChange={setCustomRound}
              onSkip={() => {
                setStep(3);
                setSelectedRound(null);
                setCustomRound("");
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "24px",
              }}
            >
              <motion.button
                onClick={() => setStep(1)}
                whileTap={{ scale: 0.97 }}
                style={btnBack}
              >
                ← Back
              </motion.button>
              <motion.button
                onClick={() => setStep(3)}
                whileHover={{ opacity: 0.88 }}
                whileTap={{ scale: 0.97 }}
                style={btnNext(true)}
              >
                Continue to Style →
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.15 }}
          >
            <div style={{ marginBottom: "28px" }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  margin: "0 0 6px",
                }}
              >
                Step 4 of 5
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
                  fontWeight: 500,
                  letterSpacing: "-0.025em",
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Style & Depth
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  margin: "6px 0 0",
                }}
              >
                Choose how the AI interviews you
              </motion.p>
            </div>
            <StyleDepthPicker
              style={interviewStyle}
              depth={interviewDepth}
              onStyleChange={setInterviewStyle}
              onDepthChange={setInterviewDepth}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "24px",
              }}
            >
              <motion.button
                onClick={() => setStep(2)}
                whileTap={{ scale: 0.97 }}
                style={btnBack}
              >
                ← Back
              </motion.button>
              <motion.button
                onClick={() => setStep(4)}
                whileHover={{ opacity: 0.88 }}
                whileTap={{ scale: 0.97 }}
                style={btnNext(true)}
              >
                Continue to Resume →
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step-4"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.15 }}
          >
            <ResumeSection
              resumes={resumes ?? []}
              selectedResumeId={effectiveResumeId}
              githubUrl={effectiveGithubUrl}
              githubOpen={githubOpen}
              githubProfile={githubProfile}
              useConnectedGithub={useConnectedGithub}
              onResumeSelect={setSelectedResumeId}
              onPreviewResume={setPreviewResumeId}
              onResumesRefetch={() => refetchResumes()}
              onGithubUrlChange={(url) => {
                setGithubUrl(url);
                setUseConnectedGithub(false);
              }}
              onGithubToggle={() => setGithubOpen((p) => !p)}
              onUseConnectedGithub={() => {
                setUseConnectedGithub(true);
                setGithubOpen(false);
                if (githubProfile?.username) {
                  setGithubUrl(`https://github.com/${githubProfile.username}`);
                }
              }}
            />

            {/* Job description */}
            <details
              style={{
                marginTop: "24px",
                marginBottom: "24px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "16px 20px",
                fontSize: "13px",
                color: "var(--color-text-secondary)",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 500,
                  color: "var(--color-text)",
                  fontSize: "14px",
                  userSelect: "none",
                }}
              >
                Add job description (optional)
              </summary>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here so the AI can tailor questions..."
                rows={6}
                style={{
                  marginTop: "12px",
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent",
                  color: "var(--color-text)",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </details>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "32px",
              }}
            >
              <motion.button
                onClick={() => setStep(3)}
                whileTap={{ scale: 0.97 }}
                style={btnBack}
              >
                ← Back
              </motion.button>
            </div>

            {selectedCompany && selectedRole && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  marginBottom: "20px",
                  padding: "14px 18px",
                  borderRadius: "10px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg-card)",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--color-text)",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {selectedCompany.name} — {selectedRole.title}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                    margin: "4px 0 0",
                  }}
                >
                  {interviewStyle === "SUPPORTIVE"
                    ? "Supportive"
                    : interviewStyle === "PROFESSIONAL"
                      ? "Professional"
                      : interviewStyle === "CHALLENGING"
                        ? "Challenging"
                        : "Bar Raiser"}{" "}
                  ·{" "}
                  {interviewDepth === "STANDARD"
                    ? "Standard"
                    : interviewDepth === "PROBING"
                      ? "Probing"
                      : interviewDepth === "CHALLENGE"
                        ? "Challenge"
                        : "Bar Raiser"}{" "}
                  · ~{selectedRole.duration}min
                </p>
              </motion.div>
            )}

            <SessionCard
              position={effectivePosition ?? ""}
              customPosition={customRole}
              selectedResumeId={effectiveResumeId}
              resumes={resumes ?? []}
              isPending={createMutation.isPending}
              onCreate={handleCreate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
