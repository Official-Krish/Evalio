import { Elysia, t } from "elysia";
import { prisma } from "../lib/prisma";
import { authGuard } from "../middleware/auth";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

interface SdCacheEntry {
  title: string;
  description: string;
  fullBreakdown: string;
  backupTitle: string;
  backupDescription: string;
  backupFullBreakdown: string;
  difficulty: string;
}

const questionCache = new Map<string, SdCacheEntry>();

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
        if (existing) {
          return {
            title: existing.title,
            description: existing.description,
            difficulty: existing.difficulty,
          };
        }

        const company = interview.companyName || "a top tech company";
        const role = interview.position || "a senior engineering role";
        const depth =
          (interview as { interviewDepth?: string }).interviewDepth ||
          "PROBING";
        const style =
          (interview as { interviewStyle?: string }).interviewStyle ||
          "PROFESSIONAL";

        const generationPrompt = `Generate TWO distinct system design interview questions for ${company} for the role of ${role}. The second is a backup if the candidate has seen the first one.

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

The two questions MUST be on different domains (e.g., not both social media). The backup should be a completely different type of system.

Return ONLY valid JSON with this exact schema:
{
  "primary": {
    "title": "A specific, clear title for the design problem",
    "description": "2-3 sentence description of the system to design, with rough scale",
    "fullBreakdown": "Detailed markdown with sections: Functional Requirements (bullet list), Non-Functional Requirements (specific targets), High-Level Sketch (ASCII architecture diagram), Database (key tables/entities), APIs (key endpoints with request/response shapes). Adapt sections to the question — some may not need a DB section, others might need additional sections."
  },
  "backup": {
    "title": "A different system design problem",
    "description": "2-3 sentence description",
    "fullBreakdown": "Same structure as primary"
  }
}`;

        let parsed: {
          primary: {
            title: string;
            description: string;
            fullBreakdown: string;
          };
          backup: { title: string; description: string; fullBreakdown: string };
        };
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
          parsed = JSON.parse(text);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[sd/start] generation failed:", message);
          set.status = 500;
          return { error: "Failed to generate question" };
        }

        if (
          !parsed.primary?.title ||
          !parsed.primary?.description ||
          !parsed.primary?.fullBreakdown ||
          !parsed.backup?.title ||
          !parsed.backup?.description ||
          !parsed.backup?.fullBreakdown
        ) {
          set.status = 500;
          return { error: "Generated question missing required fields" };
        }

        const cacheEntry: SdCacheEntry = {
          title: parsed.primary.title,
          description: parsed.primary.description,
          fullBreakdown: parsed.primary.fullBreakdown,
          backupTitle: parsed.backup.title,
          backupDescription: parsed.backup.description,
          backupFullBreakdown: parsed.backup.fullBreakdown,
          difficulty: depth,
        };

        questionCache.set(interviewId, cacheEntry);

        return {
          title: cacheEntry.title,
          description: cacheEntry.description,
          difficulty: cacheEntry.difficulty,
        };
      },
      {
        body: t.Object({
          interviewId: t.String(),
        }),
      },
    ),
  );
