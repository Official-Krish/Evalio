import { redisSubscriber } from "./redis";

const MAX_CONCURRENT = parseInt(Bun.env.MAX_CONCURRENT_SESSIONS ?? "4");

const ACTIVE_SET = "queue:active";
const WAITING_SORTED = "queue:waiting";
const META_PREFIX = "queue:meta:";

export async function getActiveCount(): Promise<number> {
  return redisSubscriber.sCard(ACTIVE_SET);
}

export async function enqueue(
  interviewId: string,
  userId: string,
): Promise<number> {
  await redisSubscriber.hSet(
    `${META_PREFIX}${interviewId}`,
    {
      userId,
      status: "WAITING",
      createdAt: Date.now().toString(),
    },
  );
  await redisSubscriber.expire(`${META_PREFIX}${interviewId}`, 7200);
  await redisSubscriber.zAdd(WAITING_SORTED, {
    score: Date.now(),
    value: interviewId,
  });
  const position = await redisSubscriber.zRank(WAITING_SORTED, interviewId);
  return (position ?? 0) + 1;
}

export async function activateInQueue(
  interviewId: string,
): Promise<void> {
  await redisSubscriber.sAdd(ACTIVE_SET, interviewId);
  await redisSubscriber.hSet(`${META_PREFIX}${interviewId}`, {
    status: "ACTIVE",
    startedAt: Date.now().toString(),
  });
}

export async function tryActivate(
  interviewId: string,
): Promise<boolean> {
  const activeCount = await getActiveCount();
  if (activeCount >= MAX_CONCURRENT) return false;
  await activateInQueue(interviewId);
  return true;
}

export async function releaseSlot(
  interviewId: string,
): Promise<void> {
  await redisSubscriber.sRem(ACTIVE_SET, interviewId);
  await redisSubscriber.hSet(`${META_PREFIX}${interviewId}`, {
    status: "COMPLETED",
    endedAt: Date.now().toString(),
  });
}

export async function removeFromQueue(
  interviewId: string,
): Promise<void> {
  await redisSubscriber.zRem(WAITING_SORTED, interviewId);
  await redisSubscriber.hSet(`${META_PREFIX}${interviewId}`, {
    status: "CANCELLED",
  });
}

export async function dequeueNext(): Promise<string | null> {
  const result = await redisSubscriber.zPopMin(WAITING_SORTED);
  if (!result) return null;
  return result.value;
}

export async function getPosition(
  interviewId: string,
): Promise<number> {
  const rank = await redisSubscriber.zRank(WAITING_SORTED, interviewId);
  return rank !== null ? rank + 1 : 0;
}

export async function getQueueLength(): Promise<number> {
  return redisSubscriber.zCard(WAITING_SORTED);
}
