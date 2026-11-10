import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const csp = readFileSync("public/_headers", "utf8")
  .split("\n")
  .find((line) => line.trim().startsWith("Content-Security-Policy:"))
  ?.split("Content-Security-Policy:")[1]
  ?.trim();

test("production CSP permits the Site with no inline styles or executable scripts", async ({
  page,
}) => {
  expect(csp).toBeTruthy();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      document.documentElement.dataset.cspViolation = event.violatedDirective;
    });
  });
  await page.route("**/*", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "content-security-policy": csp! },
    });
  });
  await page.goto("/");
  await expect(
    page.locator(
      '[style],style,script:not([src]):not([type="application/ld+json"])',
    ),
  ).toHaveCount(0);
  await page.getByTestId("display-settings-trigger").click();
  await page.getByTestId("theme-preset-dusk").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dusk");
  await page.keyboard.press("Escape");
  await page.evaluate(() => scrollTo(0, 1500));
  await page.getByTestId("contact-trigger").click();
  await expect(page.getByTestId("contact-panel")).toBeVisible();
  await page.getByTestId("story-include-utensils").scrollIntoViewIfNeeded();
  await expect(page.locator("html")).not.toHaveAttribute("data-csp-violation");
  expect(errors).toEqual([]);
});
