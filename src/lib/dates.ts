const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatYearMonth(value: string): string {
  if (value === "present") return "Present";
  const [year = "", month = ""] = value.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** Dates as the Resume prints them, e.g. "Sep 2025 – Present". */
export function formatDates(role: { start: string; end: string }): string {
  return `${formatYearMonth(role.start)} – ${formatYearMonth(role.end)}`;
}
