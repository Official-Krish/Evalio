import { Elysia } from "elysia"
import type { Cookie } from "elysia"
import { prisma } from "../lib/prisma"

export const authGuard = new Elysia({ name: "auth-guard" })
  .resolve({ as: "scoped" }, async ({ cookie }) => {
    const t = cookie.token as Cookie<any> | undefined
    const tokenValue = t?.value
    if (typeof tokenValue !== "string") {
      throw new Error("Unauthorized")
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenValue },
      select: { id: true, email: true, name: true },
    })
    if (!user) {
      throw new Error("User not found")
    }
    return { user }
  })
