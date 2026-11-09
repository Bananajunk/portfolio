import type { Page } from "@playwright/test";

export type TimeOfDay = "day" | "dusk" | "night";
export type Calm = "on" | "off";
export interface State {
  time: TimeOfDay;
  calm: Calm;
}

// Flip to true once the Time of day and Calm mode controls land. Until then
// every state collapses to the default page, so the matrix runs one case.
export const CONTROLS_READY = false;

const times: TimeOfDay[] = ["day", "dusk", "night"];
const calms: Calm[] = ["off", "on"];

export const states: State[] = CONTROLS_READY
  ? times.flatMap((time) => calms.map((calm) => ({ time, calm })))
  : [{ time: "day", calm: "off" }];

export const stateName = ({ time, calm }: State) => `${time}, calm ${calm}`;

// Put the page into a state before scanning. Replace the body with the real
// persistence (localStorage keys or the controls themselves) when
// CONTROLS_READY flips.
export async function applyState(_page: Page, _state: State) {}
