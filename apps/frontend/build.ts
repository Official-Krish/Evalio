import tailwind from "bun-plugin-tailwind";
import { rm } from "node:fs/promises";
import path from "node:path";

const outdir = path.join(process.cwd(), "dist");
await rm(outdir, { recursive: true, force: true });

const entrypoints = [...new Bun.Glob("src/**/*.html").scanSync()];

const result = await Bun.build({
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

for (const output of result.outputs) {
  console.log(
    ` ${path.relative(process.cwd(), output.path)}  ${(output.size / 1024).toFixed(1)} KB`,
  );
}
