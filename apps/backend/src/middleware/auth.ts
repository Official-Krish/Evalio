import { Elysia } from "elysia";
import { jwt } from "@elysia/jwt";
import type { Cookie } from "elysia";
import { prisma } from "../lib/prisma";

const SECRET = Bun.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const TTL = 60_000;

type CacheEntry = {
  version: number;
  expiresAt: number;
};

const roleVersionCache = new Map<string, CacheEntry>();

function getCached(id: string): number | null {
  const entry = roleVersionCache.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    roleVersionCache.delete(id);
    return null;
  }
  return entry.version;
}

function setCached(id: string, version: number) {
  roleVersionCache.set(id, { version, expiresAt: Date.now() + TTL });
}

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

    const cached = getCached(uid);
    if (cached !== null) {
      if (cached !== tokenRoleVersion) {
        cookie.token?.remove();
        throw new Error("Unauthorized");
      }
      return {
        user: {
          id: uid,
          email: payload.email as string,
          name: payload.name as string | undefined,
          role: payload.role as "FREE" | "PRO" | "ADMIN",
        },
      };
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: uid },
        select: { roleVersion: true, role: true },
      });

      if (!user) {
        setCached(uid, -1);
        cookie.token?.remove();
        throw new Error("Unauthorized");
      }

      setCached(uid, user.roleVersion);

      if (user.roleVersion !== tokenRoleVersion) {
        cookie.token?.remove();
        throw new Error("Unauthorized");
      }

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
