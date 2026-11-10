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

test("a pointer press during a Card arrival activates its original disclosure", async ({
  page,
}) => {
  const card = page.getByTestId("role-card-shopify");
  await page.evaluate(() => scrollTo(0, 1100));
  await expect(card).toHaveAttribute("data-reveal-state", "entered");
  const summary = card.locator("summary");
  const bounds = await summary.boundingBox();
  if (!bounds) throw new Error("Shopify disclosure has no bounds");
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await expect(summary).toBeFocused();
  await page.mouse.up();
  await expect(card.locator("details")).toHaveAttribute("open", "");
  await expect(card).toHaveCSS("transform", "none");
});

test("built decorative arcs follow scrolling with a valid CSS timeline", async ({
  page,
}) => {
  const arc = page.getByTestId("role-card-owner").locator(".role-current");
  // Finish the Card's timed entrance so only the scroll timeline is measured.
  await page.getByTestId("role-card-owner").locator("summary").focus();
  await expect(arc).toHaveCSS("animation-timeline", "--current");
  const transforms = [];
  for (const top of [300, 700]) {
    await page.evaluate(async (y) => {
      scrollTo(0, y);
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    }, top);
    transforms.push(await arc.evaluate((el) => getComputedStyle(el).transform));
  }
  expect(transforms[0]).not.toBe("none");
  expect(transforms[1]).not.toBe(transforms[0]);
});
