import { prisma } from "../lib/prisma"
import { GoogleGenAI } from "@google/genai"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

type Json = Record<string, unknown>

async function readJson<T = Json>(val: unknown): Promise<T[]> {
  if (Array.isArray(val)) return val as T[]
  try {
    if (typeof val === "string") return JSON.parse(val) as T[]
  } catch { /* ignore */ }
  return []
}

function simplify(val: unknown): Json[] {
  if (Array.isArray(val)) return val as Json[]
  return []
}

export async function updateCandidateProfile(interviewId: string) {
  const interview = await prisma.interviewSession.findUnique({
    where: { id: interviewId },
    include: {
      summary: true,
      turns: { orderBy: { orderNumber: "asc" } },
      user: { select: { name: true } },
    },
  })

  if (!interview || !interview.summary) return

  const existing = await prisma.candidateSkillProfile.findUnique({
    where: { userId: interview.userId },
  })

  if (!GEMINI_API_KEY) return

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

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
  "weakestSkill": "string"
}

Return ONLY valid JSON.`

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    })

    const text = response.text ?? ""
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()
    const parsed = JSON.parse(cleaned)

    const makeEntry = (field: string) => ({
      score: parsed[field]?.score ?? 0,
      note: parsed[field]?.note ?? "",
      interviewId,
      date: new Date().toISOString(),
    })

    const prevComm = simplify(existing?.communication)
    const prevTech = simplify(existing?.technicalDepth)
    const prevProb = simplify(existing?.problemSolving)
    const prevLead = simplify(existing?.leadership)
    const prevPatterns = await readJson<string>(existing?.commonPatterns)

    const newPatterns = [...new Set([...prevPatterns, ...(parsed.patterns ?? [])])]

    await prisma.candidateSkillProfile.upsert({
      where: { userId: interview.userId },
      create: {
        userId: interview.userId,
        communication: JSON.stringify([...prevComm.slice(-9), makeEntry("communication")]),
        technicalDepth: JSON.stringify([...prevTech.slice(-9), makeEntry("technicalDepth")]),
        problemSolving: JSON.stringify([...prevProb.slice(-9), makeEntry("problemSolving")]),
        leadership: JSON.stringify([...prevLead.slice(-9), makeEntry("leadership")]),
        commonPatterns: JSON.stringify(newPatterns),
        mostImprovedSkill: parsed.mostImprovedSkill ?? null,
        weakestSkill: parsed.weakestSkill ?? null,
      },
      update: {
        communication: JSON.stringify([...prevComm.slice(-9), makeEntry("communication")]),
        technicalDepth: JSON.stringify([...prevTech.slice(-9), makeEntry("technicalDepth")]),
        problemSolving: JSON.stringify([...prevProb.slice(-9), makeEntry("problemSolving")]),
        leadership: JSON.stringify([...prevLead.slice(-9), makeEntry("leadership")]),
        commonPatterns: JSON.stringify(newPatterns),
        mostImprovedSkill: parsed.mostImprovedSkill ?? undefined,
        weakestSkill: parsed.weakestSkill ?? undefined,
      },
    })
  } catch (err) {
    console.error("[profile] update failed:", err)
  }
}
