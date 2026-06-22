import tailwind from "bun-plugin-tailwind";
import { rm, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outdir = path.join(process.cwd(), "dist");
await rm(outdir, { recursive: true, force: true });

const entrypoints = [...new Bun.Glob("src/**/*.html").scanSync()];

await Bun.build({
  entrypoints,
  outdir,
  plugins: [tailwind],
  minify: true,
  target: "browser",
  sourcemap: "linked",
  // @ts-expect-error - alias is supported by Bun but not in types
  alias: {
    "@": "./src",
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    __BACKEND_URL__: JSON.stringify(
      process.env.VITE_BACKEND_URL || "http://localhost:3000",
    ),
    __WS_HOST__: JSON.stringify(process.env.VITE_WS_HOST || "localhost:8080"),
  },
});

// Make all asset paths absolute so they work on any sub-route after refresh.
const htmlPath = path.join(outdir, "index.html");
let html = await readFile(htmlPath, "utf-8");
html = html.replace(/(src|href)="(?:\.\/)?(?!\/|https?:\/\/|data:)/g, '$1="/');
await writeFile(htmlPath, html);

// Generate OG image
await import("./scripts/generate-og");
