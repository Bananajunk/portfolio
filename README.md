# bananajunk.dev

Liam Reid's personal resume site. A single fast, WCAG 2.2 AA page built with
[Astro](https://astro.build) and deployed to Cloudflare Workers static assets.

Start with `GLOSSARY.md` for vocabulary and `docs/adr/` for why things are the
way they are. Work is tracked in GitHub Issues (spec #1).

## Setup

Requires Node 24 and pnpm.

```sh
pnpm install
pnpm dev       # http://localhost:4321
```

## Commands

| Command        | What it does                                         |
| -------------- | ---------------------------------------------------- |
| `pnpm dev`     | Astro dev server                                     |
| `pnpm build`   | Static build to `dist/`                              |
| `pnpm preview` | Serve the built site locally                         |
| `pnpm check`   | `astro check` (types) then `biome check` (lint/format) |
| `pnpm test`    | Unit tests for the content checks (`node --test`)    |
| `pnpm check:launch` | Fails while any content is still `unverified`   |
| `pnpm format`  | Apply Biome fixes                                    |
| `pnpm deploy`  | Build, then `wrangler deploy` (needs Cloudflare auth) |

## Styling

Tailwind v4 (Vite plugin) owns tokens, layout and spacing. One hand-written
file, `src/styles/motion.css`, owns motion: keyframes, scroll-driven animation
and transitions. Do not write layout or colour CSS by hand, and do not put
animation in utilities.

Cascade layers, lowest to highest priority, declared once in
`src/styles/global.css`:

```
theme, base, components, motion, utilities
```

All motion must respect Calm mode and `prefers-reduced-motion`
([ADR 0004](docs/adr/0004-calm-mode-and-motion-policy.md)).

## Content

Content is data, not markup. Roles, Stories, skills, education, Before that
and About live in `src/content/*.json`, loaded as Astro content collections
with strict schemas in `src/content.config.ts` (unknown fields fail the
build). Every Claim carries a `source` (Resume, LinkedIn, spec #1 or a named
public source).

- **Claim rules** are linted in `src/content/claim-rules.ts` when the
  collections load, so a breach fails `pnpm build`. The banned-name list is a
  seed; extend it.
- **Resume drift:** `pnpm build` first compares Role titles, dates and
  locations with `resume.html` and warns on any difference (it never fails).
  A `reconciledFrom` field records a title the Site deliberately changed, such
  as Faire ([ADR 0003](docs/adr/0003-resume-html-is-source-of-truth.md)).
- **Unverified:** anything Liam has not confirmed is marked `unverified`
  (empty Story parts must be). `pnpm check:launch` fails while any remain.
  Normal `pnpm check` and `pnpm build` stay green.
- `resume.html` and `resume.pdf` at the repo root are the committed Resume.
  They hold the phone number, so they are not in `public/`.

## Deployment

Cloudflare Workers static assets, configured in `wrangler.jsonc`
([ADR 0002](docs/adr/0002-cloudflare-workers-static-assets.md)). Security
headers and cache rules are in `public/_headers`.

- **Git deploys:** in the Cloudflare dashboard, connect the repo under
  Workers & Pages (Workers Builds) with build command `pnpm build` and deploy
  command `npx wrangler deploy`. The Worker is named `portfolio`, and `name` in
  `wrangler.jsonc` must match the Worker connected in the dashboard.
- **Custom domains are not attached yet.** Attaching `bananajunk.dev` makes
  Cloudflare take over its DNS, so the commented `routes` in `wrangler.jsonc`
  are enabled only at launch (ticket #13). Vercel keeps serving the old site
  until then.
- **`www` to apex** is a Cloudflare zone Redirect Rule (`www.bananajunk.dev/*`
  to `https://bananajunk.dev/${1}`, 301), created at launch.
- **CSP** forbids inline scripts and styles (`inlineStylesheets: "never"`).
  Adding either means changing `public/_headers` on purpose.

## Notes

- `typescript` is pinned to 6.x because `astro check` does not support 7 yet
  (Astro points to `@astrojs/ts-content-mapper` for TS 7.1+).
- A pnpm override pins `@astrojs/astro2tsx` to 0.1.4 because the 0.1.3 that
  `@astrojs/check` resolves crashes on a mismatched `@emnapi/runtime`. Drop the
  override once `@astrojs/check` picks up 0.1.4.
