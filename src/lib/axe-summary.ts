// Turns an axe-core result into the plain counts the Play section reports.
interface Rule {
  id: string;
  nodes: unknown[];
}

export interface AxeResultLike {
  violations: Rule[];
  passes: Rule[];
  incomplete: Rule[];
  inapplicable: Rule[];
}

export interface AxeSummary {
  failedRules: number;
  failedElements: number;
  passedRules: number;
  reviewRules: number;
  failedIds: string[];
}

export const summarize = (result: AxeResultLike): AxeSummary => ({
  failedRules: result.violations.length,
  failedElements: result.violations.reduce((n, v) => n + v.nodes.length, 0),
  passedRules: result.passes.length,
  reviewRules: result.incomplete.length,
  failedIds: result.violations.map((v) => v.id),
});

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

export const describeSummary = (s: AxeSummary): string => {
  const review =
    s.reviewRules > 0
      ? ` ${plural(s.reviewRules, "rule")} need a human check.`
      : "";
  if (s.failedRules === 0) {
    return `Pass. ${plural(s.passedRules, "rule")} passed, 0 failed.${review}`;
  }
  return `Fail. ${plural(s.failedRules, "rule")} failed across ${plural(s.failedElements, "element")}, ${s.passedRules} passed: ${s.failedIds.join(", ")}.${review}`;
};

export const ERROR_MESSAGE =
  "The check could not run in this browser. The Site is still tested with axe on every change; the latest results are in the repository.";
