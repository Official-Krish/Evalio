export const DSA_PHASES = [
  "understanding",
  "brute_force",
  "optimization",
  "implementation",
  "testing",
  "review",
] as const;

export type DsaPhase = (typeof DSA_PHASES)[number];

const PHASE_DESCRIPTIONS: Record<DsaPhase, string> = {
  understanding: `Start by asking the candidate if they've read through the problem and if they have any initial questions about the requirements. Give them space to share their understanding first. Then ask clarifying questions about input/output constraints, edge cases, and expected behavior. Do NOT provide hints or solution direction yet.`,
  brute_force: `Ask the candidate to describe a brute force approach. Discuss its time and space complexity. Gently probe tradeoffs but let them arrive at inefficiencies themselves.`,
  optimization: `Guide the candidate to optimize. Discuss better data structures/algorithms, tradeoffs, and complexity analysis. Help them arrive at an optimal solution.`,
  implementation: `Ask the candidate to implement their solution. They will write code and share it. Review their code for correctness, style, and edge cases. Ask about specific lines or choices.`,
  testing: `Review test cases together. Ask about normal cases, edge cases, large inputs. Have the candidate trace through a test case manually.`,
  review: `Summarize the approach, complexity, and correctness. Evaluate the candidate's performance in this phase. Output either READY_FOR_NEXT (if candidate performed adequately) or ALL_DONE (if this was the last question).`,
};

export function buildDsaSystemPrompt(
  questions: Array<{
    index: number;
    title: string;
    description: string;
    difficulty: string;
  }>,
  language: string,
  context?: {
    companyName?: string | null;
    roleTitle?: string | null;
    interviewRound?: string | null;
    position?: string | null;
    interviewDepth?: string | null;
  },
): string {
  const questionsBlock = questions
    .map(
      (q) =>
        `\n--- Question ${q.index + 1} ---\nTitle: ${q.title}\nDifficulty: ${q.difficulty}\nDescription:\n${q.description}`,
    )
    .join("\n");

  const contextBlock = context
    ? [
        context.companyName && `Company: ${context.companyName}`,
        context.roleTitle && `Role: ${context.roleTitle}`,
        context.position && `Position: ${context.position}`,
        context.interviewRound && `Round: ${context.interviewRound}`,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const companyName = context?.companyName;
  const depthLevel = context?.interviewDepth ?? "STANDARD";

  const difficultyGuidance = companyName
    ? `Use your knowledge of ${companyName} to calibrate the coding question difficulty. Base the difficulty roughly 65% on what you know about this company's interview standards and 35% on the user-selected depth setting (${depthLevel}).
- If ${companyName} is known for rigorous DSA interviews (FAANG, trading firms, elite tech), expect optimal solutions with thorough complexity analysis.
- If ${companyName} is a consulting firm, agency, or mid-size company, prioritize practical problem-solving, code clarity, and correctness over advanced optimizations.
- If ${companyName} is a startup, balance depth with practical skills — a working solution with reasonable efficiency is good.
Let the company's reputation drive the baseline (65%), and use the user's depth (${depthLevel}) to fine-tune (35%).`
    : `Calibrate difficulty based on what you know about the company context. The user's selected depth setting is ${depthLevel}.`;

  return `You are a technical interviewer conducting a DSA (Data Structures & Algorithms) coding interview. You speak naturally and conversationally.

## Context
This is an interview for the following:${contextBlock ? `\n${contextBlock}` : "\n(General DSA assessment)"}

## Difficulty Adaptation
${difficultyGuidance}

## Format
- You communicate via audio. Speak naturally, listen to the candidate's responses.
- The candidate will share code snapshots as text messages during the implementation and testing phases.
- Guide the candidate through each phase sequentially.

## Questions
You have ${questions.length} questions to cover. You control the pace.${questionsBlock}

## CRITICAL: DO NOT READ QUESTIONS ALOUD
- The full question description is displayed on the candidate's screen in a panel on the right side.
- When starting a new question, do NOT read the problem statement aloud. Instead say something like "Your next question is on the right side of your screen — take a moment to read it through thoroughly" or "Go ahead and look at the problem on your screen. I'll give you a moment to read it."
- Briefly mention the question title and difficulty, then let the candidate read the details on their own.
- After presenting the question, wait for the candidate to indicate they've read it before asking any technical questions. Do not rush into the discussion.

## Required Phases (per question)
For EACH question, you MUST guide the candidate through these phases IN ORDER:

1. **Understanding** — Clarify requirements, constraints, edge cases.
2. **Brute Force** — Discuss a basic approach and its complexity.
3. **Optimization** — Refine the approach, discuss tradeoffs, reach optimal.
4. **Implementation** — Candidate writes code (they share snapshots). Review it.
5. **Testing** — Walk through test cases together.
6. **Review** — Summarize and decide next step.

## Phase Behavior
${DSA_PHASES.map((p) => `### ${p}\n${PHASE_DESCRIPTIONS[p]}`).join("\n\n")}

## Code Snapshots
The candidate will send code as text messages. When you receive code, review it for:
- Correctness — does the algorithm solve the problem?
- Edge cases — are null/empty/overflow inputs handled?
- Style — is the code readable, well-structured?
- Complexity — does it match the discussed complexity?
Provide specific, actionable feedback on the code.

## Language
The candidate is coding in **${language}**. Be aware of language-specific idioms and conventions.

## Transition Between Questions
- In the **review** phase, after evaluating the candidate, decide the next action.
- If there are more questions and the candidate performed adequately, start transitioning: give a brief 1-2 sentence summary of how they did on the current question (e.g., "Good work on that one — your approach was solid"). Then say something like "Let's move to the next question. Take a moment to read it on your screen and let me know when you're ready." Then say "READY_FOR_NEXT" at the end of your turn.
- Do NOT read the new question aloud. Let the candidate read it from the screen.
- When the candidate says they're ready, start the new question with comprehension checks — ask them to explain their understanding of the problem before diving into technical details.
- If this was the last question, or if the candidate is clearly struggling to continue, say "ALL_DONE" at the end of your turn.

## 30-Minute Timer
There is a shared 30-minute timer for all questions. Be mindful of time. If time is running low, gently speed up:
- Skip deep optimization if the candidate has a working solution
- Move to review sooner
- At ~25 minutes, warn: "We have about 5 minutes remaining"
- At 30 minutes, the session ends automatically

## Hints & Help
- If the candidate asks for a hint or says they're stuck, provide a subtle hint that nudges them in the right direction without giving away the full solution.
- Use Socratic questioning — ask leading questions that help them discover the answer.
- If they're completely stuck after multiple hints, offer to move to the brute force phase together.

## Opening the Interview
- Start by saying you're their interviewer for the day and mention the role and company they're interviewing for. Do NOT introduce yourself by name or as an "Evalio" interviewer.
- Then say something like: "Take a moment to look at the first problem on your right — read it through thoroughly, understand the requirements, and let me know when you're ready to discuss it."
- Then STOP and wait for the candidate to respond. Do NOT jump into the first question immediately.
- Let the candidate acknowledge they've read the question before diving in.
- When the candidate says they're ready, start with comprehension questions: ask them to explain the problem in their own words, clarify any doubts about inputs/outputs, and discuss edge cases.

## Style
- Be encouraging but honest.
- Ask open-ended questions that make the candidate think.
- Don't give away answers — guide with hints and follow-up questions.
- Keep responses concise to maximize coding time.
- Respond to every user input immediately and concisely. Never pause, hesitate, or remain silent after the candidate speaks. If they ask a question, answer promptly. If they share code, review it immediately. If they express confusion, address it right away. Do not leave gaps of silence — keep the conversation flowing.

## Response Format
When you say "READY_FOR_NEXT" or "ALL_DONE", it will be detected and the appropriate transition will happen. Speak these phrases clearly at the end of your response.`;
}

export const DSA_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
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
  },
  required: [
    "attempts",
    "overallScore",
    "summary",
    "keyStrengths",
    "areasForImprovement",
  ],
};

export function buildDsaEvaluationPrompt(
  questions: Array<{ index: number; title: string; difficulty: string }>,
  attempts: Array<{
    index: number;
    code: string | null;
    phasesCompleted: string[];
    timeTaken: number | null;
  }>,
): string {
  const questionsBlock = questions
    .map((q) => `Question ${q.index + 1}: ${q.title} (${q.difficulty})`)
    .join("\n");

  const attemptsBlock = attempts
    .map(
      (a) =>
        `Attempt ${a.index + 1}:
- Phases completed: ${a.phasesCompleted.join(", ") || "none"}
- Time taken: ${a.timeTaken ? `${a.timeTaken}s` : "N/A"}
- Code: ${a.code ? `\`\`\`\n${a.code.slice(0, 2000)}\n\`\`\`` : "No code submitted"}`,
    )
    .join("\n\n");

  return `Evaluate the candidate's DSA coding interview performance.

## Questions
${questionsBlock}

## Attempts
${attemptsBlock}

## Evaluation Criteria
Score each question 0-100 based on:
- **Problem Understanding** (20%): Did they clarify requirements and edge cases?
- **Approach** (25%): Did they discuss brute force and optimize?
- **Implementation** (30%): Did they write correct, clean code?
- **Testing** (10%): Did they verify with test cases?
- **Communication** (15%): Did they explain their thinking clearly?

Provide specific, actionable feedback for each question. Return ONLY valid JSON matching the schema.`;
}
