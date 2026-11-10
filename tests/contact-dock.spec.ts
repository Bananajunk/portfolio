import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { applyState, stateName, states } from "./states";

for (const width of [1280, 390])
  for (const state of states) {
    test(`contact dock: ${width}px, ${stateName(state)}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await applyState(page, state);
      const dock = page.getByTestId("contact-dock");
      const trigger = page.getByTestId("contact-trigger");
      const panel = page.getByTestId("contact-panel");
      await expect(dock).toBeHidden();
      await page.evaluate(() => scrollTo(0, 1200));
      await expect(dock).toBeVisible();
      await trigger.hover();
      await expect(panel).toBeVisible();
      await panel.getByRole("link", { name: "Email" }).hover();
      await expect(panel).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();
      await expect(trigger).toBeFocused();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect(panel).toBeVisible();
      for (const label of ["Email", "LinkedIn", "GitHub", "Resume (PDF)"]) {
        await page.keyboard.press("Tab");
        await expect(
          panel.getByRole("link", { name: label, exact: true }),
        ).toBeFocused();
      }
      const { violations } = await new AxeBuilder({ page })
        .include("[data-contact-dock]")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(violations.map((v) => v.id)).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();
      await page.evaluate(() => {
        (document.activeElement as HTMLElement)?.blur();
        scrollTo(0, 0);
      });
      await expect(dock).toBeHidden();
    });
  }

test("contact dock toggles on touch and dismisses outside", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await applyState(page, { time: "day", calm: "on" });
  await page.evaluate(() => scrollTo(0, 1200));
  const trigger = page.getByTestId("contact-trigger"),
    panel = page.getByTestId("contact-panel");
  await trigger.tap();
  await expect(panel).toBeVisible();
  await trigger.tap();
  await expect(panel).toBeHidden();
  await trigger.tap();
  await page.touchscreen.tap(30, 180);
  await expect(panel).toBeHidden();
  await context.close();
});

test("contact dock never hides focus or covers focused content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await applyState(page, { time: "day", calm: "on" });
  await page.keyboard.press("Tab");
  const summary = page.getByTestId("role-card-shopify").locator("summary");
  await summary.focus();
  await summary.evaluate((e) =>
    scrollBy(0, e.getBoundingClientRect().top - 790),
  );
  await expect(page.getByTestId("contact-dock")).toBeHidden();
  await page.evaluate(() => scrollBy(0, 100));
  await expect(page.getByTestId("contact-trigger")).toBeVisible();
  await page.getByTestId("contact-trigger").focus();
  await page.evaluate(() => scrollTo(0, 0));
  await expect(page.getByTestId("contact-trigger")).toBeFocused();
  await expect(page.getByTestId("contact-dock")).toBeVisible();
});

test("contact control joins normal flow at high zoom and hero links survive without JS", async ({
  page,
  browser,
}) => {
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto("/");
  expect(
    await page
      .getByTestId("contact-dock")
      .evaluate((e) => getComputedStyle(e).position),
  ).toBe("static");
  const context = await browser.newContext({ javaScriptEnabled: false });
  const np = await context.newPage();
  await np.goto("/");
  await expect(np.getByTestId("contact-dock")).toBeHidden();
  await expect(np.locator("#hero-contact-links a")).toHaveCount(4);
  for (const a of await np.locator("#hero-contact-links a").all())
    await expect(a).toBeVisible();
  await context.close();
});
