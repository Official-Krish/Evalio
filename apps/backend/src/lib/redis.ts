import { createClient } from "redis";

const host = process.env.REDIS_HOST ?? "localhost";

export const redisSubscriber = createClient({
  url: `redis://${host}:6379`,
});

redisSubscriber.on("error", (err) => {
  console.error("[redis] error:", err);
});

export async function initRedis() {
  await redisSubscriber.connect();
  console.log("[redis] connected to", host);
}
