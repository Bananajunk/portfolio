import assert from "node:assert/strict";
import { test } from "node:test";
import { contactLinks } from "../src/lib/contact.ts";
import {
  buildPerson,
  canonicalUrl,
  serializeJsonLd,
  sitemapXml,
} from "../src/lib/seo.ts";

const person = buildPerson({
  name: "Liam Reid",
  jobTitle: "Senior Software Engineer",
  description: "A description",
  url: "https://bananajunk.dev/",
  contacts: contactLinks,
});

test("Person data carries email, LinkedIn and GitHub only", () => {
  assert.equal(person["@type"], "Person");
  assert.equal(person.email, "cl2reid@gmail.com");
  assert.deepEqual(person.sameAs, [
    "https://www.linkedin.com/in/cl2reid/",
    "https://github.com/Bananajunk",
  ]);
});

test("Person data contains no phone number", () => {
  const json = serializeJsonLd(person);
  assert.equal(/\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/.test(json), false);
  assert.equal(/telephone|tel:/i.test(json), false);
});

test("Person data drops contacts that are not email or https links", () => {
  const p = buildPerson({
    name: "A",
    jobTitle: "B",
    description: "C",
    url: "https://bananajunk.dev/",
    contacts: [{ label: "Phone", text: "x", href: "tel:+15555550100" }],
  });
  assert.equal("email" in p, false);
  assert.deepEqual(p.sameAs, []);
});

test("JSON-LD cannot close its script element", () => {
  assert.equal(
    serializeJsonLd({ a: "</script>" }).includes("</script>"),
    false,
  );
});

test("canonical URLs drop trailing slashes except the root", () => {
  assert.equal(canonicalUrl("/"), "https://bananajunk.dev/");
  assert.equal(canonicalUrl("/a/"), "https://bananajunk.dev/a");
});

test("sitemap lists absolute URLs", () => {
  assert.match(sitemapXml(["/"]), /<loc>https:\/\/bananajunk\.dev\/<\/loc>/);
});
