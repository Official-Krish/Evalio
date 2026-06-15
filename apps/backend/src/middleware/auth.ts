import { Elysia } from "elysia";
import { jwt } from "@elysia/jwt";
import type { Cookie } from "elysia";

const SECRET = Bun.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export const authGuard = new Elysia({ name: "auth-guard" })
  .use(jwt({ secret: SECRET, exp: "7d" }))
  .resolve({ as: "scoped" }, async ({ jwt, cookie }) => {
    const t = cookie.token as Cookie<any> | undefined;
    const tokenValue = t?.value;
    if (typeof tokenValue !== "string") {
      throw new Error("Unauthorized");
    }

    const payload = await jwt.verify(tokenValue);
    if (!payload || !payload.id || !payload.email) {
      throw new Error("Unauthorized");
    }

    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.name as string | undefined,
        role: (payload.role as "FREE" | "ADMIN") ?? "FREE",
      },
    };
  });
