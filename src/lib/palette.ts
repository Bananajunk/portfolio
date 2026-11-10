import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/** Build-time artwork uses the same checked tokens as the Site. */
export async function loadDayPalette() {
  const css = await readFile(
    resolve(process.cwd(), "src/styles/themes.css"),
    "utf8",
  );
  const block = css.match(/\[data-theme="day"\]\s*\{([^}]+)\}/)?.[1];
  if (!block) throw new Error("Missing day palette");
  const values = new Map(
    [...block.matchAll(/--c-([\w-]+):\s*(#[\da-fA-F]{6});/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );
  return (name: string): string => {
    const value = values.get(name);
    if (!value) throw new Error(`Missing day colour: ${name}`);
    return value;
  };
}
