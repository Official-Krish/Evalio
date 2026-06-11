import { Elysia, t } from "elysia"
import { prisma } from "../lib/prisma"
import { authGuard } from "../middleware/auth"

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/signup",
    async ({ body, cookie, set }) => {
      const existing = await prisma.user.findUnique({
        where: { email: body.email },
      })
      if (existing) {
        set.status = 409
        return { error: "Email already registered" }
      }

      const hashed = await Bun.password.hash(body.password)
      const user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: hashed,
          candidate: {
            create: {},
          },
        },
        select: { id: true, email: true, name: true },
      })

      cookie.token!.set({
        value: user.id,
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "/",
        sameSite: "lax",
      })

      return { user }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
        name: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, cookie, set }) => {
      const user = await prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true, email: true, name: true, password: true },
      })
      if (!user) {
        set.status = 401
        return { error: "Invalid email or password" }
      }

      const valid = await Bun.password.verify(body.password, user.password)
      if (!valid) {
        set.status = 401
        return { error: "Invalid email or password" }
      }

      cookie.token!.set({
        value: user.id,
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "/",
        sameSite: "lax",
      })

      return { user: { id: user.id, email: user.email, name: user.name } }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  .post("/logout", ({ cookie }) => {
    cookie.token!.remove()
    return { success: true }
  })
  .guard({}, (app) =>
    app.use(authGuard).get("/me", ({ user }) => ({ user }))
  )
