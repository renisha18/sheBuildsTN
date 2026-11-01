import { useMemo } from 'react'
import { Link } from 'react-router'
import EventCarousel from './EventCarousel.jsx'
import { EventFilters, EventsEmpty } from './EventFilters.jsx'
import { filtersToSearch, pillClass, useEventFilters } from './useEventFilters.js'
import { getEvents } from './loadEvents.js'
import { resultsAnnouncement } from './eventTimeline.js'

export default function Events() {
  // Ordered (upcoming, undated, past) against the browser's clock when the section first renders
  const events = useMemo(() => getEvents(), [])
  const filters = useEventFilters(events)
  const { query, selectedTags, selection, filtered } = filters

  return (
    <section
      id="events"
      aria-labelledby="events-heading"
      className="min-h-screen scroll-mt-24 px-6 py-24 md:px-12 max-sm:px-4 max-sm:pt-8"
    >
      {/* Heading with "View all" on the same row at every width (baseline-aligned, so the
          heading's own bottom margin doesn't shift the pill) */}
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="events-heading" className="about__heading">
          Events
        </h2>
        {/* Carries the active city or chapter and tags, so /events opens with the same filters */}
        <Link
          aria-label="View all events"
          to={`/events${filtersToSearch({ selection, selectedTags })}`}
          className={`${pillClass(false)} shrink-0 whitespace-nowrap max-sm:gap-1 max-sm:px-3 max-sm:py-1 max-sm:text-sm`}
        >
          View all events <span aria-hidden="true">→</span>
        </Link>
      </div>

      <EventFilters {...filters} />

      {/* Screen readers only: announced when the filters change */}
      <p aria-live="polite" className="sr-only">
        {resultsAnnouncement(filtered.length)}
      </p>

      {filtered.length > 0 ? (
        // New key on every filter/search change remounts the carousel, resetting it to the first slide
        <EventCarousel key={`${selectedTags.join(',') || 'all'}|${selection.city}|${selection.chapter}|${query.trim()}`} events={filtered} />
      ) : (
        <EventsEmpty totalCount={events.length} {...filters} />
      )}
    </section>
  )
}
