import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const outdir = path.resolve(dirname, "..", "dist");

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c8a97e"/>
      <stop offset="100%" stop-color="#a8885e"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1050" cy="200" r="300" fill="#c8a97e" opacity="0.04"/>
  <circle cx="1100" cy="300" r="200" fill="#c8a97e" opacity="0.03"/>
  <text x="80" y="200" font-family="Georgia, serif" font-size="72" font-weight="bold" fill="#ffffff" letter-spacing="-0.5">Evalio</text>
  <text x="80" y="280" font-family="Georgia, serif" font-size="28" fill="#a8885e" font-style="italic">interview practice that remembers.</text>
  <text x="80" y="360" font-family="system-ui, sans-serif" font-size="18" fill="#888888">
    <tspan x="80" dy="0">Practice interviews with AI that thinks</tspan>
    <tspan x="80" dy="28">like real interviewers. Scored across</tspan>
    <tspan x="80" dy="28">6 dimensions with actionable feedback.</tspan>
  </text>
  <rect x="80" y="440" width="180" height="48" rx="24" fill="url(#accent)"/>
  <text x="170" y="472" font-family="system-ui, sans-serif" font-size="16" fill="#0a0a0a" text-anchor="middle" font-weight="600">Get Started</text>
  <line x1="80" y1="530" x2="400" y2="530" stroke="#c8a97e" stroke-width="1" opacity="0.3"/>
  <text x="80" y="570" font-family="system-ui, sans-serif" font-size="12" fill="#555555">evalio.app</text>
</svg>`;

await sharp(Buffer.from(SVG))
  .resize(1200, 630)
  .png()
  .toFile(path.join(outdir, "og.png"));

console.log("✓ Generated og.png");
