// Builds the Open Graph / Twitter card image at build time. Text is converted
// to vector paths from the self-hosted fonts, so the PNG looks the same on any
// machine and CI needs no system fonts.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { create, type Font } from "fontkitten";
import sharp from "sharp";
import { OG_IMAGE_SIZE } from "./seo.ts";

const { width, height } = OG_IMAGE_SIZE;

// Day palette from src/styles/themes.css.
const colours = {
  bg: "#fff8e1",
  ink: "#1b1a17",
  inkSoft: "#5a5446",
  banana: "#ffd23f",
  accent: "#5b2be0",
};

// Resolved from the project root: this module is bundled into dist/ at build.
const fontPath = (name: string) =>
  resolve(process.cwd(), `public/fonts/${name}-latin-wght-normal.woff2`);

// fontkitten cannot instance a WOFF2 variable font, so text uses each font's
// default weight (Bricolage 800, Atkinson 400). At thumbnail size that reads
// better than the site's medium display weight anyway.
async function loadFont(name: string): Promise<Font> {
  const font = create(await readFile(fontPath(name)));
  if (font.isCollection) throw new Error(`Expected a single font in ${name}`);
  return font;
}

/** Lay out one line of text as an SVG path, baseline at (x, y). */
function textPath(
  font: Font,
  text: string,
  size: number,
  x: number,
  y: number,
) {
  const scale = size / font.unitsPerEm;
  let pen = 0;
  // One glyph per character: no kerning, which is fine at these sizes.
  const paths = font.glyphsForString(text).map((glyph) => {
    const d = glyph.path.toSVG();
    const gx = pen;
    pen += glyph.advanceWidth;
    return d ? `<path transform="translate(${gx} 0)" d="${d}"/>` : "";
  });
  return {
    svg: `<g transform="translate(${x} ${y}) scale(${scale} ${-scale})">${paths.join("")}</g>`,
    width: pen * scale,
  };
}

export interface OgInput {
  name: string;
  title: string;
  tagline: string;
  domain: string;
}

export async function renderOgImage({
  name,
  title,
  tagline,
  domain,
}: OgInput): Promise<Buffer> {
  const [display, text] = await Promise.all([
    loadFont("bricolage-grotesque"),
    loadFont("atkinson-hyperlegible-next"),
  ]);
  const left = 96;
  const nameLine = textPath(display, name, 148, left, 300);
  const titleLine = textPath(text, title, 52, left, 392);
  const taglineLine = textPath(text, tagline, 34, left, 468);
  const domainLine = textPath(text, domain, 34, left, 548);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${colours.bg}"/>
  <rect x="0" y="0" width="${width}" height="16" fill="${colours.banana}"/>
  <rect x="${left}" y="120" width="96" height="10" rx="5" fill="${colours.banana}"/>
  <g fill="${colours.ink}">${nameLine.svg}${titleLine.svg}</g>
  <g fill="${colours.inkSoft}">${taglineLine.svg}</g>
  <g fill="${colours.accent}">${domainLine.svg}</g>
</svg>`;
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
