import { Elysia, t } from "elysia"
import { jwt } from "@elysia/jwt"
import { prisma } from "../lib/prisma"
import { authGuard } from "../middleware/auth"
import { strictRateLimit } from "../middleware/rateLimit"
import { sendOtpEmail, sendWelcomeEmail, sendResetOtpEmail } from "../lib/email"

const SECRET = Bun.env.JWT_SECRET || "dev-secret"

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(strictRateLimit)
  .use(jwt({ secret: SECRET, exp: "7d" }))
  .post(
    "/signup",
    async ({ body, set }) => {
      if (!PASSWORD_REGEX.test(body.password)) {
        set.status = 400
        return {
          error:
            "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
        }
      }

      const existing = await prisma.user.findUnique({
        where: { email: body.email },
      })
      if (existing) {
        set.status = 409
        return { error: "Email already registered" }
      }

      const hashed = await Bun.password.hash(body.password)
      const otp = generateOtp()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

      const user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: hashed,
          verificationOtp: otp,
          verificationOtpExpiry: otpExpiry,
          candidate: {
            create: {},
          },
        },
        select: { id: true, email: true, name: true, role: true, emailVerified: true },
      })

      const sent = await sendOtpEmail(body.email, body.name ?? "there", otp)
      if (!sent) {
        console.warn("[auth] OTP email failed to send, but user was created")
      }

      return {
        user,
        message: "Account created. Please verify your email using the OTP sent.",
      }
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
    "/verify-otp",
    async ({ body, cookie, jwt, set }) => {
      const user = await prisma.user.findUnique({
        where: { email: body.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          verificationOtp: true,
          verificationOtpExpiry: true,
        },
      })

      if (!user) {
        set.status = 404
        return { error: "User not found" }
      }

      if (user.emailVerified) {
        return { message: "Email already verified", verified: true }
      }

      if (!user.verificationOtp || !user.verificationOtpExpiry) {
        set.status = 400
        return { error: "No OTP requested. Please sign up again." }
      }

      if (new Date() > user.verificationOtpExpiry) {
        set.status = 400
        return { error: "OTP has expired. Request a new one." }
      }

      if (user.verificationOtp !== body.otp) {
        set.status = 400
        return { error: "Invalid OTP" }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationOtp: null,
          verificationOtpExpiry: null,
        },
      })

      const token = await jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      })
      cookie.token!.set({
        value: token,
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "/",
        sameSite: "lax",
      })

      sendWelcomeEmail(user.email, user.name ?? "there").catch(() => {})

      return {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        verified: true,
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        otp: t.String({ length: 6 }),
      }),
    }
  )
  .post(
    "/resend-otp",
    async ({ body, set }) => {
      const user = await prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true, email: true, name: true, emailVerified: true },
      })

      if (!user) {
        set.status = 404
        return { error: "User not found" }
      }

      if (user.emailVerified) {
        return { message: "Email already verified" }
      }

      const otp = generateOtp()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationOtp: otp,
          verificationOtpExpiry: otpExpiry,
        },
      })

      const sent = await sendOtpEmail(user.email, user.name ?? "there", otp)
      if (!sent) {
        set.status = 500
        return { error: "Failed to send OTP email. Please try again." }
      }

      return { message: "OTP resent to your email" }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, cookie, jwt, set }) => {
      const user = await prisma.user.findUnique({
        where: { email: body.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          password: true,
          emailVerified: true,
        },
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

      if (!user.emailVerified) {
        set.status = 403
        return {
          error: "Please verify your email before signing in",
          needsVerification: true,
          email: user.email,
        }
      }

      const token = await jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      })
      cookie.token!.set({
        value: token,
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "/",
        sameSite: "lax",
      })

      return {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      }
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
  .post(
    "/forgot-password",
    async ({ body, set }) => {
      const user = await prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true, email: true, name: true },
      })

      if (!user) {
        return { message: "If that email exists, a reset code has been sent." }
      }

      const otp = generateOtp()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationOtp: otp,
          verificationOtpExpiry: otpExpiry,
        },
      })

      const sent = await sendResetOtpEmail(user.email, user.name ?? "there", otp)
      if (!sent) {
        set.status = 500
        return { error: "Failed to send reset email. Please try again." }
      }

      return { message: "If that email exists, a reset code has been sent." }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
      }),
    }
  )
  .post(
    "/reset-password",
    async ({ body, set }) => {
      if (!PASSWORD_REGEX.test(body.password)) {
        set.status = 400
        return {
          error:
            "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
        }
      }

      const user = await prisma.user.findUnique({
        where: { email: body.email },
        select: {
          id: true,
          verificationOtp: true,
          verificationOtpExpiry: true,
        },
      })

      if (!user) {
        set.status = 404
        return { error: "User not found" }
      }

      if (!user.verificationOtp || !user.verificationOtpExpiry) {
        set.status = 400
        return { error: "No reset code requested." }
      }

      if (new Date() > user.verificationOtpExpiry) {
        set.status = 400
        return { error: "Reset code has expired. Request a new one." }
      }

      if (user.verificationOtp !== body.otp) {
        set.status = 400
        return { error: "Invalid reset code" }
      }

      const hashed = await Bun.password.hash(body.password)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashed,
          verificationOtp: null,
          verificationOtpExpiry: null,
        },
      })

      return { message: "Password has been reset successfully." }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        otp: t.String({ length: 6 }),
        password: t.String({ minLength: 8 }),
      }),
    }
  )
  .guard({}, (app) =>
    app.use(authGuard).get("/me", ({ user }) => ({ user }))
  )
