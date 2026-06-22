import { Elysia } from "elysia";
import { jwt } from "@elysia/jwt";
import type { Cookie } from "elysia";
import { prisma } from "../lib/prisma";

const SECRET = Bun.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const TTL = 30_000;

type CacheEntry = {
  role: "FREE" | "PRO" | "ADMIN";
  expiresAt: number;
};

const roleCache = new Map<string, CacheEntry>();

export const authGuard = new Elysia({ name: "auth-guard" })
  .use(jwt({ secret: SECRET, exp: "7d" }))
  .resolve({ as: "scoped" }, async ({ jwt, cookie }) => {
    const t = cookie.token as Cookie<unknown> | undefined;
    const tokenValue = t?.value;
    if (typeof tokenValue !== "string") {
      throw new Error("Unauthorized");
    }

    const payload = await jwt.verify(tokenValue);
    if (!payload || !payload.id || !payload.email) {
      throw new Error("Unauthorized");
    }

    const uid = payload.id as string;
    const tokenRoleVersion = (payload.roleVersion as number) ?? 0;

    const cached = roleCache.get(uid);
    if (
      cached !== null &&
      cached !== undefined &&
      Date.now() < cached.expiresAt
    ) {
      return {
        user: {
          id: uid,
          email: payload.email as string,
          name: payload.name as string | undefined,
          role: cached.role,
        },
      };
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: uid },
        select: { roleVersion: true, role: true },
      });

      if (!user) {
        cookie.token?.remove();
        throw new Error("Unauthorized");
      }

      if (user.roleVersion !== tokenRoleVersion) {
        cookie.token?.remove();
        throw new Error("Unauthorized");
      }

      roleCache.set(uid, { role: user.role, expiresAt: Date.now() + TTL });

      return {
        user: {
          id: uid,
          email: payload.email as string,
          name: payload.name as string | undefined,
          role: user.role,
        },
      };
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") throw err;
      throw new Error("Unauthorized");
    }
  });
