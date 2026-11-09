// Fails when the gzipped JS a first load pulls in exceeds the budget.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_BYTES = Number(process.env.JS_BUDGET_BYTES ?? 30 * 1024);
const dist = "dist";
const html = readFileSync(join(dist, "index.html"), "utf8");

const scripts = new Set();
const queue = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map(
  (m) => m[1],
);
queue.push(
  ...[
    ...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g),
  ].map((m) => m[1]),
);

// Follow static imports so chunks pulled in by an entry count too.
while (queue.length) {
  const src = queue.pop();
  if (!src.startsWith("/") || scripts.has(src)) continue;
  scripts.add(src);
  const code = readFileSync(join(dist, src), "utf8");
  for (const m of code.matchAll(
    /(?:from|import)\s*["'](\.{1,2}\/[^"']+)["']/g,
  )) {
    queue.push(join(dirname(src), m[1]));
  }
}

let total = 0;
for (const src of scripts) {
  const size = gzipSync(readFileSync(join(dist, src))).length;
  total += size;
  console.log(`${String(size).padStart(7)} B  ${src}`);
}
console.log(`${String(total).padStart(7)} B  total (budget ${BUDGET_BYTES} B)`);

if (total > BUDGET_BYTES) {
  console.error("JS budget exceeded");
  process.exit(1);
}
