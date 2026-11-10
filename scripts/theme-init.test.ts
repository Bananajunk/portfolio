import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const script = readFileSync(
  new URL("../public/theme-init.js", import.meta.url),
  "utf8",
);
function initialize(
  hour: number,
  stored: Record<string, string> = {},
  reduced = false,
) {
  const root = { dataset: {} as Record<string, string> };
  runInNewContext(script, {
    document: { documentElement: root },
    localStorage: { getItem: (key: string) => stored[key] ?? null },
    Date: class {
      getHours() {
        return hour;
      }
    },
    matchMedia: (query: string) => ({
      matches: query.includes("reduced-motion") && reduced,
    }),
  });
  return root.dataset;
}
test("Time of day defaults to the browser local hour", () => {
  for (const [hour, theme] of [
    [0, "night"],
    [5, "night"],
    [6, "day"],
    [16, "day"],
    [17, "dusk"],
    [19, "dusk"],
    [20, "night"],
    [23, "night"],
  ] as const)
    assert.equal(initialize(hour).theme, theme);
});
test("stored choices persist and reduced motion defaults Calm on", () => {
  assert.equal(initialize(12, { "bj-theme": "night" }).theme, "night");
  assert.equal(initialize(12, { "bj-theme": "invalid" }).theme, "day");
  assert.equal(initialize(12, {}, true).calm, "on");
  assert.equal(initialize(12, { "bj-calm": "off" }, true).calm, "off");
});
