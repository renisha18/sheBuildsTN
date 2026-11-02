import { useMemo } from 'react'
import { Link } from 'react-router'
import EventCarousel from './EventCarousel.jsx'
import { EventFilters, EventsEmpty, PHONE_PILL_CLASS } from './EventFilters.jsx'
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
      <h2 id="events-heading" className="about__heading">
        Events
      </h2>

      {/* "View all events" sits at the end of the tag pills' row, same height as the pills
          (44px; 36px on phones, where its visible label shortens to "View all"). It carries the active city or chapter and tags, so
          /events opens with the same filters. */}
      <EventFilters
        {...filters}
        action={
          <Link
            aria-label="View all events"
            to={`/events${filtersToSearch({ selection, selectedTags })}`}
            className={`${pillClass(false)} shrink-0 whitespace-nowrap ${PHONE_PILL_CLASS}`}
          >
            View all<span className="max-sm:hidden"> events</span> <span aria-hidden="true">→</span>
          </Link>
        }
      />

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
