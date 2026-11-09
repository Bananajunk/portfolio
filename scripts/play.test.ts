import assert from "node:assert/strict";
import { test } from "node:test";
import { describeSummary, summarize } from "../src/lib/axe-summary.ts";
import {
  atEdge,
  COLS,
  cellFromPoint,
  clampCell,
  describe,
  move,
  ROWS,
} from "../src/lib/stickers.ts";

test("move steps one cell and stops at the board edge", () => {
  assert.deepEqual(move({ col: 3, row: 2 }, "right"), { col: 4, row: 2 });
  assert.deepEqual(move({ col: 0, row: 0 }, "left"), { col: 0, row: 0 });
  assert.deepEqual(move({ col: COLS - 1, row: ROWS - 1 }, "down"), {
    col: COLS - 1,
    row: ROWS - 1,
  });
  assert.deepEqual(move({ col: 1, row: 1 }, "up", 5), { col: 1, row: 0 });
});

test("clampCell keeps strays on the board", () => {
  assert.deepEqual(clampCell({ col: -4, row: 99 }), { col: 0, row: ROWS - 1 });
});

test("cellFromPoint snaps to the nearest cell", () => {
  assert.deepEqual(cellFromPoint(0, 0, 100, 50), { col: 0, row: 0 });
  assert.deepEqual(cellFromPoint(100, 50, 100, 50), {
    col: COLS - 1,
    row: ROWS - 1,
  });
  assert.deepEqual(cellFromPoint(50, 25, 100, 50), { col: 5, row: 3 });
  assert.deepEqual(cellFromPoint(500, -20, 100, 50), { col: COLS - 1, row: 0 });
  assert.deepEqual(cellFromPoint(10, 10, 0, 0), { col: 0, row: 0 });
});

test("describe and atEdge read well for screen readers", () => {
  assert.equal(
    describe("Banana", { col: 0, row: 5 }),
    "Banana, column 1 of 11, row 6 of 6",
  );
  assert.equal(atEdge({ col: 0, row: 2 }, "left"), true);
  assert.equal(atEdge({ col: 0, row: 2 }, "right"), false);
});

const rule = (id: string, nodes = 1) => ({ id, nodes: Array(nodes).fill({}) });

test("summarize counts rules and elements", () => {
  const s = summarize({
    violations: [rule("color-contrast", 3), rule("label")],
    passes: [rule("a"), rule("b"), rule("c")],
    incomplete: [rule("d")],
    inapplicable: [],
  });
  assert.deepEqual(s, {
    failedRules: 2,
    failedElements: 4,
    passedRules: 3,
    reviewRules: 1,
    failedIds: ["color-contrast", "label"],
  });
});

test("describeSummary reports pass and fail in words", () => {
  const pass = summarize({
    violations: [],
    passes: [rule("a")],
    incomplete: [],
    inapplicable: [],
  });
  assert.equal(describeSummary(pass), "Pass. 1 rule passed, 0 failed.");
  const fail = summarize({
    violations: [rule("label", 2)],
    passes: [rule("a"), rule("b")],
    incomplete: [rule("c"), rule("d")],
    inapplicable: [],
  });
  assert.equal(
    describeSummary(fail),
    "Fail. 1 rule failed across 2 elements, 2 passed: label. 2 rules need a human check.",
  );
});
