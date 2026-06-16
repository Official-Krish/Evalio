import { serve } from "bun";
import index from "./index.html";

const BACKEND_URL = process.env.VITE_BACKEND_URL || "http://localhost:3000";

const server = serve({
  port: 5173,
  routes: {
    "/api/*": async (req) => {
      const url = new URL(req.url);
      return fetch(`${BACKEND_URL}${url.pathname}${url.search}`, req);
    },
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});
