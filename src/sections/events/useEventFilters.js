import { useMemo, useState } from 'react'
import { EVENT_TAGS, tagLabel } from './eventTags.js'

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

// How several selected tags combine. Narrowing: an event must have ALL of them. To show events
// with ANY of them instead, change every() to some().
export function matchesTags(event, selectedTags) {
  return selectedTags.length === 0 || selectedTags.every((tag) => event.tags.includes(tag))
}

// Search text + any number of selected tags ([] = all), applied to `events` without reordering
// them. tagCounts (tag id -> number of events) is always counted over all events.
export function useEventFilters(events) {
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([]) // [] = all

  const tagCounts = useMemo(
    () => Object.fromEntries(EVENT_TAGS.map(({ id }) => [id, events.filter((event) => event.tags.includes(id)).length])),
    [events],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter((event) => {
      const searchable = [event.title, event.description, event.format, event.venue, event.chapter, ...event.partners, ...event.tags.map(tagLabel)]
      const matchesQuery = q ? searchable.filter(Boolean).join(' ').toLowerCase().includes(q) : true
      return matchesQuery && matchesTags(event, selectedTags)
    })
  }, [events, query, selectedTags])

  // Turns one tag on or off; keeps the EVENT_TAGS order
  const toggleTag = (id) =>
    setSelectedTags((current) =>
      current.includes(id) ? current.filter((t) => t !== id) : EVENT_TAGS.map((t) => t.id).filter((t) => t === id || current.includes(t)),
    )
  const clearTags = () => setSelectedTags([])

  const clearAll = () => {
    setQuery('')
    setSelectedTags([])
  }

  return { query, setQuery, selectedTags, toggleTag, clearTags, tagCounts, filtered, clearAll }
}
