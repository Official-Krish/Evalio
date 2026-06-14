export interface CandidateHistoryEntry {
  interviewId?: string
  date?: string
  dimensions?: { name: string; score: number; label: string }[]
  overallScore?: number
  strengths?: string[]
  weaknesses?: string[]
  commonPatterns?: string[]
  summary?: string
}

export interface PromptInput {
  position: string | null
  candidateName: string | null
  resumeText: string | null
  jobDescription: string | null
  githubUsername: string | null
  githubSummary: string | null
  githubLanguages: string[]
  githubProjects: {
    name: string
    description: string | null
    stars: number
    language: string | null
  }[]
  durationMinutes: number
  interviewStyle: "SUPPORTIVE" | "PROFESSIONAL" | "CHALLENGING" | "BAR_RAISER"
  interviewDepth: "STANDARD" | "PROBING" | "CHALLENGE" | "BAR_RAISER"
  companyName: string | null
  companyCulture: string[] | null
  companyInterviewerBehavior: string[] | null
  companyEvaluationBiases: string[] | null
  roleTopics: string[] | null
  roleEvaluationCriteria: string[] | null
  roleMustProbe: string[] | null
  candidateHistory: CandidateHistoryEntry | null
}

function buildStyleDirective(style: string): string {
  switch (style) {
    case "SUPPORTIVE":
      return `## Interview Style: Supportive
A conversational, low-pressure style.
- Rare interruptions. Let the candidate finish naturally.
- If they go off-topic, gently guide back: "That's helpful context. Let me bring us back to [topic]."
- Encourage with brief affirmations before moving on.`
    case "PROFESSIONAL":
      return `## Interview Style: Professional
A structured, neutral style.
- Interrupt only when answers become unfocused or repetitive.
- "Let me stop you there — I'd like to hear specifically about [topic]."
- Keep a steady pace. One topic at a time.`
    case "CHALLENGING":
      return `## Interview Style: Challenging
A high-pressure style. Push for depth.
- Interrupt aggressively when answers go off-track or stay surface-level.
- "Stop. Give me a concrete example." / "You're listing. Pick one and go deep."
- Demand specificity: "What does that mean quantitatively?"
- Challenge assumptions: "Why not a different approach?"`
    case "BAR_RAISER":
      return `## Interview Style: Bar Raiser
An elite, surgical style.
- Sometimes allow a good answer, then challenge the next assumption.
- Do not challenge every statement. Choose the highest leverage point.
- Interrupt strategically — cut in only when the answer reveals a weak point.
- "I disagree with your premise. Why did you think that was the right approach?"
- "You keep saying 'we optimized it' — prove it. Before and after."
- Use deliberate silence after they finish. If they fill it, let them dig deeper.
- "What would you do differently?"`
    default:
      return ""
  }
}

function buildDepthDirective(depth: string): string {
  switch (depth) {
    case "STANDARD":
      return `## Interaction Depth: Standard
Ask a question. Listen. Provide brief feedback. Move on.
One clear topic per question. No follow-up chains.
Keep the conversation smooth and natural.`
    case "PROBING":
      return `## Interaction Depth: Probing
Occasionally go deeper after answers:
- "Can you elaborate on that?"
- "What specifically did you mean by [vague term]?"
1-2 follow-ups per topic, then move on.`
    case "CHALLENGE":
      return `## Interaction Depth: Challenge
After each answer, apply at least one challenge:
- "I don't agree. Why was that the right decision?"
- "What metric supports that claim?"
- "What alternative did you consider and why did you reject it?"
- "What would happen if that approach failed?"
Only move on after the candidate defends their answer.`
    case "BAR_RAISER":
      return `## Interaction Depth: Bar Raiser
The candidate must convince you of every answer:
- Start with skepticism: "I think that was the wrong approach."
- Demand evidence: "Prove it with data or experience."
- Use deliberate silence after they finish speaking.
- "If you had to do it over, what would you change?"
- "What would a senior engineer critique about that design?"
- "Why should I believe you?"
Do not relent until the candidate demonstrates real depth.`
    default:
      return ""
  }
}

function buildCompanyContext(
  companyName: string | null,
  culture: string[] | null,
  interviewerBehavior: string[] | null,
): string {
  if (!companyName) return ""

  const lines: string[] = [`## Interview Context\nCompany: ${companyName}`]

  if (culture && culture.length > 0) {
    lines.push("", "Culture:", ...culture.map((c) => `- ${c}`))
  }

  if (interviewerBehavior && interviewerBehavior.length > 0) {
    lines.push("", "Interviewer Approach:", ...interviewerBehavior.map((b) => `- ${b}`))
  }

  return lines.join("\n")
}

function buildRoleContext(
  roleTitle: string | null,
  topics: string[] | null,
  evaluationCriteria: string[] | null,
  mustProbe: string[] | null,
): string {
  if (!roleTitle) return ""

  const lines: string[] = [`Role: ${roleTitle}`]

  if (topics && topics.length > 0) {
    lines.push("", "Topics:", ...topics.map((t) => `- ${t}`))
  }

  if (evaluationCriteria && evaluationCriteria.length > 0) {
    lines.push("", "Evaluation Criteria:", ...evaluationCriteria.map((c) => `- ${c}`))
  }

  if (mustProbe && mustProbe.length > 0) {
    lines.push("", "Must Probe:", ...mustProbe.map((p) => `- ${p}`))
  }

  return lines.join("\n")
}

function buildCandidateHistory(history: CandidateHistoryEntry | null): string {
  if (!history) return ""

  const lines: string[] = ["## Candidate History"]

  if (history.overallScore != null) {
    lines.push(`Prior Score: ${Math.round(history.overallScore)}%`)
  }

  if (history.strengths && history.strengths.length > 0) {
    lines.push("", "Strengths:", ...history.strengths.map((s) => `- ${s}`))
  }

  if (history.weaknesses && history.weaknesses.length > 0) {
    lines.push("", "Weaknesses:", ...history.weaknesses.map((w) => `- ${w}`))
  }

  if (history.commonPatterns && history.commonPatterns.length > 0) {
    lines.push("", "Common Patterns:", ...history.commonPatterns.map((p) => `- ${p}`))
  }

  if (history.dimensions && history.dimensions.length > 0) {
    lines.push("", "Dimension Scores:")
    for (const d of history.dimensions) {
      lines.push(`- ${d.name}: ${d.label} (${d.score})`)
    }
  }

  if (history.summary) {
    lines.push("", `Summary: ${history.summary}`)
  }

  lines.push("", "Instructions:", "- Reference prior interviews when relevant.", "- Focus on weak areas. Probe for improvement.", "- Acknowledge growth if the candidate has improved since last session.")

  return lines.join("\n")
}

export function buildInterviewPrompt(input: PromptInput): string {
  const role = input.position?.trim() || "the role the candidate is applying for"
  const sections: string[] = []

  sections.push(
    `You are an AI interviewer conducting a voice interview for ${role}.

## Interview Objective
Your goal is not merely to ask questions. Your goal is to discover:
- How the candidate thinks.
- How they make decisions.
- How they handle uncertainty.
- How they communicate under pressure.
- Whether they can defend their reasoning.

Optimize for signal, not coverage.

The interview will be conducted through spoken conversation in English.
Ask one question at a time. Adapt based on the candidate's responses.
Maintain a natural conversational flow.
Keep your responses concise and spoken-word friendly (no markdown, no bullet points in speech).`
  )

  if (input.candidateName) {
    sections.push(`## Candidate\nName: ${input.candidateName}`)
  }

  sections.push(buildCandidateHistory(input.candidateHistory))
  sections.push(buildCompanyContext(input.companyName, input.companyCulture, input.companyInterviewerBehavior))
  sections.push(buildRoleContext(input.position, input.roleTopics, input.roleEvaluationCriteria, input.roleMustProbe))
  sections.push(buildStyleDirective(input.interviewStyle))
  sections.push(buildDepthDirective(input.interviewDepth))

  if (input.resumeText) {
    sections.push(
      `## Resume (full text below — use this to personalize questions)\n${input.resumeText}`
    )
  }

  if (input.githubUsername) {
    sections.push(`## GitHub Profile\nUsername: ${input.githubUsername}`)
  }

  if (input.githubSummary) {
    sections.push(`Bio: ${input.githubSummary}`)
  }

  if (input.githubLanguages.length > 0) {
    sections.push(
      `Languages used across projects: ${input.githubLanguages.join(", ")}`
    )
  }

  if (input.githubProjects.length > 0) {
    sections.push(`## Notable Projects`)
    for (const p of input.githubProjects.slice(0, 10)) {
      sections.push(
        `- ${p.name}${p.description ? `: ${p.description}` : ""}${p.language ? ` [${p.language}]` : ""}${p.stars > 0 ? ` (${p.stars}★)` : ""}`
      )
    }
  }

  if (input.jobDescription) {
    sections.push(
      `## Job Description\n${input.jobDescription}`
    )
  }

  sections.push(
    `## Evaluation Dimensions
Continuously assess these dimensions throughout the interview:
- Communication — clarity, structure, conciseness
- Technical Depth — knowledge, rigor, precision
- Problem Solving — approach, creativity, tradeoff awareness
- Leadership — ownership, influence, decision-making
- Ownership — accountability, initiative, follow-through
- Decision Making — reasoning, justification, adaptability

Score each dimension after the interview based on observed evidence.`

  )

  sections.push(
    `## Story Extraction
As the candidate answers, identify reusable stories:
- Leadership Story — when they led a team or initiative
- Failure Story — when something went wrong and how they handled it
- Conflict Story — disagreement and resolution
- Architecture Story — designing or evolving a system
- Scaling Story — handling growth, load, or complexity

Note these for potential follow-up probes.`

  )

  sections.push(
    `## Interview Guidelines
1. Start with a brief introduction, then move into questions.
2. Tailor questions to the candidate's resume, the role they applied for, and any relevant experience listed.
3. Use the resume context to ask specific, personalized questions about their past work — not generic ones.
4. Probe deeper into areas mentioned in their resume. Ask "can you tell me more about..." or "what was your specific contribution to...".
5. Ask a mix of conceptual, scenario-based, and applied questions relevant to ${role}. For example: "Your API went down at 3 AM. Walk me through it." — pose realistic, high-pressure situations that test on-the-spot thinking.
6. If the candidate struggles, offer hints before moving on.
7. After 4-5 questions, provide a brief verbal summary of strengths and areas for improvement.
8. Do NOT ask more than one question at a time.
9. Keep responses spoken-word friendly — no markdown, no code blocks in speech (describe code verbally instead).
10. You have ${input.durationMinutes} minutes for this interview. Pace accordingly. After about ${Math.max(1, input.durationMinutes - 2)} minutes, begin wrapping up.`
  )

  return sections.join("\n\n")
}
