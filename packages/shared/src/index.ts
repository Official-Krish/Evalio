import { z } from "zod"

export { companies as COMPANIES, getCompany, getDefaultStyleDepth } from "./companies"
export type { CompanyConfig, CompanyRole } from "./companies"

// ── Password validation ──
export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "At least one uppercase letter")
  .regex(/[a-z]/, "At least one lowercase letter")
  .regex(/[0-9]/, "At least one number")
  .regex(/[^A-Za-z0-9]/, "At least one special character")

export const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

// ── Auth ──
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
})

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
})

export const resendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  password: passwordSchema,
})

// ── Interview Style & Depth ──
export const interviewStyleSchema = z.enum([
  "SUPPORTIVE",
  "PROFESSIONAL",
  "CHALLENGING",
  "BAR_RAISER",
])

export const interviewDepthSchema = z.enum([
  "STANDARD",
  "PROBING",
  "CHALLENGE",
  "BAR_RAISER",
])

// ── Interview ──
export const createInterviewSchema = z.object({
  position: z.string().min(1),
  resumeId: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  jobDescription: z.string().optional(),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  roleTitle: z.string().optional(),
  interviewStyle: interviewStyleSchema.optional(),
  interviewDepth: interviewDepthSchema.optional(),
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
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type ResendOtpInput = z.infer<typeof resendOtpSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>
export type InterviewStatus = z.infer<typeof interviewStatusSchema>
export type InterviewStyle = z.infer<typeof interviewStyleSchema>
export type InterviewDepth = z.infer<typeof interviewDepthSchema>

export type UserRole = "FREE" | "ADMIN"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface InterviewSession {
  id: string
  userId: string
  status: InterviewStatus
  position: string | null
  jobDescription: string | null
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
  summary?: InterviewSummary | null
  interviewStyle?: InterviewStyle | null
  interviewDepth?: InterviewDepth | null
  companyId?: string | null
  companyName?: string | null
  roleTitle?: string | null
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

export interface InterviewSummary {
  id: string
  interviewId: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  improvementAreas: string[]
  recommendedTopics: string[]
  resumeStrengths: string[]
  resumeWeaknesses: string[]
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
