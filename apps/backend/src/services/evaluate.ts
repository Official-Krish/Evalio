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
  const apiKey = Bun.env.GEMINI_API_KEY;
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

export async function evaluateInterview(interviewId: string, _retries = 1) {
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

// ── DSA Evaluation ──

interface DsaEvaluationResult {
  overallScore: number;
  summary: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  attempts: Array<{
    index: number;
    score: number;
    feedback: string;
    complexity: string;
    strengths: string[];
    weaknesses: string[];
  }>;
}

const DSA_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    overallScore: {
      type: "number",
      description: "Overall DSA score 0-100 weighted across questions",
    },
    summary: { type: "string", description: "Overall DSA performance summary" },
    keyStrengths: {
      type: "array",
      items: { type: "string" },
      description: "Top 3-5 strengths",
    },
    areasForImprovement: {
      type: "array",
      items: { type: "string" },
      description: "Top 3-5 areas to improve",
    },
    attempts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "number" },
          score: { type: "number", description: "Score 0-100" },
          feedback: {
            type: "string",
            description: "Detailed evaluation feedback",
          },
          complexity: {
            type: "string",
            description: "Time and space complexity achieved",
          },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
        },
        required: [
          "index",
          "score",
          "feedback",
          "complexity",
          "strengths",
          "weaknesses",
        ],
      },
    },
  },
  required: ["overallScore", "summary", "keyStrengths", "areasForImprovement"],
};

async function generateDsaEvaluation(
  prompt: string,
): Promise<DsaEvaluationResult | null> {
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
          responseJsonSchema: DSA_EVALUATION_SCHEMA,
        },
      });

      const text = response.text;
      if (!text) {
        console.warn(`[dsa-evaluate] empty response, attempt ${attempt + 1}`);
        throw new Error("No response from Gemini");
      }

      return JSON.parse(text) as DsaEvaluationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        `[dsa-evaluate] attempt ${attempt + 1}/2 failed: ${message}`,
      );
      if (attempt < 1) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }

  return null;
}

export async function evaluateDsaSession(interviewId: string) {
  try {
    const dsaSession = await prisma.dsaSession.findUnique({
      where: { interviewId },
      include: {
        problems: { orderBy: { index: "asc" } },
      },
    });

    if (!dsaSession) {
      console.warn(
        `[dsa-evaluate] no DSA session for interview ${interviewId}`,
      );
      return;
    }

    if (dsaSession.status === "EVALUATED") return;

    const problems = dsaSession.problems;
    const problemBlocks = problems
      .map((p, i) => `Question ${i + 1}: ${p.title} (${p.difficulty})`)
      .join("\n");

    const attemptBlocks = problems
      .map(
        (p) =>
          `Attempt ${p.index + 1}:
- Phases completed: ${p.phasesCompleted.join(", ") || "none"}
- Time taken: ${p.timeTaken ? `${p.timeTaken}s` : "N/A"}
- Code: ${p.code ? `\`\`\`\n${p.code.slice(0, 2000)}\n\`\`\`` : "No code submitted"}`,
      )
      .join("\n\n");

    const prompt = `Evaluate the candidate's DSA coding interview performance.

## Questions
${problemBlocks}

## Attempts
${attemptBlocks}

## Evaluation Criteria
Score each question 0-100 based on:
- **Problem Understanding** (20%): Did they clarify requirements and edge cases?
- **Approach** (25%): Did they discuss brute force and optimize?
- **Implementation** (30%): Did they write correct, clean code?
- **Testing** (10%): Did they verify with test cases?
- **Communication** (15%): Did they explain their thinking clearly?

Provide specific, actionable feedback for each question. Return ONLY valid JSON matching the schema.`;

    const result = await generateDsaEvaluation(prompt);
    if (!result) {
      console.error(
        `[dsa-evaluate] evaluation failed for interview ${interviewId}`,
      );
      return;
    }

    // Update each problem with score and feedback
    await Promise.all(
      result.attempts.map((a) =>
        prisma.dsaProblem.updateMany({
          where: { dsaSessionId: dsaSession.id, index: a.index },
          data: {
            score: a.score,
            feedback: a.feedback,
            complexity: a.complexity,
          },
        }),
      ),
    );

    // Update session with overall score and mark as evaluated
    await prisma.dsaSession.update({
      where: { id: dsaSession.id },
      data: {
        status: "EVALUATED",
      },
    });

    // Store overall scores on the interview session
    await prisma.interviewSession.update({
      where: { id: interviewId },
      data: {
        overallScore: result.overallScore,
        technicalScore: result.overallScore,
        problemSolvingScore: result.overallScore,
      },
    });

    console.log(
      `[dsa-evaluate] completed for interview ${interviewId}: ${result.overallScore}/100`,
    );
  } catch (err) {
    console.error(`[dsa-evaluate] error:`, err);
  }
}

// ── System Design Evaluation ──

const SYSTEM_DESIGN_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    overallScore: {
      type: "number",
      description: "Overall system design score 0-100",
    },
    dimensions: {
      type: "object",
      properties: {
        requirementsGathering: { type: "number", description: "0-100" },
        estimation: { type: "number", description: "0-100" },
        highLevelArchitecture: { type: "number", description: "0-100" },
        dataModel: { type: "number", description: "0-100" },
        scalability: { type: "number", description: "0-100" },
        faultTolerance: { type: "number", description: "0-100" },
        tradeoffsAndDepth: { type: "number", description: "0-100" },
      },
      required: [
        "requirementsGathering",
        "estimation",
        "highLevelArchitecture",
        "dataModel",
        "scalability",
        "faultTolerance",
        "tradeoffsAndDepth",
      ],
    },
    canvasFeedback: {
      type: "object",
      properties: {
        missingComponents: {
          type: "array",
          items: { type: "string" },
        },
        strongDecisions: {
          type: "array",
          items: { type: "string" },
        },
        weakDecisions: {
          type: "array",
          items: { type: "string" },
        },
        overallDiagramQuality: { type: "string" },
      },
      required: [
        "missingComponents",
        "strongDecisions",
        "weakDecisions",
        "overallDiagramQuality",
      ],
    },
    graphHistoryInsights: {
      type: "object",
      properties: {
        architectureEvolution: { type: "string" },
        patternStrengths: {
          type: "array",
          items: { type: "string" },
        },
        patternWeaknesses: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: [
        "architectureEvolution",
        "patternStrengths",
        "patternWeaknesses",
      ],
    },
    summary: { type: "string" },
    improvements: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "overallScore",
    "dimensions",
    "canvasFeedback",
    "graphHistoryInsights",
    "summary",
    "improvements",
  ],
} as const;

interface SystemDesignEvaluationResult {
  overallScore: number;
  dimensions: {
    requirementsGathering: number;
    estimation: number;
    highLevelArchitecture: number;
    dataModel: number;
    scalability: number;
    faultTolerance: number;
    tradeoffsAndDepth: number;
  };
  canvasFeedback: {
    missingComponents: string[];
    strongDecisions: string[];
    weakDecisions: string[];
    overallDiagramQuality: string;
  };
  graphHistoryInsights: {
    architectureEvolution: string;
    patternStrengths: string[];
    patternWeaknesses: string[];
  };
  summary: string;
  improvements: string[];
}

async function generateSystemDesignEvaluation(
  prompt: string,
): Promise<SystemDesignEvaluationResult | null> {
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
          responseJsonSchema: SYSTEM_DESIGN_EVALUATION_SCHEMA,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response from Gemini");
      }

      return JSON.parse(text) as SystemDesignEvaluationResult;
    } catch {
      if (attempt < 1) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }

  return null;
}

export async function evaluateSystemDesignSession(interviewId: string) {
  try {
    const interview = await prisma.interviewSession.findUnique({
      where: { id: interviewId },
      include: {
        user: { select: { name: true } },
        turns: { orderBy: { orderNumber: "asc" } },
      },
    });

    if (!interview) {
      return;
    }

    // Filter AI-origin nodes from graph history for evolution analysis
    const rawGraphHistory = (interview as Record<string, unknown>)
      .canvasGraphHistory;
    const graphHistory = Array.isArray(rawGraphHistory) ? rawGraphHistory : [];
    const userOnlyHistory = graphHistory.map((snapshot: unknown) => {
      const s = snapshot as { nodes?: { origin?: string }[] };
      if (!s.nodes) return snapshot;
      return {
        ...s,
        nodes: s.nodes.filter((n) => n.origin !== "ai"),
      };
    });

    const transcript = interview.turns
      .map(
        (t) =>
          `[Q${t.orderNumber}]: ${t.questionText}\n[A${t.orderNumber}]: ${t.answerText}`,
      )
      .join("\n\n");

    const prompt = `Evaluate the candidate's system design interview performance.

## Transcript
${transcript || "No transcript available."}

## Architecture Evolution (user contributions only, AI suggestions excluded)
${JSON.stringify(userOnlyHistory.slice(-10))}

## Final Diagram
${JSON.stringify((interview as { finalDiagram?: unknown }).finalDiagram ?? "No final diagram")}

## Evaluation Criteria
Score each dimension 0-100 based on observed evidence:
- **Requirements Gathering**: Did they clarify scope, constraints, and assumptions?
- **Estimation**: Did they estimate traffic, storage, bandwidth, and cache requirements?
- **High-Level Architecture**: Overall structure, component choices, and interactions
- **Data Model**: Schema design, storage technology choices, indexing strategy
- **Scalability**: Handling growth, sharding, replication, CDN, caching layers
- **Fault Tolerance**: Redundancy, failover, disaster recovery, graceful degradation
- **Tradeoffs & Depth**: Awareness of alternatives, informed decision-making, depth of reasoning

## Canvas Feedback
Analyze the final diagram. What's missing? What strong decisions were made? What weak decisions?
Rate the overall diagram quality.

## Graph History Insights
How did the architecture evolve? (AI-suggested nodes are excluded — only user's own decisions.)
What patterns (strengths and weaknesses) appear across the timeline?

Return ONLY valid JSON matching the schema.`;

    const result = await generateSystemDesignEvaluation(prompt);
    if (!result) {
      return;
    }

    await prisma.$transaction([
      prisma.interviewSession.update({
        where: { id: interviewId },
        data: {
          overallScore: result.overallScore,
          technicalScore: Math.round(
            (result.dimensions.highLevelArchitecture +
              result.dimensions.dataModel +
              result.dimensions.scalability +
              result.dimensions.faultTolerance +
              result.dimensions.tradeoffsAndDepth) /
              5,
          ),
          problemSolvingScore: Math.round(
            (result.dimensions.requirementsGathering +
              result.dimensions.estimation +
              result.dimensions.highLevelArchitecture) /
              3,
          ),
        },
      }),
      prisma.interviewSummary.upsert({
        where: { interviewId },
        create: {
          interviewId,
          summary: result.summary,
          strengths: result.canvasFeedback.strongDecisions,
          weaknesses: result.canvasFeedback.weakDecisions,
          improvementAreas: result.improvements,
          recommendedTopics: [],
          resumeStrengths: [],
          resumeWeaknesses: [],
        },
        update: {
          summary: result.summary,
          strengths: result.canvasFeedback.strongDecisions,
          weaknesses: result.canvasFeedback.weakDecisions,
          improvementAreas: result.improvements,
          recommendedTopics: [],
          resumeStrengths: [],
          resumeWeaknesses: [],
        },
      }),
    ]);
  } catch {
    /* evaluation failed silently */
  }
}
