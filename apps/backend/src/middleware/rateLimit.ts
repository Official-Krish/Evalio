import { rateLimit } from "elysia-rate-limit";

/**
 * Global rate limit — applied to every route on the app.
 * 100 requests per 60 seconds per IP.
 */
export const globalRateLimit = rateLimit({
  duration: 60_000,
  max: 100,
  generator: (req, server) => server?.requestIP(req)?.address ?? "unknown",
  errorResponse: new Response(
    JSON.stringify({
      error: "Too many requests. Please slow down and try again shortly.",
    }),
    { status: 429, headers: { "Content-Type": "application/json" } },
  ),
});

export const strictRateLimit = rateLimit({
  duration: 60_000,
  max: 10,
  generator: (req, server) => server?.requestIP(req)?.address ?? "unknown",
  errorResponse: new Response(
    JSON.stringify({
      error: "Too many requests. Please wait a moment before trying again.",
    }),
    { status: 429, headers: { "Content-Type": "application/json" } },
  ),
});
