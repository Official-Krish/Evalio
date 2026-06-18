import { Elysia, t } from "elysia";
import { prisma } from "../lib/prisma";
import { authGuard } from "../middleware/auth";
import {
  fetchCompanyQuestions,
  getOrCreateQuestion,
} from "../services/questionPool";
import { DSA_PHASES } from "../services/dsaPrompt";

export const dsaRoutes = new Elysia({ prefix: "/dsa" })
  .use(authGuard)
  .guard({}, (app) =>
    app
      .post(
        "/start",
        async ({ user, body, set }) => {
          const { interviewId, language, questionCount } = body;

          // Validate interview
          const interview = await prisma.interviewSession.findUnique({
            where: { id: interviewId },
          });
          if (!interview || interview.userId !== user.id) {
            set.status = 404;
            return { error: "Interview not found" };
          }
          if (interview.mode !== "DSA") {
            set.status = 400;
            return { error: "Interview is not in DSA mode" };
          }

          // Check if DSA session already exists
          const existing = await prisma.dsaSession.findUnique({
            where: { interviewId },
            include: {
              attempts: { orderBy: { index: "asc" } },
            },
          });
          if (existing) {
            return {
              session: {
                ...existing,
                questions: existing.questions as Array<{
                  id: number;
                  title: string;
                  slug: string;
                  difficulty: string;
                  acceptanceRate: number;
                }>,
              },
            };
          }

          // Fetch questions
          if (!interview.companyId) {
            set.status = 400;
            return { error: "Interview has no company assigned" };
          }

          const count = questionCount ?? 3;
          let questions: Array<{
            id: number;
            title: string;
            slug: string;
            difficulty: string;
            acceptanceRate: number;
          }>;

          try {
            questions = await fetchCompanyQuestions(interview.companyId, count);
          } catch (err) {
            set.status = 502;
            return {
              error: `Failed to fetch questions: ${(err as Error).message}`,
            };
          }

          if (questions.length === 0) {
            set.status = 404;
            return { error: "No questions found for this company" };
          }

          // Upsert questions into DB and fetch descriptions
          const enriched = await Promise.all(
            questions.map((q) =>
              getOrCreateQuestion(
                q.slug,
                q.id,
                q.difficulty as "EASY" | "MEDIUM" | "HARD",
                q.acceptanceRate,
              ).then((dbQ) => ({
                dbId: dbQ.id,
                leetcodeId: dbQ.leetcodeId,
                title: dbQ.title,
                slug: dbQ.slug,
                difficulty: dbQ.difficulty,
                description: dbQ.description ?? "",
                testCases:
                  (
                    dbQ as {
                      testCases?: {
                        input: string;
                        output: string;
                        explanation?: string;
                      }[];
                    }
                  ).testCases ?? [],
              })),
            ),
          );

          // Create DSA session
          const session = await prisma.dsaSession.create({
            data: {
              interviewId,
              userId: user.id,
              language: language ?? "python",
              questions: enriched.map((q) => ({
                dbId: q.dbId,
                leetcodeId: q.leetcodeId,
                title: q.title,
                slug: q.slug,
                difficulty: q.difficulty,
                testCases: q.testCases,
              })),
            },
            include: {
              attempts: { orderBy: { index: "asc" } },
            },
          });

          // Create empty attempts for each question
          await Promise.all(
            enriched.map((q, idx) =>
              prisma.dsaQuestionAttempt.create({
                data: {
                  dsaSessionId: session.id,
                  questionId: q.dbId,
                  index: idx,
                  currentPhase: "understanding",
                  phasesCompleted: [],
                },
              }),
            ),
          );

          const withAttempts = await prisma.dsaSession.findUnique({
            where: { id: session.id },
            include: {
              attempts: { orderBy: { index: "asc" } },
            },
          });

          return {
            session: {
              ...withAttempts!,
              questions: enriched,
            },
          };
        },
        {
          body: t.Object({
            interviewId: t.String(),
            language: t.Optional(t.String()),
            questionCount: t.Optional(t.Number()),
          }),
        },
      )
      .post(
        "/submit",
        async ({ user, body, set }) => {
          const { sessionId, index, code, phase, timeTaken } = body;

          const session = await prisma.dsaSession.findUnique({
            where: { id: sessionId },
          });
          if (!session || session.userId !== user.id) {
            set.status = 404;
            return { error: "Session not found" };
          }

          const attempt = await prisma.dsaQuestionAttempt.findFirst({
            where: { dsaSessionId: sessionId, index },
          });
          if (!attempt) {
            set.status = 404;
            return { error: "Question attempt not found" };
          }

          const updateData: Record<string, unknown> = {};

          if (code !== undefined) {
            updateData.code = code;
            const currentSnapshots = (attempt.codeSnapshots ?? {}) as Record<
              string,
              string
            >;
            const currentPhase = phase ?? attempt.currentPhase;
            currentSnapshots[currentPhase] = code;
            updateData.codeSnapshots = currentSnapshots;
          }

          if (phase) {
            updateData.currentPhase = phase;
            const completed = [...attempt.phasesCompleted];
            const phaseIdx = DSA_PHASES.indexOf(
              phase as (typeof DSA_PHASES)[number],
            );
            if (phaseIdx > 0) {
              const prevPhase = DSA_PHASES[phaseIdx - 1]!;
              if (!completed.includes(prevPhase)) {
                completed.push(prevPhase);
              }
            }
            updateData.phasesCompleted = completed;

            if (phase === "review") {
              if (!completed.includes("implementation")) {
                completed.push("implementation");
              }
              if (!completed.includes("testing")) {
                completed.push("testing");
              }
              completed.push("review");
              updateData.phasesCompleted = completed;
              updateData.completedAt = new Date();
            }
          }

          if (timeTaken !== undefined) {
            updateData.timeTaken = timeTaken;
          }

          const updated = await prisma.dsaQuestionAttempt.update({
            where: { id: attempt.id },
            data: updateData,
          });

          // If this question is completed, increment currentIndex
          if (phase === "review") {
            await prisma.dsaSession.update({
              where: { id: sessionId },
              data: {
                currentIndex: Math.min(
                  index + 1,
                  (session.questions as Array<unknown>).length - 1,
                ),
              },
            });
          }

          return { attempt: updated };
        },
        {
          body: t.Object({
            sessionId: t.String(),
            index: t.Number(),
            code: t.Optional(t.String()),
            phase: t.Optional(t.String()),
            timeTaken: t.Optional(t.Number()),
          }),
        },
      )
      .get("/session/:id", async ({ params: { id }, user, set }) => {
        const session = await prisma.dsaSession.findUnique({
          where: { id },
          include: {
            attempts: { orderBy: { index: "asc" } },
          },
        });
        if (!session || session.userId !== user.id) {
          set.status = 404;
          return { error: "Session not found" };
        }
        return {
          session: {
            ...session,
            questions: session.questions as Array<{
              dbId: string;
              leetcodeId: number;
              title: string;
              slug: string;
              difficulty: string;
              testCases?: {
                input: string;
                output: string;
                explanation?: string;
              }[];
            }>,
          },
        };
      })
      .post(
        "/evaluate",
        async ({ user, body, set }) => {
          const { sessionId } = body;

          const session = await prisma.dsaSession.findUnique({
            where: { id: sessionId },
            include: {
              attempts: { orderBy: { index: "asc" } },
            },
          });
          if (!session || session.userId !== user.id) {
            set.status = 404;
            return { error: "Session not found" };
          }

          // Mark session as submitted
          await prisma.dsaSession.update({
            where: { id: sessionId },
            data: { status: "SUBMITTED", submittedAt: new Date() },
          });

          return { status: "ok" };
        },
        {
          body: t.Object({
            sessionId: t.String(),
          }),
        },
      ),
  );
