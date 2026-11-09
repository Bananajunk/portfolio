import assert from "node:assert/strict";
import { test } from "node:test";
import { lintClaimText } from "../src/content/claim-rules.ts";
import {
  findDrift,
  findUnverified,
  parseResumeJobs,
  type RoleData,
} from "./content-checks.ts";

const html = `<span class="org">Faire</span> · <span class="role">Senior Frontend Developer</span></span>
    <span class="when">Jul 2023 – Sep 2025 · Remote</span>`;

const faire: RoleData = {
  id: "faire",
  org: "Faire",
  title: "Senior Frontend Developer",
  start: "2023-07",
  end: "2025-09",
  location: "Remote",
};

test("matching roles produce no findings", () => {
  assert.deepEqual(findDrift([faire], parseResumeJobs(html)), []);
});

test("title, date and location drift each warn", () => {
  const drifted = {
    ...faire,
    title: "Staff Engineer",
    end: "2025-10",
    location: "Toronto, ON",
  };
  const findings = findDrift([drifted], parseResumeJobs(html));
  assert.equal(findings.filter((f) => f.level === "warn").length, 3);
});

test("a reconciled title is info, a stale reconciliation warns", () => {
  const reconciled = {
    ...faire,
    title: "Senior Software Engineer",
    reconciledFrom: "Senior Frontend Developer",
  };
  const jobs = parseResumeJobs(html);
  assert.deepEqual(
    findDrift([reconciled], jobs).map((f) => f.level),
    ["info"],
  );
  const stale = { ...reconciled, reconciledFrom: "Something Else" };
  assert.equal(findDrift([stale], jobs)[0]?.level, "warn");
});

test("findUnverified reports flags and topics", () => {
  const found = findUnverified([
    { a: { unverified: true } },
    { unverified: ["Team size"] },
    { unverified: false },
  ]);
  assert.deepEqual(found, ["[0].a.unverified", "[1].unverified: Team size"]);
});

test("claim rules catch the forbidden phrasings", () => {
  assert.equal(lintClaimText("Fixed 280 accessibility findings").length, 1);
  assert.equal(
    lintClaimText("personally fixed 120+ of ~280 findings").length,
    0,
  );
  assert.equal(
    lintClaimText("Unified Client Cart State launched to all").length,
    1,
  );
  assert.equal(lintClaimText("Built on Olympus").length, 1);
  assert.equal(lintClaimText("Built Maestro at Shopify").length, 1);
  assert.equal(lintClaimText("Call (519) 577-8763").length, 1);
  assert.equal(
    lintClaimText("rolled out to 100% of restaurants (Nov 2026)").length,
    0,
  );
});
