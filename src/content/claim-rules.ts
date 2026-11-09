/**
 * Claim rules as code (GLOSSARY.md, spec #1). Every text field in the content
 * collections is linted against these when the collections load, so a
 * violation fails `pnpm build`.
 *
 * Kept dependency-free so scripts and tests can import it directly.
 */

/** Owner-internal names that must never appear on the Site. Extend as needed. */
export const BANNED_INTERNAL_NAMES = [
  "Olympus",
  "Apollo",
  "Mercury",
  "Minos",
  "Zeus",
  "Lookout",
  "Jeeves",
] as const;

export interface ClaimRule {
  id: string;
  message: string;
  pattern: RegExp;
}

export const CLAIM_RULES: readonly ClaimRule[] = [
  ...BANNED_INTERNAL_NAMES.map((name) => ({
    id: `internal-name-${name.toLowerCase()}`,
    message: `"${name}" is an Owner-internal name`,
    pattern: new RegExp(`\\b${name}\\b`, "i"),
  })),
  {
    id: "fixed-280",
    message:
      'Never "fixed 280". Say "led remediation of ~280 findings" and "personally fixed 120+"',
    pattern: /\bfixed\s+(?:all\s+|over\s+|~\s*)?280\b/i,
  },
  {
    id: "cart-state-launched",
    message:
      "Unified Client Cart State was designed and built to 100% of staging, never launched",
    pattern:
      /Unified Client Cart State[^.]*\b(?:launched|launch|live in production|in production)\b/i,
  },
  {
    id: "maestro-ownership",
    message:
      "Never claim Maestro or the Flow engine; cite Shopify's public post instead",
    pattern:
      /\b(?:built|wrote|designed|created|authored|led)\b[^.]*\bMaestro\b/i,
  },
  {
    id: "phone-number",
    message: "The phone number stays off the public web",
    pattern: /\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/,
  },
];

/** Returns the message for every rule the text breaks. */
export function lintClaimText(text: string): string[] {
  return CLAIM_RULES.filter((rule) => rule.pattern.test(text)).map(
    (rule) => rule.message,
  );
}
