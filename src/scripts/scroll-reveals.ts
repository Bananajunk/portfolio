// One arrival per visit, after the element is visibly inside the viewport.
// CSS owns motion; this observer never writes styles or handles scroll events.
export {};

const root = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
const seen = new WeakSet<Element>();
let observer: IntersectionObserver | undefined;

const settle = (element: HTMLElement) => {
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

// Stop before a control receives focus or a press; it must not move away.
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
document.addEventListener("focusin", settleInteraction);
document.addEventListener("pointerdown", settleInteraction, { passive: true });
new MutationObserver(sync).observe(root, {
  attributes: true,
  attributeFilter: ["data-calm"],
});
reducedMotion.addEventListener("change", sync);
window.addEventListener("resize", sync);
sync();
