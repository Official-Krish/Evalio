import { Elysia, t } from "elysia";
import { prisma } from "../lib/prisma";
import { authGuard } from "../middleware/auth";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const questionCache = new Map<
  string,
  {
    title: string;
    description: string;
    fullBreakdown: string;
    difficulty: string;
  }
>();

export function getSdQuestion(interviewId: string) {
  return questionCache.get(interviewId) ?? null;
}

export function clearSdQuestion(interviewId: string) {
  questionCache.delete(interviewId);
}

export const sdRoutes = new Elysia({ prefix: "/sd" })
  .use(authGuard)
  .guard({}, (app) =>
    app.post(
      "/start",
      async ({ user, body, set }) => {
        const { interviewId } = body;

        const interview = await prisma.interviewSession.findUnique({
          where: { id: interviewId },
        });
        if (!interview || interview.userId !== user.id) {
          set.status = 404;
          return { error: "Interview not found" };
        }
        if (interview.mode !== "SYSTEM_DESIGN") {
          set.status = 400;
          return { error: "Interview is not in SYSTEM_DESIGN mode" };
        }

        const existing = questionCache.get(interviewId);
        if (existing) return existing;

        const company = interview.companyName || "a top tech company";
        const role = interview.position || "a senior engineering role";
        const depth =
          (interview as { interviewDepth?: string }).interviewDepth ||
          "PROBING";
        const style =
          (interview as { interviewStyle?: string }).interviewStyle ||
          "PROFESSIONAL";

        const generationPrompt = `Generate a system design interview question for ${company} for the role of ${role}.

Depth: ${depth} — ${
          depth === "STANDARD"
            ? "pick a moderately complex system. Focus on core architecture."
            : depth === "PROBING"
              ? "pick a system with multiple interacting services or real-time constraints."
              : depth === "CHALLENGE"
                ? "pick a complex system with geo-distribution or data pipelines."
                : "pick an elite-level system. Multi-region, distributed consensus, or ML at scale."
        }

Style: ${style} — ${
          style === "SUPPORTIVE"
            ? "conversational and encouraging."
            : style === "CHALLENGING"
              ? "high-pressure, push for depth."
              : style === "BAR_RAISER"
                ? "surgical and precise."
                : "structured and neutral."
        }

Return ONLY valid JSON with this exact schema:
{
  "title": "A specific, clear title for the design problem",
  "description": "2-3 sentence description of the system to design, with rough scale",
  "fullBreakdown": "Detailed markdown with sections: Functional Requirements (bullet list), Non-Functional Requirements (specific targets), High-Level Sketch (ASCII architecture diagram), Database (key tables/entities), APIs (key endpoints with request/response shapes). Adapt sections to the question — some may not need a DB section, others might need additional sections."
}`;

        let question;
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: generationPrompt }] }],
            config: {
              responseMimeType: "application/json",
            },
          });

          const text = response.text;
          if (!text) throw new Error("Empty response from Gemini");
          question = JSON.parse(text) as {
            title: string;
            description: string;
            fullBreakdown: string;
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[sd/start] generation failed:", message);
          set.status = 500;
          return { error: "Failed to generate question" };
        }

        if (
          !question.title ||
          !question.description ||
          !question.fullBreakdown
        ) {
          set.status = 500;
          return { error: "Generated question missing required fields" };
        }

        const result = {
          title: question.title,
          description: question.description,
          fullBreakdown: question.fullBreakdown,
          difficulty: depth,
        };

        questionCache.set(interviewId, result);

        return result;
      },
      {
        body: t.Object({
          interviewId: t.String(),
        }),
      },
    ),
  );
