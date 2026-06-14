# @evalio/frontend

React 19 SPA for AI Evalio.

## Stack

- **Runtime:** Bun
- **Framework:** React 19
- **Bundler:** Vite
- **Styling:** Tailwind CSS 4
- **Routing:** React Router v7
- **State:** TanStack React Query
- **UI:** Radix UI + custom components
- **Forms:** React Hook Form + Zod
- **Animations:** Motion (motion/react)
- **API Client:** Elysia Eden Treaty

## Pages

| Route | Page |
|-------|------|
| `/` | Landing |
| `/login` | Sign in |
| `/signup` | Create account |
| `/verify-otp` | Email verification |
| `/forgot-password` | Request password reset |
| `/reset-password` | Reset password with OTP |
| `/dashboard` | Interview history |
| `/interview/new` | Create new interview |
| `/interview/:id` | Live interview session |
| `/results/:id` | Interview results & scores |
| `/profile` | User profile |
| `/pricing` | Pricing |
| `/about`, `/faq`, `/contact` | Info pages |
| `/blog`, `/blog/:slug` | Blog |
| `/privacy`, `/terms`, `/cookies` | Legal |

## Scripts

```bash
bun dev       # Development with HMR
bun start     # Production server
bun build     # Production build
bun run lint  # ESLint
```

## Environment

```env
VITE_BACKEND_URL=http://localhost:3000
```
