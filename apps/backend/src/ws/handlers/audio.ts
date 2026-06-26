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
  if (conn.closingMode) return;
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
  try {
    conn.gemini.send(
      JSON.stringify({
        realtimeInput: {
          mediaChunks: [
            {
              mimeType: "audio/pcm",
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
  if (conn.closingMode) return;
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
    if (conn.questionBuf) {
      await flushTurn(conn);
    } else if (conn.currentTurnId && conn.answerBuf) {
      await mergeAnswerBuf(conn, "\n\n");
    }
    conn.answerBuf = "";
    conn.currentTurnId = null;
    conn.questionBuf = "";
    conn.cleanQuestionBuf = "";
    conn.waitingForAiResponse = true;

    try {
      conn.gemini.send(
        JSON.stringify({
          realtimeInput: { audioStreamEnd: true },
        }),
      );
    } catch {
      await conn.safeSend({ error: "Failed to end audio stream" });
    }
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

  // Inject [PACING] signal as context (no AI response triggered)
  if (conn.pacing) {
    try {
      conn.gemini.send(
        JSON.stringify({
          clientContent: {
            turns: [
              {
                role: "user",
                parts: [{ text: conn.pacing.buildMessage() }],
              },
            ],
            turnComplete: false,
          },
        }),
      );
    } catch {
      // Non-critical — pacing is advisory
    }
  }

  try {
    conn.gemini.send(
      JSON.stringify({
        realtimeInput: {
          audioStreamEnd: true,
        },
      }),
    );
  } catch {
    await conn.safeSend({ error: "Failed to end audio stream" });
  }
}
