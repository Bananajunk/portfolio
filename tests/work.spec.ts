import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { applyState } from "./states";

test("Role Cards render from content and expand with the keyboard", async ({
  page,
}) => {
  await page.goto("/");
  const cards = page.locator('[data-testid^="role-card-"]');
  await expect(cards).toHaveCount(4);
  await expect(page.getByTestId("role-card-owner")).toContainText(
    "Online Ordering",
  );
  await expect(page.getByTestId("role-card-faire")).toContainText(
    "Senior Software Engineer",
  );

  const owner = page.getByTestId("role-card-owner").locator("details");
  await expect(owner).not.toHaveAttribute("open", "");
  await page.getByTestId("role-card-owner").locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(owner).toHaveAttribute("open", "");
  await page.keyboard.press("Space");
  await expect(owner).not.toHaveAttribute("open", "");
});

test("Role Cards work without JS", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const details = page.getByTestId("role-card-shopify").locator("details");
  await page.getByTestId("role-card-shopify").locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
  await context.close();
});

test("Before that and Education match the Resume", async ({ page }) => {
  await page.goto("/");
  const section = page.getByTestId("before-that");
  await expect(section).toContainText("Microsoft (Yammer)");
  await expect(section).toContainText("Desire2Learn");
  await expect(section).toContainText("University of Waterloo");
  await expect(section).toContainText("Wilfrid Laurier University");
});

test("axe: Role Cards expanded in every theme", async ({ page }) => {
  await page.goto("/");
  for (const time of ["day", "dusk", "night"] as const) {
    await applyState(page, { time, calm: "on" });
    await page.evaluate(() => {
      for (const d of document.querySelectorAll("details")) d.open = true;
    });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(violations.map((v) => `${time} ${v.id}`)).toEqual([]);
  }
});
