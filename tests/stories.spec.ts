import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { applyState } from "./states";

const ids = [
  "accessibility",
  "flow-2",
  "include-utensils",
  "unified-client-cart-state",
];

test("four Stories render in order with the four-part structure", async ({
  page,
}) => {
  await page.goto("/");
  const articles = page.locator("article.story");
  await expect(articles).toHaveCount(4);
  for (const [i, id] of ids.entries()) {
    await expect(articles.nth(i)).toHaveAttribute("data-testid", `story-${id}`);
  }
  // Accessibility has no trade-offs text: three parts, no empty block.
  const a11y = page.getByTestId("story-accessibility");
  await expect(a11y.locator("[data-part]")).toHaveCount(3);
  await expect(a11y.locator('[data-part="tradeoffs"]')).toHaveCount(0);
  // Flow has all four.
  const flow = page.getByTestId("story-flow-2");
  await expect(flow.locator("[data-part]")).toHaveCount(4);
  await expect(flow).toContainText("Recoil");
  await expect(flow.getByRole("link", { name: /Maestro/ })).toBeVisible();
  await expect(
    page.getByTestId("story-unified-client-cart-state"),
  ).not.toContainText(/launched/i);
});

test("every Story has a labelled heading outline", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 2, name: "Stories" }),
  ).toBeVisible();
  await expect(page.locator("#stories h3")).toHaveCount(4);
  for (const label of ["Problem", "What I did", "Outcome"]) {
    await expect(page.locator("#stories h4", { hasText: label })).toHaveCount(
      4,
    );
  }
  await expect(
    page.locator("#stories h4", { hasText: "Trade-offs" }),
  ).toHaveCount(1);
});

test("Stories reflow at 400% zoom without horizontal scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("axe: Stories in every theme", async ({ page }) => {
  await page.goto("/");
  for (const time of ["day", "dusk", "night"] as const) {
    await applyState(page, { time, calm: "on" });
    const { violations } = await new AxeBuilder({ page })
      .include("#stories")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(violations.map((v) => `${time} ${v.id}`)).toEqual([]);
  }
});
