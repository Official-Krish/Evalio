import { Elysia, t } from "elysia"
import { prisma } from "../lib/prisma"
import { authGuard } from "../middleware/auth"

async function verifyInterview(
  interviewId: string,
  userId: string,
  set: Record<string, unknown>
) {
  const interview = await prisma.interviewSession.findUnique({
    where: { id: interviewId },
  })
  if (!interview || interview.userId !== userId) {
    set.status = 404
    return null
  }
  return interview
}

export const transcriptRoutes = new Elysia()
  .guard({}, (app) =>
    app
      .use(authGuard)
      .post(
        "/interview/:id/transcripts",
        async ({ params: { id }, user, body, set }) => {
          if (!(await verifyInterview(id, user.id, set))) return

          const event = await prisma.transcriptEvent.create({
            data: {
              interviewId: id,
              turnId: body.turnId ?? null,
              role: body.role,
              text: body.text,
              startMs: body.startMs ?? null,
              endMs: body.endMs ?? null,
            },
          })
          return { event }
        },
        {
          body: t.Object({
            role: t.Enum({
              USER: "USER",
              ASSISTANT: "ASSISTANT",
              SYSTEM: "SYSTEM",
            }),
            text: t.String(),
            turnId: t.Optional(t.Nullable(t.String())),
            startMs: t.Optional(t.Nullable(t.Number())),
            endMs: t.Optional(t.Nullable(t.Number())),
          }),
        }
      )
      .post(
        "/interview/:id/transcripts/batch",
        async ({ params: { id }, user, body, set }) => {
          if (!(await verifyInterview(id, user.id, set))) return

          const events = await prisma.transcriptEvent.createMany({
            data: body.events.map((e) => ({
              interviewId: id,
              turnId: e.turnId ?? null,
              role: e.role,
              text: e.text,
              startMs: e.startMs ?? null,
              endMs: e.endMs ?? null,
            })),
          })
          return { count: events.count }
        },
        {
          body: t.Object({
            events: t.Array(
              t.Object({
                role: t.Enum({
                  USER: "USER",
                  ASSISTANT: "ASSISTANT",
                  SYSTEM: "SYSTEM",
                }),
                text: t.String(),
                turnId: t.Optional(t.Nullable(t.String())),
                startMs: t.Optional(t.Nullable(t.Number())),
                endMs: t.Optional(t.Nullable(t.Number())),
              })
            ),
          }),
        }
      )
      .get(
        "/interview/:id/transcripts",
        async ({ params: { id }, user, set }) => {
          if (!(await verifyInterview(id, user.id, set))) return

          const events = await prisma.transcriptEvent.findMany({
            where: { interviewId: id },
            orderBy: { startMs: "asc" },
          })
          return { events }
        }
      )
  )
