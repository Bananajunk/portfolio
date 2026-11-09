import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";
import { lintClaimText } from "./content/claim-rules.ts";

/** Prose that is shown on the Site and so must obey the Claim rules. */
const claimText = z.string().superRefine((text, ctx) => {
  for (const message of lintClaimText(text)) {
    ctx.addIssue({ code: "custom", message });
  }
});

/** Where a Claim comes from: the Resume, LinkedIn, Liam (spec #1) or a named public source. */
const source = z
  .strictObject({
    kind: z.enum(["resume", "linkedin", "spec", "public"]),
    name: z.string().min(1).optional(),
    url: z.url().optional(),
  })
  .refine((s) => s.kind !== "public" || s.name !== undefined, {
    message: "A public source needs a name",
  });

/** One Claim: text, where it is traceable to, and whether Liam has confirmed it. */
const claim = z.strictObject({
  text: claimText.min(1),
  source,
  unverified: z.boolean().optional(),
});

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM");

const roles = defineCollection({
  loader: file("src/content/roles.json"),
  schema: z.strictObject({
    id: z.string().min(1),
    order: z.number().int(),
    org: z.string().min(1),
    /** Title as shown on the Site. */
    title: z.string().min(1),
    /** The Resume's title when the Site deliberately differs (ADR 0003). */
    reconciledFrom: z.string().min(1).optional(),
    start: yearMonth,
    end: z.union([yearMonth, z.literal("present")]),
    /** Location exactly as the Resume prints it. */
    location: z.string().min(1),
    size: z.enum(["large", "small"]),
    context: claimText.optional(),
    claims: z.array(claim).min(1),
  }),
});

/**
 * One of the four parts of a Story. Empty text is allowed only while it is
 * marked unverified; filled text needs a source.
 */
const storyPart = z
  .strictObject({
    text: claimText,
    source: source.optional(),
    unverified: z.boolean().optional(),
  })
  .refine((p) => p.text !== "" || p.unverified === true, {
    message: "An empty part must be marked unverified",
  })
  .refine((p) => p.text === "" || p.source !== undefined, {
    message: "A written part needs a source",
  });

const stories = defineCollection({
  loader: file("src/content/stories.json"),
  schema: z.strictObject({
    id: z.string().min(1),
    order: z.number().int(),
    title: z.string().min(1),
    problem: storyPart,
    whatIDid: storyPart,
    tradeoffs: storyPart,
    outcome: storyPart,
    /** Topics Liam has yet to confirm; any entry fails the launch-readiness check. */
    unverified: z.array(z.string().min(1)).default([]),
  }),
});

const skills = defineCollection({
  loader: file("src/content/skills.json"),
  schema: z.strictObject({
    id: z.string().min(1),
    order: z.number().int(),
    label: z.string().min(1),
    items: z.array(z.string().min(1)).min(1),
    source,
  }),
});

const education = defineCollection({
  loader: file("src/content/education.json"),
  schema: z.strictObject({
    id: z.string().min(1),
    order: z.number().int(),
    school: z.string().min(1),
    degree: z.string().min(1),
    startYear: z.number().int(),
    endYear: z.number().int(),
    source,
  }),
});

const earlier = defineCollection({
  loader: file("src/content/earlier.json"),
  schema: z.strictObject({
    id: z.string().min(1),
    order: z.number().int(),
    org: z.string().min(1),
    title: z.string().min(1),
    start: yearMonth,
    end: yearMonth,
    location: z.string().min(1),
    /** Optional one-liner about the work. */
    summary: claimText.optional(),
    source,
  }),
});

const about = defineCollection({
  loader: file("src/content/about.json"),
  schema: z
    .strictObject({
      id: z.string().min(1),
      order: z.number().int(),
      kind: z.enum(["language", "community", "bio"]),
      text: claimText,
      source: source.optional(),
      unverified: z.boolean().optional(),
    })
    .refine((a) => a.text !== "" || a.unverified === true, {
      message: "An empty item must be marked unverified",
    }),
});

const hero = defineCollection({
  loader: file("src/content/hero.json"),
  schema: z.strictObject({
    id: z.string().min(1),
    name: z.string().min(1),
    title: z.string().min(1),
    summary: claimText.min(1),
    /** One verified line of impact for the 30-second skim. */
    impact: claimText.min(1),
    source,
  }),
});

export const collections = {
  hero,
  roles,
  stories,
  skills,
  education,
  earlier,
  about,
};
