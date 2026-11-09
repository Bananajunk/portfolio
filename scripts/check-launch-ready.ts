/**
 * Launch-readiness check. Fails while anything in the content is still marked
 * unverified. Not part of `pnpm check` or `pnpm build`; run it before launch.
 */
import { readFileSync } from "node:fs";
import { CONTENT_FILES, findUnverified } from "./content-checks.ts";

const root = new URL("../", import.meta.url);
const pending: string[] = [];
for (const name of CONTENT_FILES) {
  const data: unknown = JSON.parse(
    readFileSync(new URL(`src/content/${name}.json`, root), "utf8"),
  );
  for (const where of findUnverified(data))
    pending.push(`${name}${where.startsWith("[") ? "" : "."}${where}`);
}

if (pending.length > 0) {
  console.error(
    `launch check: ${pending.length} unverified item(s) to confirm with Liam:`,
  );
  for (const p of pending) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("launch check: nothing unverified");
