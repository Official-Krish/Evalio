import { Elysia } from "elysia"
import { prisma } from "../lib/prisma"
import { authGuard } from "../middleware/auth"

export const profileRoutes = new Elysia({ prefix: "/profile" })
  .guard({}, (app) =>
    app
      .use(authGuard)
      .get("/skills", async ({ user }) => {
        const profile = await prisma.candidateSkillProfile.findUnique({
          where: { userId: user.id },
        })
        return { profile }
      })
  )
