// Fails when a theme token pair drops below its WCAG ratio.
// Reads src/styles/themes.css, the single source of truth for the palette.
import { readFileSync } from "node:fs";

const css = readFileSync(
  new URL("../src/styles/themes.css", import.meta.url),
  "utf8",
);

const parseBlock = (selector) => {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`themes.css: missing ${selector}`);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  return Object.fromEntries(
    [...body.matchAll(/--c-([\w-]+):\s*(#[0-9a-fA-F]{6});/g)].map((m) => [
      m[1],
      m[2].toLowerCase(),
    ]),
  );
};

const themes = {
  day: parseBlock('[data-theme="day"] {'),
  dusk: parseBlock('[data-theme="dusk"] {'),
  night: parseBlock('[data-theme="night"] {'),
};
const noJsNight = parseBlock(":root:not([data-theme]) {");

const channel = (v) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const tints = ["tint-peach", "tint-mint", "tint-sky", "tint-lilac"];
const surfaces = ["bg", "surface", ...tints];

// [foreground, background, minimum, why]
const pairs = [
  ...surfaces.flatMap((s) => [
    ["ink", s, 4.5, "text"],
    ["ink-soft", s, 4.5, "text"],
    ["accent", s, 4.5, "link text"],
    ["focus", s, 3, "focus ring, 2.4.13"],
    ["border", s, 3, "UI component edge"],
  ]),
  ["on-banana", "banana", 4.5, "text"],
];

const results = [];
let failed = false;
for (const [name, tokens] of Object.entries(themes)) {
  for (const [fg, bg, min, why] of pairs) {
    const r = ratio(tokens[fg], tokens[bg]);
    const ok = r >= min;
    if (!ok) failed = true;
    results.push({ name, fg, bg, r, min, why, ok });
  }
}

for (const key of Object.keys(themes.night)) {
  if (themes.night[key] !== noJsNight[key]) {
    failed = true;
    console.error(
      `no-JS dark fallback differs from night theme for --c-${key}`,
    );
  }
}

if (process.argv.includes("--table")) {
  for (const name of Object.keys(themes)) {
    console.log(`\n${name}`);
    for (const x of results.filter((r) => r.name === name)) {
      console.log(
        `${x.ok ? "ok  " : "FAIL"} ${x.fg} on ${x.bg}: ${x.r.toFixed(2)} (min ${x.min}, ${x.why})`,
      );
    }
  }
} else {
  for (const x of results.filter((r) => !r.ok)) {
    console.error(
      `FAIL [${x.name}] ${x.fg} on ${x.bg}: ${x.r.toFixed(2)} < ${x.min} (${x.why})`,
    );
  }
}

if (failed) {
  console.error("Contrast check failed.");
  process.exit(1);
}
console.log(`Contrast check passed (${results.length} pairs across 3 themes).`);
