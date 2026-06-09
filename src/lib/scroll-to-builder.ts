/** Scroll to the component picker, accounting for sticky builder chrome on mobile. */
export function scrollToBuilderParts(behavior: ScrollBehavior = "smooth") {
  const target =
    document.getElementById("builder-parts") ?? document.getElementById("builder-mobile-summary");
  if (!target) return;

  const isMobile = window.matchMedia("(max-width: 1279px)").matches;
  const headerPx =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--mobile-header-height")) || 40;
  const stickyPx = isMobile ? 108 : 0;
  const offset = headerPx + stickyPx + 12;

  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior });
}
