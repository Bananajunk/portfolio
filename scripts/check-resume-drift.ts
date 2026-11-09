/**
 * Warns when Role data drifts from resume.html. Never fails the build
 * (ADR 0003): drift is a prompt to reconcile, not an error.
 */
import { readFileSync } from "node:fs";
import { findDrift, parseResumeJobs, type RoleData } from "./content-checks.ts";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("resume.html", root), "utf8");
const roles = JSON.parse(
  readFileSync(new URL("src/content/roles.json", root), "utf8"),
) as RoleData[];

const jobs = parseResumeJobs(html);
if (jobs.length === 0) {
  console.warn("resume drift: could not read any jobs from resume.html");
} else {
  const findings = findDrift(roles, jobs);
  for (const f of findings)
    console.warn(`resume drift (${f.level}): ${f.message}`);
  const warnings = findings.filter((f) => f.level === "warn").length;
  console.log(
    warnings === 0
      ? "resume drift: roles match resume.html"
      : `resume drift: ${warnings} warning(s)`,
  );
}
