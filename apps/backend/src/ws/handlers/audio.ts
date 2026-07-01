import type { InterviewConnection } from "../session";
import {
  isChallengeMode,
  createTurn,
  flushTurn,
  mergeAnswerBuf,
} from "../helpers/turn";

export async function handleAudioChunk(
  conn: InterviewConnection,
  msg: Record<string, unknown>,
) {
  if (conn.closingMode || conn.finalized) return;
  if (!conn.gemini) {
    await conn.safeSend({
      error: "Not initialized. Send init first.",
    });
    return;
  }
  conn.lastAudioTime = Date.now();
  conn.audioChunksSinceLastTurn++;
  if (conn.audioChunksSinceLastTurn === 1) {
    console.log(
      `[audio] forwarding first audio chunk to Gemini (waitingForAiResponse=${conn.waitingForAiResponse})`,
    );
  }
  if (conn.canvasInactivityTimer) {
    clearTimeout(conn.canvasInactivityTimer);
    conn.canvasInactivityTimer = null;
  }
  try {
    conn.gemini.send(
      JSON.stringify({
        realtimeInput: {
          mediaChunks: [
            {
              mimeType: "audio/pcm;rate=16000",
              data: msg.data as string,
            },
          ],
        },
      }),
    );
  } catch {
    await conn.safeSend({ error: "Failed to send audio" });
  }
}

export async function handleAudioStreamEnd(
  conn: InterviewConnection,
  msg: Record<string, unknown>,
) {
  if (conn.closingMode || conn.finalized) return;
  if (!conn.gemini) {
    await conn.safeSend({
      error: "Not initialized. Send init first.",
    });
    return;
  }
  conn.lastAudioTime = Date.now();
  if (conn.canvasInactivityTimer) {
    clearTimeout(conn.canvasInactivityTimer);
    conn.canvasInactivityTimer = null;
  }

  const isInterrupted = (msg as { interrupted?: boolean }).interrupted === true;
  if (isInterrupted) {
    conn.interruptionCount++;
  }
  const MIN_MEANINGFUL_CHUNKS = 3;

  // Hallucination guardrail: if the user barely spoke, silently keep listening
  if (!isInterrupted && conn.audioChunksSinceLastTurn < MIN_MEANINGFUL_CHUNKS) {
    conn.waitingForAiResponse = false;
    conn.audioChunksSinceLastTurn = 0;
    conn.gemini.send(
      JSON.stringify({
        clientContent: {
          turns: [],
          turnComplete: false,
        },
      }),
    );
    return;
  }

  conn.audioChunksSinceLastTurn = 0;

  if (isInterrupted) {
    if (conn.questionBuf) {
      await flushTurn(conn);
    } else if (conn.currentTurnId && conn.answerBuf) {
      await mergeAnswerBuf(conn, "\n\n");
    }
    conn.answerBuf = "";
    conn.currentTurnId = null;
    conn.questionBuf = "";
    conn.cleanQuestionBuf = "";
    conn.waitingForAiResponse = false;
    conn.audioChunksSinceLastTurn = 0;
    return;
  }

  if (isChallengeMode(conn)) {
    if (conn.interviewId) {
      if (!conn.currentTurnId && conn.questionBuf) {
        conn.currentTurnId = await createTurn(conn, conn.questionBuf);
      }
      if (conn.currentTurnId && conn.answerBuf) {
        await mergeAnswerBuf(conn, "\n\n");
      }
    }
  } else {
    if (conn.interviewId && conn.questionBuf) {
      await flushTurn(conn);
    } else if (conn.interviewId && conn.currentTurnId && conn.answerBuf) {
      await mergeAnswerBuf(conn);
    }
  }

  conn.waitingForAiResponse = true;
  conn.dsaTransitioned = false;

  const signalTurnEnd = () => {
    if (!conn.gemini) return;
    try {
      conn.gemini.send(
        JSON.stringify({ realtimeInput: { audioStreamEnd: true } }),
      );
    } catch {
      // Non-critical
    }
    try {
      conn.gemini.send(
        JSON.stringify({
          clientContent: { turns: [], turnComplete: true },
        }),
      );
    } catch {
      // Non-critical
    }
  };

  // Silent Observation Mode: delay the AI's response by 3-5 seconds
  if (conn.runtime.silenceMode === "extended") {
    const delay = 3000 + Math.floor(Math.random() * 2000);
    setTimeout(() => signalTurnEnd(), delay);
  } else {
    signalTurnEnd();
  }
}
