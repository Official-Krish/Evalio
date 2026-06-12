import { useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "motion/react"
import { api } from "../lib/api"
import { Button } from "../components/ui/Button"
import type { InterviewSession } from "@ai-interview/shared"
import toast from "react-hot-toast"
import { Card } from "@/components/ui/Card"

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED: "bg-success/10 text-success border-success/20",
    ACTIVE: "bg-accent/10 text-accent border-accent/20",
    CREATED: "bg-warning/10 text-warning border-warning/20",
    FAILED: "bg-danger/10 text-danger border-danger/20",
  }
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colors[status] || ""}`}
    >
      {status}
    </span>
  )
}

function UploadResumeModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await api.uploadResume(file)
      toast.success("Resume uploaded!")
      queryClient.invalidateQueries({ queryKey: ["resumes"] })
      onClose()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Upload Resume</h3>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-[var(--radius-md)] file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:brightness-110 file:cursor-pointer cursor-pointer"
        />
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          Supports PDF, DOCX, TXT
        </p>
        <div className="flex gap-2 mt-4 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} loading={uploading}>
            Upload
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [showUpload, setShowUpload] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.listInterviews(),
    select: (d) => d.interviews,
  })

  return (
    <div className="space-y-8">
      <UploadResumeModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Interviews</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Practice interviews with AI feedback
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowUpload(true)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Resume
          </Button>
            <Button size="sm" onClick={() => navigate("/interview/new")}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Interview
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-[var(--radius-lg)] bg-[var(--color-bg-card)] border border-[var(--color-border)] animate-pulse"
            />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="text-center py-12">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 text-[var(--color-text-muted)]"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
          <p className="text-[var(--color-text-secondary)]">
            No interviews yet
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Upload a resume and create your first interview
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowUpload(true)}
            >
              Upload Resume
            </Button>
          <Button size="sm" onClick={() => navigate("/interview/new")}>
              Start Interview
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {data.map(
            (interview: InterviewSession & { _count?: { turns: number } }, i: number) => (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={
                    interview.status === "COMPLETED"
                      ? `/results/${interview.id}`
                      : `/interview/${interview.id}`
                  }
                >
                  <Card className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">
                          {interview.position || "General Interview"}
                        </h3>
                        <StatusBadge status={interview.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                        <span>
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </span>
                        {interview._count &&
                          interview._count.turns > 0 && (
                            <span>{interview._count.turns} turns</span>
                          )}
                        {interview.overallScore != null && (
                          <span className="text-accent font-medium">
                            {Math.round(interview.overallScore)}/100
                          </span>
                        )}
                      </div>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[var(--color-text-muted)] shrink-0"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Card>
                </Link>
              </motion.div>
            )
          )}
        </div>
      )}
    </div>
  )
}
