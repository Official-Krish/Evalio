import { Elysia, t } from "elysia";
import { GoogleGenAI } from "@google/genai";
import { authGuard } from "../middleware/auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const companyRoutes = new Elysia({ prefix: "/companies" })
  .use(authGuard)
  .post(
    "/generate",
    async ({ body, set }) => {
      if (!GEMINI_API_KEY) {
        set.status = 500;
        return { error: "GEMINI_API_KEY not configured" };
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const prompt = `You are a company interview context generator.

Generate a JSON object for the company "${body.companyName}" (${body.industry ?? "unknown industry"}) with the following fields:
- "personality": A 2-3 sentence description of what it's like to interview at this company, what they value, their culture, and how they conduct interviews.
- "roles": An array of 3 role objects, each with:
  - "title": A realistic job title at this company
  - "description": A 1-sentence description of what the role does
  - "defaultStyle": one of "SUPPORTIVE", "PROFESSIONAL", "CHALLENGING", "BAR_RAISER"
  - "defaultDepth": one of "STANDARD", "PROBING", "CHALLENGE", "BAR_RAISER"

Return ONLY valid JSON, no markdown formatting or code fences.`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const text = response.text ?? "";
        const cleaned = text
          .replace(/```json\s*/g, "")
          .replace(/```\s*/g, "")
          .trim();
        const parsed = JSON.parse(cleaned);

        return {
          company: {
            name: body.companyName,
            industry: body.industry ?? "Technology",
            personality: parsed.personality ?? "",
            roles: parsed.roles ?? [],
          },
        };
      } catch (err) {
        set.status = 500;
        console.error("[company] generate failed:", err);
        return { error: "Failed to generate company context" };
      }
    },
    {
      body: t.Object({
        companyName: t.String(),
        industry: t.Optional(t.String()),
      }),
    },
  );
