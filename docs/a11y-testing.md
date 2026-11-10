# Accessibility testing

Target: WCAG 2.2 level AA. Automated checks cover part of the standard; they do
not establish conformance. Manual checks that have not been repeated for this
design are listed explicitly below. The former public accessibility statement
was removed at Liam's request; this document remains the testing record.

## Soft Current pass, 2026-11-10

Tested the production build in Chromium through Playwright on macOS. No screen
reader or physical mobile device was used. The suite contains 82 passing browser
tests, including the scripted audit in `tests/a11y-audit.spec.ts`.

| Check | Method and coverage | Result |
| --- | --- | --- |
| Automated accessibility | axe-core WCAG A/AA tags, 1280px and 390px, day/dusk/night, Calm on/off, settings closed/open, expanded Role Cards and open contact disclosure | No violations |
| Colour contrast | Unchanged `pnpm check:contrast`, 93 token pairs: text 4.5:1, UI/focus 3:1 | Pass |
| Keyboard and focus | Tab through expanded Cards; visible outlines; centre-point hit test for obstruction; skip link; fragment links; reverse Tab; no trap | Pass in all themes |
| Settings | Keyboard slider and presets, Calm switch, Escape and restored focus | Pass |
| Contact disclosure | Hover, focus, tap, Escape, outside click, four links, preservation of focus when hero returns, hiding when it would cover another focused control | Pass in all themes and Calm states at both widths |
| Reflow | 640×400 and 320×256 CSS px viewports, equivalent to the previous 200% and 400% reflow checks; settings and Cards open; keyboard traversal; no horizontal overflow | Pass in all themes; visual captures also cover both Calm states |
| Text spacing | WCAG spacing overrides at 1280px, 390px and 320px with expanded Cards; no clipped text or horizontal overflow | Pass |
| Forced colours | Chromium emulation, keyboard outlines, native Calm input, contact border; screenshots at both widths in all theme/Calm states | Pass in emulation |
| Motion | Calm on and system reduced motion each produce zero non-essential animations/transitions, including a stored Calm-off choice under reduced motion | Pass |
| Motion present when enabled | Work Cards change transform during scroll while written Claims remain opaque; focused Cards stop moving | Pass |
| Pointer targets | Controls at least 44×44 CSS px at 1280px and 320px; labelled switch measured by its operable label | Pass |
| Structure | One h1, no skipped heading levels, named navigation, en-CA language, underlined prose links | Pass |
| No JavaScript | Claims, Stories, contact links and native Role disclosures remain available; settings and floating contact enhancement stay hidden | Pass |
| CSP | Production header policy applied to browser responses; no inline executable scripts/styles, no violations, settings and contact remain functional | Pass |
| 404 | axe clean, skip link and return link keyboard reachable | Pass |

The contact disclosure joins normal flow at widths of 360px or less, or heights
of 500px or less. Its panel opens below the trigger in that layout so opening it
does not push the focused trigger out of view. The short settings flyout scrolls
internally, and keyboard traversal brings each control into view.

The target-size helper retains WCAG's inline-link exception for links inside
sentences. Current primary actions, disclosures and the Story source link have
explicit 44px minimum targets. Decorative clipping is excluded from text-spacing
checks only through `data-decoration`; meaningful text is not excluded.

Visual evidence and image provenance are in [Soft Current](design/soft-current.md).
The complete local visual pass recorded no horizontal overflow, failed images or
page errors. Checks ran after each implementation section and again on the final
production build. No existing gate or threshold was weakened; the target-size
assertion increased from 24px to 44px, and Lighthouse now explicitly requires an
SEO score of 100 as well.

## Checks still requiring a person or another environment

These are **not recorded as passed** for Soft Current:

- VoiceOver with Safari on macOS and iOS, including the rotor, Card disclosures,
  settings announcements and contact disclosure reading order.
- NVDA or another real screen reader on Windows.
- Physical phone/tablet touch, landscape layout and large text settings.
- Native browser zoom at 200% and 400%. CSS viewport reflow was verified, but a
  native browser zoom session was not completed.
- Real Windows Contrast themes. Chromium forced-colours emulation was verified.
- Safari and Firefox keyboard and rendering checks. Scroll-timeline support is
  progressive enhancement; unsupported browsers receive the static layout.

For a screen-reader walkthrough, expect Liam Reid at level 1; Work, Stories,
Before that and About at level 2; employer, Story and timeline headings below
those. Navigation is named Sections and, when open, Contact and Resume. The
contact button announces Contact Liam and its expanded state. Each Role
summary announces More at followed by the employer. Read the page with Cards
open, operate settings, then repeat with the night theme and Calm mode on.

### Historical result

Liam completed a VoiceOver/Safari macOS pass on 2026-11-09 for the previous
design. No findings were reported and versions were not recorded. That result
is retained as history, not evidence that the redesigned interface has passed.

## Re-running the scripted checks

```sh
pnpm build
pnpm exec playwright install chromium
pnpm axe
```

If port 4321 is in use, run the same specs with a temporary config that points
`baseURL` and the `webServer` command at another port. Do not commit it. This pass
used port 4323 because another process owned 4321; assertions and specs were
unchanged by that override.
