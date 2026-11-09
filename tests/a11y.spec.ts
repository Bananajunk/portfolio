import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { applyState, stateName, states } from "./states";

const pages = ["/"];

for (const path of pages) {
  for (const state of states) {
    test(`axe: ${path} (${stateName(state)})`, async ({ page }) => {
      await page.goto(path);
      await applyState(page, state);
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`),
      ).toEqual([]);
    });
  }
}
