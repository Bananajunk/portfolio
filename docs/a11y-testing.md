# Accessibility testing

Target: WCAG 2.2 level AA. This is a goal, not a conformance claim. Automated
checks and scripted browser checks catch only part of WCAG 2.2, so the checks
that need a person and a screen reader are listed as pending at the end.

The public summary is the accessibility statement on the Site (`#accessibility`,
linked from the footer). Keep it in step with this file.

## Environment

- Date of the scripted pass: 2026-11-09
- Browser: Chromium 158.0.8127.18 through Playwright 1.65.0, headless, on macOS 26.6.2
- Assistive technology: none. No screen reader was used in the scripted pass.
- Build tested: `pnpm build` then `pnpm preview`, commit `12-a11y-pass` on top of `main` at 29a63f3
- Themes: every check below runs in all three Time of day themes (day, dusk, night) unless noted
- Scripted checks live in `tests/a11y-audit.spec.ts` and run with `pnpm axe`, so they repeat on every PR

## Scripted checks (done)

All results are from 2026-11-09 in Chromium. "Pass" means the scripted
assertion held in day, dusk and night.

| # | Check | WCAG | Method | Result |
| --- | --- | --- | --- | --- |
| 1 | Automated rules | A, AA, 2.1 AA, 2.2 AA tags | axe-core 4.14.0 via `tests/a11y.spec.ts`, 3 themes x Calm on/off, flyout closed and open | Pass, no violations |
| 2 | Colour contrast | 1.4.3, 1.4.11 | `pnpm check:contrast` (93 pairs across 3 themes) plus axe | Pass |
| 3 | Skip link | 2.4.1 | First Tab stop is "Skip to main content", it is on screen when focused, and Enter moves focus to `main` | Pass |
| 4 | Tab order and keyboard traps | 2.1.1, 2.1.2, 2.4.3 | Tab through the whole page with every Role Card open until focus leaves the document (more than 20 stops); Shift+Tab then returns | Pass, no trap, order follows the page |
| 5 | Visible focus | 2.4.7, 2.4.13 | Computed outline on every stop is not `none` (3px, token `--c-focus`) | Pass |
| 6 | Focus not obscured | 2.4.11 | At every Tab stop the element at the centre of the focused control is that control, not the sticky nav, at 1280x800 | Pass |
| 7 | In-page links | 2.4.1, 2.4.11 | Activate each fragment link by keyboard; the section lands in view and below the sticky nav | Pass |
| 8 | Display settings by keyboard | 2.1.1, 2.4.3 | Enter opens the flyout; the slider responds to Home and arrow keys; presets work with Enter; Calm mode toggles with Space; Escape closes and returns focus to the button | Pass |
| 9 | Reflow, 200% zoom | 1.4.10 | 640x400 CSS px window (1280x800 at 200%): no horizontal scroll, flyout inside the viewport, Tab through the flyout and then the page with Role Cards open, focus never obscured | Pass |
| 10 | Reflow, 400% zoom | 1.4.10 | 320x256 CSS px window (1280x1024 at 400%): same assertions as 9 | Pass. The flyout is shorter than its content at this height and scrolls inside itself; every control stays reachable |
| 11 | Text spacing | 1.4.12 | Inject the WCAG spacing values (line height 1.5, paragraph spacing 2em, letter 0.12em, word 0.16em); no clipped text or horizontal overflow | Pass |
| 12 | Forced colours | 1.4.11, 1.4.1 | `forcedColors: active` emulation: focus outlines still present on every stop, Calm switch falls back to the native control, sticker edges stay solid. Also reviewed screenshots of the top of the page with the flyout open and the Play section | Pass. Emulation is not a real Windows High Contrast session |
| 13 | Reduced motion | 2.3.3 (AAA, kept by ADR 0004) | `prefers-reduced-motion: reduce` with no stored choice sets Calm mode on and no element has an animation or transition | Pass |
| 14 | Calm mode | 2.2.2 | Calm on: zero animations or transitions, including when a Role Card opens. Explicit Calm off wins over reduced motion, and motion is then present (guards against a vacuous pass) | Pass |
| 15 | Target size (minimum) | 2.5.8 | Every link, button, input and summary measures at least 24x24 CSS px at 1280 and 320 widths, flyout open. Most are 44px or more | Pass, with two notes below |
| 16 | Dragging movements | 2.5.7 | Sticker board: a sticker moves with the arrow buttons, arrow keys and click-to-place, no drag needed (also in `tests/play.spec.ts`). Time of day has a slider and three preset buttons | Pass |
| 17 | Structure | 1.3.1, 2.4.6, 3.1.1 | One `h1`, no skipped heading levels, one each of `main`, banner, `nav` and contentinfo, `lang="en-CA"`, and links inside paragraphs carry an underline (not colour alone) | Pass |
| 18 | 404 page | A, AA | axe clean in the default state; Tab reaches the skip link and "Back to the Site" only | Pass |
| 19 | Accessibility statement | n/a | Linked from the footer, links to email and GitHub issues work, contains no phone number | Pass |

Notes on check 15:

- The Calm mode switch input is 36x20 px, but it sits inside a label that is
  44px tall and toggles it, so the pointer target is the label. The test
  measures the label.
- The "Source:" link in a Story is an inline link inside a sentence. WCAG 2.5.8
  exempts inline links, so it is 18px tall by design. It is listed so the
  exception is visible.

## Findings

No failures were found by the scripted checks, so no code fixes beyond the
statement were needed. One flake was in the test, not the Site: measuring focus
during the 250ms Role Card open transition could briefly report the neighbouring
card. The test now waits for the transition to finish.

No issues were ticketed from the scripted pass. Findings from the manual checks
below should be fixed or ticketed with a rationale before launch.

## Pending manual checks (Liam)

These cannot be run by the automation and are **not** recorded as passed.
Record date, browser and result for each in the table at the end.

### 1. VoiceOver, Safari on macOS (required before launch)

1. Run `pnpm build && pnpm preview`, open the printed URL in Safari.
2. Turn on VoiceOver with Cmd+F5. Use VO = Control+Option.
3. Skip link: press Tab once. It should announce "Skip to main content, link".
   Press VO+Space and check focus lands in the main content.
4. Landmarks: open the rotor (VO+U), choose Landmarks. Expect banner,
   navigation "Sections", main, and contentinfo.
5. Headings: in the rotor choose Headings. Expect Liam Reid (level 1), then
   Work, Stories, Before that, About, Play, Accessibility statement and
   Contact at level 2, with Story and Play parts below them. Nothing should be
   read as an empty or duplicate heading.
6. Navigation: activate each nav link. The current section should be announced
   as current, and reading continues from the section.
7. Role Cards: move to each card summary. Expect it to read as a collapsed
   disclosure button with the employer and title. Open it with VO+Space and
   confirm the new text is read in order.
8. Display settings: find the button "Display settings". Open it, then check
   the slider reads "Time of day" with the value (Day, Dusk or Night) and
   changes when adjusted with Up and Down arrows. Check the three presets
   announce pressed or not pressed, and Calm mode reads as a switch with on or
   off. Press Escape and confirm focus returns to the button.
9. Play, sticker board: select a sticker with VO+Space. Move it with the arrow
   keys and the arrow buttons. After each move, check the new position is
   announced ("Banana, column 3 of 11, row 2 of 6").
10. Play, axe score: press "Run axe on this page" and check the result is
    announced without moving focus.
11. Repeat steps 3 to 10 in the night theme and with Calm mode on.
12. Note anything read twice, read as "group" with no name, or skipped.

### 2. VoiceOver, Safari on iOS (real device)

1. Settings, Accessibility, VoiceOver on, then open bananajunk.dev (or the
   preview URL on the same network).
2. Swipe right through the whole page. Check every link and button is reachable
   and named, and the flyout and Role Cards open with a double tap.
3. Use the rotor for Headings and Landmarks as above.
4. Check the sticker arrow buttons work with a double tap and the position is
   announced.

### 3. Real touch and zoom, phone and tablet

1. On a phone, check tap targets are comfortable (nothing needs a precise tap)
   and nothing scrolls sideways in portrait and landscape.
2. Set the browser text size to the largest and pinch zoom to 200%; confirm
   content reflows with no horizontal scroll.

### 4. Real forced colours, Windows (if a machine is available)

1. Windows, Settings, Accessibility, Contrast themes, choose Aquatic, open the
   Site in Edge.
2. Check the focus ring, the display settings button and flyout, the Calm mode
   switch, the sticker edges and the Role Card edges are all visible.

### 5. Other browsers

Repeat the keyboard walkthrough (Tab through the page, open the flyout, open a
Role Card) in Safari and Firefox on desktop. Chromium is the only browser
covered above.

### 6. Dictation and text-only zoom (optional)

Use Voice Control ("click Work", "click Display settings") to confirm the
visible names match the accessible names. In Safari, View, Make Text Bigger to
check text-only zoom.

### Pending results log

| Check | Date | Browser / AT | Result |
| --- | --- | --- | --- |
| 1. VoiceOver, Safari macOS | | | |
| 2. VoiceOver, Safari iOS | | | |
| 3. Touch and zoom on a device | | | |
| 4. Forced colours on Windows | | | |
| 5. Safari and Firefox keyboard pass | | | |
| 6. Voice Control and text zoom | | | |

## Re-running the scripted checks

```sh
pnpm build
pnpm exec playwright install chromium   # first time only
pnpm axe                                # includes tests/a11y-audit.spec.ts
```

If port 4321 is in use, run the same specs with a temporary config that points
`baseURL` and the `webServer` command at another port. Do not commit it.
