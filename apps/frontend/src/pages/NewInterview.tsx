import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { motion } from "motion/react"
import { api } from "../lib/api"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card } from "../components/ui/Card"
import type { Resume } from "@ai-interview/shared"
import toast from "react-hot-toast"

const positions = [
  {
    title: "Software Engineer",
    icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Frontend Engineer",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    title: "Backend Engineer",
    icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
  },
  {
    title: "Data Scientist",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    title: "Product Manager",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    title: "DevOps Engineer",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },
]

export function NewInterviewPage() {
  const navigate = useNavigate()
  const [position, setPosition] = useState("")
  const [customPosition, setCustomPosition] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [selectedResumeId, setSelectedResumeId] = useState<string | undefined>()

  const { data: resumes } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.listResumes(),
    select: (d) => d.resumes,
  })

  const createMutation = useMutation({
    mutationFn: api.createInterview,
    onSuccess: (data) => {
      toast.success("Interview created!")
      navigate(`/interview/${data.interview.id}`)
    },
    onError: (err) => toast.error(err.message),
  })

  const selectedPosition = position === "custom" ? customPosition : position

  const handleCreate = () => {
    if (!selectedPosition) {
      toast.error("Select or enter a position")
      return
    }
    createMutation.mutate({
      position: selectedPosition,
      resumeId: selectedResumeId,
      githubUrl: githubUrl || undefined,
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New Interview
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Configure your practice interview session
        </p>
      </div>

      <Card>
        <h2 className="font-medium mb-4">Position</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {positions.map((p) => {
            const active = position === p.title
            return (
              <motion.button
                key={p.title}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPosition(p.title)}
                className={`
                  flex flex-col items-center gap-1.5 p-3 rounded-[var(--radius-md)] text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-accent/10 text-accent border border-accent/30"
                      : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-accent/20 hover:text-[var(--color-text)]"
                  }
                `}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={p.icon} />
                </svg>
                {p.title}
              </motion.button>
            )
          })}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setPosition("custom")}
            className={`
              flex flex-col items-center gap-1.5 p-3 rounded-[var(--radius-md)] text-sm font-medium transition-all
              ${
                position === "custom"
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-accent/20 hover:text-[var(--color-text)]"
              }
            `}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Custom
          </motion.button>
        </div>
        {position === "custom" && (
          <Input
            value={customPosition}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomPosition(e.target.value)}
            placeholder="Enter position title"
          />
        )}
      </Card>

      <Card>
        <h2 className="font-medium mb-4">Resume</h2>
        {resumes && resumes.length > 0 ? (
          <div className="space-y-2">
            {resumes.map((r: Resume) => (
              <button
                key={r.id}
                onClick={() => setSelectedResumeId(r.id)}
                className={`
                  w-full text-left p-3 rounded-[var(--radius-md)] text-sm transition-all border
                  ${
                    selectedResumeId === r.id
                      ? "bg-accent/10 border-accent/30 text-accent"
                      : "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-accent/20"
                  }
                `}
              >
                <span className="font-medium">v{r.version}</span>
                <span className="text-[var(--color-text-muted)] ml-2">
                  {new Date(r.uploadedAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">
            No resumes uploaded. Upload one from the dashboard first.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="font-medium mb-4">GitHub (optional)</h2>
        <Input
          value={githubUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/username"
        />
      </Card>

      <Button
        size="lg"
        className="w-full"
        onClick={handleCreate}
        loading={createMutation.isPending}
      >
        Start Interview
      </Button>
    </div>
  )
}
