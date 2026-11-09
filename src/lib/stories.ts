/**
 * Pure helpers for the Stories section, kept dependency-free so node tests can
 * import them. A Story always has four parts, but an empty one (no text yet)
 * is omitted rather than rendered as a blank block.
 */
export interface StorySource {
  kind: "resume" | "linkedin" | "spec" | "public";
  name?: string | undefined;
  url?: string | undefined;
}

export interface StoryPartInput {
  text: string;
  source: StorySource[];
}

export interface StoryInput {
  problem: StoryPartInput;
  whatIDid: StoryPartInput;
  tradeoffs: StoryPartInput;
  outcome: StoryPartInput;
}

export type StoryPartKey = keyof StoryInput;

const PARTS: readonly { key: StoryPartKey; label: string }[] = [
  { key: "problem", label: "Problem" },
  { key: "whatIDid", label: "What I did" },
  { key: "tradeoffs", label: "Trade-offs" },
  { key: "outcome", label: "Outcome" },
];

export interface StoryPart extends StoryPartInput {
  key: StoryPartKey;
  label: string;
}

/** The parts to show, in order, skipping any with no text. */
export function storyParts(story: StoryInput): StoryPart[] {
  return PARTS.flatMap(({ key, label }) => {
    const part = story[key];
    return part.text.trim() === "" ? [] : [{ key, label, ...part }];
  });
}

/** Public sources cited across the shown parts, once each, in order. */
export function publicSources(parts: StoryPart[]): StorySource[] {
  const seen = new Set<string>();
  const out: StorySource[] = [];
  for (const part of parts) {
    for (const source of part.source) {
      if (source.kind !== "public") continue;
      const id = source.url ?? source.name ?? "";
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(source);
    }
  }
  return out;
}
