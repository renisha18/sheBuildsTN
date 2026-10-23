import { useMemo, useState } from 'react'

// Filter state and pill styling shared by the Events section and the All events page
// (the components that use them are in EventFilters.jsx).

// Same pill as the navbar links: teal when active, white otherwise; presses into its shadow
export const pillClass = (isActive) =>
  [
    'inline-flex items-center gap-2 rounded-full border-2 border-ink px-5 py-2 font-body font-medium text-ink shadow-brutal-sm',
    'transition motion-reduce:transition-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    isActive ? 'bg-accent-alt' : 'bg-surface hover:bg-accent-alt/20',
  ].join(' ')

// Search text + one active category (null = all), applied to `events` without reordering them
export function useEventFilters(events) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState(null) // null = all

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter((event) => {
      const matchesQuery = q
        ? `${event.title} ${event.description} ${event.category} ${event.venue ?? ''}`.toLowerCase().includes(q)
        : true
      const matchesFilter = activeFilter ? event.category === activeFilter : true
      return matchesQuery && matchesFilter
    })
  }, [events, query, activeFilter])

  const clearAll = () => {
    setQuery('')
    setActiveFilter(null)
  }

  return { query, setQuery, activeFilter, setActiveFilter, filtered, clearAll }
}
