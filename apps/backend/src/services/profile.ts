import { prisma } from "../lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { FAILURE_SIGNALS } from "../constants/signals";
import type { FailureSignalCode } from "../constants/signals";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

type Json = Record<string, unknown>;

async function readJson<T = Json>(val: unknown): Promise<T[]> {
  if (Array.isArray(val)) return val as T[];
  try {
    if (typeof val === "string") return JSON.parse(val) as T[];
  } catch {
    /* ignore */
  }
  return [];
}

function simplify(val: unknown): Json[] {
  if (Array.isArray(val)) return val as Json[];
  return [];
}

export async function updateCandidateProfile(interviewId: string) {
  const interview = await prisma.interviewSession.findUnique({
    where: { id: interviewId },
    include: {
      summary: true,
      turns: { orderBy: { orderNumber: "asc" } },
      user: { select: { name: true } },
    },
  });

  if (!interview || !interview.summary) return;

  const existing = await prisma.candidateSkillProfile.findUnique({
    where: { userId: interview.userId },
  });

  if (!GEMINI_API_KEY) return;

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const signalCodes = Object.keys(FAILURE_SIGNALS)
    .filter((k) => k !== "OTHER")
    .join(", ");

  const prompt = `Analyze this interview session and assess the candidate's skills.

Candidate: ${interview.user.name ?? "Unknown"}
Role: ${interview.position ?? "Unknown"}
Company: ${interview.companyName ?? "General"}
Style: ${interview.interviewStyle ?? "PROFESSIONAL"}
Depth: ${interview.interviewDepth ?? "STANDARD"}

Summary strengths: ${JSON.stringify(interview.summary.strengths)}
Summary weaknesses: ${JSON.stringify(interview.summary.weaknesses)}
Scores - Overall: ${interview.overallScore}, Communication: ${interview.communicationScore}, Technical: ${interview.technicalScore}, Problem Solving: ${interview.problemSolvingScore}
Turns: ${interview.turns.length}

Based on the scores above, generate a JSON object:
{
  "communication": { "score": number, "note": "1-sentence assessment", "trend": "up"|"down"|"stable" },
  "technicalDepth": { "score": number, "note": "1-sentence assessment", "trend": "up"|"down"|"stable" },
  "problemSolving": { "score": number, "note": "1-sentence assessment", "trend": "up"|"down"|"stable" },
  "leadership": { "score": number, "note": "1-sentence assessment", "trend": "up"|"down"|"stable" },
  "patterns": ["string - observed patterns in this session"],
  "mostImprovedSkill": "string",
  "weakestSkill": "string",
  "signals": [
    {
      "code": "one of: ${signalCodes}",
      "turnIds": [1, 5],
      "reason": "1-sentence why this signal was observed"
    }
  ],
  "otherSignals": [
    {
      "label": "short descriptive label",
      "turnIds": [3],
      "reason": "1-sentence why"
    }
  ],
  "traits": {
    "analytical": { "score": number, "description": "1-sentence assessment" },
    "communication": { "score": number, "description": "1-sentence assessment" },
    "ownership": { "score": number, "description": "1-sentence assessment" },
    "adaptability": { "score": number, "description": "1-sentence assessment" },
    "decisionMaking": { "score": number, "description": "1-sentence assessment" },
    "influence": { "score": number, "description": "1-sentence assessment" }
  }
}

Select 0-N signals from the predefined taxonomy only (${signalCodes}). Use turnIds to reference turn orderNumbers (1-based). If none of the codes fit, use otherSignals with a descriptive label.

Assess the candidate's stable identity traits based on this session. Score each 0-100 and write a 1-sentence description for each.

Return ONLY valid JSON.`;

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

    const makeEntry = (field: string) => ({
      score: parsed[field]?.score ?? 0,
      note: parsed[field]?.note ?? "",
      interviewId,
      date: new Date().toISOString(),
    });

    const prevComm = simplify(existing?.communication);
    const prevTech = simplify(existing?.technicalDepth);
    const prevProb = simplify(existing?.problemSolving);
    const prevLead = simplify(existing?.leadership);
    const prevPatterns = await readJson<string>(existing?.commonPatterns);
    const prevSignals = await readJson<Json>(existing?.patternSignals);

    const newPatterns = [
      ...new Set([...prevPatterns, ...(parsed.patterns ?? [])]),
    ];

    const turnIdByOrder = new Map(
      interview.turns.map((t) => [t.orderNumber, t.id]),
    );

    const mappedSignals = (parsed.signals ?? []).map(
      (s: { code: string; turnIds?: number[]; reason?: string }) => ({
        code: s.code as FailureSignalCode,
        turnIds: (s.turnIds ?? [])
          .map((n: number) => turnIdByOrder.get(n))
          .filter(Boolean),
        reason: s.reason ?? "",
      }),
    );

    const mappedOther = (parsed.otherSignals ?? []).map(
      (s: { label: string; turnIds?: number[]; reason?: string }) => ({
        code: "OTHER" as const,
        label: s.label,
        turnIds: (s.turnIds ?? [])
          .map((n: number) => turnIdByOrder.get(n))
          .filter(Boolean),
        reason: s.reason ?? "",
      }),
    );

    const signalEntry = {
      interviewId,
      date: new Date().toISOString(),
      signals: [...mappedSignals, ...mappedOther],
    };

    const updatedSignals = [...prevSignals, signalEntry];

    const rawTraits = parsed.traits as
      | Record<string, { score?: number; description?: string }>
      | undefined;
    const traitEntry = rawTraits
      ? {
          interviewId,
          date: new Date().toISOString(),
          traits: Object.fromEntries(
            Object.entries(rawTraits).map(([k, v]) => [
              k,
              { score: v?.score ?? 0, description: v?.description ?? "" },
            ]),
          ),
        }
      : null;

    const prevTraitHistory = await readJson<Json>(existing?.traitHistory);
    const updatedTraitHistory = traitEntry
      ? [...prevTraitHistory, traitEntry]
      : prevTraitHistory;

    await prisma.candidateSkillProfile.upsert({
      where: { userId: interview.userId },
      create: {
        userId: interview.userId,
        communication: JSON.stringify([
          ...prevComm.slice(-9),
          makeEntry("communication"),
        ]),
        technicalDepth: JSON.stringify([
          ...prevTech.slice(-9),
          makeEntry("technicalDepth"),
        ]),
        problemSolving: JSON.stringify([
          ...prevProb.slice(-9),
          makeEntry("problemSolving"),
        ]),
        leadership: JSON.stringify([
          ...prevLead.slice(-9),
          makeEntry("leadership"),
        ]),
        commonPatterns: JSON.stringify(newPatterns),
        patternSignals: JSON.stringify(updatedSignals),
        traitHistory: JSON.stringify(updatedTraitHistory),
        mostImprovedSkill: parsed.mostImprovedSkill ?? null,
        weakestSkill: parsed.weakestSkill ?? null,
      },
      update: {
        communication: JSON.stringify([
          ...prevComm.slice(-9),
          makeEntry("communication"),
        ]),
        technicalDepth: JSON.stringify([
          ...prevTech.slice(-9),
          makeEntry("technicalDepth"),
        ]),
        problemSolving: JSON.stringify([
          ...prevProb.slice(-9),
          makeEntry("problemSolving"),
        ]),
        leadership: JSON.stringify([
          ...prevLead.slice(-9),
          makeEntry("leadership"),
        ]),
        commonPatterns: JSON.stringify(newPatterns),
        patternSignals: JSON.stringify(updatedSignals),
        traitHistory: JSON.stringify(updatedTraitHistory),
        mostImprovedSkill: parsed.mostImprovedSkill ?? undefined,
        weakestSkill: parsed.weakestSkill ?? undefined,
      },
    });
  } catch (err) {
    console.error("[profile] update failed:", err);
  }
}
