# Cloudflare Workers static assets over Pages and Vercel

The Site is fully static and moves off Vercel to bananajunk.dev on Cloudflare. We deploy with Workers static assets rather than Pages because Cloudflare directs new projects to Workers, and headers, caching and the `www` redirect live in the repo config. The Vercel site stays live until the hero and Owner Card are done, then DNS flips.
