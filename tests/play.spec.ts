import { expect, test } from "@playwright/test";
import { applyState } from "./states";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await applyState(page, { time: "day", calm: "off" });
});

const position = (page: import("@playwright/test").Page) =>
  page.getByTestId("sticker-position");

test("sticker moves with arrow keys and announces its position", async ({
  page,
}) => {
  await page.getByTestId("sticker-banana").focus();
  await page.keyboard.press("ArrowRight");
  await expect(position(page)).toHaveText("Banana, column 3 of 11, row 2 of 6");
  await page.keyboard.press("Shift+ArrowDown");
  await expect(position(page)).toHaveText("Banana, column 3 of 11, row 5 of 6");
});

test("buttons and click-to-place move the selected sticker without dragging", async ({
  page,
}) => {
  await page.getByTestId("sticker-star").click();
  await page.getByTestId("move-left").click();
  await expect(position(page)).toHaveText("Star, column 4 of 11, row 4 of 6");

  const board = page.getByTestId("sticker-board");
  await board.click({ position: { x: 2, y: 2 } });
  await expect(position(page)).toHaveText("Star, column 1 of 11, row 1 of 6");

  await page.getByTestId("sticker-reset").click();
  await expect(position(page)).toContainText("back where they started");
});

test("pointer drag moves a sticker, but not in Calm mode", async ({ page }) => {
  const banana = page.getByTestId("sticker-banana");
  await banana.scrollIntoViewIfNeeded();
  const drag = async () => {
    await banana.scrollIntoViewIfNeeded();
    const box = await banana.boundingBox();
    if (!box) throw new Error("no sticker");
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(box.x + 200, box.y + 100, { steps: 5 });
    await page.mouse.up();
  };
  await banana.scrollIntoViewIfNeeded();
  const start = (await banana.boundingBox())?.x ?? 0;
  await drag();
  const moved = await banana.boundingBox();
  expect(moved?.x).toBeGreaterThan(start + 50);

  await page.getByTestId("sticker-reset").click();
  await page.evaluate(() => {
    document.documentElement.dataset.calm = "on";
  });
  await expect(page.locator("[data-calm-note]")).toBeVisible();
  await banana.scrollIntoViewIfNeeded();
  const before = (await banana.boundingBox())?.x;
  await drag();
  const still = await banana.boundingBox();
  expect(still?.x).toBe(before);
});

test("axe score runs on the page and reports counts", async ({ page }) => {
  await page.getByTestId("axe-run").click();
  await expect(page.getByTestId("axe-result")).toHaveText(
    /^(Pass\. \d+ rules? passed|Fail\. )/,
  );
});

test("axe score degrades gracefully when axe cannot load", async ({ page }) => {
  await page.route("**/_astro/axe*.js", (route) => route.abort());
  await page.route("**/_astro/*axe*", (route) => route.abort());
  await page.getByTestId("axe-run").click();
  await expect(page.getByTestId("axe-result")).toContainText(
    "could not run in this browser",
  );
});
