## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues on `Bananajunk/portfolio`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Visual design

For Site UI changes, follow the direction Liam approved on 2026-11-09. This supersedes the mascot, chunky headline and pill-nav direction in issues #1 and #6.

- **Tone:** calm, editorial and lightly playful. Let the content lead; use small details for wit. Keep the hero free of a mascot or decorative illustration.
- **Typography:** retain Bricolage Grotesque for display and Atkinson Hyperlegible Next for text. Use moderate display sizes and medium weights, with readable body copy and generous line spacing.
- **Layout:** use a consistent content column, aligned section edges and generous whitespace. Keep the hero a single column. Give sections hierarchy through spacing and type before adding containers.
- **Colour and surfaces:** use the approved tokens in `src/styles/themes.css` across day, dusk and night. Reserve banana yellow and pastel tints for restrained accents or meaningful grouping. Prefer plain underlined links and light borders; avoid turning navigation and contact links into heavy pills.
- **Display settings:** keep Time of day and Calm mode inside the nav's icon flyout. Match the icon to the selected theme: sun for day, sunset over a horizon for dusk, crescent moon for night. Calm mode uses a subdued switch inside the flyout.
- **Accessibility:** visual quietness must preserve clear focus, contrast, roughly 44px targets and narrow-screen reflow. Keep settings keyboard operable and hidden without JS. Motion follows ADR 0004; the hero is static.

Use `Hero.astro`, `SiteHeader.astro` and `ExperienceControls.astro` as the visual references. Review UI changes at desktop and mobile widths in all three themes, including open settings, before calling the design complete.
