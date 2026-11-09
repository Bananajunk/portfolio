// Pure sticker board maths. Positions are whole grid cells so keyboard, buttons,
// click-to-place and dragging all land on the same spots and read the same way.
export const COLS = 11;
export const ROWS = 6;

export interface Cell {
  col: number;
  row: number;
}

export type Direction = "left" | "right" | "up" | "down";

const clamp = (value: number, max: number) =>
  Math.min(max, Math.max(0, Math.round(value)));

export const clampCell = ({ col, row }: Cell): Cell => ({
  col: clamp(col, COLS - 1),
  row: clamp(row, ROWS - 1),
});

export const move = (cell: Cell, direction: Direction, step = 1): Cell =>
  clampCell({
    col:
      cell.col +
      (direction === "right" ? step : 0) -
      (direction === "left" ? step : 0),
    row:
      cell.row +
      (direction === "down" ? step : 0) -
      (direction === "up" ? step : 0),
  });

// Nearest cell for a point inside the board's usable area (the board minus the
// sticker's own size, since a sticker's position is its top-left corner).
export const cellFromPoint = (
  x: number,
  y: number,
  usableWidth: number,
  usableHeight: number,
): Cell =>
  clampCell({
    col: usableWidth > 0 ? (x / usableWidth) * (COLS - 1) : 0,
    row: usableHeight > 0 ? (y / usableHeight) * (ROWS - 1) : 0,
  });

export const describe = (label: string, { col, row }: Cell): string =>
  `${label}, column ${col + 1} of ${COLS}, row ${row + 1} of ${ROWS}`;

export const atEdge = (cell: Cell, direction: Direction): boolean => {
  const moved = move(cell, direction);
  return moved.col === cell.col && moved.row === cell.row;
};
