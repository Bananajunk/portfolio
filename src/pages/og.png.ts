import { getEntry } from "astro:content";
import { renderOgImage } from "../lib/og-image.ts";

export async function GET() {
  const hero = (await getEntry("hero", "hero"))?.data;
  if (!hero) throw new Error("Missing hero entry in src/content/hero.json");
  const png = await renderOgImage({
    name: hero.name,
    title: hero.title,
    tagline: "Accessible, fast product engineering, end to end.",
    domain: "bananajunk.dev",
  });
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
}
