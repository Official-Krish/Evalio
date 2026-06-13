import { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { motion, AnimatePresence } from "motion/react"
import { api } from "../lib/api"
import { ResumePreview } from "../components/ResumePreview"
import { ProgressStepper } from "../components/Create-Interview/ProgressStepper"
import { CompanyGrid } from "../components/Create-Interview/CompanyGrid"
import { RolePicker } from "../components/Create-Interview/RolePicker"
import { StyleDepthPicker } from "../components/Create-Interview/StyleDepthPicker"
import { ResumeSection } from "../components/Create-Interview/ResumeSection"
import { SessionCard } from "../components/Create-Interview/SessionCard"
import { COMPANIES, getDefaultStyleDepth } from "@ai-interview/shared"
import type { Resume, InterviewSession, InterviewStyle, InterviewDepth } from "@ai-interview/shared"
import toast from "react-hot-toast"

const stepVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export function NewInterviewPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string | null>(null)
  const [customRole, setCustomRole] = useState("")
  const [interviewStyle, setInterviewStyle] = useState<InterviewStyle>("PROFESSIONAL")
  const [interviewDepth, setInterviewDepth] = useState<InterviewDepth>("STANDARD")

  // Auto-set style/depth to company defaults when switching to a custom role
  const prevRoleTitle = useRef(selectedRoleTitle)
  useEffect(() => {
    if (selectedCompanyId && selectedRoleTitle === null && prevRoleTitle.current !== null) {
      const defaults = getDefaultStyleDepth(selectedCompanyId)
      setInterviewStyle(defaults.style)
      setInterviewDepth(defaults.depth)
    }
    prevRoleTitle.current = selectedRoleTitle
  }, [selectedRoleTitle, selectedCompanyId])
  const [selectedResumeId, setSelectedResumeId] = useState<string | undefined>()
  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null)
  const [githubUrl, setGithubUrl] = useState("")
  const [githubOpen, setGithubOpen] = useState(false)
  const [jobDescription, setJobDescription] = useState("")

  const { data: resumes, refetch: refetchResumes } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.listResumes(),
    select: (d) => d.resumes as Resume[],
  })

  const { data: interviews } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.listInterviews(0, 100),
    select: (d) => d.interviews as (InterviewSession & { _count?: { turns: number } })[],
  })

  const lastCompleted = (interviews ?? [])
    .filter((i) => i.status === "COMPLETED" && i.overallScore != null)[0] ?? null

  const [now] = useState(Date.now)

  const daysUntilSlot = useMemo(() => {
    if (!interviews) return null
    const since = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const recent = interviews
      .filter((i) => new Date(i.createdAt) >= since)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    if (recent.length < 3) return null
    const oldest = new Date(recent[0]!.createdAt)
    const expiresAt = new Date(oldest.getTime() + 7 * 24 * 60 * 60 * 1000)
    return Math.ceil((expiresAt.getTime() - now) / (24 * 60 * 60 * 1000))
  }, [interviews, now])

  const selectedCompany = selectedCompanyId && selectedCompanyId !== "__custom__"
    ? COMPANIES.find((c) => c.id === selectedCompanyId) ?? null
    : null

  const selectedRole = selectedCompany && selectedRoleTitle
    ? selectedCompany.roles.find((r) => r.title === selectedRoleTitle) ?? null
    : null

  const effectivePosition = selectedRole?.title ?? customRole
  const effectiveCompanyName = selectedCompany?.name ?? null
  const effectiveCompanyId = selectedCompanyId && selectedCompanyId !== "__custom__" ? selectedCompanyId : null

  const createMutation = useMutation({
    mutationFn: api.createInterview,
    onSuccess: (data) => {
      toast.success("Interview created!")
      navigate(`/interview/${data.interview.id}`)
    },
    onError: (err: Error) => {
      const msg = err.message ?? ""
      if (msg.toLowerCase().includes("rate limit") || msg.includes("3 interviews")) {
        const dayMsg = daysUntilSlot != null && daysUntilSlot > 0
          ? ` Your next slot opens in ${daysUntilSlot} day${daysUntilSlot === 1 ? "" : "s"}.`
          : ""
        toast.error(`You've used all 3 free interviews this week.${dayMsg}`, { duration: 6000 })
      } else {
        toast.error(msg || "Failed to create interview")
      }
    },
  })

  const handleCreate = () => {
    if (!effectivePosition) { toast.error("Select a position"); return }
    if (!selectedResumeId) { toast.error("Select a resume"); return }
    createMutation.mutate({
      position: effectivePosition,
      resumeId: selectedResumeId,
      githubUrl: githubUrl || undefined,
      jobDescription: jobDescription.trim() || undefined,
      companyId: effectiveCompanyId ?? undefined,
      companyName: effectiveCompanyName ?? undefined,
      roleTitle: selectedRoleTitle ?? undefined,
      interviewStyle,
      interviewDepth,
    })
  }

  const selectedResume = selectedResumeId
    ? (resumes ?? []).find((r) => r.id === selectedResumeId) ?? null
    : null

  return (
    <div className="max-w-2xl mx-auto" style={{ paddingBottom: step === 3 ? "0" : "160px" }}>
      <ResumePreview resumeId={previewResumeId} open={!!previewResumeId} onClose={() => setPreviewResumeId(null)} />

      <ProgressStepper current={step} onStepClick={(s) => s < step && setStep(s)} />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step-0" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.15 }}>
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text)", lineHeight: 1.2, margin: 0 }}>
                Select a company
              </h1>
              {lastCompleted && !selectedCompanyId && (
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "6px", margin: "6px 0 0" }}>
                  Last session: {lastCompleted.position}
                  {lastCompleted.overallScore != null ? ` · ${Math.round(lastCompleted.overallScore)}%` : ""}
                </p>
              )}
            </div>
            <CompanyGrid selectedCompanyId={selectedCompanyId} onSelect={(id) => { setSelectedCompanyId(id); if (id) setStep(1) }} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                onClick={() => setStep(selectedCompanyId ? 1 : 3)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--landing-fg, #eceae6)",
                  color: "var(--landing-bg, #080808)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "-0.01em",
                }}
              >
                {selectedCompanyId ? "Continue" : "Skip"} &rarr;
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step-1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.15 }}>
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text)", lineHeight: 1.2, margin: 0 }}>
                {selectedCompany ? `Role at ${selectedCompany.name}` : "Enter your role"}
              </h1>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "6px 0 0" }}>
                {selectedCompany ? "Select the position you're applying for" : "Type the role you're targeting"}
              </p>
            </div>
            <RolePicker
              companyId={selectedCompanyId}
              selectedRoleTitle={selectedRoleTitle}
              customRole={customRole}
              onSelectRole={setSelectedRoleTitle}
              onCustomRoleChange={setCustomRole}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
              <button
                onClick={() => setStep(0)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                &larr; Back
              </button>
              <button
                onClick={() => {
                  const hasRole = selectedCompany ? !!selectedRoleTitle : !!customRole
                  if (hasRole) setStep(2)
                  else toast.error("Select a role first")
                }}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: effectivePosition ? "var(--landing-fg, #eceae6)" : "var(--color-border)",
                  color: effectivePosition ? "var(--landing-bg, #080808)" : "var(--color-text-muted)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: effectivePosition ? "pointer" : "default",
                  transition: "all 0.15s",
                  letterSpacing: "-0.01em",
                }}
              >
                Continue to Style &rarr;
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step-2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.15 }}>
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text)", lineHeight: 1.2, margin: 0 }}>
                Style & Depth
              </h1>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "6px 0 0" }}>
                Choose how the AI interviews you
              </p>
            </div>
            <StyleDepthPicker
              style={interviewStyle}
              depth={interviewDepth}
              onStyleChange={setInterviewStyle}
              onDepthChange={setInterviewDepth}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                &larr; Back
              </button>
              <button
                onClick={() => setStep(3)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--landing-fg, #eceae6)",
                  color: "var(--landing-bg, #080808)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "-0.01em",
                }}
              >
                Continue to Resume &rarr;
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step-3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.15 }}>
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text)", lineHeight: 1.2, margin: 0 }}>
                Upload your resume
              </h1>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "6px 0 0" }}>
                We'll tailor questions to your experience
              </p>
            </div>
            <ResumeSection
              resumes={resumes ?? []}
              selectedResumeId={selectedResumeId}
              githubUrl={githubUrl}
              githubOpen={githubOpen}
              onResumeSelect={setSelectedResumeId}
              onPreviewResume={setPreviewResumeId}
              onResumesRefetch={() => refetchResumes()}
              onGithubUrlChange={setGithubUrl}
              onGithubToggle={() => setGithubOpen((p) => !p)}
            />

            {/* Job description */}
            <details style={{
              marginTop: "24px",
              marginBottom: "24px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "16px 20px",
              fontSize: "13px",
              color: "var(--color-text-secondary)",
            }}>
              <summary style={{
                cursor: "pointer",
                fontWeight: 500,
                color: "var(--color-text)",
                fontSize: "14px",
                userSelect: "none",
              }}>
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

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                &larr; Back
              </button>
            </div>

            {selectedCompany && selectedRole && (
              <div style={{
                marginBottom: "20px",
                padding: "16px 20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                  {selectedCompany.name} — {selectedRole.title}
                </p>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "4px 0 0" }}>
                  {interviewStyle === "SUPPORTIVE" ? "Supportive" : interviewStyle === "PROFESSIONAL" ? "Professional" : interviewStyle === "CHALLENGING" ? "Challenging" : "Bar Raiser"} · {interviewDepth === "STANDARD" ? "Standard" : interviewDepth === "PROBING" ? "Probing" : interviewDepth === "CHALLENGE" ? "Challenge" : "Bar Raiser"} · ~{selectedRole.duration}min
                </p>
              </div>
            )}

            <SessionCard
              position={effectivePosition ?? ""}
              customPosition={customRole}
              selectedResumeId={selectedResumeId}
              resumes={resumes ?? []}
              isPending={createMutation.isPending}
              onCreate={handleCreate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
