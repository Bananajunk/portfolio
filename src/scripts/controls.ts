const THEMES = ["day", "dusk", "night"] as const;
type Theme = (typeof THEMES)[number];

const root = document.documentElement;

const store = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; the choice then lasts for this page view.
  }
};

const slider = document.querySelector<HTMLInputElement>("[data-tod-slider]");
const output = document.querySelector<HTMLOutputElement>("[data-tod-value]");
const presets = document.querySelectorAll<HTMLButtonElement>(
  "[data-theme-preset]",
);
const calm = document.querySelector<HTMLInputElement>("[data-calm-toggle]");

const label = (theme: Theme) => theme.charAt(0).toUpperCase() + theme.slice(1);

const currentTheme = (): Theme => {
  const t = root.dataset.theme as Theme;
  return THEMES.includes(t) ? t : "day";
};

const syncTheme = () => {
  const theme = currentTheme();
  if (slider) {
    slider.value = String(THEMES.indexOf(theme));
    slider.setAttribute("aria-valuetext", label(theme));
  }
  if (output) output.textContent = label(theme);
  for (const button of presets) {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.themePreset === theme),
    );
  }
};

const setTheme = (theme: Theme) => {
  root.dataset.theme = theme;
  store("bj-theme", theme);
  syncTheme();
};

slider?.addEventListener("input", () => {
  setTheme(THEMES[Number(slider.value)] ?? "day");
});

for (const button of presets) {
  button.addEventListener("click", () => {
    setTheme(button.dataset.themePreset as Theme);
  });
}

const syncCalm = () => {
  if (calm) calm.checked = root.dataset.calm === "on";
};

calm?.addEventListener("change", () => {
  root.dataset.calm = calm.checked ? "on" : "off";
  store("bj-calm", root.dataset.calm);
});

syncTheme();
syncCalm();

const settings = document.querySelector<HTMLDetailsElement>(
  "[data-display-settings]",
);
const settingsTrigger = settings?.querySelector("summary");

// Native details handles Enter/Space; also support familiar flyout dismissal.
settings?.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && settings.open) {
    settings.open = false;
    settingsTrigger?.focus();
    event.preventDefault();
  }
});
document.addEventListener("click", (event) => {
  if (
    settings?.open &&
    event.target instanceof Node &&
    !settings.contains(event.target)
  ) {
    settings.open = false;
  }
});
settings?.addEventListener("focusout", (event) => {
  if (
    event.relatedTarget instanceof Node &&
    !settings.contains(event.relatedTarget)
  ) {
    settings.open = false;
  }
});
