// Checks every link in dist/: internal paths and #fragments resolve, and
// external URLs answer. Set SKIP_EXTERNAL=1 to skip the network checks.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const site = "https://bananajunk.dev";

const htmlFiles = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith(".html")) htmlFiles.push(path);
  }
};
walk(dist);

const pageFor = (urlPath) => {
  const clean = decodeURIComponent(urlPath.replace(/\/$/, ""));
  for (const c of [clean, `${clean}.html`, join(clean, "index.html")]) {
    const file = join(dist, c);
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
};

const idsOf = (file) =>
  new Set(
    [...readFileSync(file, "utf8").matchAll(/\sid="([^"]+)"/g)].map(
      (m) => m[1],
    ),
  );

const errors = [];
const external = new Set();

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const self = `/${file.slice(dist.length + 1)}`.replace(/index\.html$/, "");
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]*)"/g)) {
    const href = m[1].replaceAll("&amp;", "&");
    if (/^(mailto:|tel:)/.test(href)) continue;
    if (/^https?:\/\//.test(href)) {
      if (!href.startsWith(site)) external.add(href);
      continue;
    }
    const [pathPart, fragment] = href.split("#");
    const target = pathPart
      ? pageFor(pathPart.split("?")[0])
      : pageFor(self || "/");
    if (!target) {
      errors.push(`${file}: broken link ${href}`);
    } else if (fragment && !idsOf(target).has(fragment)) {
      errors.push(`${file}: missing anchor ${href}`);
    }
  }
}

if (!process.env.SKIP_EXTERNAL) {
  await Promise.all(
    [...external].map(async (url) => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(url, {
            redirect: "follow",
            signal: AbortSignal.timeout(15_000),
            headers: { "user-agent": "bananajunk-link-check" },
          });
          if (res.ok) return;
          if (attempt === 2) errors.push(`${url}: HTTP ${res.status}`);
        } catch (e) {
          if (attempt === 2) errors.push(`${url}: ${e.message}`);
        }
      }
    }),
  );
}

console.log(
  `Checked ${htmlFiles.length} page(s), ${external.size} external link(s).`,
);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
