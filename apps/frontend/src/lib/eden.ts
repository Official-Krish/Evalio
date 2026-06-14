import { treaty } from "@elysiajs/eden"
import type { App } from "@evalio/backend"

const backendUrl: string | undefined =
  typeof import.meta.env !== "undefined"
    ? (import.meta.env as Record<string, string | undefined>).VITE_BACKEND_URL
    : undefined

const base = backendUrl || (typeof window !== "undefined" ? window.location.origin : "")

export const client = treaty<App>(base, {
  fetch: {
    credentials: "include",
  },
})
