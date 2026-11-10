import { loadDayPalette } from "../lib/palette.ts";
export async function GET() {
  const colour = await loadDayPalette();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Liam Reid"><rect width="64" height="64" rx="16" fill="${colour("tint-lilac")}"/><g fill="${colour("ink")}"><path d="M13 17h7v28h12v6H13Z"/><path d="M35 17h10c9 0 13 4 13 11 0 5-2 8-6 10l7 13h-8l-6-12h-3v12h-7Zm7 6v10h3c4 0 6-2 6-5s-2-5-6-5Z"/></g></svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
}
