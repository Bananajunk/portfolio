import { readResumePdf } from "../lib/resume-pdf.ts";

export async function GET() {
  return new Response(new Uint8Array(await readResumePdf()), {
    headers: { "Content-Type": "application/pdf" },
  });
}
