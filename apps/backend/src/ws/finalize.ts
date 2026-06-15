import { prisma } from "../lib/prisma";
import { evaluateInterview } from "../services/evaluate";

export async function finalizeInterview(interviewId: string) {
  try {
    const interview = await prisma.interviewSession.findUnique({
      where: { id: interviewId },
      select: { status: true, startedAt: true },
    });
    if (!interview || interview.status === "COMPLETED") return;

    await prisma.interviewSession.update({
      where: { id: interviewId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
        ...(interview.startedAt
          ? {
              durationSeconds: Math.round(
                (Date.now() - new Date(interview.startedAt).getTime()) / 1000,
              ),
            }
          : {}),
      },
    });

    console.log(
      `[ws] finalizing interview ${interviewId}, triggering evaluation`,
    );
    evaluateInterview(interviewId).catch((err) =>
      console.error("Evaluation failed:", err),
    );
  } catch (err) {
    console.error("finalizeInterview error:", err);
  }
}
