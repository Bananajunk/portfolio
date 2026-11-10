## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues on `Bananajunk/portfolio`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Visual design

Follow **Soft Current**, approved by Liam on 2026-11-10.

- **Tone:** confident, colourful and lightly cheeky. Identify the Site as Liam Reid; use abstract arcs for personality. Keep Claims clear and easy to scan.
- **Type:** retain self-hosted Bricolage Grotesque for display and Atkinson Hyperlegible Next for text. The left-aligned hero has a large name and readable summary, without an impact callout. Keep body copy near 65ch and line height at least 1.5.
- **Layout:** align section edges within an 1100px column, with compact gaps. Work uses visible lead Claims and native disclosures for the remaining Claims. Faire and Shopify share equal-height rows, including their colour break and expanded states.
- **Identity and imagery:** use real employer and university logos. Stories use the historical Flow editor and the supplied cart screenshot inside a phone frame, with the actual utensils row enlarged. Keep imagery sized and lazy-loaded. Record image provenance in `docs/design/soft-current.md`.
- **Colour:** use the checked tokens in `src/styles/themes.css` and Tailwind utilities. Lilac, peach, mint and sky group content across all three themes. Arcs decorate margins and image areas; text stays on quiet surfaces.
- **Content:** show three Stories, followed by the combined career/education timeline and About. Contact links live in the hero and the floating contact disclosure. The Site has no Play, standalone accessibility statement or repeated Contact section.
- **Controls:** preserve the Time of day icon flyout and Calm switch. The contact disclosure appears after the hero links leave view, supports hover/focus/tap and Escape, preserves focus, and joins normal flow in cramped viewports.
- **Motion:** Work Cards, Story imagery and timeline entries arrive once as they enter view, then settle. Hero arcs loop gently while the text stays still; other arcs follow scrolling. Keep written Claims opaque, controls full size and focused content stationary. Animate only transform and opacity in `src/styles/motion.css`. Calm mode and system reduced motion each disable all non-essential motion. The complete static design remains available without JavaScript.
- **Accessibility:** preserve the heading outline, 44px targets, clear focus, reflow, text spacing, forced colours and the no-JS reading experience. Review desktop and mobile in day/dusk/night with settings and Cards open before calling a visual change complete.
