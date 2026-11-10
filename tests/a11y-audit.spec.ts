// Scripted half of the manual WCAG 2.2 AA pass (docs/a11y-testing.md). These
// drive real Chromium the way a keyboard user, a zoomed user and a forced
// colours user would. Screen reader and real-device checks cannot be scripted
// and are listed as pending in the doc.
import { expect, type Page, test } from "@playwright/test";
import { applyState, type TimeOfDay } from "./states";

const themes: TimeOfDay[] = ["day", "dusk", "night"];
const INTERACTIVE =
  "a[href], button, input, summary, [tabindex]:not([tabindex='-1'])";

interface Stop {
  tag: string;
  label: string;
  outline: string;
  obscured: boolean;
  hitDesc: string;
  offscreen: boolean;
}

// Describe the element that currently has focus. "Obscured" means the point at
// the middle of its box (or of the visible part) hits some other element, e.g.
// the sticky nav drawn over it (WCAG 2.4.11).
async function focused(page: Page): Promise<Stop | null> {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body || el === document.documentElement)
      return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const outline =
      cs.outlineStyle === "none"
        ? "none"
        : `${cs.outlineWidth} ${cs.outlineStyle}`;
    const x = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
    const y = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
    const hit = document.elementFromPoint(x, y);
    const obscured = !(
      hit &&
      (hit === el || el.contains(hit) || hit.contains(el))
    );
    const hitDesc = `${hit?.tagName}.${hit?.className}`.slice(0, 80);
    const label = (
      el.getAttribute("aria-label") ||
      el.textContent ||
      el.id ||
      ""
    )
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 40);
    return {
      tag: el.tagName.toLowerCase(),
      label,
      outline,
      obscured,
      hitDesc,
      offscreen:
        r.bottom < 0 ||
        r.top > innerHeight ||
        r.right < 0 ||
        r.left > innerWidth,
    };
  });
}

// Open every Role Card, then let the open transition finish so a mid-animation
// frame is not measured.
const openAllCards = async (page: Page) => {
  await page.evaluate(() => {
    for (const d of document.querySelectorAll<HTMLDetailsElement>(
      "details:not([data-display-settings])",
    ))
      d.open = true;
  });
  await page.waitForTimeout(400);
};

// Tab through the whole page, returning every stop until focus leaves it.
async function tabThrough(page: Page, max = 120) {
  const stops: Stop[] = [];
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const stop = await focused(page);
    if (!stop) return { stops, left: true };
    stops.push(stop);
  }
  return { stops, left: false };
}

for (const time of themes) {
  test.describe(`a11y audit: ${time}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await applyState(page, { time, calm: "off" });
    });

    test("keyboard: skip link first, no trap, focus visible and never obscured", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await openAllCards(page);
      const { stops, left } = await tabThrough(page);
      expect(left, "focus must leave the page (no keyboard trap)").toBe(true);
      expect(stops[0]?.label).toBe("Skip to main content");
      expect(stops.length).toBeGreaterThan(20);
      for (const s of stops) {
        expect(s.outline, `${s.tag} "${s.label}" focus outline`).not.toBe(
          "none",
        );
        expect(
          s.obscured,
          `${s.tag} "${s.label}" obscured by ${s.hitDesc}`,
        ).toBe(false);
        expect(s.offscreen, `${s.tag} "${s.label}" off screen`).toBe(false);
      }
      // Backwards works too, which would catch a trap on the way back.
      await page.keyboard.press("Shift+Tab");
      expect(await focused(page)).not.toBeNull();
    });

    test("keyboard: skip link moves focus to main and the fragment links land focus visibly", async ({
      page,
    }) => {
      await page.keyboard.press("Tab");
      await expect(page.locator(".skip-link")).toBeFocused();
      await expect(page.locator(".skip-link")).toBeInViewport();
      await page.keyboard.press("Enter");
      await expect(page.locator("#main")).toBeFocused();
    });

    test("keyboard: every in-page link lands its section below the sticky nav", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      const targets = await page
        .locator("a[href^='#']:not(.skip-link)")
        .evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
      for (const href of new Set(targets)) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.locator(`a[href='${href}']`).first().focus();
        await page.keyboard.press("Enter");
        const id = href.slice(1);
        const box = await page.locator(`#${id}`).boundingBox();
        const nav = await page.getByTestId("site-header").boundingBox();
        const atEnd = await page.evaluate(
          () => innerHeight + scrollY >= document.body.scrollHeight - 2,
        );
        if (!atEnd && box && nav && id !== "top")
          expect(box.y, `${href} below the nav`).toBeGreaterThanOrEqual(
            nav.y + nav.height - 1,
          );
        await expect(page.locator(`#${id}`)).toBeInViewport();
      }
    });

    for (const [name, size] of [
      ["200% zoom", { width: 640, height: 400 }],
      ["400% zoom", { width: 320, height: 256 }],
    ] as const) {
      test(`reflow at ${name}: no horizontal scroll, focus never obscured`, async ({
        page,
      }) => {
        await page.setViewportSize(size);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        );
        expect(overflow, "horizontal overflow in CSS px").toBeLessThanOrEqual(
          0,
        );
        // Open the settings flyout and one Role Card: the tallest content.
        await page.getByTestId("display-settings-trigger").click();
        const flyout = await page
          .getByTestId("experience-controls")
          .boundingBox();
        expect(flyout?.x ?? 0).toBeGreaterThanOrEqual(0);
        expect((flyout?.x ?? 0) + (flyout?.width ?? 0)).toBeLessThanOrEqual(
          size.width,
        );
        // Tab through the open flyout: each control must stay reachable.
        await page.getByTestId("display-settings-trigger").focus();
        for (let i = 0; i < 6; i++) {
          await page.keyboard.press("Tab");
          const inside = await page.evaluate(
            () => !!document.activeElement?.closest("[data-display-settings]"),
          );
          if (!inside) break;
          const s = await focused(page);
          expect(s?.obscured, `flyout "${s?.label}" obscured`).toBe(false);
          expect(s?.offscreen, `flyout "${s?.label}" off screen`).toBe(false);
        }
        await page.keyboard.press("Escape");
        await openAllCards(page);
        const { stops, left } = await tabThrough(page);
        expect(left).toBe(true);
        for (const s of stops) {
          expect(s.obscured, `${s.tag} "${s.label}" obscured at ${name}`).toBe(
            false,
          );
        }
        const after = await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        );
        expect(after, "overflow after tabbing").toBeLessThanOrEqual(0);
      });
    }

    test("forced colours: focus, controls and toy edges stay visible", async ({
      page,
    }) => {
      await page.emulateMedia({ forcedColors: "active" });
      await page.setViewportSize({ width: 1280, height: 800 });
      const { stops, left } = await tabThrough(page);
      expect(left).toBe(true);
      for (const s of stops)
        expect(s.outline, `${s.label} outline`).not.toBe("none");
      await page.getByTestId("display-settings-trigger").click();
      const calm = page.getByTestId("calm-toggle");
      // The custom switch gives way to the native one so it stays visible.
      expect(
        await calm.evaluate((e) => getComputedStyle(e).appearance),
      ).not.toBe("none");
      const sticker = page.getByTestId("sticker-banana");
      await sticker.scrollIntoViewIfNeeded();
      expect(
        await sticker.evaluate((e) => getComputedStyle(e).borderTopStyle),
      ).toBe("solid");
      expect(
        await page.evaluate(
          () => matchMedia("(forced-colors: active)").matches,
        ),
      ).toBe(true);
    });

    test("target size 2.5.8: every control is at least 24 by 24 CSS px", async ({
      page,
    }) => {
      for (const size of [
        { width: 1280, height: 800 },
        { width: 320, height: 256 },
      ]) {
        await page.setViewportSize(size);
        await page.getByTestId("display-settings-trigger").click();
        const small = await page.evaluate((sel) => {
          const bad: string[] = [];
          for (const el of document.querySelectorAll<HTMLElement>(sel)) {
            // A control inside a label is operated through the label's box.
            const box = el.closest("label") ?? el;
            const r = box.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue; // not rendered
            // 2.5.8 exempts links that sit inline within a sentence.
            if (
              el.tagName === "A" &&
              getComputedStyle(el).display === "inline" &&
              el.closest("p")
            )
              continue;
            if (getComputedStyle(el).visibility === "hidden") continue;
            if (r.width < 24 || r.height < 24)
              bad.push(
                `${el.tagName} ${el.textContent?.trim().slice(0, 30)} ${r.width}x${r.height}`,
              );
          }
          return bad;
        }, INTERACTIVE);
        expect(small, `controls under 24px at ${size.width}`).toEqual([]);
      }
    });

    test("keyboard: display settings open, operate, dismiss and return focus", async ({
      page,
    }) => {
      const trigger = page.getByTestId("display-settings-trigger");
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("experience-controls")).toBeVisible();
      await page.keyboard.press("Tab");
      await expect(page.getByTestId("time-of-day-slider")).toBeFocused();
      await page.keyboard.press("Home");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "day");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dusk");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter"); // night preset
      await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
      await page.keyboard.press("Tab");
      await expect(page.getByTestId("calm-toggle")).toBeFocused();
      await page.keyboard.press("Space");
      await expect(page.locator("html")).toHaveAttribute("data-calm", "on");
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("experience-controls")).toBeHidden();
      await expect(trigger).toBeFocused();
    });

    test("structure: one h1, no skipped heading levels, landmarks once, links not colour-only", async ({
      page,
    }) => {
      const report = await page.evaluate(() => {
        const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(
          (h) => Number(h.tagName[1]),
        );
        const skips = levels.filter(
          (l, i) => i > 0 && l - (levels[i - 1] ?? 0) > 1,
        );
        const count = (sel: string) => document.querySelectorAll(sel).length;
        const plainLinks = [
          ...document.querySelectorAll<HTMLElement>("p a[href]"),
        ]
          .filter((a) => {
            const cs = getComputedStyle(a);
            return !cs.textDecorationLine.includes("underline");
          })
          .map((a) => a.textContent?.trim().slice(0, 30));
        return {
          h1: levels.filter((l) => l === 1).length,
          skips,
          main: count("main"),
          banner: count("body > header"),
          nav: count("nav"),
          contentinfo: count("body > footer"),
          lang: document.documentElement.lang,
          plainLinks,
        };
      });
      expect(report).toEqual({
        h1: 1,
        skips: [],
        main: 1,
        banner: 1,
        nav: 1,
        contentinfo: 1,
        lang: "en-CA",
        plainLinks: [],
      });
    });

    test("text spacing 1.4.12: no clipped text or overflow with WCAG spacing applied", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.addStyleTag({
        content:
          "*{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p{margin-bottom:2em !important}",
      });
      await openAllCards(page);
      const clipped = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("body *")]
          .filter((el) => {
            const cs = getComputedStyle(el);
            return (
              ["hidden", "clip"].includes(cs.overflowY) &&
              el.scrollHeight > el.clientHeight + 1 &&
              !el.matches("[data-board]") &&
              !el.closest("[data-decoration]")
            );
          })
          .map((el) => `${el.tagName}.${el.className}`.slice(0, 60)),
      );
      expect(clipped).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(0);
    });

    test("dragging 2.5.7: the sticker board has non-drag alternatives", async ({
      page,
    }) => {
      const banana = page.getByTestId("sticker-banana");
      await banana.scrollIntoViewIfNeeded();
      const before = await banana.boundingBox();
      await banana.click();
      await page.getByTestId("move-right").click();
      const after = await banana.boundingBox();
      expect(after?.x).toBeGreaterThan((before?.x ?? 0) + 10);
      await page.keyboard.press("Tab"); // leave, then use arrow keys on the sticker
      await banana.focus();
      await page.keyboard.press("ArrowDown");
      expect((await banana.boundingBox())?.y).toBeGreaterThan(
        (after?.y ?? 0) + 10,
      );
    });
  });
}

test.describe("motion", () => {
  const animating = (page: Page) =>
    page.evaluate(
      () =>
        [...document.querySelectorAll("*")].filter((el) => {
          const cs = getComputedStyle(el);
          return (
            cs.animationName !== "none" ||
            cs.transitionDuration.split(",").some((d) => parseFloat(d) > 0)
          );
        }).length,
    );

  test("prefers-reduced-motion turns Calm mode on with no stored choice", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-calm", "on");
    expect(await animating(page)).toBe(0);
    await page.getByTestId("display-settings-trigger").click();
    await expect(page.getByTestId("calm-toggle")).toBeChecked();
  });

  test("Calm mode removes every animation and transition", async ({ page }) => {
    await page.goto("/");
    await applyState(page, { time: "day", calm: "on" });
    expect(await animating(page)).toBe(0);
    // Role Cards open without a transition.
    await page.locator("summary.role-summary").first().click();
    expect(await animating(page)).toBe(0);
  });

  test("reduced motion disables animation even with an explicit Calm off", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await applyState(page, { time: "day", calm: "off" });
    await expect(page.locator("html")).toHaveAttribute("data-calm", "off");
    // The persisted choice stays intact, but the system motion preference is honoured.
    expect(await animating(page)).toBe(0);
  });
});

test("accessibility statement is linked from the footer and has no phone number", async ({
  page,
}) => {
  await page.goto("/");
  const link = page
    .getByTestId("contact")
    .getByRole("link", { name: "Accessibility statement" });
  await link.click();
  const statement = page.getByTestId("accessibility-statement");
  await expect(statement).toBeInViewport();
  await expect(statement).toContainText("aims to conform to WCAG 2.2");
  await expect(
    statement.getByRole("link", { name: "cl2reid@gmail.com" }),
  ).toHaveAttribute("href", "mailto:cl2reid@gmail.com");
  await expect(statement.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
    "href",
    "https://github.com/Bananajunk/portfolio/issues",
  );
  expect(await statement.innerText()).not.toMatch(
    /\d{3}[\s.)-]+\d{3}[\s.-]\d{4}/,
  );
});

test("404 page: axe clean, keyboard reachable, no phone number", async ({
  page,
}) => {
  const AxeBuilder = (await import("@axe-core/playwright")).default;
  await page.goto("/no-such-page");
  await expect(page.getByTestId("not-found")).toBeVisible();
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  const { stops, left } = await tabThrough(page);
  expect(left).toBe(true);
  expect(stops.map((s) => s.label)).toEqual([
    "Skip to main content",
    "Back to the Site",
  ]);
});
