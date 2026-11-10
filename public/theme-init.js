// Blocking, same-origin script (CSP allows 'self'). Runs before first paint
// so the stored or system theme and Calm mode apply with no flash.
(() => {
  const root = document.documentElement;
  const read = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const theme = read("bj-theme");
  const hour = new Date().getHours();
  root.dataset.theme = ["day", "dusk", "night"].includes(theme)
    ? theme
    : hour >= 6 && hour < 17
      ? "day"
      : hour >= 17 && hour < 20
        ? "dusk"
        : "night";
  const calm = read("bj-calm");
  root.dataset.calm =
    calm === "on" || calm === "off"
      ? calm
      : matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "on"
        : "off";
  root.dataset.js = "";
})();
