import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * The committed Resume PDF lives at the repo root, not in `public/`, because
 * the source files are kept together. It is served from an endpoint instead,
 * so the file is copied to `dist/` at build and read from one place.
 */
export const RESUME_PDF_PATH = resolve(process.cwd(), "resume.pdf");

/** Public URL of the Resume PDF. */
export const RESUME_PDF_URL = "/liam-reid-resume.pdf";

export const readResumePdf = () => readFile(RESUME_PDF_PATH);

/** Human size such as "63 KB", computed from the committed file at build. */
export async function resumePdfSize(): Promise<string> {
  const { size } = await stat(RESUME_PDF_PATH);
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
