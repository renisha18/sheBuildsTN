// Single source of truth for the one-page layout: section ids, nav labels, order.
export const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About us' },
  { id: 'join', label: 'Join us' },
  { id: 'events', label: 'Events' },
  { id: 'blogs', label: 'Blogs' },
]

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Scrolls to a section (offset by html scroll-padding-top = navbar height) and
// replaces — never pushes — the URL hash, so Back doesn't step through sections.
export function scrollToSection(id, { instant = false, focus = true } = {}) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: instant || prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' })
  if (focus) el.focus({ preventScroll: true })
  history.replaceState(history.state, '', `#${id}`)
}
