import { describeSummary, ERROR_MESSAGE, summarize } from "../lib/axe-summary";
import {
  atEdge,
  type Cell,
  cellFromPoint,
  type Direction,
  describe,
  move,
} from "../lib/stickers";

const root = document.documentElement;
const isCalm = () => root.dataset.calm === "on";

// ---- Sticker board -------------------------------------------------------
const board = document.querySelector<HTMLElement>("[data-board]");
const stickers = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-sticker]"),
];
const positionText = document.querySelector<HTMLElement>("[data-position]");
const announcer = document.querySelector<HTMLElement>("[data-announce]");
const calmNote = document.querySelector<HTMLElement>("[data-calm-note]");
const moveButtons = document.querySelectorAll<HTMLButtonElement>("[data-move]");
const resetButton = document.querySelector<HTMLButtonElement>("[data-reset]");

const SIZE = 44; // sticker edge in px (size-11)
const cells = new Map<HTMLButtonElement, Cell>();
let selected: HTMLButtonElement | undefined = stickers[0];

const label = (el: HTMLButtonElement) => el.dataset.label ?? "Sticker";
const initial = (el: HTMLButtonElement): Cell => ({
  col: Number(el.dataset.col),
  row: Number(el.dataset.row),
});

const place = (el: HTMLButtonElement, cell: Cell) => {
  cells.set(el, cell);
  el.style.setProperty("--col", String(cell.col));
  el.style.setProperty("--row", String(cell.row));
};

const say = (text: string) => {
  if (announcer) announcer.textContent = text;
  if (positionText) positionText.textContent = text;
};

const select = (el: HTMLButtonElement) => {
  selected = el;
  for (const s of stickers) {
    const on = s === el;
    s.setAttribute("aria-pressed", String(on));
    s.dataset.selected = String(on);
  }
};

const moveSelected = (direction: Direction, step = 1) => {
  const el = selected;
  const cell = el && cells.get(el);
  if (!el || !cell) return;
  if (atEdge(cell, direction)) {
    say(
      `${label(el)} is at the ${direction === "up" ? "top" : direction === "down" ? "bottom" : direction} edge. ${describe(label(el), cell)}`,
    );
    return;
  }
  const next = move(cell, direction, step);
  place(el, next);
  say(describe(label(el), next));
};

const syncCalm = () => {
  const calm = isCalm();
  if (calmNote) calmNote.hidden = !calm;
};

if (board) {
  for (const el of stickers) place(el, initial(el));
  if (selected) select(selected);
  board.dataset.ready = "";
  syncCalm();
  new MutationObserver(syncCalm).observe(root, {
    attributes: true,
    attributeFilter: ["data-calm"],
  });

  const arrowKeys: Record<string, Direction> = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
  };

  for (const el of stickers) {
    el.addEventListener("focus", () => select(el));
    el.addEventListener("click", () => {
      select(el);
      const cell = cells.get(el);
      if (cell) say(`${describe(label(el), cell)}. Selected.`);
    });
    el.addEventListener("keydown", (event) => {
      const direction = arrowKeys[event.key];
      if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      select(el);
      moveSelected(direction, event.shiftKey ? 3 : 1);
    });

    // Dragging is an enhancement for pointers and is off in Calm mode.
    let dragging = false;
    let offset = { x: 0, y: 0 };
    let moved = false;
    el.addEventListener("pointerdown", (event) => {
      if (isCalm() || event.button !== 0) return;
      const rect = el.getBoundingClientRect();
      offset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      dragging = true;
      moved = false;
      el.setPointerCapture(event.pointerId);
      select(el);
    });
    el.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      moved = true;
      const area = board.getBoundingClientRect();
      const cell = cellFromPoint(
        event.clientX - offset.x - area.left,
        event.clientY - offset.y - area.top,
        area.width - SIZE,
        area.height - SIZE,
      );
      place(el, cell);
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      const cell = cells.get(el);
      if (moved && cell) say(describe(label(el), cell));
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }

  // Single-pointer alternative to dragging (WCAG 2.5.7): select, then click.
  let pressedBoard = false;
  board.addEventListener("pointerdown", (event) => {
    pressedBoard = event.target === board;
  });
  board.addEventListener("click", (event) => {
    if (event.target !== board || !pressedBoard || !selected) return;
    const area = board.getBoundingClientRect();
    const cell = cellFromPoint(
      event.clientX - SIZE / 2 - area.left,
      event.clientY - SIZE / 2 - area.top,
      area.width - SIZE,
      area.height - SIZE,
    );
    place(selected, cell);
    say(describe(label(selected), cell));
  });

  for (const button of moveButtons) {
    button.addEventListener("click", () =>
      moveSelected(button.dataset.move as Direction),
    );
  }

  resetButton?.addEventListener("click", () => {
    for (const el of stickers) place(el, initial(el));
    say("Stickers are back where they started.");
  });
}

// ---- Axe score -----------------------------------------------------------
const axeButton = document.querySelector<HTMLButtonElement>("[data-axe-run]");
const axeResult = document.querySelector<HTMLElement>("[data-axe-result]");

axeButton?.addEventListener("click", async () => {
  if (!axeResult || axeButton.getAttribute("aria-disabled") === "true") return;
  axeButton.setAttribute("aria-disabled", "true");
  axeResult.textContent = "Running axe…";
  try {
    // Lazy: axe-core is far over the first-load budget, so it only downloads here.
    const mod = await import("axe-core");
    const axe = mod.default ?? mod;
    const result = await axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
      },
    });
    axeResult.textContent = describeSummary(summarize(result));
  } catch {
    axeResult.textContent = ERROR_MESSAGE;
  } finally {
    axeButton.removeAttribute("aria-disabled");
    axeButton.textContent = "Run axe again";
  }
});
