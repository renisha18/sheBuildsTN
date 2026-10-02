import { useLayoutEffect } from 'react'
import { prefersReducedMotion } from '../siteSections.js'

// Fades in + lifts every [data-reveal] element inside `ref` (CSS in index.css, "Scroll reveal").
// mode 'scroll': each element reveals once at ~20% visibility, never reverses.
// mode 'load':   everything reveals right after first paint (used by the hero).
// Elements revealing together are staggered 80ms apart via --reveal-i.
// Reduced motion: never arms, so content is simply visible.
export function useReveal(ref, mode = 'scroll') {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return

    const items = [...root.querySelectorAll('[data-reveal]')]
    const reveal = (els) =>
      els.forEach((el, i) => {
        el.style.setProperty('--reveal-i', i)
        el.classList.add('is-revealed')
      })

    // Armed before paint (layout effect), so nothing flashes visible first
    root.classList.add('reveal-armed')

    if (mode === 'load') {
      let raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => reveal(items))
      })
      return () => cancelAnimationFrame(raf)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target)
        reveal(entering)
        entering.forEach((el) => observer.unobserve(el))
      },
      { threshold: 0.2 },
    )
    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ref, mode])
}
