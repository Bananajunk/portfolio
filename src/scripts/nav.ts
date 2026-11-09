// Marks the nav link for the section in view with aria-current. Without JS the
// links still work; only the current-section state is missing.
const links = [
  ...document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"),
];
const sections = links
  .map((link) => document.getElementById(link.dataset.navLink ?? ""))
  .filter((el): el is HTMLElement => el !== null);

const setCurrent = (id: string) => {
  for (const link of links) {
    if (link.dataset.navLink === id) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }
};

const update = () => {
  const line = window.innerHeight * 0.4;
  let current = sections[0]?.id ?? "";
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= line) current = section.id;
  }
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
    current = sections.at(-1)?.id ?? current;
  }
  setCurrent(current);
};

let queued = false;
const schedule = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    update();
  });
};

window.addEventListener("scroll", schedule, { passive: true });
window.addEventListener("resize", schedule);
update();
