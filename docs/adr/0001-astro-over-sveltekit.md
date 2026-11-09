# Astro over SvelteKit

The Site is content-first with a few small interactive toys, and speed and WCAG 2.2 AA are hard requirements. Astro ships no JavaScript by default and prerenders semantic HTML, while prerendered SvelteKit still ships a router and hydration runtime this page doesn't need. We chose Astro with strict TypeScript and static output, adding a Svelte island only if a toy needs real state.
