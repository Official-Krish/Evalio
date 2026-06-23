import { prisma } from "../../lib/prisma";
import type { InterviewConnection } from "../session";

export async function handleDsaMarkers(conn: InterviewConnection) {
  const buf = conn.questionBuf;

  // READY_FOR_NEXT
  if (/\bREADY[_\s]*FOR[_\s]*NEXT\b/i.test(buf)) {
    const skipMatch = buf.match(/\bREADY[_\s]*FOR[_\s]*NEXT\s*[:－]\s*(\d+)/i);
    const skipIdx = skipMatch
      ? Math.max(0, parseInt(skipMatch[1]!, 10) - 1)
      : null;
    await conn.safeSend({ type: "dsa_ready_next", index: skipIdx });
    console.log(
      `[dsa] READY_FOR_NEXT detected — skipping to ${
        skipIdx != null ? `Q${skipIdx + 1}` : "next question"
      }`,
    );

    try {
      const dsaSession = await prisma.dsaSession.findUnique({
        where: { interviewId: conn.interviewId! },
        include: { problems: { orderBy: { index: "asc" } } },
      });
      if (dsaSession) {
        const nextIdx = skipIdx != null ? skipIdx : dsaSession.currentIndex + 1;
        const nextProblem = dsaSession.problems[nextIdx];
        if (nextProblem) {
          await prisma.dsaSession.update({
            where: { id: dsaSession.id },
            data: { currentIndex: nextIdx },
          });
          console.log(
            `[dsa] updated currentIndex to ${nextIdx} (${nextProblem.title})`,
          );

          conn.gemini?.send(
            JSON.stringify({
              clientContent: {
                turns: [
                  {
                    role: "user",
                    parts: [
                      {
                        text:
                          skipIdx != null
                            ? `[System] Skip ahead. The candidate is now on Question ${nextIdx + 1}: "${nextProblem.title}" (${nextProblem.difficulty}). The previous questions were too easy for them, so we're jumping here. Do NOT read it aloud — it's on their screen. Wait for them to indicate they've read it, then start with comprehension checks.`
                            : `[System] The interview has moved to the next question. The candidate is now on Question ${nextIdx + 1}: "${nextProblem.title}" (${nextProblem.difficulty}). Do NOT read the question aloud — it's displayed on their screen. Wait for the candidate to indicate they've read it before discussing. Start with comprehension checks: ask them to explain their understanding of this problem.`,
                      },
                    ],
                  },
                ],
                turnComplete: false,
              },
            }),
          );
        }
      }
    } catch (err) {
      console.error("[dsa] failed to handle READY_FOR_NEXT:", err);
    }
    conn.dsaTransitioned = true;
  }

  if (
    !/\bREADY[_\s]*FOR[_\s]*NEXT\b/i.test(buf) &&
    !/\bALL[_\s]*DONE\b/i.test(buf)
  ) {
    console.log("[dsa] no marker found in buf");
  }

  // ALL_DONE
  if (/\bALL[_\s]*DONE\b/i.test(buf)) {
    console.log("[dsa] ALL_DONE detected");
    await conn.safeSend({ type: "dsa_all_done" });
    conn.dsaTransitioned = true;
  }

  // CODE_UPDATE
  const codeUpdateMatch = buf.match(
    /\[CODE_UPDATE\]\s*```(?:\w+)?\s*\n?([\s\S]*?)```\s*\[\/CODE_UPDATE\]/i,
  );
  if (codeUpdateMatch) {
    console.log("[dsa] CODE_UPDATE detected");
    const updatedCode = codeUpdateMatch[1]!.trim();
    await conn.safeSend({
      type: "dsa_code_update",
      code: updatedCode,
    });
    console.log("[dsa] CODE_UPDATE detected — saving");
    try {
      const dsaSession = await prisma.dsaSession.findUnique({
        where: { interviewId: conn.interviewId! },
        include: { problems: { orderBy: { index: "asc" } } },
      });
      if (dsaSession) {
        const problem = dsaSession.problems[dsaSession.currentIndex];
        if (problem) {
          const currentSnapshots = (problem.codeSnapshots ?? {}) as Record<
            string,
            string
          >;
          const currentPhase = problem.currentPhase;
          currentSnapshots[currentPhase] = updatedCode;
          await prisma.dsaProblem.update({
            where: { id: problem.id },
            data: {
              code: updatedCode,
              codeSnapshots: currentSnapshots,
            },
          });
        }
      }
    } catch (err) {
      console.error("[dsa] failed to persist CODE_UPDATE:", err);
    }
  }
}
