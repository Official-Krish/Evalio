import { Elysia } from "elysia"
import { prisma } from "../lib/prisma"
import { authGuard } from "../middleware/auth"
import { evaluateInterview } from "../services/evaluate"

export const evaluateRoutes = new Elysia()
  .guard({}, (app) =>
    app
      .use(authGuard)
      .get(
        "/interview/:id/evaluate/status",
        async ({ params: { id }, user, set }) => {
          const interview = await prisma.interviewSession.findUnique({
            where: { id },
            select: {
              userId: true,
              overallScore: true,
              communicationScore: true,
              technicalScore: true,
              problemSolvingScore: true,
              summary: { select: { id: true } },
            },
          })
          if (!interview || interview.userId !== user.id) {
            set.status = 404
            return { error: "Interview not found" }
          }

          const scored =
            interview.overallScore != null && interview.summary != null

          return {
            status: scored ? "completed" : ("pending" as const),
            scores: scored
              ? {
                  overall: interview.overallScore,
                  communication: interview.communicationScore,
                  technical: interview.technicalScore,
                  problemSolving: interview.problemSolvingScore,
                }
              : null,
          }
        }
      )
      .post(
        "/interview/:id/evaluate",
        async ({ params: { id }, user, set }) => {
          const interview = await prisma.interviewSession.findUnique({
            where: { id },
          })
          if (!interview || interview.userId !== user.id) {
            set.status = 404
            return { error: "Interview not found" }
          }

          try {
            const result = await evaluateInterview(id)
            return result
          } catch (err) {
            set.status = 500
            return { error: (err as Error).message }
          }
        }
      )
  )
