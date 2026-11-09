// Verifies the SEO and sharing output in dist/. Run after `pnpm build`.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const dist = "dist";
const site = "https://bananajunk.dev";
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (file) => readFileSync(join(dist, file), "utf8");
const meta = (html, attr, name) =>
  html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1];

const home = read("index.html");
if (!/<title>[^<]+<\/title>/.test(home)) fail("index.html: missing <title>");
if (!meta(home, "name", "description")) fail("index.html: missing description");
if (!home.includes(`<link rel="canonical" href="${site}/"`))
  fail("index.html: missing canonical URL");
for (const [attr, name] of [
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:url"],
  ["property", "og:image"],
  ["property", "og:image:alt"],
  ["name", "twitter:card"],
  ["name", "twitter:image"],
]) {
  if (!meta(home, attr, name)) fail(`index.html: missing ${name}`);
}
if (meta(home, "property", "og:image") !== `${site}/og.png`)
  fail("index.html: og:image must be the absolute /og.png URL");

// Open Graph image: a real 1200x630 PNG.
if (!existsSync(join(dist, "og.png"))) fail("og.png is missing");
else {
  const info = await sharp(join(dist, "og.png")).metadata();
  if (info.format !== "png" || info.width !== 1200 || info.height !== 630)
    fail(
      `og.png: expected 1200x630 png, got ${info.width}x${info.height} ${info.format}`,
    );
}

// Person JSON-LD.
const blocks = [
  ...home.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  ),
];
if (blocks.length !== 1)
  fail(`index.html: expected 1 JSON-LD block, got ${blocks.length}`);
else {
  try {
    const data = JSON.parse(blocks[0][1]);
    if (data["@context"] !== "https://schema.org" || data["@type"] !== "Person")
      fail("JSON-LD: expected a schema.org Person");
    for (const key of ["name", "jobTitle", "url", "email", "sameAs"])
      if (!data[key]) fail(`JSON-LD: missing ${key}`);
    if (/telephone|tel:|\d{3}[\s.)-]+\d{3}[\s.-]\d{4}/i.test(blocks[0][1]))
      fail("JSON-LD: contains a phone number");
  } catch (e) {
    fail(`JSON-LD: not valid JSON (${e.message})`);
  }
}

// Sitemap and robots.
if (!read("sitemap.xml").includes(`<loc>${site}/</loc>`))
  fail("sitemap.xml: missing the home URL");
if (!read("robots.txt").includes(`Sitemap: ${site}/sitemap.xml`))
  fail("robots.txt: missing the Sitemap line");

// 404.
if (!existsSync(join(dist, "404.html"))) fail("404.html is missing");
else {
  const nf = read("404.html");
  if (!/<h1[\s>]/.test(nf)) fail("404.html: missing <h1>");
  if (!/name="robots" content="noindex"/.test(nf))
    fail("404.html: missing noindex");
}

// No third-party scripts, and no cookie writes.
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
for (const file of walk(dist).filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  for (const m of html.matchAll(/<script[^>]*\ssrc="(https?:\/\/[^"]+)"/g))
    fail(`${file}: third-party script ${m[1]}`);
}
for (const file of walk(dist).filter((f) => f.endsWith(".js"))) {
  if (/document\.cookie\s*=/.test(readFileSync(file, "utf8")))
    fail(`${file}: writes a cookie`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("SEO and sharing output looks right.");
