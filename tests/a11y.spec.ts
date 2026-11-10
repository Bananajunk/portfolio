import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { applyState, stateName, states } from "./states";

const pages = ["/"];

for (const path of pages) {
  for (const width of [1280, 390])
    for (const state of states) {
      test(`axe: ${path} (${width}px, ${stateName(state)})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await applyState(page, state);
        // Check the quiet default and the settings controls while exposed.
        for (const settingsOpen of [false, true]) {
          if (settingsOpen)
            await page.getByTestId("display-settings-trigger").click();
          const { violations } = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
            .analyze();
          expect(
            violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`),
          ).toEqual([]);
        }
      });
    }
}
