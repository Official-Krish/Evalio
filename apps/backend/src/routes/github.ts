import { Elysia, t } from "elysia"
import { prisma } from "../lib/prisma"
import { authGuard } from "../middleware/auth"

export const githubRoutes = new Elysia({ prefix: "/github" })
  .guard({}, (app) =>
    app
      .use(authGuard)
      .get("/", async ({ user }) => {
        const profile = await prisma.githubProfile.findUnique({
          where: { userId: user.id },
        })
        return { profile }
      })
      .put(
        "/",
        async ({ user, body }) => {
          const profile = await prisma.githubProfile.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              username: body.username,
              summary: body.summary ?? "",
              languages: body.languages ?? [],
              projects: body.projects ?? [],
            },
            update: {
              username: body.username,
              ...(body.summary !== undefined && { summary: body.summary }),
              ...(body.languages !== undefined && { languages: body.languages }),
              ...(body.projects !== undefined && { projects: body.projects }),
            },
          })

          await prisma.candidateProfile.update({
            where: { userId: user.id },
            data: { githubUsername: body.username },
          })

          return { profile }
        },
        {
          body: t.Object({
            username: t.String(),
            summary: t.Optional(t.String()),
            languages: t.Optional(t.Any()),
            projects: t.Optional(t.Any()),
          }),
        }
      )
      .delete("/", async ({ user }) => {
        await prisma.githubProfile.deleteMany({
          where: { userId: user.id },
        })
        await prisma.candidateProfile.update({
          where: { userId: user.id },
          data: { githubUsername: null },
        })
        return { success: true }
      })
  )
