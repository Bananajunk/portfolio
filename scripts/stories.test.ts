import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { lintClaimText } from "../src/content/claim-rules.ts";
import { publicSources, storyParts } from "../src/lib/stories.ts";
import { findUnverified } from "./content-checks.ts";

const read = (name: string) =>
  JSON.parse(
    readFileSync(
      new URL(`../src/content/${name}.json`, import.meta.url),
      "utf8",
    ),
  );

const part = (text: string) => ({
  text,
  source: [{ kind: "resume" as const }],
});

test("an empty trade-offs block is omitted, never rendered", () => {
  const parts = storyParts({
    problem: part("P"),
    whatIDid: part("W"),
    tradeoffs: { text: "", source: [] },
    outcome: part("O"),
  });
  assert.deepEqual(
    parts.map((p) => p.key),
    ["problem", "whatIDid", "outcome"],
  );
});

test("a written trade-offs block keeps the four-part order", () => {
  const parts = storyParts({
    problem: part("P"),
    whatIDid: part("W"),
    tradeoffs: part("T"),
    outcome: part("O"),
  });
  assert.deepEqual(
    parts.map((p) => p.label),
    ["Problem", "What I did", "Trade-offs", "Outcome"],
  );
});

test("public sources are listed once, in order", () => {
  const pub = { kind: "public" as const, name: "Post", url: "https://x.test" };
  const parts = storyParts({
    problem: { text: "P", source: [pub] },
    whatIDid: part("W"),
    tradeoffs: { text: "", source: [] },
    outcome: { text: "O", source: [pub] },
  });
  assert.deepEqual(publicSources(parts), [pub]);
});

test("the three Stories ship complete, verified and rule-abiding", () => {
  const stories = read("stories");
  assert.deepEqual(
    stories.map((s: { id: string }) => s.id),
    ["accessibility", "flow-2", "include-utensils"],
  );
  assert.deepEqual(findUnverified(stories), []);
  for (const story of stories) {
    for (const key of ["problem", "whatIDid", "outcome"]) {
      assert.notEqual(story[key].text, "", `${story.id}.${key} is empty`);
    }
    for (const key of ["problem", "whatIDid", "tradeoffs", "outcome"]) {
      assert.deepEqual(lintClaimText(story[key].text), []);
    }
  }
});

test("About has no empty entries", () => {
  for (const item of read("about")) assert.notEqual(item.text, "");
});

test("accessibility Story keeps the audited wording", () => {
  const text = JSON.stringify(read("stories")[0]);
  assert.match(text, /personally fixed 120\+ of ~280/);
  assert.doesNotMatch(text, /fixed 280/i);
});
