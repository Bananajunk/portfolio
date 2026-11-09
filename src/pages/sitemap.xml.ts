import { sitemapXml } from "../lib/seo.ts";

// One scrolling page. Add a path here if the Site ever gains another route.
export function GET() {
  return new Response(sitemapXml(["/"]), {
    headers: { "Content-Type": "application/xml" },
  });
}
