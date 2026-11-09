import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { applyState, stateName, states } from "./states";

for (const state of states) {
  test(`axe: 404 (${stateName(state)})`, async ({ page }) => {
    await page.goto("/404");
    await applyState(page, state);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to the Site" }),
    ).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual(
      [],
    );
  });
}
