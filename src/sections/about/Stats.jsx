import { useEffect, useRef, useState } from 'react'
import './Stats.css'

// Update these numbers when they change.
const STATS = [
  { value: 1500, suffix: '+', label: 'Members in Chennai', tone: 'coral' },
  { value: 13, suffix: '', label: 'Events hosted', tone: 'teal' },
  { value: new Date().getFullYear() - 2019, suffix: '', label: 'Years of building', note: 'Since 2019', tone: 'yellow' },
]

const DURATION_MS = 1200
const format = (n) => n.toLocaleString('en-IN')
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

export default function Stats() {
  const ref = useRef(null)
  // null = not animating yet, so the final values render; 0..1 while counting up.
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        observer.disconnect() // count up once only
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min((now - start) / DURATION_MS, 1)
          setProgress(t < 1 ? easeOutCubic(t) : null)
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="stats" role="group" aria-label="SheBuilds in numbers" ref={ref}>
      <h3 className="sr-only">SheBuilds in numbers</h3>
      <ul className="stats__list">
        {STATS.map((s) => {
          const shown = progress === null ? s.value : Math.round(s.value * progress)
          return (
            <li key={s.label} className={`stats__block stats__block--${s.tone}`}>
              <span className="stats__number" aria-hidden="true">
                {format(shown)}{s.suffix}
              </span>
              <span className="sr-only">
                {format(s.value)}{s.suffix} {s.label}{s.note ? `, ${s.note}` : ''}
              </span>
              <span className="stats__meta" aria-hidden="true">
                <span className="stats__label">{s.label}</span>
                {s.note && <span className="stats__note">{s.note}</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
