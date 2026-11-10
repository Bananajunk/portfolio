/** Native links enhanced with a contact disclosure after the hero leaves view. */
function setupContactDock(
  dock: HTMLElement,
  trigger: HTMLButtonElement,
  panel: HTMLElement,
  heroLinks: HTMLElement,
  header: HTMLElement,
) {
  let headerInset = 0;
  let openedBy: "hover" | "focus" | "click" | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let suppressFocus = false;

  function setPanel(open: boolean, reason: typeof openedBy = null) {
    clearTimeout(closeTimer);
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    openedBy = open ? reason : null;
  }

  function overlapsFocusedContent() {
    const active = document.activeElement;
    if (!active || dock.contains(active) || !active.matches(":focus-visible"))
      return false;
    const style = getComputedStyle(dock);
    if (style.position !== "fixed") return false;
    const right = innerWidth - Number.parseFloat(style.right);
    const bottom = innerHeight - Number.parseFloat(style.bottom);
    const rect = active.getBoundingClientRect();
    // Include the focus ring around the 56px trigger.
    return (
      rect.right > right - 64 &&
      rect.left < right + 8 &&
      rect.bottom > bottom - 64 &&
      rect.top < bottom + 8
    );
  }

  function updateVisibility() {
    const heroPassed = heroLinks.getBoundingClientRect().bottom <= headerInset;
    const hasFocus = dock.contains(document.activeElement);
    dock.hidden = !(hasFocus || (heroPassed && !overlapsFocusedContent()));
    if (dock.hidden) setPanel(false);
  }

  // Read current geometry, including rapid keyboard jumps that can skip an
  // IntersectionObserver boundary between frames.
  function updateHeaderInset() {
    headerInset =
      getComputedStyle(header).position === "sticky"
        ? Math.ceil(header.getBoundingClientRect().height)
        : 0;
    updateVisibility();
  }
  updateHeaderInset();
  window.addEventListener("resize", updateHeaderInset);
  window.addEventListener("pageshow", updateVisibility);
  let focusFrame = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (focusFrame) return;
      focusFrame = requestAnimationFrame(() => {
        focusFrame = 0;
        updateVisibility();
      });
    },
    { passive: true },
  );

  dock.addEventListener("pointerenter", (event) => {
    clearTimeout(closeTimer);
    if (event.pointerType === "mouse" && panel.hidden) setPanel(true, "hover");
  });
  dock.addEventListener("pointerleave", () => {
    if (openedBy === "click" || dock.contains(document.activeElement)) return;
    closeTimer = setTimeout(() => setPanel(false), 160);
  });
  trigger.addEventListener("focus", () => {
    if (!suppressFocus && trigger.matches(":focus-visible"))
      setPanel(true, "focus");
  });
  trigger.addEventListener("click", (event) => {
    if (openedBy === "hover" && event.detail > 0) setPanel(true, "click");
    else setPanel(panel.hidden !== false, "click");
  });
  dock.addEventListener("focusout", () => {
    setTimeout(() => {
      if (!dock.contains(document.activeElement)) setPanel(false);
      updateVisibility();
    }, 0);
  });
  document.addEventListener("focusin", () => {
    if (!dock.contains(document.activeElement)) setPanel(false);
    updateVisibility();
  });
  document.addEventListener("pointerdown", (event) => {
    if (event.target instanceof Node && !dock.contains(event.target))
      setPanel(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || panel.hidden) return;
    event.preventDefault();
    setPanel(false);
    suppressFocus = true;
    trigger.focus({ preventScroll: true });
    suppressFocus = false;
  });
}

const dock = document.querySelector<HTMLElement>("[data-contact-dock]");
const trigger = document.querySelector<HTMLButtonElement>(
  "[data-contact-trigger]",
);
const panel = document.getElementById("floating-contact-links");
const heroLinks = document.getElementById("hero-contact-links");
const header = document.querySelector<HTMLElement>(".site-header");
if (dock && trigger && panel && heroLinks && header)
  setupContactDock(dock, trigger, panel, heroLinks, header);
