import { Elysia, t } from "elysia";
import { prisma } from "../lib/prisma";
import { authGuard } from "../middleware/auth";
import { generateResumeUrl } from "../lib/s3";
import { extractUsername, parseGithubProfile } from "../utils/githubParser";
import { strictRateLimit } from "../middleware/rateLimit";
import type { InterviewStyle, InterviewDepth } from "@evalio/db";

export const interviewRoutes = new Elysia({ prefix: "/interview" }).guard(
  {},
  (app) =>
    app
      .use(authGuard)
      .guard({}, (g) =>
        g.use(strictRateLimit).post(
          "/create",
          async ({ user, body, set }) => {
            // Rate limit: FREE users get 3 interviews / 7 days, PRO gets 6 / 7 days
            if (user.role !== "ADMIN") {
              const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              const recentCount = await prisma.interviewSession.count({
                where: {
                  userId: user.id,
                  createdAt: { gte: since },
                },
              });
              const role: string = user.role;
              const limit = role === "PRO" ? 6 : 3;
              if (recentCount >= limit) {
                set.status = 429;
                return {
                  error: `Rate limit reached. ${
                    role === "PRO" ? "Pro" : "Free"
                  } users can only create ${limit} interviews per 7 days.`,
                };
              }
            }

            const latestResume = await prisma.resume.findFirst({
              where: { userId: user.id },
              orderBy: { version: "desc" },
            });
            if (!latestResume) {
              set.status = 400;
              return { error: "Upload a resume before creating an interview" };
            }

            const resumeId = body.resumeId ?? latestResume.id;
            const resume = await prisma.resume.findFirst({
              where: { id: resumeId, userId: user.id },
            });
            if (!resume) {
              set.status = 400;
              return { error: "Invalid resume selected" };
            }

            if (body.githubUrl) {
              const username = extractUsername(body.githubUrl);
              if (username) {
                try {
                  const parsed = await parseGithubProfile(username);
                  await prisma.githubProfile.upsert({
                    where: { userId: user.id },
                    create: {
                      userId: user.id,
                      username: parsed.username,
                      summary: parsed.summary,
                      languages: parsed.languages,
                      projects: parsed.projects,
                    },
                    update: {
                      username: parsed.username,
                      summary: parsed.summary,
                      languages: parsed.languages,
                      projects: parsed.projects,
                      analyzedAt: new Date(),
                    },
                  });
                  await prisma.candidateProfile.update({
                    where: { userId: user.id },
                    data: { githubUsername: parsed.username },
                  });
                } catch {
                  // GitHub fetch failed, continue without profile
                }
              }
            }

            const interview = await prisma.interviewSession.create({
              data: {
                userId: user.id,
                status: "CREATED",
                mode: (body.mode as "VOICE" | "DSA") ?? "VOICE",
                position: body.position,
                jobDescription: body.jobDescription,
                resumeId: resume.id,
                ...(body.companyId && { companyId: body.companyId }),
                ...(body.companyName && { companyName: body.companyName }),
                ...(body.roleTitle && { roleTitle: body.roleTitle }),
                ...(body.interviewRound && {
                  interviewRound: body.interviewRound,
                }),
                ...(body.interviewStyle && {
                  interviewStyle: body.interviewStyle as InterviewStyle,
                }),
                ...(body.interviewDepth && {
                  interviewDepth: body.interviewDepth as InterviewDepth,
                }),
              },
            });

            return { interview };
          },
          {
            body: t.Object({
              position: t.Optional(t.String()),
              resumeId: t.Optional(t.String()),
              githubUrl: t.Optional(t.String()),
              jobDescription: t.Optional(t.String()),
              companyId: t.Optional(t.String()),
              companyName: t.Optional(t.String()),
              roleTitle: t.Optional(t.String()),
              interviewRound: t.Optional(t.String()),
              interviewStyle: t.Optional(
                t.Enum({
                  SUPPORTIVE: "SUPPORTIVE",
                  PROFESSIONAL: "PROFESSIONAL",
                  CHALLENGING: "CHALLENGING",
                  BAR_RAISER: "BAR_RAISER",
                }),
              ),
              interviewDepth: t.Optional(
                t.Enum({
                  STANDARD: "STANDARD",
                  PROBING: "PROBING",
                  CHALLENGE: "CHALLENGE",
                  BAR_RAISER: "BAR_RAISER",
                }),
              ),
              mode: t.Optional(
                t.Enum({
                  VOICE: "VOICE",
                  DSA: "DSA",
                }),
              ),
              language: t.Optional(t.String()),
            }),
          },
        ),
      )
      .get("/", async ({ user, query }) => {
        const interviews = await prisma.interviewSession.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          skip: Number(query.skip) || 0,
          take: Math.min(Number(query.take) || 20, 100),
          include: {
            _count: { select: { turns: true } },
            resume: { select: { id: true, version: true } },
            summary: true,
          },
        });
        return { interviews };
      })
      .get("/:id", async ({ params: { id }, user, set }) => {
        const interview = await prisma.interviewSession.findUnique({
          where: { id },
          include: {
            turns: { orderBy: { createdAt: "asc" } },
            summary: true,
            resume: { select: { id: true, version: true, objectKey: true } },
            dsaSession: {
              include: {
                attempts: { orderBy: { index: "asc" } },
              },
            },
          },
        });
        if (!interview || interview.userId !== user.id) {
          set.status = 404;
          return { error: "Interview not found" };
        }
        const mappedResume = interview.resume
          ? {
              ...interview.resume,
              url: interview.resume.objectKey
                ? generateResumeUrl(interview.resume.objectKey)
                : null,
            }
          : null;
        return { interview: { ...interview, resume: mappedResume } };
      })
      .patch(
        "/:id",
        async ({ params: { id }, user, body, set }) => {
          const interview = await prisma.interviewSession.findUnique({
            where: { id },
          });
          if (!interview || interview.userId !== user.id) {
            set.status = 404;
            return { error: "Interview not found" };
          }

          const updated = await prisma.interviewSession.update({
            where: { id },
            data: {
              ...(body.status && { status: body.status }),
              ...(body.startedAt !== undefined && {
                startedAt: body.startedAt,
              }),
              ...(body.endedAt !== undefined && { endedAt: body.endedAt }),
              ...(body.overallScore !== undefined && {
                overallScore: body.overallScore,
              }),
              ...(body.communicationScore !== undefined && {
                communicationScore: body.communicationScore,
              }),
              ...(body.technicalScore !== undefined && {
                technicalScore: body.technicalScore,
              }),
              ...(body.problemSolvingScore !== undefined && {
                problemSolvingScore: body.problemSolvingScore,
              }),
              ...(body.durationSeconds !== undefined && {
                durationSeconds: body.durationSeconds,
              }),
            },
          });
          return { interview: updated };
        },
        {
          body: t.Object({
            status: t.Optional(
              t.Enum({
                CREATED: "CREATED",
                ACTIVE: "ACTIVE",
                COMPLETED: "COMPLETED",
                FAILED: "FAILED",
                CANCELLED: "CANCELLED",
              }),
            ),
            startedAt: t.Optional(t.Nullable(t.Date())),
            endedAt: t.Optional(t.Nullable(t.Date())),
            overallScore: t.Optional(t.Nullable(t.Number())),
            communicationScore: t.Optional(t.Nullable(t.Number())),
            technicalScore: t.Optional(t.Nullable(t.Number())),
            problemSolvingScore: t.Optional(t.Nullable(t.Number())),
            durationSeconds: t.Optional(t.Nullable(t.Number())),
          }),
        },
      ),
);
