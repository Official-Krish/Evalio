import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysia/jwt";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/user";
import { interviewRoutes } from "./routes/interview";
import { turnRoutes } from "./routes/turn";
import { resumeRoutes } from "./routes/resume";
import { githubRoutes } from "./routes/github";
import { evaluateRoutes } from "./routes/evaluate";
import { companyRoutes } from "./routes/company";
import { profileRoutes } from "./routes/profile";
import { contactRoutes } from "./routes/contact";
import { feedbackRoutes } from "./routes/feedback";
import { globalRateLimit } from "./middleware/rateLimit";

const JWT_SECRET = Bun.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export const app = new Elysia()
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .get("/ready", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .use(globalRateLimit)
  .use(
    cors({
      origin: Bun.env.CORS_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    }),
  )
  .use(
    jwt({
      secret: JWT_SECRET,
      exp: "7d",
    }),
  )
  .group("/api", (app) =>
    app
      .use(authRoutes)
      .use(userRoutes)
      .use(interviewRoutes)
      .use(turnRoutes)
      .use(resumeRoutes)
      .use(githubRoutes)
      .use(evaluateRoutes)
      .use(companyRoutes)
      .use(profileRoutes)
      .use(contactRoutes)
      .use(feedbackRoutes),
  );
