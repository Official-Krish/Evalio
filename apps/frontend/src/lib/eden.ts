import { treaty } from "@elysiajs/eden";
import type { App } from "@evalio/backend";

declare const __BACKEND_URL__: string | undefined;
const base =
  typeof __BACKEND_URL__ !== "undefined"
    ? __BACKEND_URL__
    : "http://localhost:3000";

export const client = treaty<App>(base, {
  fetch: {
    credentials: "include",
  },
});

export const BASE_URL = base;
