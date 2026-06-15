import { WebSocketServer, WebSocket as WsWebSocket } from "ws";
import { redisSubscriber } from "../lib/redis";
import { dequeueNext, activateInQueue } from "../lib/queue";
import { InterviewConnection } from "./session";

const WS_PORT = parseInt(Bun.env.WS_PORT ?? "8080");

export function startWsServer() {
  const wss = new WebSocketServer({ port: WS_PORT });
  const wsMap = new Map<string, WsWebSocket>();
  const startCallbacks = new Map<string, () => Promise<void>>();

  async function notifyPositionUpdates() {
    const entries = await redisSubscriber.zRange("queue:waiting", 0, -1);
    for (let i = 0; i < entries.length; i++) {
      const ws = wsMap.get(entries[i]!);
      if (ws && ws.readyState === 1) {
        ws.send(
          JSON.stringify({ type: "position_update", position: i + 1 }),
        );
      }
    }
  }

  async function dequeueNextAndNotify() {
    while (true) {
      const nextId = await dequeueNext();
      if (!nextId) return;

      const ws = wsMap.get(nextId);
      if (!ws || ws.readyState !== 1) {
        wsMap.delete(nextId);
        startCallbacks.delete(nextId);
        continue;
      }

      await activateInQueue(nextId);

      const callback = startCallbacks.get(nextId);
      if (callback) {
        await callback();
      }
      return;
    }
  }

  wss.on("connection", (client) => {
    console.log("[ws] candidate connected");

    new InterviewConnection(
      client,
      wsMap,
      startCallbacks,
      dequeueNextAndNotify,
      notifyPositionUpdates,
    );
  });

  console.log(`WS server running on port ${WS_PORT}`);
}
