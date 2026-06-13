# @ai-interview/db

Prisma ORM and PostgreSQL schema for AI Interview Lab.

## Schema

- **User** — Account with roles (FREE, ADMIN), email verification fields
- **CandidateProfile** — Extended profile (GitHub username)
- **Resume** — Versioned resume storage with extracted text
- **GithubProfile** — Cached GitHub profile analysis
- **InterviewSession** — Interview with scoring (overall, communication, technical, problem-solving)
- **InterviewTurn** — Individual Q&A pairs with AI scoring
- **InterviewSummary** — AI-generated post-interview feedback

## Scripts

```bash
# Run migrations
bunx prisma migrate dev --name <name>

# Generate Prisma client
bunx prisma generate

# Open Prisma Studio
bunx prisma studio
```
