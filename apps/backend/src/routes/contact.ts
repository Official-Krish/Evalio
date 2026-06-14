import { Elysia, t } from "elysia"
import { sendContactEmail } from "../lib/email"

const emailRateLimit = new Map<string, number>()
const EMAIL_WINDOW_MS = 3_600_000 // 1 hour
const EMAIL_MAX = 1

export const contactRoutes = new Elysia({ prefix: "/contact" })
  .post(
    "/send",
    async ({ body, set, request }) => {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown"

      // per-IP rate limit: 5 submissions per hour
      const ipKey = `ip:${ip}`
      const ipCount = emailRateLimit.get(ipKey) ?? 0
      if (ipCount >= 5) {
        set.status = 429
        return { error: "Too many messages from this IP. Try again later." }
      }

      // per-email rate limit: 1 submission per hour
      const emailKey = `email:${body.email.toLowerCase().trim()}`
      const emailCount = emailRateLimit.get(emailKey) ?? 0
      if (emailCount >= EMAIL_MAX) {
        set.status = 429
        return { error: "You can only send one message per hour. Please wait before trying again." }
      }

      const sent = await sendContactEmail(body.name, body.email, body.subject, body.message)
      if (!sent) {
        set.status = 500
        return { error: "Failed to send message. Please try again later." }
      }

      // increment both counters
      emailRateLimit.set(ipKey, ipCount + 1)
      emailRateLimit.set(emailKey, emailCount + 1)

      // reset after window
      setTimeout(() => {
        const curr = emailRateLimit.get(ipKey)
        if (curr && curr <= 1) emailRateLimit.delete(ipKey)
        else if (curr) emailRateLimit.set(ipKey, curr - 1)

        const currE = emailRateLimit.get(emailKey)
        if (currE && currE <= 1) emailRateLimit.delete(emailKey)
        else if (currE) emailRateLimit.set(emailKey, currE - 1)
      }, EMAIL_WINDOW_MS)

      return { success: true, message: "Message sent. We'll get back to you soon." }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
        subject: t.String({ minLength: 1 }),
        message: t.String({ minLength: 1 }),
      }),
    }
  )
