import { useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import EventCard from '../sections/events/EventCard.jsx'
import { EventFilters, EventsEmpty } from '../sections/events/EventFilters.jsx'
import { useEventFilters } from '../sections/events/useEventFilters.js'
import { getEvents } from '../sections/events/loadEvents.js'
import { prefersReducedMotion } from '../siteSections.js'

const countLabel = (n) => (n === 1 ? '1 event' : `${n} events`)

// /events, rendered inside Layout (navbar and footer stay): every event as a grid of compact
// cards, in the same order as the home page carousel. No element here uses a section id
// (#events etc.), so the navbar treats this as "not the home page".
export default function AllEvents() {
  const events = useMemo(() => getEvents(), [])
  const filters = useEventFilters(events)
  const { filtered } = filters

  // Arriving from the home page leaves us scrolled down; start at the top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'auto' })
    const previous = document.title
    document.title = 'All events | SheBuilds Chennai'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <section aria-labelledby="all-events-heading" className="px-6 pt-8 pb-24 md:px-12 max-sm:px-4">
      <Link
        to={{ pathname: '/', hash: '#events' }}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-sm font-body font-bold text-ink no-underline underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <span aria-hidden="true">←</span> Back to events
      </Link>

      <h1 id="all-events-heading" className="about__heading">
        All events
      </h1>
      <p className="-mt-2 mb-6 font-body text-muted">{countLabel(events.length)}</p>

      <EventFilters {...filters} />

      <p aria-live="polite" className="sr-only">
        {countLabel(filtered.length)}
      </p>

      {filtered.length > 0 ? (
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 max-sm:mt-6">
          {filtered.map((event) => (
            <li key={event.id} className="flex">
              <EventCard event={event} compact />
            </li>
          ))}
        </ul>
      ) : (
        <EventsEmpty totalCount={events.length} {...filters} />
      )}
    </section>
  )
}
