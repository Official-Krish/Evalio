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
  role: "FREE" | "PRO" | "ADMIN";
  expiresAt: number;
};

const roleCache = new Map<string, CacheEntry>();

function getCached(id: string): CacheEntry | null {
  const entry = roleCache.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    roleCache.delete(id);
    return null;
  }
  return entry;
}

function setCached(
  id: string,
  version: number,
  role: "FREE" | "PRO" | "ADMIN",
) {
  roleCache.set(id, { version, role, expiresAt: Date.now() + TTL });
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
      if (cached.version !== tokenRoleVersion) {
        cookie.token?.remove();
        throw new Error("Unauthorized");
      }
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
        setCached(uid, -1, "FREE");
        cookie.token?.remove();
        throw new Error("Unauthorized");
      }

      setCached(uid, user.roleVersion, user.role);

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
