import { Elysia, t } from "elysia"
import { prisma } from "../lib/prisma"
import { authGuard } from "../middleware/auth"
import { extractUsername, parseGithubProfile } from "../utils/githubParser"
import { strictRateLimit } from "../middleware/rateLimit"

export const interviewRoutes = new Elysia({ prefix: "/interview" })
  .use(strictRateLimit)
  .guard({}, (app) =>
    app
      .use(authGuard)
      .post(
        "/create",
        async ({ user, body, set }) => {
          // Rate limit: FREE users can only create 3 interviews per 7 days
          if (user.role !== "ADMIN") {
            const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            const recentCount = await prisma.interviewSession.count({
              where: {
                userId: user.id,
                createdAt: { gte: since },
              },
            })
            if (recentCount >= 3) {
              set.status = 429
              return {
                error: "Rate limit reached. Free users can only create 3 interviews per 7 days.",
              }
            }
          }

          const latestResume = await prisma.resume.findFirst({
            where: { userId: user.id },
            orderBy: { version: "desc" },
          })
          if (!latestResume) {
            set.status = 400
            return { error: "Upload a resume before creating an interview" }
          }

          const resumeId = body.resumeId ?? latestResume.id
          const resume = await prisma.resume.findFirst({
            where: { id: resumeId, userId: user.id },
          })
          if (!resume) {
            set.status = 400
            return { error: "Invalid resume selected" }
          }

          if (body.githubUrl) {
            const username = extractUsername(body.githubUrl)
            if (username) {
              try {
                const parsed = await parseGithubProfile(username)
                await prisma.githubProfile.upsert({
                  where: { userId: user.id },
                  create: {
                    userId: user.id,
                    username: parsed.username,
                    summary: parsed.summary,
                    languages: parsed.languages,
                    projects: parsed.projects,
                  },
                  update: {
                    username: parsed.username,
                    summary: parsed.summary,
                    languages: parsed.languages,
                    projects: parsed.projects,
                    analyzedAt: new Date(),
                  },
                })
                await prisma.candidateProfile.update({
                  where: { userId: user.id },
                  data: { githubUsername: parsed.username },
                })
              } catch {
                // GitHub fetch failed, continue without profile
              }
            }
          }

          const interview = await prisma.interviewSession.create({
            data: {
              userId: user.id,
              status: "CREATED",
              position: body.position,
              jobDescription: body.jobDescription,
              resumeId: resume.id,
            },
          })

          return { interview }
        },
        {
          body: t.Object({
            position: t.Optional(t.String()),
            resumeId: t.Optional(t.String()),
            githubUrl: t.Optional(t.String()),
            jobDescription: t.Optional(t.String()),
          }),
        }
      )
      .get("/", async ({ user, query }) => {
        const interviews = await prisma.interviewSession.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          skip: Number(query.skip) || 0,
          take: Math.min(Number(query.take) || 20, 100),
          include: {
            _count: { select: { turns: true } },
            resume: { select: { id: true, version: true } },
          },
        })
        return { interviews }
      })
      .get("/:id", async ({ params: { id }, user, set }) => {
        const interview = await prisma.interviewSession.findUnique({
          where: { id },
          include: {
            turns: { orderBy: { createdAt: "asc" } },
            summary: true,
            resume: { select: { id: true, version: true, originalUrl: true } },
          },
        })
        if (!interview || interview.userId !== user.id) {
          set.status = 404
          return { error: "Interview not found" }
        }
        return { interview }
      })
      .patch(
        "/:id",
        async ({ params: { id }, user, body, set }) => {
          const interview = await prisma.interviewSession.findUnique({
            where: { id },
          })
          if (!interview || interview.userId !== user.id) {
            set.status = 404
            return { error: "Interview not found" }
          }

          const updated = await prisma.interviewSession.update({
            where: { id },
            data: {
              ...(body.status && { status: body.status }),
              ...(body.startedAt !== undefined && { startedAt: body.startedAt }),
              ...(body.endedAt !== undefined && { endedAt: body.endedAt }),
              ...(body.overallScore !== undefined && {
                overallScore: body.overallScore,
              }),
              ...(body.communicationScore !== undefined && {
                communicationScore: body.communicationScore,
              }),
              ...(body.technicalScore !== undefined && {
                technicalScore: body.technicalScore,
              }),
              ...(body.problemSolvingScore !== undefined && {
                problemSolvingScore: body.problemSolvingScore,
              }),
              ...(body.durationSeconds !== undefined && {
                durationSeconds: body.durationSeconds,
              }),
            },
          })
          return { interview: updated }
        },
        {
          body: t.Object({
            status: t.Optional(
              t.Enum({
                CREATED: "CREATED",
                ACTIVE: "ACTIVE",
                COMPLETED: "COMPLETED",
                FAILED: "FAILED",
                CANCELLED: "CANCELLED",
              })
            ),
            startedAt: t.Optional(t.Nullable(t.Date())),
            endedAt: t.Optional(t.Nullable(t.Date())),
            overallScore: t.Optional(t.Nullable(t.Number())),
            communicationScore: t.Optional(t.Nullable(t.Number())),
            technicalScore: t.Optional(t.Nullable(t.Number())),
            problemSolvingScore: t.Optional(t.Nullable(t.Number())),
            durationSeconds: t.Optional(t.Nullable(t.Number())),
          }),
        }
      )
  )
