// Pure helpers for head metadata and structured data. No Astro imports so
// scripts/seo.test.ts can run them under plain Node.

export const SITE_URL = "https://bananajunk.dev";
export const OG_IMAGE_PATH = "/og.png";
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export interface ContactLink {
  label: string;
  text: string;
  href: string;
}

export interface PersonInput {
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  contacts: readonly ContactLink[];
}

/** Absolute URL for a path on the Site, with no trailing slash except the root. */
export function absoluteUrl(path: string, site: string = SITE_URL): string {
  return new URL(path, site).href;
}

export function canonicalUrl(pathname: string, site: string = SITE_URL) {
  const clean = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return absoluteUrl(clean, site);
}

/**
 * schema.org Person. Email, LinkedIn and GitHub only: the phone number stays
 * off the public web (spec #1), so contact data is limited to what
 * `contactLinks` exposes and anything else is dropped.
 */
export function buildPerson({
  name,
  jobTitle,
  description,
  url,
  contacts,
}: PersonInput) {
  const email = contacts
    .map((c) => c.href)
    .find((href) => href.startsWith("mailto:"))
    ?.slice("mailto:".length);
  const sameAs = contacts
    .map((c) => c.href)
    .filter((href) => href.startsWith("https://"));
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle,
    description,
    url,
    ...(email ? { email } : {}),
    sameAs,
    knowsLanguage: ["en", "fr"],
  };
}

/** Serialise JSON-LD so it cannot close the surrounding script element. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

export function sitemapXml(paths: readonly string[], site = SITE_URL) {
  const urls = paths
    .map((p) => `  <url><loc>${absoluteUrl(p, site)}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
