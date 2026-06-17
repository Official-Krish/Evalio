import { GoogleGenAI } from "@google/genai";
import { prisma } from "../lib/prisma";
import { updateCandidateProfile } from "./profile";
import { aggregateFailurePatterns } from "./failurePatterns";
import { aggregateIdentityTraits } from "./identityTraits";

interface TurnEvaluation {
  orderNumber: number;
  score: number;
  feedback: string;
}

interface EvaluationResult {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  summary: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  recommendedTopics: string[];
  resumeStrengths: string[];
  resumeWeaknesses: string[];
  turns: TurnEvaluation[];
}

const EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    overallScore: {
      type: "number",
      description: "Overall interview score 0-100",
    },
    communicationScore: {
      type: "number",
      description: "Communication skills score 0-100",
    },
    technicalScore: {
      type: "number",
      description: "Technical knowledge score 0-100",
    },
    problemSolvingScore: {
      type: "number",
      description: "Problem solving ability score 0-100",
    },
    summary: {
      type: "string",
      description: "Brief overall evaluation summary",
    },
    keyStrengths: {
      type: "array",
      items: { type: "string" },
      description: "Top 3-5 key strengths demonstrated",
    },
    areasForImprovement: {
      type: "array",
      items: { type: "string" },
      description: "Top 3-5 areas to improve",
    },
    recommendedTopics: {
      type: "array",
      items: { type: "string" },
      description: "Topics the candidate should study further",
    },
    resumeStrengths: {
      type: "array",
      items: { type: "string" },
      description: "Top 3 things that work well in the candidate's resume",
    },
    resumeWeaknesses: {
      type: "array",
      items: { type: "string" },
      description:
        "Top 3 gaps or improvements needed in the candidate's resume",
    },
    turns: {
      type: "array",
      items: {
        type: "object",
        properties: {
          orderNumber: { type: "number" },
          score: {
            type: "number",
            description: "Score for this turn 0-100",
          },
          feedback: {
            type: "string",
            description: "Specific feedback for this answer",
          },
        },
        required: ["orderNumber", "score", "feedback"],
      },
    },
  },
  required: [
    "overallScore",
    "communicationScore",
    "technicalScore",
    "problemSolvingScore",
    "summary",
    "keyStrengths",
    "areasForImprovement",
    "recommendedTopics",
    "resumeStrengths",
    "resumeWeaknesses",
    "turns",
  ],
} as const;

function buildEvaluationPrompt(input: {
  position: string | null;
  candidateName: string | null;
  resumeText: string | null;
  githubSummary: string | null;
  githubLanguages: string[];
  turns: { orderNumber: number; questionText: string; answerText: string }[];
}) {
  const questions = input.turns
    .map(
      (t) =>
        `[Question ${t.orderNumber}]: ${t.questionText}\n[Answer ${t.orderNumber}]: ${t.answerText || "(no answer)"}`,
    )
    .join("\n\n");

  return `You are an expert technical interviewer. Evaluate the following interview.

Position: ${input.position || "Unknown"}
Candidate: ${input.candidateName || "Unknown"}
Resume: ${input.resumeText || "Not provided"}
GitHub: ${input.githubSummary || "Not linked"} ${input.githubLanguages.length ? `Languages: ${input.githubLanguages.join(", ")}` : ""}

--- Structured Q&A ---
${questions || "No structured Q&A recorded"}

Score each turn individually (0-100) with specific feedback.
Provide overall scores for communication, technical knowledge, and problem solving.
List key strengths, areas for improvement, and recommended topics for further study.
Also analyze the candidate's resume briefly — what are its strongest points (resumeStrengths) and what could be improved (resumeWeaknesses)? Keep each to 2-3 items.`;
}

async function generateEvaluation(
  prompt: string,
): Promise<EvaluationResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY env not set");

  const ai = new GoogleGenAI({ apiKey });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: EVALUATION_SCHEMA,
        },
      });

      const text = response.text;
      if (!text) {
        console.warn(
          `[evaluate] empty response, raw:`,
          JSON.stringify(response).slice(0, 500),
        );
        throw new Error("No response from Gemini");
      }

      return JSON.parse(text) as EvaluationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[evaluate] attempt ${attempt + 1}/2 failed: ${message}`);
      if (attempt < 1) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }

  return null;
}

async function writeEvaluation(
  interviewId: string,
  interviewData: {
    startedAt: Date | null;
    endedAt: Date | null;
  } | null,
  turns: { id: string; orderNumber: number }[],
  result: EvaluationResult,
) {
  const durationSeconds =
    interviewData?.startedAt && interviewData?.endedAt
      ? Math.round(
          (new Date(interviewData.endedAt).getTime() -
            new Date(interviewData.startedAt).getTime()) /
            1000,
        )
      : null;

  await Promise.all([
    prisma.interviewSummary.upsert({
      where: { interviewId },
      create: {
        interviewId,
        summary: result.summary,
        strengths: result.keyStrengths,
        weaknesses: result.areasForImprovement,
        improvementAreas: result.areasForImprovement,
        recommendedTopics: result.recommendedTopics,
        resumeStrengths: result.resumeStrengths,
        resumeWeaknesses: result.resumeWeaknesses,
      },
      update: {
        summary: result.summary,
        strengths: result.keyStrengths,
        weaknesses: result.areasForImprovement,
        improvementAreas: result.areasForImprovement,
        recommendedTopics: result.recommendedTopics,
        resumeStrengths: result.resumeStrengths,
        resumeWeaknesses: result.resumeWeaknesses,
      },
    }),
    prisma.interviewSession.update({
      where: { id: interviewId },
      data: {
        overallScore: result.overallScore,
        communicationScore: result.communicationScore,
        technicalScore: result.technicalScore,
        problemSolvingScore: result.problemSolvingScore,
        durationSeconds,
      },
    }),
    ...result.turns.map((t) => {
      const dbTurn = turns[t.orderNumber - 1];
      if (!dbTurn) return Promise.resolve();
      return prisma.interviewTurn.update({
        where: { id: dbTurn.id },
        data: { score: t.score, feedback: t.feedback },
      });
    }),
  ]);

  // Trigger candidate profile update asynchronously
  try {
    await updateCandidateProfile(interviewId);
    await aggregateFailurePatterns(interviewId);
    await aggregateIdentityTraits(interviewId);
  } catch (err) {
    console.error("[evaluate] post-evaluation updates failed:", err);
  }
}

export async function evaluateInterview(interviewId: string, retries = 1) {
  const interview = await prisma.interviewSession.findUnique({
    where: { id: interviewId },
    select: {
      position: true,
      startedAt: true,
      endedAt: true,
      resume: { select: { extractedText: true } },
      user: {
        select: {
          id: true,
          name: true,
          githubProfile: {
            select: { summary: true, languages: true },
          },
        },
      },
      turns: {
        orderBy: { orderNumber: "asc" },
        select: {
          id: true,
          orderNumber: true,
          questionText: true,
          answerText: true,
        },
      },
    },
  });

  if (!interview) {
    console.warn(`[evaluation] interview ${interviewId} not found`);
    return { error: "Interview not found" };
  }
  if (interview.turns.length === 0) {
    console.warn(
      `[evaluation] interview ${interviewId} has no turns — skipping`,
    );
    const prompt = buildEvaluationPrompt({
      position: interview.position,
      candidateName: interview.user.name,
      resumeText: interview.resume?.extractedText ?? null,
      githubSummary: null,
      githubLanguages: [],
      turns: [],
    });
    // Still generate a basic evaluation even with no turns
    const result = await generateEvaluation(prompt);
    if (result) {
      await writeEvaluation(
        interviewId,
        {
          startedAt: interview.startedAt,
          endedAt: interview.endedAt,
        },
        interview.turns,
        result,
      );
    }
    return { evaluation: result, summary: null };
  }

  const github = interview.user.githubProfile;

  const prompt = buildEvaluationPrompt({
    position: interview.position,
    candidateName: interview.user.name,
    resumeText: interview.resume?.extractedText ?? null,
    githubSummary: github?.summary ?? null,
    githubLanguages: (github?.languages as string[]) ?? [],
    turns: interview.turns,
  });

  const result = await generateEvaluation(prompt);
  if (!result) throw new Error("Evaluation failed — no response from Gemini");

  await writeEvaluation(
    interviewId,
    {
      startedAt: interview.startedAt,
      endedAt: interview.endedAt,
    },
    interview.turns,
    result,
  );

  return { evaluation: result, summary: null };
}
