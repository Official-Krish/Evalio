import type { InterviewConnection } from "../session";

export function startHeartbeat(conn: InterviewConnection) {
  conn.heartbeatTimer = setInterval(() => {
    if (conn.client.readyState !== 1) {
      stopHeartbeat(conn);
      return;
    }
    conn.client.ping();
    conn.pongTimeoutId = setTimeout(() => {
      console.log(`[ws] heartbeat timeout for ${conn.interviewId}`);
      conn.cleanup("heartbeat_timeout");
    }, 10000);
  }, 30000);

  conn.client.on("pong", () => {
    if (conn.pongTimeoutId) {
      clearTimeout(conn.pongTimeoutId);
      conn.pongTimeoutId = null;
    }
  });
}

export function stopHeartbeat(conn: InterviewConnection) {
  if (conn.heartbeatTimer) clearInterval(conn.heartbeatTimer);
  if (conn.pongTimeoutId) clearTimeout(conn.pongTimeoutId);
  conn.heartbeatTimer = null;
  conn.pongTimeoutId = null;
}
