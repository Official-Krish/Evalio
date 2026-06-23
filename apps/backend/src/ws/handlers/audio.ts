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
  console.log("[ws] audio_stream_end from client \u2192 Gemini");

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
