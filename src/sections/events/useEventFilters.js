import { useMemo, useState } from 'react'
import { EVENT_TAGS, tagLabel } from './eventTags.js'

// Filter state shared by the Events section and the All events page (the components that use it
// are in EventFilters.jsx). The pill style lives in components/filterStyles.js, shared with Blogs.
export { pillClass } from '../../components/filterStyles.js'

// How several selected tags combine. Narrowing: an event must have ALL of them. To show events
// with ANY of them instead, change every() to some().
export function matchesTags(event, selectedTags) {
  return selectedTags.length === 0 || selectedTags.every((tag) => event.tags.includes(tag))
}

// Search text + any number of selected tags ([] = all), applied to `events` without reordering
// them. availableTags: the tag ids (in EVENT_TAGS order) that at least one event has, over all
// events, so a tag with no events gets no pill.
export function useEventFilters(events) {
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([]) // [] = all

  const availableTags = useMemo(
    () => EVENT_TAGS.map(({ id }) => id).filter((id) => events.some((event) => event.tags.includes(id))),
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

  return { query, setQuery, selectedTags, toggleTag, clearTags, availableTags, filtered, clearAll }
}
