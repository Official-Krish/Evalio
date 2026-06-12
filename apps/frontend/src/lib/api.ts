import { client } from "./eden"
import type {
  User,
  InterviewSession,
  Resume,
  EvaluationResult,
  EvaluationStatus,
  LoginInput,
  SignupInput,
  CreateInterviewInput,
} from "@ai-interview/shared"

function errorMessage(err: unknown): string {
  if (typeof err === "string") return err
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>
    if (typeof e.value === "string") return e.value
    if (e.message) return String(e.message)
  }
  return "Request failed"
}

export const api = {
  login: async (input: LoginInput) => {
    const { data, error } = await client.api.auth.login.post(input)
    if (error) throw new Error(errorMessage(error.value))
    return data as unknown as { user: User }
  },

  signup: async (input: SignupInput) => {
    const { data, error } = await client.api.auth.signup.post(input)
    if (error) throw new Error(errorMessage(error.value))
    return data as unknown as { user: User }
  },

  me: async () => {
    const { data, error } = await client.api.auth.me.get()
    if (error) return { user: null } as { user: User | null }
    return data as { user: User } | { user: null }
  },

  logout: async () => {
    await client.api.auth.logout.post()
  },

  listResumes: async () => {
    const { data, error } = await client.api.resumes.get()
    if (error) throw new Error(errorMessage(error.value))
    return data as unknown as { resumes: Resume[] }
  },

  uploadResume: async (file: File) => {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/resumes/upload", {
      method: "POST",
      credentials: "include",
      body: form,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Upload failed")
    return data as { resume: Resume }
  },

  listInterviews: async (skip = 0, take = 20) => {
    const { data, error } = await client.api.interview.get({
      query: { skip: String(skip), take: String(take) },
    })
    if (error) throw new Error(errorMessage(error.value))
    return data as unknown as { interviews: InterviewSession[] }
  },

  getInterview: async (id: string) => {
    const { data, error } = await client.api.interview({ id }).get()
    if (error) throw new Error(errorMessage(error.value))
    return data as unknown as { interview: InterviewSession }
  },

  createInterview: async (input: CreateInterviewInput) => {
    const { data, error } = await client.api.interview.create.post(input)
    if (error) throw new Error(errorMessage(error.value))
    return data as unknown as { interview: InterviewSession }
  },

  evaluate: async (id: string) => {
    const { data, error } = await client.api.interview({ id }).evaluate.post()
    if (error) throw new Error(errorMessage(error.value))
    return data as unknown as { evaluation: EvaluationResult }
  },

  evaluationStatus: async (id: string) => {
    const { data, error } = await client.api.interview({ id }).evaluate.status.get()
    if (error) throw new Error(errorMessage(error.value))
    return data as unknown as EvaluationStatus
  },
}
