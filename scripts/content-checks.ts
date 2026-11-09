/**
 * Pure logic for the build-time content checks, so it can be tested without
 * touching the filesystem.
 */

export interface RoleData {
  id: string;
  org: string;
  title: string;
  reconciledFrom?: string;
  start: string;
  end: string;
  location: string;
}

export interface ResumeJob {
  org: string;
  title: string;
  when: string;
  location: string;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function decode(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Reads the job headers out of the Resume HTML. */
export function parseResumeJobs(html: string): ResumeJob[] {
  const jobs: ResumeJob[] = [];
  const pattern =
    /<span class="org">(.*?)<\/span>\s*·\s*<span class="role">(.*?)<\/span>[\s\S]*?<span class="when">(.*?)<\/span>/g;
  for (const match of html.matchAll(pattern)) {
    const [, org = "", title = "", when = ""] = match;
    const [dates = "", location = ""] = decode(when).split(" · ");
    jobs.push({
      org: decode(org),
      title: decode(title),
      when: dates,
      location,
    });
  }
  return jobs;
}

function formatYearMonth(value: string): string {
  if (value === "present") return "Present";
  const [year = "", month = ""] = value.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** Dates as the Resume prints them, e.g. "Sep 2025 – Present". */
export function formatDates(role: Pick<RoleData, "start" | "end">): string {
  return `${formatYearMonth(role.start)} – ${formatYearMonth(role.end)}`;
}

export interface Finding {
  level: "warn" | "info";
  message: string;
}

function sameOrg(site: string, resume: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/\.com$/, "");
  return norm(site) === norm(resume);
}

/** Compares Role data with the Resume. Drift is a warning, never a failure. */
export function findDrift(roles: RoleData[], jobs: ResumeJob[]): Finding[] {
  const findings: Finding[] = [];
  for (const role of roles) {
    const job = jobs.find((j) => sameOrg(role.org, j.org));
    if (!job) {
      findings.push({
        level: "warn",
        message: `${role.org}: no matching job on the Resume`,
      });
      continue;
    }
    if (role.title !== job.title) {
      if (role.reconciledFrom === job.title) {
        findings.push({
          level: "info",
          message: `${role.org}: title "${role.title}" deliberately differs from the Resume's "${job.title}" (ADR 0003)`,
        });
      } else {
        findings.push({
          level: "warn",
          message: `${role.org}: title is "${role.title}" but the Resume says "${job.title}"`,
        });
      }
    } else if (role.reconciledFrom) {
      findings.push({
        level: "warn",
        message: `${role.org}: the Resume now matches "${role.title}", so drop reconciledFrom`,
      });
    }
    const dates = formatDates(role);
    if (dates !== job.when) {
      findings.push({
        level: "warn",
        message: `${role.org}: dates are "${dates}" but the Resume says "${job.when}"`,
      });
    }
    if (role.location !== job.location) {
      findings.push({
        level: "warn",
        message: `${role.org}: location is "${role.location}" but the Resume says "${job.location}"`,
      });
    }
  }
  for (const job of jobs) {
    if (!roles.some((r) => sameOrg(r.org, job.org))) {
      findings.push({
        level: "warn",
        message: `${job.org}: on the Resume but missing from the roles data`,
      });
    }
  }
  return findings;
}

/** Walks content data and lists every place still marked unverified. */
export function findUnverified(data: unknown, path = ""): string[] {
  const found: string[] = [];
  if (Array.isArray(data)) {
    data.forEach((item, i) => {
      found.push(...findUnverified(item, `${path}[${i}]`));
    });
  } else if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      const here = path ? `${path}.${key}` : key;
      if (key === "unverified") {
        if (value === true) found.push(here);
        else if (Array.isArray(value)) {
          for (const topic of value) found.push(`${here}: ${String(topic)}`);
        }
      } else {
        found.push(...findUnverified(value, here));
      }
    }
  }
  return found;
}

export const CONTENT_FILES = [
  "roles",
  "stories",
  "skills",
  "education",
  "earlier",
  "about",
] as const;
