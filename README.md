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
| `pnpm format`  | Apply Biome fixes                                    |
| `pnpm budget`  | Fail if first-load JS is over ~30 KB gzipped (needs `dist/`) |
| `pnpm linkcheck` | Check internal and external links in `dist/` (`SKIP_EXTERNAL=1` skips the network) |
| `pnpm axe`     | Playwright + axe-core against the preview (needs `dist/` and `pnpm exec playwright install chromium`) |
| `pnpm lighthouse` | Lighthouse CI against `dist/`, 100/100/100 and LCP under 1s (needs Chrome, or `CHROME_PATH`) |
| `pnpm deploy`  | Build, then `wrangler deploy` (needs Cloudflare auth) |

## CI gates

`.github/workflows/ci.yml` runs on every PR and on `main`: type check and lint,
build, JS budget, link check, axe and Lighthouse. Each job is a separate PR
check. The axe matrix lives in `tests/states.ts`; flip `CONTROLS_READY` once the
Time of day and Calm mode controls exist so it covers day/dusk/night with Calm
on and off.

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
