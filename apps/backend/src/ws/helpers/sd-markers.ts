import type { CanvasDiffAction } from "@evalio/shared";
import type { InterviewConnection } from "../session";

let canvasDiffCount = 0;
let canvasExampleCount = 0;
let lastCanvasDiffTime = 0;
let lastCanvasExampleTime = 0;

export function resetSdCounters() {
  canvasDiffCount = 0;
  canvasExampleCount = 0;
  lastCanvasDiffTime = 0;
  lastCanvasExampleTime = 0;
}

export async function handleSdMarkers(conn: InterviewConnection) {
  const buf = conn.questionBuf;

  const diffMatch = buf.match(
    /<canvas_diff>\s*(\[[\s\S]*?\])\s*<\/canvas_diff>/i,
  );
  if (diffMatch) {
    const now = Date.now();
    const canSend = now - lastCanvasDiffTime >= 15_000 && canvasDiffCount < 50;
    if (canSend) {
      try {
        const actions = JSON.parse(diffMatch[1]!) as CanvasDiffAction[];
        await conn.safeSend({ type: "canvas_diff", actions });
        canvasDiffCount++;
        lastCanvasDiffTime = now;
      } catch {}
    }
  }

  const exampleMatch = buf.match(
    /<canvas_example>\s*(\{[\s\S]*?\})\s*<\/canvas_example>/i,
  );
  if (exampleMatch) {
    const now = Date.now();
    const canSend =
      now - lastCanvasExampleTime >= 60_000 && canvasExampleCount < 5;
    if (canSend) {
      try {
        const payload = JSON.parse(exampleMatch[1]!);
        await conn.safeSend({ type: "canvas_example", ...payload });
        canvasExampleCount++;
        lastCanvasExampleTime = now;
      } catch {}
    }
  }
}
