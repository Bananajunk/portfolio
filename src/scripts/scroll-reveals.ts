// One arrival per visit, after the element is visibly inside the viewport.
// CSS owns motion; this observer never writes styles or handles scroll events.
export {};

const root = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
const seen = new WeakSet<Element>();
let observer: IntersectionObserver | undefined;
let pressed: HTMLElement | undefined;

const settle = (element: HTMLElement) => {
  delete element.dataset.revealPressed;
  element.dataset.revealState = "settled";
  seen.add(element);
  observer?.unobserve(element);
};

const sync = () => {
  observer?.disconnect();
  const enabled = root.dataset.calm === "off" && !reducedMotion.matches;
  if (!enabled || !("IntersectionObserver" in window)) {
    for (const element of targets) {
      delete element.dataset.revealState;
    }
    return;
  }

  const bottomInset = Math.round(innerHeight * 0.22);
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || !(entry.target instanceof HTMLElement))
          continue;
        const element = entry.target;
        if (element === pressed) continue;
        // Anchor jumps and keyboard navigation should arrive at stable content.
        if (
          entry.boundingClientRect.top < 0 ||
          element.matches(":focus-within")
        ) {
          settle(element);
        } else {
          element.dataset.revealState = "entered";
          seen.add(element);
          observer?.unobserve(element);
        }
      }
    },
    { rootMargin: `0px 0px -${bottomInset}px 0px` },
  );

  for (const element of targets) {
    // Never rearrange what's already being read, including restored scroll.
    if (
      seen.has(element) ||
      element.getBoundingClientRect().top < innerHeight - bottomInset
    ) {
      settle(element);
    } else {
      element.dataset.revealState = "waiting";
      observer.observe(element);
    }
  }
};

for (const element of targets) {
  element.addEventListener("animationend", (event) => {
    if (event.target === element) settle(element);
  });
}

// Keyboard focus settles immediately. Pointer focus keeps the pressed control
// in place until its click has been dispatched and the disclosure has opened.
const settleInteraction = (event: Event) => {
  if (!(event.target instanceof Element)) return;
  // A moving screenshot must not pass over a neighbouring focused link.
  const story = event.target.closest(".story");
  for (const element of story?.querySelectorAll<HTMLElement>("[data-reveal]") ??
    []) {
    settle(element);
  }
  let element = event.target.closest<HTMLElement>("[data-reveal]");
  while (element) {
    settle(element);
    element =
      element.parentElement?.closest<HTMLElement>("[data-reveal]") ?? null;
  }
};
document.addEventListener("focusin", (event) => {
  if (event.target instanceof Node && pressed?.contains(event.target)) return;
  settleInteraction(event);
});
document.addEventListener("pointerdown", (event) => {
  if (!(event.target instanceof Element)) return;
  pressed = event.target.closest<HTMLElement>("[data-reveal]") ?? undefined;
  if (pressed) {
    pressed.dataset.revealPressed = "";
    observer?.unobserve(pressed);
  }
});
const finishPress = () => {
  if (pressed) settle(pressed);
  pressed = undefined;
};
document.addEventListener("click", finishPress);
document.addEventListener("pointercancel", finishPress);
document.addEventListener("pointerup", () => {
  // Also settle a drag released outside the original target. The browser
  // dispatches pointer activation before the next animation frame.
  const released = pressed;
  requestAnimationFrame(() => {
    if (pressed === released) finishPress();
  });
});
new MutationObserver(sync).observe(root, {
  attributes: true,
  attributeFilter: ["data-calm"],
});
reducedMotion.addEventListener("change", sync);
window.addEventListener("resize", sync);
sync();
