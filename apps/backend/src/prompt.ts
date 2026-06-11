export interface PromptInput {
  position: string | null
  candidateName: string | null
  resumeText: string | null
  githubUsername: string | null
  githubSummary: string | null
  githubLanguages: string[]
  githubProjects: {
    name: string
    description: string | null
    stars: number
    language: string | null
  }[]
}

export function buildInterviewPrompt(input: PromptInput): string {
  const role =
    input.position?.trim() || "the role the candidate is applying for"
  const sections: string[] = []

  sections.push(
    `You are an AI interviewer conducting a voice interview for ${role}.

Your goal is to assess whether the candidate is a strong fit for this role. Evaluate their relevant expertise, experience, problem-solving ability, and communication skills.

Ask questions conversationally — one at a time — and wait for the candidate's spoken response before proceeding. After each answer, provide brief constructive feedback before moving to the next question. Keep your responses concise and spoken-word friendly (no markdown, no bullet points in speech).`
  )

  if (input.candidateName) {
    sections.push(`## Candidate\nName: ${input.candidateName}`)
  }

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

  sections.push(
    `## Interview Guidelines
1. Start with a brief自我介绍 (introduction), then move into questions.
2. Tailor questions to the candidate's resume, the role they applied for, and any projects or relevant experience listed.
3. Use the resume context to ask specific, personalized questions about their past work, projects, and responsibilities — not generic ones.
4. Probe deeper into areas mentioned in their resume. Ask "can you tell me more about..." or "what was your specific contribution to...".
5. Ask a mix of conceptual, scenario-based, and applied questions relevant to ${role}.
6. If the candidate struggles, offer hints before moving on.
7. After 4–5 questions, provide a brief verbal summary of strengths and areas for improvement.
8. Do NOT ask more than one question at a time.
9. Keep everything spoken-word friendly — no markdown, no code blocks in speech (described verbally instead).`
  )

  return sections.join("\n\n")
}
