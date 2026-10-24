import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router'
import EventsTimeline from '../sections/events/EventsTimeline.jsx'
import { EventFilters, EventsEmpty } from '../sections/events/EventFilters.jsx'
import { useEventFilters } from '../sections/events/useEventFilters.js'
import { getEvents } from '../sections/events/loadEvents.js'
import { countLabel, splitTimeline, yearId } from '../sections/events/eventTimeline.js'
import { prefersReducedMotion } from '../siteSections.js'

// /events, rendered inside Layout (navbar and footer stay): every event on a timeline, upcoming
// first, then past events by year. No element here uses a section id (#events etc.), so the
// navbar treats this as "not the home page".
export default function AllEvents() {
  // One clock for both the loader's order and the upcoming/past split
  const now = useMemo(() => new Date(), [])
  const events = useMemo(() => getEvents(now), [now])
  const filters = useEventFilters(events)
  const { filtered } = filters
  const { upcoming, past } = useMemo(() => splitTimeline(filtered, now), [filtered, now])

  const pageRef = useRef(null)
  const barRef = useRef(null)

  // Arriving from the home page leaves us scrolled down; start at the top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'auto' })
    const previous = document.title
    document.title = 'All events | SheBuilds Chennai'
    return () => {
      document.title = previous
    }
  }, [])

  // The sticky filter bar's real height (it wraps on narrow screens), so year headings
  // reached by a jump link land below it
  useLayoutEffect(() => {
    const bar = barRef.current
    const page = pageRef.current
    const publish = () => page.style.setProperty('--events-bar-h', `${bar.offsetHeight}px`)
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(bar)
    return () => observer.disconnect()
  }, [])

  // Scroll to a year without pushing history entries (like the navbar's section links)
  const jumpTo = (e, year) => {
    const el = document.getElementById(yearId(year))
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' })
    el.focus({ preventScroll: true })
    history.replaceState(history.state, '', `#${yearId(year)}`)
  }

  return (
    <section ref={pageRef} aria-labelledby="all-events-heading" className="events-page px-6 pt-8 pb-24 md:px-12 max-sm:px-4">
      <Link
        to={{ pathname: '/', hash: '#events' }}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-sm font-body font-bold text-ink no-underline underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <span aria-hidden="true">←</span> Back to events
      </Link>

      <h1 id="all-events-heading" className="about__heading">
        All events
      </h1>
      <p aria-live="polite" className="-mt-2 font-body text-muted">
        {countLabel(filtered.length)}
      </p>

      {/* Sticky just below the navbar; opaque, so the timeline scrolls underneath it */}
      <div ref={barRef} className="events-page__bar">
        <EventFilters {...filters} />
        {past.length > 0 && (
          <nav aria-label="Jump to year" className="events-page__years">
            {past.map(({ year }) => (
              <a key={year} href={`#${yearId(year)}`} onClick={(e) => jumpTo(e, year)} className="events-page__year">
                {year}
              </a>
            ))}
          </nav>
        )}
      </div>

      {filtered.length > 0 ? (
        <EventsTimeline upcoming={upcoming} past={past} />
      ) : (
        <EventsEmpty totalCount={events.length} {...filters} />
      )}
    </section>
  )
}
