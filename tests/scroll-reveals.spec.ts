import { expect, test } from "@playwright/test";
import { applyState } from "./states";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await applyState(page, { time: "day", calm: "off" });
});

test("a visible Card finishes arriving without more scrolling and does not replay", async ({
  page,
}) => {
  const card = page.getByTestId("role-card-faire");
  await card.evaluate((el) =>
    scrollBy(0, el.getBoundingClientRect().top - 650),
  );
  await expect
    .poll(() => card.evaluate((el) => el.getAnimations().length))
    .toBe(1);
  expect(await card.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  const scrollPosition = await page.evaluate(() => scrollY);
  await expect(card).toHaveCSS("transform", "none", { timeout: 2000 });
  expect(await page.evaluate(() => scrollY)).toBe(scrollPosition);
  await page.evaluate(() => scrollTo(0, 0));
  await card.scrollIntoViewIfNeeded();
  expect(await card.evaluate((el) => el.getAnimations().length)).toBe(0);
  await expect(card).toHaveCSS("transform", "none");
});

test("Calm interrupts an arrival and leaves offscreen imagery fully visible", async ({
  page,
}) => {
  const image = page.locator(".story-image");
  await image.evaluate((el) =>
    scrollBy(0, el.getBoundingClientRect().top - 600),
  );
  await expect
    .poll(() => image.evaluate((el) => el.getAnimations().length))
    .toBe(1);
  // Exercise the persisted preference change while the animation is active.
  await page.evaluate(() => {
    document.documentElement.dataset.calm = "on";
  });
  for (const selector of [".story-image", ".phone-enter", ".feature-enter"]) {
    await expect(page.locator(selector)).toHaveCSS("opacity", "1");
    await expect(page.locator(selector)).toHaveCSS("transform", "none");
  }
  await page.evaluate(() => {
    document.documentElement.dataset.calm = "off";
  });
  await expect(image).toHaveCSS("transform", "none");
});

test("focusing an arriving Card stops it permanently and preserves its disclosure", async ({
  page,
}) => {
  const card = page.getByTestId("role-card-shopify");
  await card.evaluate((el) =>
    scrollBy(0, el.getBoundingClientRect().top - 650),
  );
  await card.locator("summary").focus();
  await expect(card).toHaveCSS("transform", "none");
  await page.keyboard.press("Enter");
  await expect(card.locator("details")).toHaveAttribute("open", "");
  await page.keyboard.press("Tab");
  await expect(card).toHaveCSS("transform", "none");
});
