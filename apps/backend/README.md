# @evalio/backend

Elysia.js HTTP server + WebSocket server for real-time AI-powered interviews.

## Stack

- **Runtime:** Bun
- **Framework:** Elysia.js
- **Database:** Prisma + PostgreSQL
- **AI:** Google Gemini Live API (voice)
- **Auth:** JWT (httpOnly cookies)
- **Email:** Resend SDK
- **File Storage:** AWS S3
- **Rate Limiting:** elysia-rate-limit

## Routes

| Route | Description |
|-------|-------------|
| `POST /api/auth/signup` | Create account (sends OTP email) |
| `POST /api/auth/verify-otp` | Verify email with OTP |
| `POST /api/auth/resend-otp` | Resend verification OTP (30s cooldown) |
| `POST /api/auth/login` | Sign in (requires verified email) |
| `POST /api/auth/forgot-password` | Send password reset OTP |
| `POST /api/auth/reset-password` | Reset password with OTP |
| `POST /api/auth/logout` | Clear session |
| `GET /api/auth/me` | Get current user |
| `POST /api/interview/create` | Create interview session |
| `GET /api/interview` | List user's interviews |
| `GET /api/interview/:id` | Get interview with turns |
| `PATCH /api/interview/:id` | Update interview status/scores |
| `POST /api/resumes/upload` | Upload resume |
| `GET /api/resumes` | List user's resumes |
| `GET /api/user` | Get user profile |
| `PATCH /api/user` | Update user profile |
| `GET /health` | Health check |

## WebSocket

Port `8080` — real-time audio interview with Gemini Live API.

1. Client sends `init` with `token` (userId) and `interviewId`
2. Server starts Gemini session with resume/GitHub context
3. Client streams `audio_chunk` (PCM audio)
4. Client signals `audio_stream_end` on turn end
5. AI responds with audio + transcription
6. `end_interview` triggers closing summary and evaluation

## Environment

```env
DATABASE_URL=postgresql://...
PORT=3000
WS_PORT=8080
JWT_SECRET=...
RESEND_API_KEY=re_...
EMAIL_FROM="Name <noreply@...>"
GEMINI_API_KEY=...
AWS_BUCKET_NAME=...
AWS_ACCESS_KEY=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
CDN_BASE_URL=...
CORS_ORIGIN=http://localhost:5173
```

## Scripts

```bash
bun run dev        # Start via turbo
bun src/index.ts   # Start directly
```
