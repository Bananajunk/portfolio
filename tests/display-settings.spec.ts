import { expect, test } from "@playwright/test";

test("display settings open by keyboard, persist choices and dismiss", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByTestId("display-settings-trigger");
  const panel = page.getByTestId("experience-controls");
  await expect(panel).toBeHidden();
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(panel).toBeVisible();
  await page.getByTestId("theme-preset-dusk").click();
  await page.getByTestId("calm-toggle").check();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dusk");
  await expect(page.locator("html")).toHaveAttribute("data-calm", "on");
  await trigger.click();
  await page.locator("h1").click();
  await expect(panel).toBeHidden();
});

test("display settings fit at 400% equivalent reflow and close when tabbing out", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 200 });
  await page.goto("/");
  await page.getByTestId("display-settings-trigger").click();
  const panel = page.getByTestId("experience-controls");
  const bounds = await panel.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(200);
  await page.getByTestId("calm-toggle").focus();
  await page.keyboard.press("Tab");
  await expect(panel).toBeHidden();
});
