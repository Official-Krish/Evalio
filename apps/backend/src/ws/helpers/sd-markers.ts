import type { CanvasDiffAction } from "@evalio/shared";
import type { InterviewConnection } from "../session";

interface TaskDescriptionPayload {
  title: string;
  description: string;
}

let canvasDiffCount = 0;
let canvasExampleCount = 0;
let taskDescriptionCount = 0;
let lastCanvasDiffTime = 0;
let lastCanvasExampleTime = 0;

export function resetSdCounters() {
  canvasDiffCount = 0;
  canvasExampleCount = 0;
  taskDescriptionCount = 0;
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
    if (now - lastCanvasDiffTime >= 15_000 && canvasDiffCount < 50) {
      try {
        const actions = JSON.parse(diffMatch[1]!) as CanvasDiffAction[];
        await conn.safeSend({ type: "canvas_diff", actions });
        canvasDiffCount++;
        lastCanvasDiffTime = now;
      } catch {
        console.error("[sd] failed to parse canvas_diff JSON");
      }
    }
  }

  const exampleMatch = buf.match(
    /<canvas_example>\s*(\{[\s\S]*?\})\s*<\/canvas_example>/i,
  );
  if (exampleMatch) {
    const now = Date.now();
    if (now - lastCanvasExampleTime >= 60_000 && canvasExampleCount < 5) {
      try {
        const payload = JSON.parse(exampleMatch[1]!);
        await conn.safeSend({ type: "canvas_example", ...payload });
        canvasExampleCount++;
        lastCanvasExampleTime = now;
      } catch {
        console.error("[sd] failed to parse canvas_example JSON");
      }
    }
  }

  const taskMatch = buf.match(
    /<task_description>\s*(\{[\s\S]*?\})\s*<\/task_description>/i,
  );
  if (taskMatch && taskDescriptionCount < 3) {
    try {
      const payload = JSON.parse(taskMatch[1]!) as TaskDescriptionPayload;
      await conn.safeSend({
        type: "task_description",
        title: payload.title,
        description: payload.description,
      });
      taskDescriptionCount++;
    } catch {
      console.error("[sd] failed to parse task_description JSON");
    }
  }
}
