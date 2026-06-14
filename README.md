# AI Evalio

Real-time voice interview simulator powered by Google Gemini. Practice technical and behavioral interviews with AI that adapts to your target company, role, and preferred style — with live audio, interruption handling, and post-interview scoring.

## Architecture

```
ai-interview/
├── apps/
│   ├── backend/          # Elysia.js HTTP server + WebSocket server
│   │   ├── src/
│   │   │   ├── prompt.ts       # Dynamic prompt assembly engine
│   │   │   ├── ws.ts           # WebSocket handler, turn management
│   │   │   ├── gemini.ts       # Gemini Live session wrapper
│   │   │   ├── services/
│   │   │   │   └── evaluate.ts # Post-interview evaluation (Gemini)
│   │   │   └── routes/         # Auth, user, resume, interview CRUD
│   │   └── prisma/             # PostgreSQL schema + migrations
│   └── frontend/               # React 19 SPA
│       └── src/
│           ├── pages/          # NewInterview, Interview, Results, Dashboard
│           ├── components/     # CompanyGrid, RolePicker, StyleDepthPicker, etc.
│           ├── hooks/          # useMicrophone, useAudioPlayer
│           └── lib/            # WebSocket client, API client, auth
├── packages/
│   ├── shared/                 # Zod schemas, shared types, company configs
│   ├── ui/                     # Shared UI primitives
│   ├── eslint-config/
│   └── typescript-config/
```

## Features

### Voice Interview Engine
- **Real-time bidirectional audio** via WebSocket + Gemini Live API (PCM 16kHz)
- **AI can interrupt** mid-answer when answers go off-track
- **User cannot interrupt AI** — mic blocked during AI speech
- **Voice Activity Detection** — Gemini handles end-of-turn detection
- **Incremental transcription** with progressive-refinement dedup

### 16 Company Profiles
Each company has structured culture, interviewer behavior, and role-specific interview data:

| Company | Style | Depth | Roles |
|---------|-------|-------|-------|
| Stripe | Challenging | Challenge | Backend, Payments, Platform |
| Amazon | Bar Raiser | Challenge | SDE, PM, Solutions Architect |
| Google | Professional | Probing | SWE, Data Scientist, UX Engineer |
| Meta | Challenging | Probing | Frontend, ML, Infrastructure |
| Netflix | Bar Raiser | Bar Raiser | Backend, Data, SRE |
| Microsoft | Professional | Standard | SWE, DevOps, AI Engineer |
| Apple | Challenging | Probing | iOS, Hardware, Security |
| Uber | Professional | Challenge | Backend, Mobile, Data Science |
| Airbnb | Supportive | Probing | Fullstack, Design, Staff |
| Datadog | Professional | Standard | SRE, Cloud, Support |
| Deloitte USI | Professional | Probing | Consultant, Data Analyst, Cloud |
| Goldman Sachs | Bar Raiser | Challenge | Quant Dev, Risk, Platform |
| Palantir | Challenging | Bar Raiser | FDE, Data, Security |
| Figma | Supportive | Standard | Design Engineer, Frontend, Platform |
| Notion | Supportive | Standard | Fullstack, Mobile, Infra |
| Startup | Supportive | Challenge | CTO, Founder, Staff |

Roles define `topics`, `evaluationCriteria`, and `mustProbe` — so a Stripe Backend interview (distributed systems, APIs, caching) is completely different from a Stripe PM interview (prioritization, metrics, stakeholder management) even with the same style and depth.

### 4 Interview Styles
Controls _how_ questions are asked — with per-style interruption behavior:

| Style | Approach | Interruption |
|-------|----------|-------------|
| **Supportive** | Conversational, encouraging | Rare, gentle redirection |
| **Professional** | Structured, neutral | When unfocused or repetitive |
| **Challenging** | High-pressure, push for depth | Aggressive, cut off off-track answers |
| **Bar Raiser** | Elite, surgical | Strategic — highest leverage point only |

### 4 Interaction Depths
Controls _how many_ follow-ups and _how hard_ each question is probed:

| Depth | Follow-ups | Challenge Level |
|-------|-----------|-----------------|
| Standard | None | Smooth, conversational |
| Probing | 1-2 per topic | Gentle elaboration requests |
| Challenge | Until defended | Disagree, demand metrics |
| Bar Raiser | Maximum rigor | Skepticism, evidence required |

### Prompt Assembly Engine
Instead of a single static prompt, the system assembles a dynamic prompt from layers:

```
Interview Objective           ← Optimize for signal, not coverage
Candidate History             ← Past scores, strengths, weaknesses
Company Context               ← Culture + Interviewer Approach
Role Context                  ← Topics + Evaluation Criteria + Must Probe
Interview Style               ← How to ask
Interaction Depth             ← How many follow-ups
Resume / GitHub / JD          ← Personalization data
Evaluation Dimensions         ← What to assess (6 dimensions)
Story Extraction              ← Identify reusable stories
Interview Guidelines          ← Practical rules
```

Impact weighting: **Role ~60%** (drives what gets asked), **Style ~25%** (how), **Company ~10%** (cultural emphasis), **Depth ~5%** (follow-up count).

### Evaluation & Scoring
- Post-interview evaluation via Gemini 2.5 Flash
- Per-turn scoring with feedback
- 6 dimension scores: Communication, Technical Depth, Problem Solving, Leadership, Ownership, Decision Making
- Resume-strength correlation
- Candidate skill profile updates over time
- Candidates can retake interviews after 7 days (FREE tier: 3/week)

### Real-time Audio Pipeline

```
Browser Mic → PCM 16kHz → WebSocket → Gemini Live API → Audio + Transcription → Browser Speaker
     │                           │                           │
     └── audio_stream_end ───────┘                           └── turnComplete detection
                                                                  ├── challenge mode: accumulate
                                                                  └── standard mode: flush turn
```

### Additional Features
- **Resume upload & analysis** — PDF parsing, section detection, AI-tailored questions
- **GitHub integration** — public repo analysis for code-specific questions
- **Job description parsing** — paste a JD for targeted questions
- **Custom company & role** — AI generates interview context on the fly
- **Email verification** — OTP via Resend
- **Rate limiting** — FREE: 3 interviews / 7 days, 15 min cap
- **Interview history** — dashboard with scores, feedback, improvement tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | [Bun](https://bun.sh) 1.3+ |
| Backend | [Elysia.js](https://elysiajs.com) |
| Frontend | React 19, [motion](https://motion.dev) (animations) |
| Database | PostgreSQL + [Prisma](https://prisma.io) |
| AI | Google Gemini 2.5 Flash (Live API with audio) |
| Real-time | WebSocket (`ws`) |
| Auth | JWT + OTP |
| Email | Resend |
| CSS | Tailwind CSS 4 |
| Icons | react-icons (Font Awesome, Simple Icons) |
| Monorepo | [Turborepo](https://turbo.build) |

## Quick Start

### Prerequisites

- **Bun** 1.3+ (`curl -fsSL https://bun.sh/install | bash`)
- **PostgreSQL** running locally or remotely
- **Google AI Studio API key** for Gemini Live

### Setup

```bash
# Install dependencies
bun install

# Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Set up your .env files
# apps/backend/.env requires:
#   DATABASE_URL=postgresql://...
#   GEMINI_API_KEY=your_key
#   JWT_SECRET=...
#   RESEND_API_KEY=...
#   WS_PORT=8080
#
# apps/frontend/.env requires:
#   VITE_API_HOST=http://localhost:3000
#   VITE_WS_HOST=localhost:8080

# Run database migrations
bun run --filter @evalio/db prisma migrate dev

# Start development servers
bun run dev
```

### Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 |
| WebSocket | ws://localhost:8080 |

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps in development mode (hot reload) |
| `bun run build` | Build all apps and packages |
| `bun run lint` | Run ESLint across all packages |
| `bun run check-types` | Run TypeScript type checking |
| `bun run format` | Format code with Prettier |
| `bun run --filter @evalio/backend dev` | Backend only |
| `bun run --filter @evalio/frontend dev` | Frontend only |

## API Overview

### HTTP Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register with email + password |
| POST | `/api/auth/verify-otp` | Verify email with OTP |
| POST | `/api/auth/login` | Login, receive JWT |
| GET | `/api/interviews` | List user's interviews |
| POST | `/api/interviews` | Create new interview |
| GET | `/api/interviews/:id` | Get interview details |
| POST | `/api/resumes/upload` | Upload resume (PDF) |
| GET | `/api/github/profile` | Get linked GitHub profile |
| POST | `/api/companies/generate` | AI-generate custom company context |

### WebSocket Messages

| Direction | Type | Purpose |
|-----------|------|---------|
| Client → | `init` | Authenticate, start interview session |
| Client → | `audio_chunk` | Send PCM audio data |
| Client → | `audio_stream_end` | Signal end of user speech |
| Client → | `end_interview` | Request closing + evaluation |
| Server → | `ready` | Interview initialized, listening |
| Server → | `serverContent` | AI speech (audio + transcription) |
| Server → | `closing_started` | Interview entering closing phase |
| Server → | `feedback_ready` | Evaluation complete, navigate to results |
| Server → | `time_limit` | Total interview duration |
| Server → | `time_warning` | 1 minute remaining |
| Server → | `time_limit_reached` | Time expired, closing triggered |

## Project Structure

### Backend (`apps/backend`)

```
src/
├── index.ts                  # Elysia app entry
├── prompt.ts                 # Dynamic prompt assembly
├── ws.ts                     # WebSocket server + Gemini bridge
├── gemini.ts                 # Gemini Live API client
├── lib/
│   └── prisma.ts             # DB client
├── middleware/
│   ├── auth.ts               # JWT middleware
│   └── rateLimit.ts          # Rate limiting
├── routes/
│   ├── auth.ts               # Signup, login, OTP
│   ├── interview.ts          # CRUD + creation
│   ├── resume.ts             # Upload, list
│   ├── github.ts             # GitHub sync
│   ├── company.ts            # Company config
│   ├── evaluate.ts           # Evaluation status
│   ├── user.ts               # Profile
│   └── profile.ts            # Candidate skill profile
└── services/
    ├── evaluate.ts           # Post-interview scoring
    └── candidateProfile.ts   # Skill profile updates
```

### Frontend (`apps/frontend`)

```
src/
├── main.tsx                  # App entry
├── App.tsx                   # Router setup
├── lib/
│   ├── ws.ts                 # WebSocket client class
│   ├── api.ts                # HTTP client
│   └── auth.ts               # Auth context
├── hooks/
│   ├── useMicrophone.ts      # Mic → PCM 16kHz → base64
│   └── useAudioPlayer.ts     # base64 PCM → AudioContext playback
├── pages/
│   ├── NewInterview.tsx      # Multi-step interview setup wizard
│   ├── Interview.tsx         # Live interview room
│   ├── Results.tsx           # Post-interview scores + feedback
│   ├── Dashboard.tsx         # Interview history
│   ├── Login.tsx             # Auth pages
│   └── ...
└── components/
    └── Create-Interview/
        ├── CompanyGrid.tsx    # Company selection grid
        ├── RolePicker.tsx     # Role selection + custom role
        ├── StyleDepthPicker.tsx # Style & depth configuration
        ├── ResumeSection.tsx  # Resume + GitHub upload
        ├── ProgressStepper.tsx # Step indicator
        └── SessionCard.tsx    # Session review + launch
```

## Key Design Decisions

### Why Structured Company/Role Data Instead of Free-form Personality

Free-form personality strings caused the AI to produce similar interviews across roles at the same company. By splitting into `culture` (company values), `interviewerBehavior` (approach), and role-specific `topics`, `evaluationCriteria`, and `mustProbe`, the generated interview varies meaningfully by role. Impact: Role ~60%, Style ~25%, Company ~10%, Depth ~5%.

### Challenge Mode Turn Accumulation

In standard interview modes, each Q&A creates a new database turn. In Challenge and Bar Raiser modes, multiple user answers accumulate into a single turn until the AI asks a new question (detected via `isNewQuestion()` heuristic). This gives the AI room to challenge, probe, and redirect without creating spurious turn boundaries.

### AI Interruption Without Backend Round-trip

Interruption is detected on the frontend: when Gemini sends audio `inlineData` while `isUserSpeakingRef.current` is true, the mic is stopped immediately and `audio_stream_end` is sent. No backend round-trip needed, keeping latency low.

### Prompt Layering

Instead of one monolithic system prompt, the prompt is assembled from independent sections (Objective, Company Context, Role Context, Style, Depth, Resume, Guidelines). Each section is independently maintainable and conditionally included. This makes it easy to tweak individual behaviors without affecting the rest.

## License

MIT
