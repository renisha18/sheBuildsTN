import { useMemo, useState } from 'react'
import EventCarousel from './EventCarousel.jsx'
import { CATEGORIES, EVENTS } from './eventsData.js'

const iconProps = {
  'aria-hidden': true,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-4 w-4 shrink-0',
}

// One small inline icon per filter pill (keys match CATEGORIES)
const FILTER_ICONS = {
  Conference: (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <path d="M12 16v4M8 20h8" />
    </svg>
  ),
  Workshop: (
    <svg {...iconProps}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v14H5.5A1.5 1.5 0 0 0 4 19.5v-14Z" />
      <path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H19v-3" />
    </svg>
  ),
  Hackathon: (
    <svg {...iconProps}>
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
    </svg>
  ),
  'Speaker Night': (
    <svg {...iconProps}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  ),
  Meetup: (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
    </svg>
  ),
}

// Same pill as the navbar links: teal when active, white otherwise; presses into its shadow
const pillClass = (isActive) =>
  [
    'inline-flex items-center gap-2 rounded-full border-2 border-ink px-5 py-2 font-body font-medium text-ink shadow-brutal-sm',
    'transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    isActive ? 'bg-accent-alt' : 'bg-surface hover:bg-accent-alt/20',
  ].join(' ')

export default function Events() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState(null) // null = all

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EVENTS.filter((event) => {
      const matchesQuery = q
        ? `${event.title} ${event.description} ${event.category} ${event.location}`.toLowerCase().includes(q)
        : true
      const matchesFilter = activeFilter ? event.category === activeFilter : true
      return matchesQuery && matchesFilter
    })
  }, [query, activeFilter])

  const clearAll = () => {
    setQuery('')
    setActiveFilter(null)
  }

  return (
    <section
      id="events"
      aria-labelledby="events-heading"
      className="min-h-screen scroll-mt-24 px-6 py-24 md:px-12"
    >
      <h2 id="events-heading" className="about__heading">
        Events
      </h2>

      {/* Search + category filters */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="relative w-full max-w-sm xl:flex-1">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, topics, or hosts"
            aria-label="Search events, topics, or hosts"
            className="w-full rounded-full border-2 border-ink bg-surface py-2.5 pl-11 pr-4 font-body text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          />
        </div>

        <div className="flex flex-wrap gap-3" role="group" aria-label="Filter events by category">
          {CATEGORIES.map((category) => {
            const isActive = activeFilter === category
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveFilter(isActive ? null : category)}
                className={pillClass(isActive)}
              >
                {FILTER_ICONS[category]}
                {category}
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length > 0 ? (
        // New key on every filter/search change remounts the carousel, resetting it to the first slide
        <EventCarousel key={`${activeFilter ?? 'all'}|${query.trim()}`} events={filtered} />
      ) : (
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4 rounded-xs border-4 border-ink bg-surface p-8 text-center shadow-brutal-lg">
          <p className="font-display text-xl font-bold text-ink">No events found</p>
          <p className="font-body text-sm text-muted">
            Nothing matches that search{activeFilter ? ` in ${activeFilter}` : ''}. Try a different term or clear the filters.
          </p>
          <button type="button" onClick={clearAll} className={pillClass(false)}>
            Clear filters
          </button>
        </div>
      )}
    </section>
  )
}
