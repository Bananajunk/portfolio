# Launch runbook (bananajunk.dev)

Ticket #13. Do not start until the pre-flight list is complete. Vercel keeps
serving the old site until the flip.

## Pre-flight

- [ ] Cloudflare Workers reset: the stale `bananajunk` Worker is deleted and
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
