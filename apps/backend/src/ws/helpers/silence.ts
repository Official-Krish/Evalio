import type { InterviewConnection } from "../session";

const SILENCE_CHECK_INTERVAL = 10_000;
const MAX_SILENCE_PROMPTS = 3;
const SILENCE_COOLDOWN = 60_000;
const VOICE_SILENCE_THRESHOLD = 30_000;
const VOICE_EXTENDED_THRESHOLD = 45_000;
const VOICE_DESIGN_CRITIQUE_THRESHOLD = 40_000;
const DSA_SILENCE_THRESHOLD = 120_000;
const SD_SILENCE_THRESHOLD = 180_000;
const DSA_CODE_ACTIVITY_WINDOW = 30_000;
const SD_CANVAS_ACTIVITY_WINDOW = 15_000;

export function startSilenceTimer(conn: InterviewConnection) {
  stopSilenceTimer(conn);
  conn.silenceTimer = setInterval(
    () => checkSilence(conn),
    SILENCE_CHECK_INTERVAL,
  );
}

export function stopSilenceTimer(conn: InterviewConnection) {
  if (conn.silenceTimer) {
    clearInterval(conn.silenceTimer);
    conn.silenceTimer = null;
  }
}

export function resetSilenceState(conn: InterviewConnection) {
  conn.lastAudioTime = Date.now();
  conn.lastCodePreviewTime = 0;
  conn.lastCanvasSnapshotTime = 0;
  conn.lastCanvasSnapshotData = null;
  conn.silencePromptCount = 0;
  conn.lastSilencePromptTime = 0;
  conn.silencePromptActive = false;
}

function checkSilence(conn: InterviewConnection) {
  if (conn.closingMode || conn.finalized) return;
  if (conn.waitingForAiResponse) return;
  if (conn.silencePromptCount >= MAX_SILENCE_PROMPTS) return;

  const now = Date.now();
  if (now - conn.lastSilencePromptTime < SILENCE_COOLDOWN) return;

  const audioElapsed = now - conn.lastAudioTime;

  const isSpecificSilent = conn.isSystemDesign
    ? audioElapsed >= SD_SILENCE_THRESHOLD &&
      now - conn.lastCanvasSnapshotTime < SD_CANVAS_ACTIVITY_WINDOW
    : conn.isDsaMode
      ? audioElapsed >= DSA_SILENCE_THRESHOLD &&
        now - conn.lastCodePreviewTime < DSA_CODE_ACTIVITY_WINDOW
      : false;

  if (isSpecificSilent) {
    sendSilencePrompt(conn, conn.isSystemDesign ? "sd" : "dsa");
    return;
  }

  // Fall through to generic silence prompt — threshold depends on variant tier
  const voiceThreshold =
    conn.silenceTier === "extended"
      ? VOICE_EXTENDED_THRESHOLD
      : conn.silenceTier === "design_critique"
        ? VOICE_DESIGN_CRITIQUE_THRESHOLD
        : VOICE_SILENCE_THRESHOLD;
  if (audioElapsed >= voiceThreshold) {
    sendSilencePrompt(conn, "voice");
  }
}

function sendSilencePrompt(
  conn: InterviewConnection,
  mode: "voice" | "dsa" | "sd",
) {
  if (!conn.gemini) return;

  conn.silencePromptCount++;
  conn.lastSilencePromptTime = Date.now();
  conn.silencePromptActive = true;

  const text =
    mode === "voice"
      ? `[SYSTEM: The candidate has been silent for 30 seconds. If appropriate for the current moment in the interview, gently encourage them to share their thoughts. You might ask an open-ended question like "Take your time — what are you thinking?" or "Feel free to think out loud." Only prompt if it feels natural — don't interrupt their thinking if they seem to be working through something.]`
      : mode === "dsa"
        ? `[SYSTEM: The candidate has been coding silently for 2 minutes without speaking. Do NOT look at or analyze their code directly. Instead, ask a process-oriented question about their approach. For example: "Could you walk me through your approach so far?" or "What's your current thinking on the time complexity?" If they seem stuck, offer a subtle hint or ask a leading question rather than pointing out errors. Use probing questions to keep them talking about their solution without giving it away.]`
        : buildSdSilencePrompt(conn.lastCanvasSnapshotData);

  conn.gemini.send(
    JSON.stringify({
      clientContent: {
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true,
      },
    }),
  );

  conn.waitingForAiResponse = true;
}

function buildSdSilencePrompt(canvasData: unknown): string {
  const canvasContext =
    canvasData && typeof canvasData === "object"
      ? `\n\nLatest canvas state for reference:\n${JSON.stringify(canvasData).slice(0, 800)}`
      : "";

  return `[SYSTEM: The candidate has been working on their diagram silently for 3 minutes. Do NOT analyze or critique their design directly. Instead, ask a Socratic question about their choices. Reference what they've drawn on the canvas. For example: "I see you've added [component] — what tradeoffs did you consider there?" or "How would this design handle a sudden spike in traffic to [specific part of their diagram]?" You could also gently introduce a constraint change relevant to their current design. Keep the conversation going without evaluating their work explicitly.]${canvasContext}`;
}
