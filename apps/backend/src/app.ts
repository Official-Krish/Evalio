import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { authRoutes } from "./routes/auth"
import { userRoutes } from "./routes/user"
import { interviewRoutes } from "./routes/interview"
import { turnRoutes } from "./routes/turn"
import { transcriptRoutes } from "./routes/transcript"
import { resumeRoutes } from "./routes/resume"
import { githubRoutes } from "./routes/github"
import { evaluateRoutes } from "./routes/evaluate"

export const app = new Elysia()
  .use(cors({
    origin: Bun.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }))
  .use(authRoutes)
  .use(userRoutes)
  .use(interviewRoutes)
  .use(turnRoutes)
  .use(transcriptRoutes)
  .use(resumeRoutes)
  .use(githubRoutes)
  .use(evaluateRoutes)
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
