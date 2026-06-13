# AI Interview Lab

AI-powered voice interview platform. Practice technical interviews with real-time AI feedback powered by Google Gemini.

## Architecture

```
ai-interview/
├── apps/
│   ├── backend/     # Elysia.js HTTP server + WebSocket server for real-time audio
│   └── frontend/    # React 19 SPA with Tailwind CSS 4
├── packages/
│   ├── db/          # Prisma ORM (PostgreSQL)
│   ├── shared/      # Zod schemas and shared types
│   ├── ui/          # Shared UI components
│   ├── eslint-config/
│   └── typescript-config/
```

## Quick Start

```bash
# Install dependencies
bun install

# Set up database (requires PostgreSQL running)
bun run --filter @ai-interview/db prisma migrate dev

# Copy environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Start both backend and frontend
bun run dev
```

- **Backend** → http://localhost:3000 (API) + ws://localhost:8080 (WebSocket)
- **Frontend** → http://localhost:5173

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps in development mode |
| `bun run build` | Build all apps and packages |
| `bun run lint` | Run ESLint across all packages |
| `bun run check-types` | Run TypeScript type checking |
| `bun run format` | Format code with Prettier |

## Key Features

- **Voice Interviews** — Real-time audio streaming via WebSocket + Gemini Live API
- **Resume Analysis** — Upload resumes, AI generates personalized questions
- **GitHub Integration** — Analyze GitHub profile for context-aware questions
- **AI Evaluation** — Post-interview scoring across communication, technical, and problem-solving
- **Email Verification** — OTP-based email verification via Resend
- **Rate Limiting** — FREE tier: 3 interviews per 7 days, 15 min per interview
