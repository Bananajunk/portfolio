# Launch runbook (bananajunk.dev)

## Current build configuration

The Site is live on Cloudflare. On 2026-11-10 Liam approved keeping Soft Current
live while PR #33 remains unmerged. The final visual polish was pushed in
commit `00c9395` and deployed as version `e51477f3-c7c9-4766-a205-ee541c17e66a`.

Cloudflare Settings > Builds must keep these commands separate:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `pnpm run build` |
| Deploy command | `npx wrangler deploy` |
| Builds for non-production branches | Enabled |
| Version command | `npx wrangler versions upload` |

The Version command previously ran `wrangler deploy`, which sent PR builds to
production. It was corrected in the dashboard on 2026-11-10. These build settings
are external to `wrangler.jsonc`; do not assume the repository config controls
branch deployment behaviour. [Saved settings](design/soft-current/cloudflare-build-settings.webp).

After changing branch-build settings, push a PR update and verify it creates a
version preview URL while the active production deployment ID stays unchanged.
Do not merge a PR merely to test previews. [Cloudflare build settings documentation](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/).

## Historical migration checklist

The following records the original Vercel-to-Cloudflare migration from ticket
#13. It is not the procedure for routine releases or preview verification.

## Pre-flight

- [x] Cloudflare Workers reset (done 2026-11-09).
      `portfolio` is recreated from Git (Workers & Pages, import repository).
- [ ] Preview builds pass. Non-production deploy command is
      `npx wrangler versions upload`. A branch build must not run
      `wrangler deploy`, which would push PR code to production.
- [ ] Production build on `main` is green and https://portfolio.cl2reid.workers.dev serves the full Site.
- [ ] `pnpm check:launch` and `pnpm check:seo` pass.
- [ ] Pending manual checks in `docs/a11y-testing.md` are done, at least
      VoiceOver on Safari/macOS.
- [ ] Phone number is not in the public build (see below).
- [ ] Note the current Vercel DNS records and project settings (screenshot or
      export) so the rollback below is exact.

## Flip

1. Uncomment the two `routes` in `wrangler.jsonc` (apex and `www`, both
   `custom_domain: true`) in a PR, merge, and let the production build deploy.
   Cloudflare takes over DNS for these hostnames and issues TLS.
2. Add the `www` redirect: Rules, Redirect Rules, `www.bananajunk.dev/*` to
   `https://bananajunk.dev/${1}`, 301.
3. Remove `bananajunk.dev` and `www` from the Vercel project's Domains, then
   retire the Vercel project once the checks below pass.

## Verify in production

- [ ] `https://bananajunk.dev` and `https://www.bananajunk.dev` (redirects to apex) load over valid TLS.
- [ ] `/liam-reid-resume.pdf`, `/og.png`, `/sitemap.xml`, `/robots.txt` and a missing path (404 page) behave.
- [ ] Headers from `public/_headers` are present (CSP, cache rules).
- [ ] Lighthouse and axe pass once against the production URL
      (`pnpm lighthouse` and the axe suite with `BASE_URL`, or run Lighthouse in Chrome).
- [ ] Share preview checks (LinkedIn Post Inspector, a Slack paste) show the OG image.

## Rollback

If anything is wrong in the first hours:

1. Re-comment the two `routes` in `wrangler.jsonc`, merge, and deploy, or
   remove the custom domains in Workers & Pages, Settings, Domains & Routes.
2. Restore the DNS records noted in pre-flight (or re-add the domains in
   Vercel and follow its DNS instructions). TTLs are short, so allow a few
   minutes.
3. Confirm the old site is back, then open an issue describing what failed.

The `workers.dev` URL keeps serving the new Site throughout, so it is a safe
place to debug.

## Phone number

The number was removed from `resume.html` and `resume.pdf` in #22, but it is
still in earlier git history of this public repo, and in Liam's iCloud copy of
the resume. Removing it from history needs a force-push rewrite and is a
separate decision.
