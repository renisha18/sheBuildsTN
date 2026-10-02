import { useEffect, useRef, useState } from 'react'
import TimelineItem from './TimelineItem.jsx'
import './Journey.css'

// Card colours reuse project tokens where one exists; the rest are Figma
// illustration colours with no token equivalent.
const milestones = [
  { year: '2019', title: 'The Beginning', color: '#F5B942',
    description: 'Five friends started a WhatsApp group to share job leads and CSS tips. Nobody expected what came next.' },
  { year: '2020', title: 'First Meetup', color: 'var(--color-accent)',
    description: 'Twenty-three women showed up to a borrowed conference room in Nungambakkam. The WiFi failed. Nobody left.' },
  { year: '2021', title: '100 Members', color: 'var(--color-accent-alt)',
    description: 'Crossed the triple digits, launched a Slack workspace, and held the first all-women hackathon.' },
  { year: '2022', title: 'First Conference', color: '#B9A6E0',
    description: 'SheBuilds Conf 2022 — 200 attendees, 14 speakers, one legendary after-party at the Marina beachfront' },
  { year: '2023', title: '300 Members', color: '#F79A55',
    description: 'Added mentorship tracks, a job board, and a monthly newsletter read by 1,200+ subscribers.' },
  { year: '2024', title: 'Growing Together', color: '#9CCF8F',
    description: 'Partnered with 12 companies for hiring pipelines, launched a scholarship fund, and kept growing.' },
  { year: '2025', title: 'Scaling Impact', color: '#EE6A63',
    description: 'Paving the way to grow across Chennai — more chapters, more cities, more women who build.' },
  { year: '2026', title: "What's Next", color: '#F5B942',
    description: 'More women, more builders, more impact. The journey continues.' },
]

// Gap between years. Each rail segment also takes this long to reach the next
// diamond, so the line arrives exactly as the next year fades in.
const STEP_MS = 1000
const TOTAL = milestones.length

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// `character` = optional node (illustration) for the reserved bottom-right slot.
export default function Journey({ character = null }) {
  const timelineRef = useRef(null)
  // Reduced motion starts fully revealed, so no observer and no timers ever run.
  const [revealed, setRevealed] = useState(() => (prefersReducedMotion() ? TOTAL : 0))

  // Start once the timeline scrolls into view.
  useEffect(() => {
    if (prefersReducedMotion()) return

    const node = timelineRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setRevealed(1) // 2019 appears immediately
        observer.disconnect()
      },
      // fires once the top has cleared the bottom 20% of the viewport
      { rootMargin: '0px 0px -20% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Then one more year every STEP_MS. A single timer at a time: StrictMode's
  // double-invoke schedules, clears, and reschedules without skipping a year.
  useEffect(() => {
    if (revealed === 0 || revealed >= TOTAL) return
    const id = setTimeout(() => setRevealed((c) => c + 1), STEP_MS)
    return () => clearTimeout(id)
  }, [revealed])

  return (
    <section
      className="journey"
      aria-labelledby="journey-heading"
      style={{ '--step': `${STEP_MS}ms` }}
    >
      <h2 id="journey-heading" className="journey__heading">Journey</h2>

      <div className="journey__timeline" ref={timelineRef}>
        <ol className="journey__list">
          {milestones.map((item, i) => (
            <TimelineItem
              key={item.year}
              data={item}
              isRevealed={i < revealed}
              position={i % 2 === 0 ? 'up' : 'down'}
            />
          ))}
        </ol>
      </div>

      {/* Reserved space for the character illustration (added later) */}
      <div className="journey__character">{character}</div>
    </section>
  )
}
