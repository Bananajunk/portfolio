import { expect, type Page } from "@playwright/test";

export type TimeOfDay = "day" | "dusk" | "night";
export type Calm = "on" | "off";
export interface State {
  time: TimeOfDay;
  calm: Calm;
}

// The Time of day and Calm mode controls landed in #19, so every state is a
// separate case.
export const CONTROLS_READY = true;

const times: TimeOfDay[] = ["day", "dusk", "night"];
const calms: Calm[] = ["off", "on"];

export const states: State[] = CONTROLS_READY
  ? times.flatMap((time) => calms.map((calm) => ({ time, calm })))
  : [{ time: "day", calm: "off" }];

export const stateName = ({ time, calm }: State) => `${time}, calm ${calm}`;

// Seed the stored choices, reload so theme-init.js applies them before first
// paint, and confirm the page actually reached the requested state.
export async function applyState(page: Page, { time, calm }: State) {
  await page.evaluate(
    (stored) => {
      localStorage.setItem("bj-theme", stored.time);
      localStorage.setItem("bj-calm", stored.calm);
    },
    { time, calm },
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", time);
  await expect(page.locator("html")).toHaveAttribute("data-calm", calm);
}
