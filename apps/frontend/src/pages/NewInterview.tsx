import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { motion, AnimatePresence } from "motion/react"
import { api } from "../lib/api"
import { ResumePreview } from "../components/ResumePreview"
import { ProgressStepper } from "../components/Create-Interview/ProgressStepper"
import { InterviewerCards } from "../components/Create-Interview/InterviewerCards"
import { ResumeSection } from "../components/Create-Interview/ResumeSection"
import { SessionCard } from "../components/Create-Interview/SessionCard"
import type { Resume, InterviewSession } from "@ai-interview/shared"
import toast from "react-hot-toast"

const stepVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export function NewInterviewPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [position, setPosition] = useState("")
  const [customPosition, setCustomPosition] = useState("")
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

  const selectedPosition = position === "custom" ? customPosition : position

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
    if (!selectedPosition) { toast.error("Select a position"); return }
    if (!selectedResumeId) { toast.error("Select a resume"); return }
    createMutation.mutate({
      position: selectedPosition,
      resumeId: selectedResumeId,
      githubUrl: githubUrl || undefined,
      jobDescription: jobDescription.trim() || undefined,
    })
  }

  const selectedResume = selectedResumeId
    ? (resumes ?? []).find((r) => r.id === selectedResumeId) ?? null
    : null

  return (
    <div className="max-w-2xl mx-auto" style={{ paddingBottom: step === 2 ? "0" : "160px" }}>
      <ResumePreview resumeId={previewResumeId} open={!!previewResumeId} onClose={() => setPreviewResumeId(null)} />

      <ProgressStepper current={step} onStepClick={(s) => s < step && setStep(s)} />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step-0" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.15 }}>
            <div style={{ marginBottom: "28px" }}>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Choose your interviewer
              </h1>
              {lastCompleted && !position && (
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "6px", margin: "6px 0 0" }}>
                  Last session: {lastCompleted.position}
                  {lastCompleted.overallScore != null ? ` \u00B7 ${Math.round(lastCompleted.overallScore)}%` : ""}
                </p>
              )}
            </div>
            <InterviewerCards
              position={position}
              customPosition={customPosition}
              onPositionChange={setPosition}
              onCustomPositionChange={setCustomPosition}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => position ? setStep(1) : toast.error("Select a role first")}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: position ? "var(--color-accent)" : "var(--color-border-light)",
                  color: position ? "#fff" : "var(--color-text-muted)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: position ? "pointer" : "default",
                  transition: "all 0.15s",
                }}
              >
                Continue to Resume &rarr;
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step-1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.15 }}>
            <div style={{ marginBottom: "28px" }}>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                onClick={() => selectedResumeId ? setStep(2) : toast.error("Select a resume")}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: selectedResumeId ? "var(--color-accent)" : "var(--color-border-light)",
                  color: selectedResumeId ? "#fff" : "var(--color-text-muted)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: selectedResumeId ? "pointer" : "default",
                  transition: "all 0.15s",
                }}
              >
                Review Session &rarr;
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step-2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.15 }}>
            <div style={{ marginBottom: "28px" }}>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Review your session
              </h1>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "6px 0 0" }}>
                Everything looks ready to go
              </p>
            </div>

            {/* Resume preview card */}
            {selectedResume && (
              <div
                style={{
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "transparent",
                  overflow: "hidden",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "16px" }}>{"\u{1F4C4}"}</span>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)", margin: 0 }}>
                        {selectedResume.originalUrl ? (() => {
                          const name = selectedResume.originalUrl.split("/").pop()
                          return name ? name.replace(/\.[^/.]+$/, "") : `Resume v${selectedResume.version}`
                        })() : `Resume v${selectedResume.version}`}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "2px 0 0" }}>
                        Uploaded {new Date(selectedResume.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewResumeId(selectedResume.id)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: "1px solid rgba(99,102,241,0.3)",
                      background: "rgba(99,102,241,0.1)",
                      color: "var(--color-accent)",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Preview
                  </button>
                </div>
                <div
                  style={{
                    height: "200px",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    color: "var(--color-text-muted)",
                    cursor: "pointer",
                  }}
                  onClick={() => setPreviewResumeId(selectedResume.id)}
                >
                  Click to preview full resume
                </div>
              </div>
            )}

            {/* Optional job description */}
            <details
              style={{
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
                placeholder="Paste the job description here so the AI can tailor questions to the specific role requirements..."
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
            </div>

            <SessionCard
              position={position}
              customPosition={customPosition}
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
