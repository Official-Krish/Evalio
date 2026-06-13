export interface BlogPost {
  slug: string
  title: string
  subtitle: string
  date: string
  readMins: number
  tag: string
  sections: { heading?: string; body: string }[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "why-voice-interviews-change-everything",
    title: "Why voice changes everything about interview practice",
    subtitle:
      "Text-based mock interviews teach you what to say. Voice practice teaches you how to say it — and that gap is where most candidates lose.",
    date: "June 10, 2026",
    readMins: 5,
    tag: "Interview Science",
    sections: [
      {
        body: "Most interview prep tools give you a text box. You type an answer. The AI grades it. You move on. It feels productive — but it trains the wrong muscle. Real interviews are spoken, real-time, and unforgiving of filler.",
      },
      {
        heading: "The performance gap is real",
        body: "A candidate can write a perfect STAR answer in a Google Doc and completely freeze when asked the same question aloud. Speaking under pressure activates a different cognitive load than writing. Your working memory competes with language production, emotional regulation, and social performance simultaneously. Text prep doesn't stress-test any of that.",
      },
      {
        heading: "Transcription reveals what you can't see",
        body: "When Interview Lab transcribes your spoken answer, candidates are frequently surprised. They said \"basically\" eleven times. They never answered the actual question. They trailed off mid-sentence three times. You can't feel those things while speaking — you need to hear them back. That feedback loop, repeated, is what builds fluency.",
      },
      {
        heading: "Repetition in the right modality",
        body: "Deliberate practice in sports psychology means practicing in conditions that match performance. A basketball player doesn't practice free throws while sitting. An interview candidate shouldn't practice answers while typing. Interview Lab closes that gap — you speak, the AI listens, questions follow-up in real time, and you get scored on the actual output.",
      },
      {
        heading: "What this means for your prep",
        body: "Don't cut text prep entirely. Reading job descriptions, preparing STAR stories, and researching companies is necessary groundwork. But the final 20% — the translation of knowledge into composed, articulate speech — only comes from voice practice. That's the layer Interview Lab is built to train.",
      },
    ],
  },
  {
    slug: "how-ai-scores-your-interview",
    title: "How Interview Lab scores your performance",
    subtitle:
      "Behind the numbers: what the AI is actually measuring, how scores are calculated, and what a 73 vs a 91 really means.",
    date: "June 5, 2026",
    readMins: 6,
    tag: "Product",
    sections: [
      {
        body: "After every session, Interview Lab generates four scores: Overall, Communication, Technical, and Problem Solving. People ask us what these actually measure. This post explains the methodology honestly — including the limitations.",
      },
      {
        heading: "The evaluation input",
        body: "The AI evaluator receives the full structured Q&A from your session — every question the interviewer asked, and every answer you gave. It also receives your resume and GitHub profile if provided. The evaluator is a separate Gemini call made after the interview ends, so it sees the complete session rather than making in-the-moment judgements.",
      },
      {
        heading: "Communication score",
        body: "This measures how clearly and confidently ideas are expressed — not what you said, but how. It penalises excessive hedging (\"I think maybe possibly\"), incomplete thoughts, and answers that don't directly address the question. It rewards clear framing, appropriate pace (inferred from transcript length vs turn duration), and confident directness.",
      },
      {
        heading: "Technical score",
        body: "Technical score evaluates the accuracy and depth of technical content in your answers. It cross-references your stated experience on the resume — so a junior candidate answering a systems design question is judged differently than a senior engineer doing the same. The rubric looks for: correct terminology, depth of explanation, awareness of tradeoffs, and whether claims match the resume context.",
      },
      {
        heading: "Problem Solving score",
        body: "This one is the hardest to measure and we're most transparent about its limitations. It tries to capture structured thinking: did you break the problem down before answering? Did you acknowledge constraints? Did you revise your approach when challenged? It's noisier than the other scores but improves as session length increases.",
      },
      {
        heading: "What a score improvement actually means",
        body: "The most meaningful signal isn't a single session score — it's the delta across sessions for the same role. A 67 → 81 on a Software Engineer practice run means the evaluator found measurably more depth, clarity, and structure the second time. That's the number to track.",
      },
    ],
  },
  {
    slug: "building-real-time-voice-on-the-web",
    title: "Building real-time AI voice interviews in the browser",
    subtitle:
      "The technical decisions behind Interview Lab's live voice session — WebSockets, Gemini Live, and why we ditched the obvious architecture.",
    date: "May 28, 2026",
    readMins: 8,
    tag: "Engineering",
    sections: [
      {
        body: "Building a product where a user speaks to an AI in real time, the AI responds with voice, and everything is transcribed and persisted — sounds simple on a whiteboard. In practice it involved throwing away two architectures before landing on one that actually works.",
      },
      {
        heading: "What we tried first: HTTP polling",
        body: "The first prototype sent audio blobs via HTTP POST, waited for a Gemini response, and played back TTS. Latency was 3–6 seconds per exchange. Interviews felt like talking to someone on a very bad satellite call. We killed this in week one.",
      },
      {
        heading: "WebSockets to Gemini Live",
        body: "The current architecture uses a persistent WebSocket from the browser to our backend, which maintains its own WebSocket connection to Gemini's Live API. This eliminates the handshake overhead on every exchange. Audio chunks stream in real time. The AI's response audio streams back before the answer is complete. Latency dropped to under 800ms end-to-end in typical conditions.",
      },
      {
        heading: "The dedup problem",
        body: "Gemini sends incremental transcription chunks: \"Tell\" → \"Tell me\" → \"Tell me about\" → \"Tell me about your journey\". Each chunk is a refinement of the previous, not a new word. Naively appending these produces garbled text. We wrote a dedupAppend function that detects when an incoming chunk extends the existing buffer vs when it's genuinely new content. This is one of those 20-line functions that took two days to get right.",
      },
      {
        heading: "Turn management and persistence",
        body: "Each question-answer exchange is a \"turn\" stored in the database. The backend buffers the AI's question and the user's answer in memory until a turn boundary is detected (when the user stops speaking). At that point both are flushed to the database atomically. This means if a session disconnects mid-interview, all completed turns are preserved and the evaluation can still run.",
      },
      {
        heading: "What's next",
        body: "We're exploring letting candidates choose different interviewer personalities — a more direct FAANG-style interviewer vs a conversational startup founder style. The architecture supports this via prompt switching. The harder part is making each persona feel genuinely different in voice and temperament, not just lexically different. That's the next engineering problem.",
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}
