import { z } from "zod"

// ── Auth ──
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

// ── Interview ──
export const createInterviewSchema = z.object({
  position: z.string().min(1),
  resumeId: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
})

export const interviewStatusSchema = z.enum([
  "CREATED",
  "ACTIVE",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
])

// ── Resume ──
export const resumeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  version: z.number(),
  originalUrl: z.string().nullable(),
  extractedText: z.string().nullable(),
  uploadedAt: z.date(),
})

// ── Types ──
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>
export type InterviewStatus = z.infer<typeof interviewStatusSchema>

export interface User {
  id: string
  name: string
  email: string
}

export interface InterviewSession {
  id: string
  userId: string
  status: InterviewStatus
  position: string | null
  overallScore: number | null
  communicationScore: number | null
  technicalScore: number | null
  problemSolvingScore: number | null
  durationSeconds: number | null
  startedAt: Date | null
  endedAt: Date | null
  createdAt: Date
  resume?: Resume | null
  turns?: InterviewTurn[]
  transcriptEvents?: TranscriptEvent[]
  summary?: InterviewSummary | null
}

export interface InterviewTurn {
  id: string
  interviewId: string
  orderNumber: number
  questionText: string
  answerText: string
  score: number | null
  feedback: string | null
  createdAt: Date
}

export interface TranscriptEvent {
  id: string
  interviewId: string
  turnId: string | null
  role: "USER" | "ASSISTANT" | "SYSTEM"
  text: string
  startMs: number | null
  endMs: number | null
  createdAt: Date
}

export interface InterviewSummary {
  id: string
  interviewId: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  improvementAreas: string[]
  recommendedTopics: string[]
}

export interface Resume {
  id: string
  userId: string
  version: number
  originalUrl: string | null
  extractedText: string | null
  uploadedAt: Date
}

export interface EvaluationResult {
  overallScore: number
  communicationScore: number
  technicalScore: number
  problemSolvingScore: number
  summary: string
  keyStrengths: string[]
  areasForImprovement: string[]
  recommendedTopics: string[]
  turns: { orderNumber: number; score: number; feedback: string }[]
}

export interface EvaluationStatus {
  status: "pending" | "completed"
  scores: {
    overall: number
    communication: number
    technical: number
    problemSolving: number
  } | null
}
